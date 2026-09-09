import { blankRecord } from "./core.js";
export const samples = {
  plumbing: {
    title: "厨房水管维修",
    provider: "Evergreen Plumbing · Fictional",
    type: "receipt",
    number: "DEMO-1042",
    issue: "2026-08-18",
    date: "2026-08-17",
    category: "plumbing",
    summary: "更换厨房水槽下方存水弯，含人工与配件。",
    location: "厨房 · 水槽下方",
    address: "123 Example Lane, Sample City, WA 00000",
    total: 285,
    currency: "USD",
    payment: "paid",
    completion: "completed",
    items: [
      { description: "Kitchen P-trap replacement · labor", amount: 220 },
      { description: "Parts and materials", amount: 65 },
    ],
    warranty: "Labor warranty: 90 days from service date.",
    evidence: [
      { field: "service.date", page: 1, quote: "Service date: 2026-08-17" },
      { field: "amount.total", page: 1, quote: "Total paid: USD 285.00" },
      {
        field: "property.service_address",
        page: 1,
        quote: "Service at: 123 Example Lane, Sample City, WA 00000",
      },
    ],
  },
  hvac: {
    title: "空调年度保养",
    provider: "Northline Heating · Fictional",
    type: "invoice",
    number: "DEMO-2088",
    issue: "2026-08-22",
    date: null,
    category: "hvac",
    summary: "空调年度保养。",
    location: null,
    address: null,
    total: 189,
    currency: "USD",
    payment: "unknown",
    completion: "unknown",
    items: [{ description: "Annual HVAC tune-up", amount: 189 }],
    warranty: null,
    evidence: [
      {
        field: "document.issue_date",
        page: 1,
        quote: "Issue date: 2026-08-22",
      },
      { field: "amount.total", page: 1, quote: "Amount due: USD 189.00" },
    ],
  },
  roof: {
    title: "屋顶更换报价",
    provider: "Summit Roofing · Fictional",
    type: "estimate",
    number: "DEMO-Q306",
    issue: "2026-09-01",
    date: null,
    category: "roofing",
    summary: "计划更换屋顶，当前为预估报价。",
    location: "屋顶",
    address: "123 Example Lane, Sample City, WA 00000",
    total: 12800,
    currency: "USD",
    payment: "unknown",
    completion: "planned",
    items: [
      { description: "Roof replacement — estimated price", amount: 12800 },
    ],
    warranty:
      "Proposed: 10-year workmanship warranty; starts after completed installation.",
    evidence: [
      { field: "document.type", page: 1, quote: "ESTIMATE — not a receipt" },
      {
        field: "amount.total",
        page: 1,
        quote: "Estimated total: USD 12,800.00",
      },
    ],
  },
};
export function sampleRecord(key) {
  const s = samples[key],
    r = blankRecord();
  r.property = { id: "示例房屋 · Example Lane", service_address: s.address };
  r.document = { type: s.type, number: s.number, issue_date: s.issue };
  r.service = {
    date: s.date,
    category: s.category,
    summary: s.summary,
    location: s.location,
    completion_status: s.completion,
  };
  r.provider.name = s.provider;
  r.amount = {
    total: s.total,
    currency: s.currency,
    payment_status: s.payment,
  };
  r.items = structuredClone(s.items);
  r.details.warranty = s.warranty;
  r.source = {
    name: `${key}-demo.pdf`,
    mime_type: "application/pdf",
    sha256: null,
    mode: "demo",
    sample_id: key,
  };
  r.evidence = structuredClone(s.evidence);
  return r;
}
