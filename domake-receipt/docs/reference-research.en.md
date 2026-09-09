[English](reference-research.en.md) · [中文](reference-research.md)

> This research memo includes more extensive candidates for a future production design. The only export contract implemented in this round is [receipt.schema.json](receipt.schema.json), as described in [output-format.en.md](output-format.en.md). Candidate field names, fixed-point monetary values, date ranges, refund and material-purchase statuses, and other proposals are not all implemented in the prototype. Migration belongs to a later version.

# Domic Home Passport: Fields, Review Workflow, and Reusable Resources

Research date: September 9, 2026. Purpose: support the Domic Home Passport home-history receipt-entry prototype and partner handoff. The fields and product behavior below are design recommendations for this project. Repository capabilities and licenses were checked against primary GitHub pages, LICENSE files, and the GitHub API. This round involved desk research only: no external skills were installed, no external code was copied, and none of these repositories was tested by running it.

## 1. Recommended product definition

Turn uploaded documents into home-maintenance records with original evidence that users can review and correct. The value of a repair invoice goes beyond the amount spent: it records when work happened, what was repaired, who performed it, which system or equipment was involved, and whether evidence can be found later for a claim, maintenance, or resale.

Retain two layers: the **document** is the source of facts, and the **home activity record** is the organized result confirmed by the user. These are often one-to-one, but one invoice can contain several services, and one repair can involve a quote, invoice, payment receipt, warranty card, and other documents. The first interface can be simple without locking the data relationships into a permanent one-to-one model.

The errors most likely to damage trust in a home's history are treating an invoice date as the work date, a business address as the property address, a quote as completed work, and several documents for the same job as separate expenses. Address these four risks before prioritizing item-by-item product recognition.

## 2. Minimum main form: nine information groups

| Interface field | Proposed field | Why retain it | Handling when missing |
|---|---|---|---|
| Property | `property_id` | The key linking a record to the home's history; selected by the user from their properties | May be empty in a draft; must be confirmed before final filing. The model must not invent an ID. |
| Service date | `service_date_start`, `service_date_end` | Records the date or date range when work took place | `null`; show the invoice date separately without presenting it as the service date. |
| What was done | `summary` | A one-sentence description of the work, more useful than simply “service” | Can be filed after the user adds a summary. Without evidence of service, describe the document according to its actual nature. |
| System / location | `category`, `location_detail` | Organizes history by roof, HVAC, plumbing, and similar systems | `category: "other"` or `"unknown"`; location `null`. |
| Service provider / merchant | `provider_name` | Supports future contact, repair tracking, and document lookup | `null`, with a missing-information flag. |
| Service address | `service_address` | Checks whether the document belongs to the property | `null`; the user can still manually confirm the property. Never copy the business address into this field to fill the gap. |
| Amount and currency | `total_amount`, `currency` | Retains the documented amount in its original currency | Both may be `null`. Do not enter 0 or default to USD. |
| Document type | `document_type` | Distinguishes receipts, invoices, quotes, work orders, and other documents | `"unknown"`, with a prompt for user confirmation. |
| Payment / work status | `payment_status`, `activity_status` | Payment does not prove work is complete; purchased materials do not prove installation | `"unknown"`; update only with evidence or user confirmation. |

The main form can use a compact two-column layout. Put the issue date, document number, line items, taxes, equipment, warranty, and notes in an expandable “More information” section. Do not require every document to have every optional field completed.

**Suggested filing requirements:** once the user has selected a property they can access, confirmed or added a summary, and reviewed the source document, they should be able to save an incomplete record. An unknown date, merchant, or amount should not prevent retaining genuine evidence. Show “Filed · Information incomplete” instead of claiming that all information is accurate. Any model result that has not been confirmed by the user remains a draft.

Suggested initial category enum: `hvac`, `plumbing`, `electrical`, `roof`, `appliances`, `structure`, `interior`, `exterior`, `landscaping`, `pest_control`, `safety_security`, `cleaning`, `other`, `unknown`. Categories are organizational labels, not proof that work occurred.

## 3. Candidate production extension format: not this round's v1 export contract

Keep the confirmation form simple and the export structure stable. The following is a **draft example of a candidate production extension**. All names, addresses, and amounts are synthetic demonstration data, not real user receipts. Keep fixed keys and write JSON `null` when a value cannot be extracted. The application maintains `source`, `property_id`, and `review`. The model only populates `document` and `activity` and provides field evidence; it cannot decide the filing status on the application's behalf.

```json
{
  "schema_version": "1.0",
  "record_id": "draft_demo_001",
  "property_id": "property_demo_01",
  "source": {
    "document_id": "document_demo_001",
    "file_name": "sample-hvac-invoice.pdf",
    "page_count": 2
  },
  "document": {
    "document_type": "invoice",
    "document_number": "DEMO-1042",
    "issue_date": "2026-09-03",
    "provider_name": "Example Home Services",
    "total_amount": "418.00",
    "currency": "USD",
    "payment_status": "paid"
  },
  "activity": {
    "service_date_start": "2026-09-01",
    "service_date_end": null,
    "summary": "Replaced the HVAC blower capacitor and checked operation",
    "category": "hvac",
    "location_detail": "Attic HVAC unit",
    "service_address": "100 Example Lane, Example City, CA 90000",
    "activity_status": "completed",
    "notes": null
  },
  "details": {
    "line_items": [],
    "equipment": [],
    "warranty": null
  },
  "review": {
    "status": "needs_review",
    "warnings": []
  }
}
```

Implementation conventions:

- `record_id` and `document_id` are unguessable IDs generated by the application. The example IDs are for demonstration only.
- Dates use `YYYY-MM-DD` and are stored as date values in the document's local calendar date. Do not convert them into UTC timestamps that could shift the day. Retain the start and end of a date range. If only a month or year is known, do not invent the first day of a month; leave the date empty and retain the original text in evidence metadata.
- Monetary amounts use fixed-point decimal strings such as `"418.00"`, with `DECIMAL` in the database. The frontend can still present a monetary input. Use an explicit three-letter currency code. `$` alone can represent several currencies; if the currency cannot be established, keep `null` and flag it. Number parsing must handle regional differences such as `1,234.56` and `1.234,56`.
- `document_type`: `receipt | invoice | estimate | work_order | warranty | refund | other | unknown`.
- `payment_status`: `paid | partial | unpaid | refunded | not_applicable | unknown`. A document titled “Invoice” does not prove that it is unpaid, and a receipt-like appearance does not prove that payment is complete.
- `activity_status`: `proposed | scheduled | completed | purchased | unknown`. Use `purchased` for bought materials. Do not change it to `completed` without an installation record.
- `review.status`: `needs_review | saved | rejected`. This is application state, not model confidence. Track completeness separately so one field does not mean both “saved” and “complete.”
- `details` is an extension area. `line_items: []` means that no usable line items were available after extraction, not that a zero total was confirmed. If an entire page is unreadable or extraction fails completely, use top-level processing status and warnings instead of returning an empty record that appears successful.
- More detailed payment information can add `amount_paid` and `balance_due`, but populate them only when explicitly stated in the document. Keep total, amount paid, and balance due separate; do not overwrite one with another.
- Retain `document_type: "refund"` explicitly for refund documents. If expense reporting is added later, define a consistent transaction-direction or sign convention separately. Do not infer that the user received a refund from a minus sign alone, or count the original invoice and refund as two positive expenses.

### Internal evidence metadata

Do not force evidence into every input field or overwhelm users with complex JSON. Store it separately in `field_meta` or review records. Suggested structure:

```json
{
  "field_path": "activity.service_date_start",
  "value_state": "present",
  "source_kind": "document",
  "page": 1,
  "raw_text": "Service completed: September 1, 2026",
  "review_reason": null,
  "human_verified": false
}
```

`value_state` may be `present | not_present | unreadable | ambiguous | not_applicable`. `source_kind` may be `document | user | derived`. Page references and original text supplied by the model must themselves be verifiable in the source document. Do not fabricate precise locations when no verifiable bounding box exists. Retain the model's original value, the user's final value, edit time, and reviewer for later review and evaluation.

For example, if no service date appears, the value is `null` and the metadata is `not_present`; unclear printing is `unreadable`; and `03/04/2026` is `ambiguous` if month/day order cannot be established. The interface should distinguish “Not provided in document,” “Unreadable,” and “Needs confirmation,” instead of turning every problem into an indistinguishable blank. A model's self-reported 0.97 is not validated 97% accuracy. The first version should prioritize explicit review reasons and evidence rather than using attractive but uncalibrated percentages to imply trustworthiness.

### Additional information worth retaining for the home domain

| Information | Priority | Extraction boundary |
|---|---|---|
| Equipment brand, model, and serial number | High | Extract when present in the source; useful for future maintenance, replacement parts, and recall checks. |
| Warranty term, expiration date, coverage, and original terms | High | Distinguish “one-year warranty” from an explicit expiration date. Do not calculate an expiration date without an explicit starting date. |
| Work location / room | High | Kitchen, primary bathroom, attic, and other specific locations offer more maintenance value than a general address alone. |
| Original issue, completed work, and recommended follow-up | Medium | Clearly separate what has been done from what is recommended for later. |
| Next maintenance date / frequency | Medium | Extract only what is explicitly documented. General suggestions from the model must appear as separate advice. |
| Labor, materials, taxes, discounts, and line items | Medium | Keep expandable; complete line-item extraction is not a prerequisite for first-version success. |
| Provider phone/email, license number, and work-order number | Medium | Store only when present in the source. Do not automatically claim that the provider's license has been verified. |
| Construction permits, inspection results, and related numbers | Medium | Important supporting records for later; an ordinary invoice is not evidence of a permit or an approved inspection. |

## 4. Addresses, duplicate documents, long PDFs, and multiple services

### Address matching

Identify the service address, billing address, and business address as separate roles. Only a service address can directly support property matching. Normalized street abbreviations, capitalization, and spacing can help generate match candidates, but retain the original text and unit number. Do not automatically declare a match because ZIP codes agree, streets look similar, or the user owns only one property.

Recommended interface: establish the current property before upload. After extraction, show “Address matches the current property,” “Different address,” or “No service address in the document.” For the latter two cases, let the user choose the correct property or confirm the association on the review page. The model must not overwrite an existing property address. A property ID outside the account's permissions must not be written; enforce permissions on the server.

### Duplicate uploads

1. If a file has the same SHA-256 hash within the same user or organization, show that it has already been uploaded and open the original draft or record. Avoid another model charge unless the user explicitly requests extraction again.
2. If files differ but the merchant, document number, date, amount, currency, and similar values match, flag a possible duplicate for comparison. Do not delete it automatically.
3. A quote, invoice, and payment receipt for one job are usually complementary evidence and should be linkable to one activity. Do not treat all of them as duplicates. Expense reporting should count the established expense record once.
4. Uploads, retries, and confirmed saves should carry application-generated idempotency keys. Retrying after a network timeout must not create a second home record. Use backend transactions and unique constraints; disabling a button is not sufficient.

### Multiple pages and separate documents

- The first version can have explicit limits, for example 10 pages and 20 MB per file. These are suggested product limits and must be distinguished from actual model and infrastructure limits. Display them before upload.
- Show the page count of a long PDF and allow relevant-page selection or require the file to be split. Do not process only its first page or first few pages and then report complete success.
- One two-page invoice is one document; two invoices scanned into one PDF are two logical documents. Retain page ranges and document groups. If multiple independent documents are detected, split them for review or clearly ask the user to split them.
- For long-document batches, retain page provenance, group identifiers, and failed pages. Failure in one group must not discard completed groups. Report full completion only after all pages have been covered.
- Use `documents[]` for independent documents and `activities[]` for different work within one document. Do not force everything into one enormous summary.
- An invoice containing air-conditioning maintenance and plumbing repair can produce two activities, each linked to the same `document_id`. Store the document total only once. Leave activity-level amounts empty when the cost cannot be allocated accurately; do not copy the total into every activity.

If the first version supports only one document and one activity, state that boundary explicitly in the interface and API contract. Route detected multi-document or multi-activity cases to manual handling rather than silently merging them. For the future database, the recommended object groups are `documents`, `activities`, `activity_documents`, `extractions`, and `review_revisions`. The partner can decide whether to split them into physical tables based on the chosen technology stack.

## 5. Complete workflow from upload to database

```text
Select property → Choose or drop a file → Validate and preview the file
  → Upload complete → Queued / extracting → Extract type and fields
  → Validate structure and check dates / amounts / addresses / duplicates
  → Editable review page → User confirms save
  → Save succeeds → View original, edit, or export from the home's history
```

“Upload complete,” “Extraction complete,” and “Saved” are three different outcomes. Show the final success message only after the database confirms the save. If a prototype stores data only in the browser, explicitly say “Saved to this browser.” A sample demonstration must not be presented as completed live AI recognition.

| Situation | What the user should see | Next step |
|---|---|---|
| Valid JPG / PNG / PDF | Original preview, extraction progress, and editable results | Review and save. |
| iPhone HEIC or another unsupported format | A clear unsupported-format explanation and a way back | Convert to a supported format and upload again; add server-side conversion later. |
| File too large / too many pages | Actual size or page count alongside the allowed limit | Select pages, split the file, or choose a different file. |
| Password-protected PDF / damaged file | An explanation instead of an endless spinner | Upload an unprotected version or another file. |
| Blurry document or cropped amount/date | Specific fields marked “Unreadable,” with other results retained | Replace with a clear image or enter the values manually. |
| Not a target document | The document type detected | Choose another file or enter the record manually. |
| Model timeout, 429, or service failure | Current step and a retry action, retaining the file and edits | A limited number of background retries, then manual entry. |
| Invalid model JSON | A clear message without exposing a raw exception stack | One controlled retry; after another failure, open a blank form and retain the source. |
| Amount calculation mismatch | The printed total and the calculation discrepancy | User checks the values; do not replace the printed total automatically. |
| User cancels or goes back | Entered content retained as a draft | Resume later without forcing another extraction. |
| Confirmed save fails | Explicit “Not saved” status, with all edits retained | Retry saving; idempotency prevents duplicates. |
| Confirmed save succeeds | Summary, associated property, status, and a link to view the record | Upload another file, view the source, edit, or export. |

For desktop review, place the original on the left and fields on the right. On mobile, provide switchable source and field views. Do not squeeze every edit into a small, non-scrollable modal. Use a large drawer or dedicated review page, followed by a concise success message after saving. Design keyboard access, screen-reader announcements for upload/save status, and focus on fields with errors from the first version.

If an image is uploaded again, the model must not silently overwrite fields the user has edited. Show the differences and let the user accept new extracted values. AI recognition produces drafts only; this also lets a future mobile camera entry point reuse the same backend workflow.

## 6. Five GitHub references and their boundaries

### A. Receiptor-AI/bookkeeping-skills — workflow and skill-structure reference

Provides a `receipt-processing` skill with fixed output fields, original-document references, exception handling, and a review workflow, plus a separate output-structure reference file. The repository is MIT-licensed. Its extraction → validation → exception queue → auditable export organization is a useful reference. Its domain is bookkeeping; property association, service dates, equipment, and completion status need our own design. Its tax categories and email-first strategy should not be copied directly. The commercial Receiptor service is not a free OCR engine bundled in the repository. [Repository](https://github.com/Receiptor-AI/bookkeeping-skills) · [receipt-processing source](https://github.com/Receiptor-AI/bookkeeping-skills/blob/main/skills/receipt-processing/SKILL.md) · [Output structure](https://github.com/Receiptor-AI/bookkeeping-skills/blob/main/skills/receipt-processing/references/OUTPUT-SCHEMA.md) · [MIT license](https://github.com/Receiptor-AI/bookkeeping-skills/blob/main/LICENSE)

**Suggested use:** take inspiration from its layered documentation and give the partner this project's own extraction instructions, JSON Schema, samples, and human-correction rules. The web feature does not require installing a complete bookkeeping skill set.

### B. invoice-x/invoice2data — possible low-cost path for frequent, fixed vendor formats

This Python tool supports PDF text and OCR backends, YAML/JSON regular-expression templates, and CSV/JSON/XML output. The reviewed repository also describes an optional AI fallback. MIT-licensed. It is suitable for recurring vendor invoices with consistent layouts. For varied user photographs, the benefit of maintaining many templates needs validation first. [Repository](https://github.com/invoice-x/invoice2data) · [MIT license](https://github.com/invoice-x/invoice2data/blob/master/LICENSE.md)

**Suggested use:** do not make a template engine a mandatory step in the first version. If one vendor later accounts for a large share of uploads, add a template shortcut that emits the same Domic Home Passport structure. Fall back to multimodal extraction when it fails.

### C. Docling — optional preprocessing for complex PDFs

Supports multiple file formats, PDF layout and table understanding, OCR, a unified document representation, and exports including JSON. It can run locally. The main code is MIT-licensed; individual models require separate checks of their original licenses. It processes document structure and does not automatically determine home-history business fields. [Repository](https://github.com/docling-project/docling) · [MIT license](https://github.com/docling-project/docling/blob/main/LICENSE)

**Suggested use:** retain as a future option for complex or multipage PDFs, layout evidence, or private deployment. Send ordinary photos and short PDFs directly to the multimodal model initially to avoid adding a local OCR environment, model downloads, and processing time.

### D. Instructor, now 567-labs/instructor — optional Python structured-extraction layer

Provides Pydantic-based structured results, type validation, and retries, with support for multiple model providers. The original `instructor-ai/instructor` address currently redirects to `567-labs/instructor`. The main code is MIT-licensed. It can help isolate provider interfaces, but it is not a complete upload, review, and database application. [Repository](https://github.com/567-labs/instructor) · [MIT license](https://github.com/567-labs/instructor/blob/main/LICENSE)

**Suggested use:** evaluate it as a direct dependency if the partner selects a Python backend. If retaining TypeScript, native provider structured output plus Zod / JSON Schema validation is sufficient for the first version; do not change the technology stack just to use a library. Business validation is required with either approach: valid JSON does not imply correct content.

### E. AkashaPrasad/receipt-parser — closest interaction reference; do not copy its code

The repository README describes photo/PDF uploads, Gemini extraction, deterministic checks, SQLite storage, two-column review, editing, and retaining edits after re-upload. Its direction closely matches this project. At review time, the GitHub API returned `license: null`, and the recursive file tree contained no LICENSE or COPYING file, so permission to reuse its code was not established. [Repository and workflow description](https://github.com/AkashaPrasad/receipt-parser)

**Suggested use:** take inspiration only from the publicly described interaction patterns and implement them independently. If the partner later wants to copy or derive code, obtain the author's explicit permission first. The completeness of this small repository's demonstration does not establish production readiness for this project.

### Review snapshot

These are the latest default-branch commits returned by the GitHub API during this review, so the partner can revisit the same versions. Active repositories will continue to change. These identify the research sources, not pinned production dependencies.

| Repository | Reviewed commit SHA | License review result |
|---|---|---|
| Receiptor-AI/bookkeeping-skills | `2c5958b6e749508f39f5f6acf2ca72396d43ec29` | MIT |
| invoice-x/invoice2data | `68c449c5334e192a214969058aaa92c65a5172ba` | MIT |
| docling-project/docling | `cdc2477e12107f45bf8b6813571f31f9e795ba07` | Main code MIT; models need separate review |
| 567-labs/instructor | `6192284d26743db3fe5d5c06a5472e718613f760` | MIT |
| AkashaPrasad/receipt-parser | `0588b8eb3fc74cf7e87910a0506bc597fb35647b` | No license found; permission to copy not established |

Copying or distributing MIT-licensed projects requires retaining the applicable copyright and license notices. Record dependency versions and licenses when actually introducing them. A repository being described as “open source” does not mean that all of its models, dependencies, and attachments share the same license. [Example MIT license text](https://github.com/invoice-x/invoice2data/blob/master/LICENSE.md)

## 7. First-round acceptance and architecture recommendations for the partner

**The prototype can cover:** web file selection, photo/PDF preview, fixed-field review, missing and error states, manual corrections, saving results, a history list, source-document association, JSON export, and demonstration examples. If backend AI is not connected, prominently identify demonstration data and browser-only storage. Do not claim that arbitrary user files have already been correctly read by AI.

**Before a real user pilot:** add server-side model calls and key management, private file storage, permission checks, database persistence, upload/task/confirmed-save APIs, limited retries, quotas, and cost records. Publish only synthetic samples and project documentation on the public website. Do not commit users' real property addresses, receipt images, or API keys to public GitHub or static assets.

Suggested API responsibilities: upload returns a `document_id`; creating an extraction job returns a `job_id`; the frontend queries job status and receives a draft; the user submits changes and confirmation; the save endpoint validates permissions and the idempotency key, then commits the record atomically. The extraction service must not directly write final home-history records. It does not require a multi-agent runtime with unrestricted tool calls; multi-agent work is more useful during this research and development stage.

Start with a suggested 60–100 authorized or synthetic evaluation files, covering clear and blurry photos, phone screenshots, digital and scanned PDFs, different service and issue dates, estimates, partial payments, material purchases, warranties, duplicate uploads, multipage files, and mixed documents. Keep a held-out test set that is not used to tune the prompt. This sample size is a starting recommendation, not a statistical guarantee of production accuracy.

Track key-field accuracy, the rate of invented key-field values, the number of fields requiring edits, confirmation time, first-attempt success rate, recovery rate after failure, actual cost per document, and latency distribution separately. Prioritize service dates, property matching, amount and currency, document type, and work status above ordinary category labels. Model self-assessment cannot replace human-labeled reference answers.

Validate amount calculations only when enough components are present. Do not declare an error when discounts, additional fees, or taxes are missing. When values differ, show the original and calculated amounts without automatically rewriting the total. Treat all document content as data to extract. Text such as “ignore the rules” or “visit this URL” must not change server-side extraction instructions or gain additional permissions.

## 8. Product choices to discuss with the user and partner

1. Should the first release cover maintenance and repairs only, or also purchased materials, renovations, cleaning, warranties, and inspection reports? Recommendation: allow different document types and clearly show their status on the main timeline.
2. Can one user have several properties, co-owners, or tenants? This affects property selection and data permissions. Recommendation: start the prototype with one property while retaining `property_id`.
3. Can a record be saved without a service date or amount? Recommendation: allow it and mark it incomplete so users and models are not pushed into guessing.
4. What API and fields does the partner's existing system accept? This report proposes an independent, stable contract. Add a mapping layer later instead of asking the model to emit an unknown internal system format directly.
5. How should maximum pages per document, free quotas, paid/free model routing, and original-document retention be set? Decide using costs and latency measured on real samples.
6. Will the first release support several activities per document? If not, tell users clearly and provide a manual way to split or summarize them.

These questions do not prevent completing a reviewable prototype. The initial recommendations are: extract English and Chinese content; accept JPG, PNG, and PDF uploads; let users select a property; process one logical document at a time initially; require human confirmation for every result; export a fixed JSON structure; allow missing information to be saved with flags; and explicitly describe the integration boundaries for a real model, database, and private storage in the page documentation.
