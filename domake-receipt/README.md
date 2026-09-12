Current cloud workspace: https://timememo.net/domake-receipt/cloud/ . The cloud management console stores originals and property histories on the server. This README below describes the earlier browser-only pilot. The new server implementation is downloadable at docs/cloud-ai-service-source.zip, including its API contract and database schema.

[English](README.md) · [中文](README.zh.md)

# Domic Home Passport

Live cloud-service implementation and tests: [source handoff archive](docs/cloud-ai-service-source.zip). Hosting registration metadata and secrets are intentionally excluded.

An interactive prototype and partner handoff for the receipt module of the existing home-passport project. Updated September 10, 2026. The workspace and project brief default to English, with a Chinese language switch. The confirmed primary audience is UK customers who use English.

- [Prototype](https://timememo.net/domake-receipt/)
- [Samples and review guide](https://timememo.net/domake-receipt/walkthrough/) / [Chinese](https://timememo.net/domake-receipt/walkthrough/zh.html)
- [Project brief](https://timememo.net/domake-receipt/project/)
- [中文原型](https://timememo.net/domake-receipt/zh.html)
- [中文项目说明](https://timememo.net/domake-receipt/project/zh.html)
- [Output schema](docs/receipt.schema.json) / [field rules](docs/output-format.en.md)
- [Partner handoff](docs/implementation-plan.en.md)

The current public version uses experimental English image OCR in the browser, conservative field extraction, recovery states and real-image test controls. PDF can be read with cloud AI or entered manually; three preset examples remain explicitly labelled. Confirmed records and originals are stored in IndexedDB in this browser. There is no shared cloud database or customer login.

**12 September update:** real cloud AI is connected through OpenRouter using `google/gemini-3.1-flash-lite`. The API key is a server secret; the browser uses a separate pilot access code. Images and PDFs now follow the same review/confirmation workflow. Frontend 85 and service 12 controlled checks pass; actual model comparisons and cloud requests are documented in the [live AI report](ai-pilot/) / [中文](ai-pilot/zh.html). Existing older screenshot reports remain OCR/manual evidence. Records and original files still stay in this browser; there is no shared customer database.

## Run locally

Node.js 22+ for development validation, plus a static web server:

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Use localhost or HTTPS rather than opening file:// directly. The website does not need node_modules at runtime. Tesseract.js and English language data are self-hosted under vendor/ocr; no third-party OCR API is called. Google Fonts falls back to system fonts if unavailable.

## Review the prototype

1. Choose the plumbing sample; service date and issue date are separate.
2. Edit the total, review the confirmation dialog, tick the confirmation box and save.
3. View, edit and export the saved record; delete only after confirmation.
4. Upload an English image or use the six image tests. Review the actual OCR output; failures must not appear as successful empty records. PDF opens in manual mode.
5. Enter a property and work summary. Other unknown values remain null; drafts may omit core fields.
6. Add the same actual file again to open its existing record. Unsupported, empty or oversized files are rejected.
7. The HVAC sample has missing service information. The roof estimate cannot be marked as paid or completed.
8. Switch between English and Chinese. Unsaved work prompts before navigation; saved records remain in the same browser database. User-authored content is not translated.

Automated checks cover parsing, business rules, DOM flows, migration, storage and controlled failures. Actual browser experiments are documented in [test-results.en.md](docs/test-results.en.md). Real mobile-camera testing and real model accuracy/latency measurements have not been performed. The language switch is page navigation; it does not translate source documents. The English interface does not imply Arabic OCR support.

## Source and compatibility

This folder is independent of the rest of the existing TimeMemo static site. A partner can copy it to another repository. The source archive excludes node_modules, credentials and user files; it includes the self-hosted OCR runtime and fictional test images. Public GitHub access allows reading/downloading; editing the repository requires collaborator access.

The existing URL, schema $id and IndexedDB name are retained for compatibility. User-facing branding is Domic Home Passport. Downloads use the Domic Home Passport name; the older archive URL remains a compatibility alias.

Tesseract is now an explicit licensed runtime dependency; other research references are not deployed services. See the English/Chinese research documents for sources, assumptions and limitations. Next.js, Supabase and private R2 are proposed next-phase components, not implemented services.

## Pro and homeowner records

Schema 1.1 separates the service company, person who performed the work, and type of property change. Existing 1.0 records retain their display names without guessing company/person identity. See [intake and recovery](docs/intake-flow.en.md), [format](docs/output-format.en.md), and [actual test report](docs/test-results.en.md).

## New sample pack and parser recheck

Eight fictional PDF/image inputs and a Chinese PDF guide are available on the [bilingual review page](walkthrough/). Three new images were tested through Node OCR and the real parser; see [the evidence](walkthrough/engine-tests/report.en.md). The noisy work-summary field observed in the blurred photo is now rejected, with raw OCR preserved. 35 automated checks pass. That September 9 report is archived. The September 10 browser round is complete: see the current report below.

## September 10: ten documents and management scaffold

[Actual step-by-step screenshots and report](round2/) · [中文](round2/zh.html) · [Management console](admin/) · [Ten receipt PDFs and PNGs](round2/domic-10-uk-receipts.zip)

Schema 1.2 adds an optional uploader account and explicit property UID without guessing old relationships. Management offers records, people, property histories, originals and edit/reconfirmation. It reads this browser only; the fictional portfolio is separate. Nine home-service documents were manually reviewed and saved through the real English UI; the restaurant document was rejected from automatic intake. This validates the review workflow, not unattended recognition. All ten PNGs were tested independently: 5 partial, 4 uncertain, 1 unrelated; none fully extracted. PDF stays manual. The browser CSV download attempt was not verified; the actual selectable CSV preview was read and all 180 cells matched the saved records.

Reproduce the additional 11 relationship/storage checks with `node scripts/verify-context.mjs`. The report records PDF preview and browser-download compatibility limits.

## Four detailed interaction cases · 10 September 2026

[中文逐步截图](interaction-guide/zh.html) · [English overview](interaction-guide/) · [39-page Chinese PDF](interaction-guide/domic-four-cases.zh.pdf).

Four fresh real-browser journeys capture 32 steps: unreadable input and replacement, partial extraction and completion, correcting a truncated address before confirmation, and correcting a deliberately simulated human amount typo after saving. The last journey updates the same record from GBP158 to GBP185 without creating a duplicate. The guide distinguishes inline outcomes, dialogs and navigation; every step states its save status. Independent evidence checks: 45/45. The application itself is unchanged from tested build 2f827f5.
