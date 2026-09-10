# Ten saved OCR results after conservative label fixes

This is a **parser-only recheck**, using the same ten preserved raw OCR texts and confidence values with explicit `en-GB`. No new image OCR was run, no baseline was overwritten, and no ground truth was provided to extraction. Parser hashes, timing, and integrity checks are in `after-reparse-run.json`; field comparisons are in `before_after_summary.json`.

Outcomes changed from **5 partial / 5 uncertain** to **5 partial / 4 uncertain / 1 unrelated**, with zero complete review outcomes. Five of seven stated workers were recovered. Case 01 gained its service and issue dates. Cases 01, 05, and 06 gained correct GBP invoice totals. Case 04 gained its GBP1,440 quoted amount. Restaurant case 10 is now explicitly unrelated.

For 72 primary fields across nine home-service fixtures, schema-aware comparison yields 15 correct nonempty values, 9 correctly blank values, 47 missing stated values, and one incomplete nonempty address. Literal manifest comparison yields 14 correct nonempty values and two differences: the extra difference is the quotation, where manifest invoice total is null but schema stores the quote amount in an estimate record. The JSON reports both interpretations; quoted cost is not paid spending.

Manual review remains necessary:

- **01:** Company, complete property address, full work description, completion and payment status. The worker display name is not the company.
- **02:** Property address, work date, description, amount/currency, and completion status. The absent company is correct for an individual provider.
- **03:** Company, address, stated work, and completion detail. Missing date, worker, and finances require additional evidence.
- **04:** Company, address, quote date, and proposed scope. Do not convert the proposed roofer or visit into actual attendance or completed service.
- **05:** The extracted address is only `8 Pretend Hawthorn Row`; locality and postcode are missing, and the OCR postcode itself is damaged. Review the original image. Generic Date must not automatically populate both issue and service dates. Company, work details, and statuses remain missing.
- **06:** Company, address, dates, full work, completion, and partial-payment status. VAT, deposit, and balance still lack separate structured fields.
- **07:** Company, Ruby Vale, address, dates, work, and completion/unpaid status. Total remains blank because the original states only Amount due; seek actual total evidence.
- **08:** Company, actual worker Mila Brook, address, dates, work, and statuses. Do not infer identity from three-column name order. OCR amount `E75 00` needs image review.
- **09:** Company, full address, dates, both work paragraphs, and statuses. Keep total blank: OCR reads `£1 80 00`, not a safely parseable 180.
- **10:** Treat as unrelated and do not create a home-maintenance record.

All records remain draft. Within these ten saved results, there is no customer/preparer/server/proposed-worker substitution and no wrong nonempty service date, currency, or actual invoice total. Coverage remains limited: all eight stated home-service company names and all nine work summaries are still blank.

The external `round2-parser-regression.test.mjs` contains 19 behavior tests covering UK context, date validity, currency and total conflicts, paid versus due, negated payment, proposed workers, role boundaries, continuation text, OCR noise, and unrelated dining. The final test output is preserved in `parser-regression.tap`; tests are not skipped and do not encode defects as expected behavior.
