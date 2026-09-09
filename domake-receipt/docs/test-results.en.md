[English](test-results.en.md) · [中文](test-results.zh.md)

# Actual experiments — September 9, 2026

Six fictional PNG files were processed by the real browser Tesseract.js 7.0.0 English engine and the current extraction rules. No Gemini call was made; expected values were not supplied to the reader. These are development fixtures used to improve the parser, not a held-out accuracy benchmark.

## Method and observed results

The company and individual receipts were selected through the in-app browser file chooser. All six cases can also be rerun through the site's “Test the reader with six fictional images” controls: each fetches the actual PNG, creates a File, and uses the same validation, hashing, OCR and review path as an uploaded image. Chrome was used for the repeatable case controls and final regression checks. No filename/hash selects an extraction answer. The manifest is ground truth and is never imported by the application.

| Actual input | Observed result |
|---|---|
| [Company receipt](../test-assets/01-clear-company.png) | `review`; Cedar Home Services, worker Omar Hassan, replacement of kitchen faucet, 2026-09-01 service date, AED 420, paid and completed after parser correction. Customer Lina Patel was not treated as worker. Issue date remained 2026-09-02. |
| [Individual receipt](../test-assets/02-clear-individual.png) | `review`; Samir Ali, company null, repair of bedroom door lock, wrapped service address, 2026-08-28 and AED 260. Customer Noura Mansour was not treated as worker. Home-system category stayed unknown. |
| [Missing information](../test-assets/03-partial-missing-fields.png) | `partial`; Blue Palm Electrical, light-switch repair and service address retained. Date, amount, currency and worker stayed null. Review modal opened. Home-system category stayed unknown. |
| [Unreadable blur](../test-assets/04-unreadable-blur.png) | `no_text`; no successful extraction form or automatic saved record. Replacement, retry and manual entry offered. |
| [Restaurant receipt](../test-assets/05-unrelated-restaurant.png) | `unrelated`; readable restaurant text identified as outside home-service scope. Did not call the image blurry; no automatic saved record. |
| [Landscape photograph](../test-assets/06-unrelated-landscape.png) | `no_text`; OCR produced noisy fragments, but conservative confidence filtering prevented receipt fields. Did not claim to know whether the input was a blurry document or photo. |

## Observed interaction checks

- Extraction alone left the record count unchanged. In the Chrome experiment it stayed at zero through partial, blur, restaurant and landscape cases.
- Manual recovery from the landscape produced blank company, worker and summary fields, without carrying over the prior receipt.
- Edited worker to “Omar Hassan (checked)” and assigned “QA Villa 18”. The final confirmation displayed the edited name. Save was disabled before the checkbox was checked.
- Explicit confirmation created one local record. Adding the same company file again opened that record and kept the count at one.
- Cancelling a real landscape OCR task returned to the upload screen without a new record. Further work did not receive its late result.
- English/Chinese switching retained the existing saved record. The Chinese partial-result modal preserved the original English document text.
- Visually checked the review dialog at desktop and 390 × 844 viewport size. Changed the mobile dialog to scroll its summary while keeping its review button visible. This is not a physical-phone camera test.

## Fixes made during this iteration

Added wrapped-label handling and explicit payment/work-status labels; separated company and worker; kept ambiguous Contractor names as display names; excluded Amount due from document total and preferred Grand total; prevented customer/preparer names from becoming workers. Fixed duplicate-open busy state, suppressed duplicate-success notices when opening fails, locked editable controls during pending saves, and replaced the native discard prompt with an in-page dialog. A real browser test exposed the need for conservative filtering of photo-generated OCR noise.

34 automated tests pass: existing bilingual review/storage flows plus extraction, identity roles, date/amount safeguards, schema migration and controlled decoding/deadline/cancellation faults. Controlled faults are unit tests, not observed service outages or measured timeout rates.

## Still unverified

Real customer documents, Arabic/mixed script, handwriting, general unfamiliar layouts, damaged/encrypted/multipage PDF extraction, multiple invoices, verified worker identity, phone-camera capture, Gemini accuracy/cost/latency, production storage and permissions. No percentile latency, per-record price, population accuracy or “all inputs work” claim is supported. About 100 authorized representative documents and a separate held-out test set are recommended for the next model comparison.
