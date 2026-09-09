[English](intake-flow.en.md) · [中文](intake-flow.zh.md)

# Intake, review and recovery

Updated September 9, 2026. This document describes the current prototype and its next-phase boundaries. The separate test report records actual experiments; the acceptance checklist below is a plan, not a passed-test claim.

## Current implementation

Domic Home Passport reads printed English images locally using self-hosted Tesseract.js 7.0.0. A limited label parser turns recovered text into draft fields. The file is not sent to an external recognition service. Processing can be cancelled or retried and has a 45-second deadline. PDFs currently support preview and manual entry. Gemini, Arabic recognition and general layout understanding remain next-phase work.

This reader cannot reliably distinguish a sharp ordinary photograph from a blurred document when neither produces usable text. It also cannot establish relevance from missing keywords. OCR confidence is an engine diagnostic, not the probability that an extracted field is true.

## Result states

| Result | Interface and next action |
|---|---|
| `review` | Useful home-service fields: automatically open a summary with access to the full editing form. |
| `partial` | Retain recovered facts; show missing details; open review. Unknown values remain blank. |
| `no_text` | No usable receipt information found. Explain possible photo, readability or language limitations; offer replacement or manual entry. Do not claim the photograph is blurry. |
| `unrelated` | Recognized text suggests an unrelated service. Show recovery choices; never silently add home history. |
| `uncertain` | Insufficient evidence of relevance. Ask the user to verify the property connection or enter details manually. |
| Invalid/unsupported file | Explain the applicable format, size or decoding problem and allow replacement. |
| Cancelled/failed/timed out | Stop processing, offer retry/manual entry, and prevent late results from overwriting another file. |
| Duplicate file | Open the existing saved record instead of creating another copy. |
| Save failed | Retain edits, offer retry or export, and show no saved confirmation. |

Readability and relevance are separate assessments. These are conservative text-based routes, not guaranteed visual or semantic classification.

## Confirm before recording

Upload/open → read → review summary → edit the full form if needed → review final summary → tick confirmation → save. Nothing becomes a confirmed record merely because extraction finished. The final confirmation must reflect the latest edits.

The review includes property, work description, change type, location, actual service date, company, individual worker, amount/currency, payment and completion. Require property assignment and a meaningful work description. Other facts may remain unknown and are shown as missing. Users may save a draft or explicitly confirm an incomplete record. “Saved” appears only after storage succeeds.

Schema 1.1 separates `provider.organization_name` and `provider.person_name`; `provider.name` remains a compatible display name. `service.change_type` describes repair, replacement, installation, improvement, maintenance or inspection. Missing facts use `null` or `unknown`; no invented dates, people, currency or completion. Original quotes, OCR text and engine confidence accompany exported results. Human edits must not be presented as facts read from the document.

Records and originals live in this browser’s IndexedDB. This is not a shared database or cross-device account.

## Identity and production follow-up

Company and actual worker are different identities. Customer, preparer, salesperson and a signature alone do not establish who performed work. Future entity linking must keep observed names and evidence; identical names never automatically merge businesses or people.

The backend should verify accounts, authorize each property independently for owners and Pros, retain extraction/review revisions and audit access, and use idempotent saves. Company/person matching and contact connections require an authorized, reviewable decision. Keep property addresses private; receipt submission must not publish addresses or automatically contact named people. Add representative Arabic/mixed-language samples, authenticated storage and server-side model validation before production use.

## Acceptance plan — outcomes recorded separately

| Cases | Planned checks |
|---|---|
| 01–04 | Clear receipt; missing fields; cropped partial receipt; severe blur. |
| 05–08 | Sharp ordinary photo; automotive invoice; restaurant receipt; home-damage photo. |
| 09–12 | Unfamiliar layout; customer/preparer/technician separation; company without worker; quotation. |
| 13–16 | Ambiguous date/currency; one multi-page invoice; multiple invoices/page limits; corrupt/protected file. |
| 17–20 | Empty/oversized/unsupported file; failure/timeout/cancellation; duplicate/double save; edited-value confirmation. |
| 21–24 | Required versus optional gaps; storage failure; Arabic/mixed script; unsaved edits during replacement/language switch. |

Measure actual fixture outcomes, missing or incorrect critical fields, identity errors, recovery and latency. Synthetic examples do not establish real-world accuracy.

References: [Tesseract.js FAQ](https://github.com/naptha/tesseract.js/blob/master/docs/faq.md), [Tesseract quality guidance](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html), [Document AI quality assessment](https://docs.cloud.google.com/document-ai/docs/handle-response#image_quality_scores), [Gemini document understanding](https://ai.google.dev/gemini-api/docs/document-processing).
