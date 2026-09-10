# Round 2: independent ten-image OCR baseline

All ten new PNG fixtures listed in `round2-assets/manifest.json` were read from disk and processed by a fresh Tesseract 7.0.0 English worker per image, using the site's local language data and byte-identical LSTM cores. The loaded site `extraction.js` processed only actual OCR text and confidence. Ground truth was never supplied to OCR or extraction. No website changes, browser upload, phone-camera capture, or image preprocessing were performed.

**OCR completed for 10/10 images with zero engine failures. Extraction produced 5 partial, 5 uncertain, and zero review outcomes. This baseline fails the ten-image functional extraction acceptance.** The documents are newly authored fictional test fixtures, not real merchant transactions or camera photographs.

- Confidence ranged from 87 to 94. OCR plus parsing took 230–446 ms per image, approximately 3.13 seconds in total. These are Node engine timings, not browser user-facing latency.
- The actual call was `extractText(data.text, data.confidence, { locale: manifest.locale })`. The manifest explicitly specifies `en-GB`, and all ten output records retained that locale.
- UK configuration was passed correctly, but none of the images yielded a supported date/total label with an extracted value. This run therefore does not demonstrate successful UK date or currency recognition.
- The parser stayed unchanged during the run: SHA-256 `7c71334c18b585582f59d710e7eb719a820344b676c1afde694e8bdcd70d595f`. Its snapshot is `extraction.baseline.js`. Preserve baseline outputs when retesting a later parser.

| Case | Confidence | Status | Key observation |
|---|---:|---|---|
| 01 Plumbing company and technician | 93 | partial | OCR recovered TOTAL PAID, Toby Wren, and ISO dates; combined columns and unrecognized labels left primary fields blank. |
| 02 Individual joiner | 91 | uncertain | Only PAID IN FULL became paid; worker stayed blank despite Work carried out by in a combined column. |
| 03 Electrical job with missing fields | 93 | uncertain | Missing date, amount, and worker remained blank; the stated work was also missed. |
| 04 Roofing quotation | 93 | partial | Estimate and planned were correct, payment remained unknown; quoted cost and scope were missed. |
| 05 Boiler service | 88 | partial | Only the first street-address line was extracted; locality and postcode were lost. |
| 06 Glazing VAT invoice | 94 | partial | INVOICE TOTAL (including VAT) was unsupported; no deposit/balance substitution occurred. |
| 07 Unpaid decoration work | 89 | partial | OCR contained noise. The document gives Amount due without a separate Total. Payment remained unknown. |
| 08 Gardening with three people | 94 | uncertain | Three role/name columns were read but not structured. The amount was OCRed as E75 00. |
| 09 Appliance repair with long text | 94 | uncertain | Address and work paragraphs were missed. The total became £1 80 00 and must not be silently repaired. |
| 10 Unrelated restaurant | 87 | uncertain | It was not claimed to be home service, but explicit unrelated routing failed because receipt/invoice was absent from OCR. |

Across eight primary fields on the nine home-service fixtures, 72 ground-truth comparisons found 61 missing stated values, 10 correctly blank values, and one incomplete nonempty value (case 05 address). There were zero fully correct nonempty primary values. Company, worker, service date, summary, total, and currency were blank for all ten images. Treat these as coverage gaps, not a reason to infer unsupported facts. `comparison-summary.json` and the per-image comparison files include literal comparisons, enum mappings, and unsupported fields separately.

No customer, preparer, server, or proposed worker was substituted for an actual worker. No wrong nonempty service date, currency, or total was emitted. Every record remained draft. The quotation was not marked completed or paid. These safety results coexist with near-total extraction omissions and cannot support a high-accuracy claim. Explicit restaurant rejection failed.

Conservative next steps are exact TOTAL PAID and INVOICE TOTAL label support; precise attending-worker label handling with layout-aware binding; safe wrapped-address handling; and unrelated restaurant recognition without requiring the word receipt. Do not turn E75 00 or £1 80 00 into financial values. Do not use Amount due as Total. Case 05's generic Date cannot independently establish both issue and service dates. Case 04's quoted £1,440 must remain an estimate, not paid spending. High average OCR confidence does not restore missing brand headers or damaged postcodes.

Input hashes, raw OCR text/JSON, confidence, timings, parser output, configuration, and artifact hashes are preserved. A later reparse of this raw OCR must be labelled parser-only retesting; a fresh OCR run is a separate test. Browser upload and mobile-camera behavior remain untested by this run.
