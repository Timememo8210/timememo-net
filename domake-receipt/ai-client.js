const SESSION_KEY = "domic-ai-pilot-code";

export class AIError extends Error {
  constructor(code, status = 0) {
    super(code);
    this.name = "AIError";
    this.code = code;
    this.status = status;
  }
}

export function createAIClient({ endpoint, timeoutMs = 45000, fetchImpl = fetch, sessionStore } = {}) {
  const base = String(endpoint || "").replace(/\/$/, "");
  let code = "";
  try { code = sessionStore?.getItem(SESSION_KEY) || ""; } catch { /* Memory-only access remains available. */ }
  function clearAccess() {
    code = "";
    try { sessionStore?.removeItem(SESSION_KEY); } catch { /* Restricted browser storage. */ }
  }
  async function request(path, { method = "GET", body, signal, access = code, authenticated = true } = {}) {
    if (!base) throw new AIError("not_configured");
    if (authenticated && !access) throw new AIError("access_required");
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    if (signal?.aborted) cancel();
    else signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const response = await fetchImpl(base + path, {
        method, body, signal: controller.signal,
        headers: authenticated ? { Authorization: `Bearer ${access}` } : {},
        credentials: "omit", cache: "no-store",
      });
      let data;
      try { data = await response.json(); } catch {
        throw new AIError(response.ok ? "malformed_output" : "upstream_failure", response.status);
      }
      if (!response.ok) {
        const fallback = { 401: "invalid_access", 403: "invalid_access", 402: "insufficient_credits", 413: "file_too_large", 429: "rate_limited", 503: "not_configured", 504: "timeout" };
        throw new AIError(data?.error?.code || fallback[response.status] || "upstream_failure", response.status);
      }
      return data;
    } catch (error) {
      if (timedOut) throw new AIError("timeout");
      if (controller.signal.aborted) throw new AIError("cancelled");
      if (error instanceof AIError) throw error;
      throw new AIError("network_error");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  }
  return {
    get hasAccess() { return Boolean(code); },
    clearAccess,
    health: () => request("/api/health", { authenticated: false }),
    async unlock(value) {
      const next = String(value || "").trim();
      if (!next) throw new AIError("access_required");
      if (/^sk-or-/i.test(next)) throw new AIError("api_key_not_allowed");
      const data = await request("/api/session", { method: "POST", access: next });
      if (data?.configured !== true) throw new AIError(data?.configured === false ? "not_configured" : "malformed_output");
      code = next;
      try { sessionStore?.setItem(SESSION_KEY, code); } catch { /* This tab can continue using memory. */ }
      return data;
    },
    async extract(file, { locale = "en-GB", signal } = {}) {
      const body = new FormData();
      body.append("file", file, file.name);
      body.append("locale", locale || "en-GB");
      const data = await request("/api/extract", { method: "POST", body, signal });
      if (!data || typeof data.extraction !== "object" || data.extraction === null || Array.isArray(data.extraction) || typeof data.model !== "string" || !data.model)
        throw new AIError("malformed_output");
      return data;
    },
  };
}
