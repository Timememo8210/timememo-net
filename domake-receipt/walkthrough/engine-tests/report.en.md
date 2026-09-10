# Local OCR test: what actually worked

On September 9, 2026, we tested three synthetic receipt images using the local Node version of the same Tesseract.js engine and English language data used by the prototype, then passed the raw text and confidence directly to the project's parser. These are engine and parser tests. **No browser upload, browser screenshot, or real phone-camera workflow was tested in this run.**

| Test image | Actual structured result | Review outcome |
|---|---|---|
| Clear UK receipt | Company: Cedar Home Services. Technician: James Turner. Service date: 2026-09-01. Issue date: 2026-09-02. Total: GBP 240.00. | Ready for human review. The plumbing category remained unknown; optional warranty and line items were not extracted. |
| Angled UK receipt image | Receipt number `CHS-UK-260901-09` and receipt type were recognized. Company, technician, dates, work summary, address, and amount remained unknown. | Partial extraction; manual completion or a clearer image is needed. |
| Blurred AED receipt image | Receipt type was recognized. Company, technician, dates, address, and amount remained unknown. A work line containing obvious OCR noise was rejected after a parser fix. | Partial extraction; the work summary, category, and change type also remain unknown. |

The angled image produced incorrect date text and postcode characters. The parser left those fields blank instead of treating the corrupted text as confirmed facts. The blurred image initially yielded `Replace kitchen faucet <==... SS` as its summary. A small fix now rejects that entire field and retains the raw text for review; it does not guess a cleaned value.

We checked the fix against the same saved OCR text and confidence, without running OCR again. The clear receipt's key fields and the angled receipt's unknown values were unchanged. The blurred receipt's summary changed to `null`, and its category and change type changed to `unknown`. Original OCR output and pre-fix results were preserved.

The original Node engine-and-parser runs took approximately 0.48, 0.79, and 0.52 seconds respectively on this Mac. These local timings do not measure browser upload, mobile performance, network transfer, review, or saving, and are not a product speed promise. Three synthetic samples are not an accuracy benchmark for real receipts.


## Evidence files

- [run-configuration.json](run-configuration.json)
- [results-summary.json](results-summary.json)
- [recheck-results.json](recheck-results.json)
- 10-clear-uk-receipt: [OCR](10-clear-uk-receipt.ocr.txt) · [Before](10-clear-uk-receipt.parsed.json) · [After](10-clear-uk-receipt.rechecked.parsed.json)
- 09-handheld-uk: [OCR](09-handheld-uk.ocr.txt) · [Before](09-handheld-uk.parsed.json) · [After](09-handheld-uk.rechecked.parsed.json)
- 08-handheld-partial: [OCR](08-handheld-partial.ocr.txt) · [Before](08-handheld-partial.parsed.json) · [After](08-handheld-partial.rechecked.parsed.json)
