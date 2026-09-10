# Browser saved-record verification

**PASS: 9/9 saved records; 216 reviewed field values match; 80 blank values remain null.**

All nine account snapshots, explicit property UIDs, schema 1.2 records, confirmation states, timestamps and source SHA256 hashes were checked. 77 changed controls are recorded in edited_fields; 14 unknown enum values remain unknown.

| Case | Result | Reviewed fields | Blank → null | Account | Property UID | Schema 1.2 |
| --- | --- | ---: | ---: | --- | --- | --- |
| uk-01 | PASS | 24 | 8 | demo-alice | round2-uk-01 | PASS |
| uk-02 | PASS | 24 | 10 | demo-ben | round2-uk-02 | PASS |
| uk-03 | PASS | 24 | 13 | demo-james | round2-uk-03 | PASS |
| uk-04 | PASS | 24 | 10 | demo-alice | round2-uk-04 | PASS |
| uk-05 | PASS | 24 | 7 | demo-ben | round2-uk-05 | PASS |
| uk-06 | PASS | 24 | 8 | demo-james | round2-uk-06 | PASS |
| uk-07 | PASS | 24 | 8 | demo-alice | round2-uk-07 | PASS |
| uk-08 | PASS | 24 | 8 | demo-ben | round2-uk-08 | PASS |
| uk-09 | PASS | 24 | 8 | demo-james | round2-uk-09 | PASS |

The expected data includes the intentional GBP 1,440 estimate correction in uk-04, ExampleHeat 24i boiler in uk-05, renovation/improvement in uk-07, landscaping/maintenance in uk-08 and appliance/repair in uk-09. uk-01 notes match its recorded confirmation summary.

Cases 2–9 use the final editedValues in results.json; uk-01 uses manual-review-values plus recorded unchanged controls and confirmation notes. The nine-record saved-records.json is the source for persistence completeness.

SHA256 was recalculated from each actual round2/files input. This verifies the saved hash metadata against the fixture bytes; this independent file check does not itself reread IndexedDB Blob bytes. No website files were changed.

No mismatches found.

## Actual UI CSV export

**PASS: 9 data rows × 20 columns; 180 cells checked against the nine saved records.** The header, all record IDs and all projected field values match; 18 unknown nullable values are blank CSV cells.

Source: `ui-export.csv`, captured from the actual browser’s visible, selectable CSV export-preview dialog. This was parsed as the actual UI output, not regenerated from saved records. The browser download handoff remains unverified.
