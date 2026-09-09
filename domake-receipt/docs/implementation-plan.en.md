[English](implementation-plan.en.md) · [中文](implementation-plan.md)

# Domic Home Passport: Partner Handoff and Next Implementation Phase

Confirmed scope for this round (2026-09-09): the user chose to build a reviewable prototype and implementation plan first, with real AI extraction in the next round. The confirmed product name is **Domic Home Passport**.

## Delivered modules

| File | Responsibility |
|---|---|
| index.html / styles.css | Workspace, side-by-side original document and fields, single-column mobile layout, and confirmation dialog |
| app.js | File selection and preview, sample flow, manual editing, state changes, confirmation, history, and export |
| core.js | Null, date, and amount validation; business-state rules; file validation and hashing; shared record structure |
| storage.js | Transactional saving, reading, and deletion of records and originals in browser IndexedDB |
| samples.js / samples/*.json | Three fictional examples and their fixed-format outputs |
| docs/receipt.schema.json | Machine-readable output contract for this round |
| docs/extraction-prompt.en.md | Draft extraction prompt for the next round; not yet tested with a model |
| docs/model-research.en.md | Official model capabilities and prices, cost assumptions, and evaluation methods recorded during research |
| docs/reference-research.en.md | GitHub references and candidates for later production extensions |
| docs/project-history.en.md | Evidence from the earlier project and the limits of its existing implementation |
| tests/ | Business-rule and workflow verification |

The prototype uses TimeMemo's existing static GitHub Pages publishing setup. It makes no model requests and has no server uploads, cloud database, login, account permissions, or cross-device synchronization. IndexedDB is explicitly local prototype storage on the current device; it is not a connection to the Domic backend. The prototype has no third-party runtime scripts. Fonts load from Google Fonts, with system fonts as a fallback.

Original files and structured records are stored in IndexedDB under this browser origin. Other application code on the same origin may access that local data, so this is not an isolation boundary for sensitive documents; use fictional samples for public reviews. Saved records can be restored after closing a tab, but private browsing, clearing site data, or browser storage eviction can remove them. JSON exports do not include the original binary files; download originals separately. JSON import is not implemented in this round.

## Architecture for the next round

Continue the earlier plan: a Next.js application and API, Supabase PostgreSQL, and private R2 object storage. If the partner's existing platform differs, adapt it to the same data contract. Do not embed API keys in the browser or require end users to configure keys.

```text
Desktop or mobile browser
  → Authenticated upload endpoint / private, short-lived upload URL
  → documents + extraction_jobs
  → One extraction service (Gemini adapter → schema → business rules)
  → Draft for review, with field evidence
  → User review and corrections
  → Transactional confirmation (record + revision + file relationships)
  → Property activity history / search / export
```

Each receipt does not need multiple agents working on it. One replaceable multimodal extraction service with deterministic validation makes costs easier to control. Multiple agents can support research and engineering review instead.

Suggested data objects: `properties` for ownership and permissions; `documents` for document type, original file, hash, and total amount; `activities` for property service events; `activity_documents` for many-to-many relationships; `extraction_jobs` for processing status and usage; `extractions` for original model outputs; and `review_revisions` for user changes and confirmations. Check property permissions on the server. Store each document total once; do not copy its full amount to every linked activity as separate spending.

## Draft API contract — not deployed

| Endpoint | Input and output | Core constraints |
|---|---|---|
| POST /api/documents | File metadata + property_id → document_id + upload URL | Check authorization, actual file type, size, and quota; use an idempotency key |
| POST /api/documents/:id/extractions | document_id + schema_version → job_id | Process only uploaded files belonging to the current account; ensure idempotency and bounded retries |
| GET /api/jobs/:id | queued / processing / needs_review / failed / canceled | Return processing stage, error reason, and draft; show percentages only when progress is actually measurable |
| PATCH /api/records/:id | Changed fields + revision | Save a draft; use optimistic locking to avoid overwriting another person's changes |
| POST /api/records/:id/confirm | Final fields + expected_revision + idempotency key | Check permissions, schema, and business rules, then confirm transactionally; report success only after durable storage succeeds |
| GET /api/properties/:id/history | Filters / pagination → confirmed activities | Display estimates, supporting documents, and completion status distinctly |
| DELETE /api/records/:id | record_id | Require authorization and user confirmation; delete originals, derived data, and revisions according to the retention policy |

This is a proposed integration contract. It does not imply that Daniel's existing system already provides these endpoints.

## End-to-end interaction and failure handling

| Stage | Expected behavior or recovery | Status in this round |
|---|---|---|
| Select a file | PDF/JPG/PNG/WebP; 15 MB limit in this round; ask users to convert HEIC; reject empty files and basic type/signature mismatches | Basic type, signature, and size checks implemented; not a security scan or a full PDF parser |
| Preview | Keep the original accessible; open it separately if a PDF cannot be embedded; the browser PDF viewer handles page navigation | Implemented; encrypted or damaged PDFs require the user to export a usable copy; page counts are not parsed automatically |
| Upload | Show actual transfer progress; retain the job or draft after a connection failure; allow retry | No server upload in this round; planned for the next round |
| Extract | Show stages and allow cancellation; proposed behavior: explain delays after 15 seconds, time out and recover after 45 seconds, and retry a 429/503 at most once with jittered backoff | Only a simulated sample delay and cancellation are implemented; real jobs come next round |
| Multiple documents | Detect multiple invoices and route them to splitting and review; disclose page counts and failed pages in long PDFs; do not read only the first page | Manual splitting in this round; automatic detection next round |
| Review | Explain unknown or ambiguous fields; separate service and issue dates; require the user to confirm property assignment if addresses differ | Manual property assignment in this round; matching against authorized property candidates next round |
| Confirm | Confirmation dialog and review checkbox; allow missing information, but require a property and summary | Implemented |
| Save | Store originals and fields in one transaction; preserve the form and offer draft export if storage is full | Implemented locally; atomic server-side submission next round |
| Deduplicate | Open the existing record for an identical file; let the user compare possible duplicates | SHA-256 deduplication in the same browser is implemented; cross-device and semantic deduplication next round |
| Edit again | Do not silently discard changes; clearing a field should preserve null; reconfirmation updates the same record | Implemented; collaborative editing and audit history next round |
| Success | State the actual storage location; support viewing and editing history, JSON export, original-file download, and confirmed deletion | Implemented locally |

The prototype does not automatically reconcile line-item sums because taxes, discounts, or fees may be missing. In the next round, flag differences only when all components are available; never silently rewrite the document total.

## Suggested one-week pilot

1. Have Daniel confirm the existing technology stack, authentication method, property_id, target regions, and business scope. The product name is already confirmed as Domic Home Passport.
2. Prepare about 100 authorized or synthetic samples covering different providers and formats, and manually label the key fields. Most of the 13 old PDFs are blank templates and should only support regression checks.
3. Use the same schema and prompt to compare 2.5 Flash-Lite, 3.1 Flash-Lite, and 3.5 Flash-Lite. Use 2.5 Flash and 3 Flash Preview as comparisons for complex samples.
4. Measure field accuracy, fabricated critical fields, user correction rate, p50/p95 latency, timeout and retry rates, and total cost per confirmed record. Keep a held-out test set that is not used to tune the prompt.
5. After choosing the model, implement upload jobs, private originals, property authorization, transactional saving, and error recovery before a small real-user trial.

Proposed targets, not measured results: for clear single-page documents, p50 below 5 seconds and p95 below 15 seconds. Evaluate critical fields such as amount, currency, and dates separately. Require human review of model suggestions. Agree on acceptance thresholds using the partner's actual sample set.

## Open decisions

- What production domain and existing repository should the implementation use?
- Should the first release support Ireland (EUR), the UK (GBP), or the US (USD)? The prototype does not assume a currency.
- Which documents belong in property history: repairs, purchases, estimates, warranties, or inspection reports? Buying materials must remain distinct from installing them.
- How should multiple properties per person, co-owner and tenant permissions, and sale or rental handover access work?
- What are the free allowance, monthly/account quotas, site-wide budget, original-file retention period, and account-deletion policy?
- Should multi-page/multi-invoice files, date ranges, refunds, and itemized taxes or discounts be in the first or second release?
- Obtain Daniel's current database API and field contract, then define explicit mappings so the model layer stays separate from the internal system.

## Language update

The public workspace and brief default to English and offer a Chinese switch. User-authored names, addresses, notes and source quotes are preserved as entered. Record keys and enum values are identical across both interfaces; application-generated exported warnings use English. This update retains the existing browser database and URLs. Arabic receipt extraction has not been implemented or measured; the next-phase sample set should reflect the actual audience and countries, including Arabic text and regional currencies where needed.
