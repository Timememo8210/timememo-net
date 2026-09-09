# Synthetic OCR input fixtures

These six PNGs contain no actual customer information. They are test inputs and must never be treated as evidence of a real property service.

The first five were authored as original SVG documents and rendered to PNG with sharp. `generate.mjs` reproduces them using the bundled runtime. The landscape is a new synthetic photograph generated with the built-in image_gen tool; its final prompt is saved in `landscape-prompt.txt`.

`manifest.json` records the expected values and failure behavior. These expectations are ground truth for testing, not a report of observed OCR quality.

| Input | Expected behavior |
| --- | --- |
| `01-clear-company.png` | Extract the company and named technician separately; show a review and wait for confirmation. |
| `02-clear-individual.png` | Identify Samir Ali as an individual contractor and keep company blank; customer is a separate role. |
| `03-partial-missing-fields.png` | Preserve readable service details; date, amount, currency and worker remain missing. |
| `04-unreadable-blur.png` | No reliable readable details; offer re-upload or manual entry without an invented result. |
| `05-unrelated-restaurant.png` | Readable restaurant receipt outside property-service scope; do not create a home-service record automatically. |
| `06-unrelated-landscape.png` | No receipt details; offer a relevant document upload or manual entry without claiming the image is blurry. |

No case should save a history record before explicit human confirmation. The test suite covers only controlled English inputs and does not measure Arabic recognition or broad real-world reliability.
