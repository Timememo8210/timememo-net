[English](project-history.en.md) · [中文](project-history.md)

# Domic Home Passport: project history

**Confirmed product name: Domic Home Passport.** The user has confirmed this name for the current prototype and project documentation. Historical references to Domic and Home Passport below retain the names used in the original records.

Review date: 9 September 2026. This history was compiled from a read-only review of the local Sky Portal Git checkout, public pages, and existing test artifacts. The original site was not changed, and credentials were not copied.

## Main findings

The project described by the user matches the **Domic / Home Passport** records in Sky Portal. Domic is the name used in the May–June 2026 strategy documents and Git history.

The identified partner is **Daniel Zhu (瑜杰)**. The product was conceived as a lasting record of a property's repairs, improvements, equipment, and warranties, supporting ongoing maintenance and eventual sale or rental handover. It is more specific than a general expense-receipt OCR tool. ProLynk connects customers with service providers; Domic holds the homeowner's property history.

## Confirmed historical records

### 7 May 2026: ProLynk × Domic strategy

The ProLynk page in Sky Portal records the following:

- Domic is a “digital property passport.” Its structured records can come from automatic ProLynk imports or documents uploaded by homeowners.
- Relevant details include equipment model numbers, installation dates, and maintenance intervals. Paper documents and equipment nameplates would be parsed for brand and warranty information.
- A property health score, maintenance roadmap, and improvement recommendations were longer-term ideas. The product could generate a property history report for sale or rental handover.
- The proposed stack was a Next.js frontend, Supabase database, and Cloudflare R2 storage for original documents and images. Document hashes were intended to check file integrity; they do not independently prove that work took place.
- The proposed business model was a free or freemium Domic product alongside ProLynk's service marketplace.

### 20 May 2026: initial Domic release scope

The old records targeted a usable version by early July. They establish the plan, but do not establish that a release actually happened. Three core features were planned:

1. Receive documents automatically from ProLynk and display them in a chronological maintenance timeline.
2. Accept forwarded emails and manually uploaded PDF receipts.
3. Use AI to extract and file the information, beginning with internal testing and iteration.

Notes from 3 June 2026 also proposed shared Domic / ProLynk accounts, quick sign-in through ProLynk, and Google sign-in. The historical market sequence was Ireland in 2026, then the UK, with the US considered later. This was the plan at the time, rather than a statement of the current target market. The new schema should therefore avoid silently defaulting to USD: it should retain an explicit currency and support international addresses, including Irish Eircodes and UK and US postal formats.

### 15 June 2026: model and integration direction

The meeting summary selected Gemini 2.5 Flash for image recognition and Whisper for voice. Other proposed directions included a ProLynk API / MCP integration and separate development and production environments. These are historical plans, not production settings verified in this round.

### 22 June 2026: recorded live model tests

The Daniel Codex workbench, Live Lab, and JSON results remain available:

- Model: `gemini-2.5-flash`.
- All 13 public PDF samples eventually produced readable results. Twelve were read directly as PDFs. One Highland Roofing sample encountered repeated HTTP 503 high-demand errors, so the test used its `pdftotext` text layer for Gemini extraction instead.
- Classification matched the expected category in 12 of 13 cases. S12, an insulation sample, was classified as Renovation instead of Insulation.
- Only S01, S12, and S13 contained relatively complete values. Most of the other samples were blank invoice templates. Readable results for 13 of 13 files must not be presented as 100% accuracy on real receipts.
- The old tests returned `0` for several missing amounts and sometimes generated property-value commentary for blank templates. The new design should remove these behaviors: missing values should be `null`, and blank templates should not become completed-work history.
- S12 had a subtotal of 3,800 and a total of 2,500, with notes describing a discount. Validation cannot assume that subtotal plus tax always equals total without accounting for discounts.

## Existing implementation and gaps

### `projects/home-passport-receipts.html`

This is a standalone static HTML prototype with upload, editable confirmation, a final review before submission, success feedback, history, and deletion.

- It accepts one file at a time, using `accept="image/*,.pdf"` and the mobile camera hint `capture="environment"`.
- The browser converts the file to base64 and calls Gemini 2.5 Flash directly. Users can edit the extracted JSON fields.
- Confirming a record only writes to the browser's `localStorage` key `hp_receipts`. **It does not write to a Domic / Home Passport backend or shared database**, despite the old UI saying that the receipt was saved to Home Passport.
- It lacks original-file retention, a property association ID, actual upload progress, cancellation, timeout and retry states, file-format and size validation, duplicate detection, cloud persistence, access control, and partner API integration.
- The old version calls the model from the browser. Production integration should move this to a server to manage authentication, quotas, and data processing centrally.
- It has one `date` field, without distinguishing the service date from the invoice date. Its only address is `vendor.address`; there is no separate property service address.
- `normalizeData` turns missing amounts into `0`, missing currency into `USD`, and unknown document types into `receipt`.
- Returning to edit clears the customer notes. Manually clearing fields is not handled consistently, and the logic that formats amounts and then reads them with `parseFloat` is flawed. The reconstruction should replace this state-management approach.

The original minimum extraction fields were `date`; `vendor {name, phone, address}`; `total`; `category`; `items [{description, amount}]`; `confidence`; `currency`; `documentType`; `subtotal`; `tax`; and `paymentMethod`. User notes and `savedAt` were added on submission.

### Property-specific fields already explored in the June tests

The `extracted` object in an original result included:

- `property {address, unit, city, region, postalCode, country}`
- `vendor {name, address, phone, email, licenseNumber}`
- `service {projectName, workType, areaOfHome, workPerformed, materials[], laborSummary, warranty, permitNumber, followUpRecommendation, resaleValueNote, valueSignal}`
- `items [{description, quantity, unitPrice, total, kind}]`
- `documentType, date, subtotal, tax, total, currency, category, notes, confidenceScore`

The old `resaleValueNote` and `followUpRecommendation` values mixed extracted information with model inference. They do not belong in the layer that represents facts from the document. Warranty, equipment, location within the property, work performed, and property address all have clear value for this domain. They can be optional extensions and should remain empty when the document does not provide them.

## Historical interface style

- Git commit `46712b70cf26ee79e0bbc98dd71e65a87a7b1c4c`, dated 20 June 2026, explicitly says “Redesign receipt scanner to match Domic design system”.
- The old scanner uses Inter, bright-blue primary buttons (`#007BFF`), a pale blue-gray background (`#F8FAFC`), white cards with roughly 12 px rounded corners, dark-gray text (`#1E293B`), subtle borders and shadows, a mobile-first width of 512 px, and bottom-sheet details.
- A visual review of the existing `prolynk-screenshots/01-ho-dashboard.png` showed matching bright-blue navigation and primary buttons, a pale-gray background, white cards, soft-green service icons, and generous spacing.
- The current interface of a standalone Domic website was not found. The ProLynk screenshot should not be described as a screenshot of the live Domic product.

## Sources and shareable links

1. Original prototype: [Receipt Scanner / Home Passport](https://timememo8210.github.io/sky-portal/projects/home-passport-receipts.html)
2. Project and collaboration history: [ProLynk project records](https://timememo8210.github.io/sky-portal/prolynk.html)
3. Original three-step illustration: [HP Demo Flow](https://timememo8210.github.io/sky-portal/projects/hp-demo-flow.html)
4. HTTP 200 confirmed during the review: [Daniel Codex workbench](https://timememo8210.github.io/sky-portal/projects/danielproject__codex.html)
5. Readable test table: [Gemini Live Lab](https://timememo8210.github.io/sky-portal/projects/danielproject__codex_live.html)
6. Complete test data: [22 June 2026 JSON results](https://timememo8210.github.io/sky-portal/projects/danielproject__codex_assets/2026-06-22/gemini_live_results.json)
7. Historical market report, not treated as a freshly verified market assessment: [ProLynk competitor analysis](https://timememo8210.github.io/sky-portal/research/prolynk-market-analysis.html)
8. Public repository: [Timememo8210/sky-portal](https://github.com/Timememo8210/sky-portal)
9. Historical engineering-site link: [lynksync.ie](https://lynksync.ie). It returned HTTP 403 during the review, so its live content could not be verified. The meetings also mention `lynkthink.ie`; its relationship to the former domain remains unconfirmed, and the two should not be treated as the same site without evidence.

Git commits checked:

- `6871259`, 3 May 2026: added Receipt Scanner.
- `da4eea3`, 3 May 2026: added the three-step confirmation flow.
- `8ab0c9f`, 12 May 2026: added the ProLynk × Domic strategy and Daniel meeting notes.
- `7318b27`, 16 June 2026: added meeting summaries covering 12 May–15 June.
- `46712b7`, 20 June 2026: aligned the scanner with the Domic design system.
- `361dbfb`, 22 June 2026: added the Daniel OCR workbench and test artifacts.

## Not yet found or verified

- A standalone Domic production domain and current product interface.
- Daniel's current backend API contract, database tables, shared-account implementation, and production deployment.
- The complete original Next.js source project and `.env.local` mentioned in the June workbench. A static presentation page is not evidence of a complete product repository.
- The accessible list of public GitHub repositories only matched `sky-portal`; no separate public receipt, Domic, or ProLynk repository was found. This does not establish that no private repository exists.
- The latest 50 Codex / ChatGPT task summaries contained no related historical task other than the current reconstruction. The review did not exhaust all archived tasks.

Topics for the next discussion with Daniel: the production domain; existing sign-in and property models; the API for saving records; whether the first release accepts one document with multiple pages or batches of documents; the current target market and currency handling; whether a service date must be supplied before saving; expected monthly volume; and the latency budget. The product name is already confirmed as **Domic Home Passport**. While integration details remain open, the current prototype can demonstrate the complete upload → extract → review → save → view flow using a fixed export schema and clearly disclosed local browser storage.
