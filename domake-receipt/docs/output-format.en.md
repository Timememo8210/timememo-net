[English](output-format.en.md) · [中文](output-format.md)

# Domic Home Passport: Fixed Output Format v1

Updated: 2026-09-09. This specification matches the prototype's `core.js`, `samples.js`, and exports. The authoritative machine-readable contract is [receipt.schema.json](receipt.schema.json). Extended structures in the research notes are future candidates, not a second v1 format.

## Core information

| Form information | JSON path | Rule |
|---|---|---|
| Assigned property | `property.id` | A user-entered property name or identifier in this round; production must use the real UUID of a property the user is authorized to access, never a model-generated guess |
| Service date | `service.date` | Actual service date in YYYY-MM-DD format; null if unknown; do not substitute the document issue date |
| Service description | `service.summary` | One sentence describing work performed or planned; the user must provide it before confirming the record |
| Property system and location | `service.category`, `service.location` | HVAC, plumbing, roofing, etc., plus the specific room or location; use unknown for a missing category and null for a missing location |
| Service provider | `provider.name` | Merchant or service-provider name as written in the document; do not invent it from general knowledge |
| Service address | `property.service_address` | Address where the work took place; keep it separate from the provider's business address in `provider.address` |
| Total amount and currency | `amount.total`, `amount.currency` | Amount is a number or null; currency is a three-letter ISO code supported by the source document, with no default to USD |
| Document type | `document.type` | receipt / invoice / estimate / warranty / other / unknown |
| Payment and work status | `amount.payment_status`, `service.completion_status` | Independent states: payment does not prove completion, and an estimate does not prove spending |

Optional details: `document.issue_date` for the issue date; `document.number` for the document number; `provider.phone` and `provider.address`; `items[]` with descriptions and amounts; `details.asset_model`, `details.asset_serial`, `details.warranty`, and `details.permit_number`; and `notes`. Fill information when available and leave it empty when absent.

## Missing values, zero, and errors

- Missing scalar values use JSON `null`; the UI shows a blank field or “Unknown.” Do not write an empty string, N/A, or 0 to represent missing information. An explicitly stated zero amount may be stored as `0`. Use `unknown` for enum fields when the document provides no information.
- An empty item list is `[]`; it is not evidence that the amount is zero. A failed model extraction is a job error, not a successful empty record.
- This round's UI does not distinguish reasons for missing values; it marks them as unknown. The next round will add field metadata for `not_present / unreadable / ambiguous / not_applicable`.
- Store dates as local calendar dates without timezone conversion. If only a month is known, the date is ambiguous, or a service-date range cannot be represented, leave the date null and preserve the original wording in notes/evidence. Date-range fields are a next-round extension.
- Currency and amount may both be missing. `$` alone does not establish USD; the user must verify the currency. The prototype supports only nonnegative document totals. For refunds or negative amounts, preserve the original and add notes; a dedicated refund format is planned for the next round.
- Prototype JSON amounts are numbers. When writing to the production database, convert them to DECIMAL or fixed-point amounts using the currency's precision to avoid floating-point accumulation. The prototype does not aggregate different currencies, count estimates as spending, or make budget or tax judgments.
- Confirmed records may remain incomplete. `review.missing_fields` retains fields that still need information. A user-confirmed property assignment and service summary are required.

## Application and model responsibilities

The future model should output only facts visible in the document and supporting evidence. It must not generate property IDs, confirmation status, save dates, or claims about increased property value. The application supplies `schema_version`, `id`, `source`, `review`, and timestamps.

In this round, `source.mode` supports only `demo` and `manual`. Connecting real AI in the next round requires extending this enum and adding model/prompt version metadata; manual input must not be presented as AI extraction. `source.sha256` identifies identical files in the current browser; it does not prove that a document is authentic or that work occurred.

`review.status` is draft / confirmed. `evidence[]` stores the field path, page number, and quoted source text; only the synthetic samples have evidence in this round. `review.edited_fields` identifies modified field paths and is not a complete audit log. Production should store original model results and versioned human-review revisions separately, preserving the original evidence.

This round treats one file as one logical document and one property activity. Split PDFs containing multiple invoices before using the prototype. If one invoice covers several services, a combined summary can be used for now. A production model should detect multiple documents and route them to splitting, never silently ignore pages. Later, several activities can link to one document_id, with the document total stored only once.

## Three downloadable examples

- [Complete receipt](../samples/plumbing.json): different service and issue dates, with payment recorded.
- [Invoice missing its service date and address](../samples/hvac.json): missing information remains null, and payment/completion states are not guessed.
- [Roof estimate](../samples/roof.json): planned work, unknown payment status, and an estimated total that does not represent actual spending.

All names, addresses, and amounts in these examples are fictional. The sample outputs are drafts awaiting confirmation, not model evaluation results.

## Language update

The public workspace and brief default to English and offer a Chinese switch. User-authored names, addresses, notes and source quotes are preserved as entered. Record keys and enum values are identical across both interfaces; application-generated exported warnings use English. This update retains the existing browser database and URLs. Arabic receipt extraction has not been implemented or measured; the next-phase sample set should reflect the actual audience and countries, including Arabic text and regional currencies where needed.
