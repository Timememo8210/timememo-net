// Conservative English OCR experiment. Text is evidence, never an instruction.
import { blankRecord, set, inspect, validDate } from "./core.js";
export function extractText(text, confidence = 0, { locale = null } = {}) {
  confidence = Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) : 0;
  const record = blankRecord();
  record.source.mode = "local_ocr";
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const usable = lines.join("\n");
  const result = {
    engine: "tesseract-7.0.0-eng",
    locale: locale === "en-GB" ? "en-GB" : null,
    status: "uncertain",
    readability: "unknown",
    relevance: "unknown",
    text: usable,
    confidence: Number.isFinite(confidence) ? confidence : 0,
  };
  record.extraction = result;
  const put = (field, value, quote) => {
    if (
      value === null ||
      value === "" ||
      value === undefined ||
      (typeof value === "string" &&
        (/^(unknown|not (?:provided|stated|shown)|n\/a|none|-)$/i.test(value) ||
          (/[<=>~|_]{3,}/.test(value) || /[=<>~|_]\s*S{1,3}\b/.test(value))))
    )
      return;
    // Keep noisy OCR lines in the raw text, but do not guess a cleaned field.
    set(record, field, value);
    record.evidence.push({ field, page: 1, quote });
  };
  // Low-quality text is not sufficient evidence for any identity or amount.
  if (usable.replace(/[^a-z0-9]/gi, "").length < 18 || confidence < 35) {
    result.status = "no_text";
    return record;
  }
  result.readability = confidence >= 75 ? "readable" : "partial";
  const boundary = /^(?:company|service company|business|attending repair technician|attending technician|engineer|installer|technician|performed by|work performed by|worker|contractor|customer|prepared by|signed by|bill to|ship to|total|grand total|subtotal|vat|tax|amount due|balance due|payment|status|service date|work date|issue date|invoice date|receipt date|service address|job address|work address|work area|location|work type|receipt number|invoice number|receipt no|invoice no|description|work|warranty|phone|provider phone|company phone|company address|business address|fictional|not a valid|terms)\b/i;
  const matchLabel = (labels, multiline = false) => {
    const re = new RegExp("^(?:" + labels + ")\\s*[:#|]\\s*(.*)$", "i");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\b(?:proposed|planned|not)\s+(?:attending |repair )?(?:technician|engineer|installer|worker)\s*[:#|]/i.test(line)) continue;
      const inline = new RegExp("(?:^|\\s)(?:" + labels + ")\\s*[:#|]\\s*(.+)$", "i");
      const m = line.match(re) || line.match(inline);
      if (!m) continue;
      let value = m[1].trim(), quote = line, end = i;
      if (!value && lines[i+1] && !boundary.test(lines[i+1])) {
        value = lines[i+1]; quote += "\n"+value; end++;
      }
      // Only unmistakable prose continuations; stop before any other field.
      if (multiline && value) {
        while (lines[end+1] && end-i < 3 && !boundary.test(lines[end+1]) && /^(?:and |including |with |to |of |for |remove |replace |repair |install |check |test )/i.test(lines[end+1])) {
          value += " " + lines[++end]; quote += "\n" + lines[end];
        }
      }
      if (value && /\b(?:customer|prepared by|signed by|bill to|ship to|technician|engineer|installer|worker)\s*[:#|]/i.test(value)) continue;
      if (value) return [value, quote];
    }
    return [null, null];
  };
  for (const [field, labels] of [
    ["provider.organization_name", "Company|Service company|Business"],
    [
      "provider.person_name",
      "Attending repair technician|Attending technician|Technician|Performed by|Work performed by|Work carried out by|Engineer|Installer|Worker",
    ],
    ["provider.phone", "Provider phone|Company phone|Contractor phone"],
    ["provider.address", "Company address|Business address"],
    [
      "property.service_address",
      "Service address|Job address|Work address|Service at",
    ],
    [
      "service.summary",
      "Work|Work description|Service description|Job description|Description of work",
    ],
    ["service.location", "Location|Work area"],
    [
      "document.number",
      "Invoice number|Receipt number|Invoice no\\.?|Receipt no\\.?",
    ],
  ]) {
    const [value, quote] = matchLabel(labels, field === "service.summary");
    put(field, value, quote);
  }
  const [contractor, contractorQuote] = matchLabel("Contractor");
  if (contractor) {
    if (
      /\b(LLC|Ltd|Limited|Inc|Company|Services|Plumbing|Electrical|Construction|Repairs)\b/i.test(
        contractor,
      )
    ) {
      if (!record.provider.organization_name)
        put("provider.organization_name", contractor, contractorQuote);
    } else if (
      /^independent (?:property|home) (?:repair|maintenance|contractor)/im.test(usable) &&
      /^[A-Za-z'-]+(?: [A-Za-z'-]+){1,3}$/.test(contractor) &&
      !record.provider.person_name
    )
      put("provider.person_name", contractor, contractorQuote);
  }
  const provider =
    record.provider.organization_name || record.provider.person_name;
  if (provider) {
    const evidence = record.evidence.find(
      (x) =>
        x.field ===
        (record.provider.organization_name
          ? "provider.organization_name"
          : "provider.person_name"),
    );
    put("provider.name", provider, evidence.quote);
  } else if (contractor) put("provider.name", contractor, contractorQuote);
  for (const [field, labels] of [
    ["service.date", "Service date|Work date|Date of service|Work completed"],
    ["document.issue_date", "Issue date|Invoice date|Receipt date"],
  ]) {
    const [value, quote] = matchLabel(labels);
    // Ambiguous day/month dates stay blank; no substitution of invoice date.
    let date = value;
    if (locale === "en-GB" && value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d,m,y] = value.split("/"); date = `${y}-${m}-${d}`;
    }
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date) && validDate(date)) put(field, date, quote);
  }
  const amountCandidates = lines.map((line, i) => {
    if (/^(?:quote total|grand total|invoice total)$/i.test(line) && lines[i+1] && /^(?:£|GBP)\s*\d/.test(lines[i+1])) return line + " " + lines[i+1];
    return line;
  });
  const fullyPaid = !/\b(?:unpaid|not paid|partially paid)\b/i.test(usable) && !/(?:balance(?: due)?|amount due)\s*:?\s*(?:£|GBP)?\s*[1-9][0-9,.]*/i.test(usable) && /(?:^|\n)(?:[A-Z &-]+ )?PAID INVOICE\b|\bpayment received in full\b|(?:^|\n)paid in full[.!]?$|(?:balance|amount due)\s*:?\s*(?:£|GBP)?\s*0\.00\b/im.test(usable);
  const totalLines = amountCandidates.filter(line => /^(?:Grand total|Invoice total|Quote total|Total)\b/i.test(line) && (!/^Total paid\b/i.test(line) || fullyPaid));
  const highest = totalLines.some(line => /^Grand total\b/i.test(line)) ? totalLines.filter(line => /^Grand total\b/i.test(line)) : totalLines;
  const candidates = highest.map(line => {
    const normalized = locale === "en-GB" ? line.replace(/£\s*/, "GBP ") : line;
    const m = normalized.match(/^(?:Grand total|Invoice total(?: \(including VAT\))?|Quote total|Total(?: paid(?: \(VAT not charged\))?)?)\s*[:|]?\s*(?:(AED|SAR|USD|EUR|GBP|CNY|QAR|KWD|BHD|OMR)\s*)?((?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]{2})?)\s*(AED|SAR|USD|EUR|GBP|CNY|QAR|KWD|BHD|OMR)?$/i);
    if (!m || (m[1] && m[3] && m[1].toUpperCase() !== m[3].toUpperCase())) return null;
    const amount = Number(m[2].replaceAll(",", ""));
    return Number.isFinite(amount) ? { amount, currency: (m[1] || m[3] || "").toUpperCase(), quote: line } : null;
  });
  if (candidates.length && candidates.every(Boolean) && new Set(candidates.map(x => `${x.amount}|${x.currency}`)).size === 1) {
    put("amount.total", candidates[0].amount, candidates[0].quote);
    put("amount.currency", candidates[0].currency, candidates[0].quote);
  }
  if (!record.document.number) {
    const line = lines.find((x) =>
      /^(?:RECEIPT|INVOICE)\s*#\s*([A-Z0-9-]+)$/i.test(x),
    );
    if (line) put("document.number", line.split("#")[1].trim(), line);
  }
  const documentLine = lines.find((x) =>
    /\b(receipt|invoice|estimate|quotation|warranty)\b/i.test(x),
  );
  if (documentLine) {
    const type = /estimate|quotation/i.test(documentLine)
      ? "estimate"
      : /receipt/i.test(documentLine)
        ? "receipt"
        : /invoice/i.test(documentLine)
          ? "invoice"
          : "warranty";
    put("document.type", type, documentLine);
  }
  let home =
    /\b(plumb(?:ing|er)?|faucet|p[- ]?trap|hvac|air condition(?:er|ing)|roof(?:ing)?|electrical|electrician|kitchen|bathroom|bedroom|door lock|light switch|renovation|home repair|landscaping|water heater|ceiling|drywall|carpentry|boiler|gutter|window replacement|decorating|gardening|appliance repair)\b/i.test(
      usable,
    );
  const unrelated =
    /\b(restaurant|cafe|dine[- ]?in|takeaway|boarding pass|flight ticket|taxi fare|hair salon|haircut)\b/i.test(
      usable,
    );
  if (unrelated && !/\b(repair|replace|replacement|install|plumb|maintain|service|inspect|clean)\w*\b/i.test(record.service.summary || "")) home = false;
  result.relevance = home
    ? "home_service"
    : unrelated && (documentLine || /total paid|card payment|amount|£/i.test(usable))
      ? "unrelated_service"
      : "unknown";
  if (result.relevance === "unrelated_service") {
    result.status = "unrelated";
    return record;
  }
  const work = record.service.summary;
  if (work) {
    const quote = record.evidence.find(
      (x) => x.field === "service.summary",
    ).quote;
    for (const [type, re] of [
      ["replacement", /\breplac(?:e|ed|ement|ing)\b/i],
      ["repair", /\brepair(?:ed|ing)?\b/i],
      ["installation", /\binstall(?:ed|ation|ing)?\b/i],
      ["improvement", /\brenovat(?:e|ed|ion)|remodel|upgrade/i],
      ["inspection", /\binspect(?:ed|ion)?\b/i],
      ["maintenance", /\bmaintenance|servic(?:e|ing)|clean(?:ing|ed)?\b/i],
    ]) {
      if (re.test(work)) {
        put("service.change_type", type, quote);
        break;
      }
    }
    for (const [category, re] of [
      ["plumbing", /faucet|plumb|pipe|p[- ]?trap|water heater|mixer tap|kitchen tap|basin tap/i],
      ["hvac", /hvac|air condition|boiler/i],
      ["electrical", /electric|wiring/i],
      ["roofing", /roof/i],
      ["renovation", /renovat|remodel/i],
    ]) {
      if (re.test(work)) {
        put("service.category", category, quote);
        break;
      }
    }
  }
  const paid = lines.find((x) =>
    /^(?:paid in full[.!]?|payment status\s*:\s*paid)$/i.test(x),
  );
  const completed = lines.find((x) =>
    /^(?:work status|service status|status)\s*:\s*completed$/i.test(x),
  );
  if (record.document.type === "estimate")
    record.service.completion_status = "planned";
  else {
    if (paid) put("amount.payment_status", "paid", paid);
    else { const payment = matchLabel("Payment status");
      if (payment[0] && /^(unpaid|partially paid)$/i.test(payment[0])) put("amount.payment_status", payment[0].toLowerCase() === "unpaid" ? "unpaid" : "partial", payment[1]);
    }
    if (completed) put("service.completion_status", "completed", completed);
  }
  result.status =
    result.relevance !== "home_service"
      ? "uncertain"
      : inspect(record).missing.length || inspect(record).errors.length || result.readability === "partial"
        ? "partial"
        : "review";
  return record;
}
