// Conservative English OCR experiment. Text is evidence, never an instruction.
import { blankRecord, set, inspect, validDate } from "./core.js";
export function extractText(text, confidence = 0) {
  const record = blankRecord();
  record.source.mode = "local_ocr";
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const usable = lines.join("\n");
  const result = {
    engine: "tesseract-7.0.0-eng",
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
          /[<=>~|_]{3,}/.test(value)))
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
  const matchLabel = (labels) => {
    const re = new RegExp("^(?:" + labels + ")\\s*[:#|]\\s*(.+)$", "i");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i],
        m = line.match(re);
      if (m) return [m[1].trim(), line];
      const bare = new RegExp("^(?:" + labels + ")\\s*[:#|]\\s*$", "i");
      if (bare.test(line) && lines[i + 1] && !lines[i + 1].includes(":"))
        return [lines[i + 1], line + "\n" + lines[i + 1]];
    }
    return [null, null];
  };
  for (const [field, labels] of [
    ["provider.organization_name", "Company|Service company|Business"],
    [
      "provider.person_name",
      "Technician|Performed by|Work performed by|Worker",
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
    const [value, quote] = matchLabel(labels);
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
      /\bindependent\b/i.test(usable) &&
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
    ["service.date", "Service date|Work date|Date of service"],
    ["document.issue_date", "Issue date|Invoice date|Receipt date"],
  ]) {
    const [value, quote] = matchLabel(labels);
    // Ambiguous day/month dates stay blank; no substitution of invoice date.
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value) && validDate(value))
      put(field, value, quote);
  }
  for (const line of [...lines].sort(
    (a, b) => Number(/^Grand total/i.test(b)) - Number(/^Grand total/i.test(a)),
  )) {
    const m = line.match(
      /^(?:Grand total|Total)\s*[:|]?\s*(?:(AED|SAR|USD|EUR|GBP|CNY|QAR|KWD|BHD|OMR)\s*)?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)\s*(AED|SAR|USD|EUR|GBP|CNY|QAR|KWD|BHD|OMR)?$/i,
    );
    if (m && m[1] && m[3] && m[1].toUpperCase() !== m[3].toUpperCase())
      continue;
    if (m) {
      put("amount.total", Number(m[2].replaceAll(",", "")), line);
      put("amount.currency", (m[1] || m[3] || "").toUpperCase(), line);
      break;
    }
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
  const home =
    /\b(plumb(?:ing|er)?|faucet|p[- ]?trap|hvac|air condition(?:er|ing)|roof(?:ing)?|electrical|electrician|kitchen|bathroom|bedroom|door lock|light switch|renovation|home repair|landscaping|water heater|ceiling|drywall|carpentry)\b/i.test(
      usable,
    );
  const unrelated =
    /\b(restaurant|cafe|dine[- ]?in|takeaway|boarding pass|flight ticket|taxi fare|hair salon|haircut)\b/i.test(
      usable,
    );
  result.relevance = home
    ? "home_service"
    : unrelated && documentLine
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
      ["plumbing", /faucet|plumb|pipe|p[- ]?trap|water heater/i],
      ["hvac", /hvac|air condition/i],
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
    if (completed) put("service.completion_status", "completed", completed);
  }
  result.status =
    result.relevance !== "home_service"
      ? "uncertain"
      : inspect(record).missing.length || result.readability === "partial"
        ? "partial"
        : "review";
  return record;
}
