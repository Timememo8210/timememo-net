(() => {
  "use strict";

  const ACCESS_KEY = "semi_access_v1";
  const LANGUAGE_KEY = "semi_language_v1";
  const EXPECTED_HASH = "d931fe4a33ad82c1e1cd44f02c9474a2302d34aad57e5c1ba304d74e6040e3a5";
  const body = document.body;

  function setLanguage(language) {
    const lang = language === "en" ? "en" : "zh";
    body.dataset.lang = lang;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.textContent = lang === "zh" ? "EN" : "中";
      button.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    });
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function unlock() {
    body.classList.remove("locked");
    const field = document.querySelector("[data-password]");
    if (field) field.value = "";
  }

  async function authenticate(event) {
    event.preventDefault();
    const field = document.querySelector("[data-password]");
    const error = document.querySelector("[data-gate-error]");
    const submit = document.querySelector("[data-gate-submit]");
    if (!field) return;
    submit.disabled = true;
    const digest = await sha256(field.value.trim());
    if (digest === EXPECTED_HASH) {
      sessionStorage.setItem(ACCESS_KEY, EXPECTED_HASH);
      error.textContent = "";
      unlock();
    } else {
      error.innerHTML = '<span class="lang-zh">密码不正确，请重试。</span><span class="lang-en">Incorrect password. Please try again.</span>';
      field.select();
    }
    submit.disabled = false;
  }

  function initGate() {
    const session = sessionStorage.getItem(ACCESS_KEY);
    if (session === EXPECTED_HASH) unlock();
    document.querySelector("[data-gate-form]")?.addEventListener("submit", authenticate);
    document.querySelector("[data-show-password]")?.addEventListener("click", (event) => {
      const field = document.querySelector("[data-password]");
      if (!field) return;
      const showing = field.type === "text";
      field.type = showing ? "password" : "text";
      event.currentTarget.innerHTML = showing
        ? '<span class="lang-zh">显示密码</span><span class="lang-en">Show password</span>'
        : '<span class="lang-zh">隐藏密码</span><span class="lang-en">Hide password</span>';
    });
  }

  function initLanguage() {
    setLanguage(localStorage.getItem(LANGUAGE_KEY) || "zh");
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(body.dataset.lang === "zh" ? "en" : "zh"));
    });
  }

  function initCalculator() {
    const die = document.querySelector("[data-die-area]");
    const wafer = document.querySelector("[data-wafer-starts]");
    const yieldInput = document.querySelector("[data-yield]");
    if (!die || !wafer || !yieldInput) return;

    const update = () => {
      const area = Math.max(1, Number(die.value) || 1);
      const starts = Math.max(0, Number(wafer.value) || 0);
      const yieldRate = Math.min(100, Math.max(0, Number(yieldInput.value) || 0)) / 100;
      const gross = Math.max(0, (Math.PI * 150 * 150 / area) - (Math.PI * 300 / Math.sqrt(2 * area)));
      const good = gross * yieldRate;
      document.querySelector("[data-gross]").textContent = Math.round(gross).toLocaleString();
      document.querySelector("[data-good]").textContent = Math.round(good).toLocaleString();
      document.querySelector("[data-annual]").textContent = Math.round(good * starts * 12).toLocaleString();
    };
    [die, wafer, yieldInput].forEach((input) => input.addEventListener("input", update));
    update();
  }

  document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));
  initLanguage();
  initGate();
  initCalculator();
})();
