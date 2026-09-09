[English](model-research.en.md) · [中文](model-research.md)

# Domic Home Passport: Receipt Extraction Models and Cost Decisions

Reviewed on September 9, 2026. Scope: turning photos and PDFs into structured data for a home's history. Prices are published API rates in US dollars, excluding tax. This round reviewed official documentation only: no paid models were called, and no accuracy or latency tests were performed on real receipts. Model choices, quotas, thresholds, and routing described here are engineering recommendations, not validated results.

## Recommended starting point

Keep a replaceable model adapter in the prototype and pilot. Use **Gemini 2.5 Flash-Lite as the lowest-cost baseline**, and compare **Gemini 3.1 Flash-Lite and 3.5 Flash-Lite on the same samples**. Do not automatically save the first batch of results based on a model's self-reported “95% confidence.” Produce a draft, then let the user confirm or correct it before saving. For complex, unclear, or financially inconsistent documents, allow at most one retry with a stronger model before asking the user to fill in the gaps.

The product's value comes from assigning a document to the correct property, retaining the original evidence, and creating a searchable history. That may not require expensive reasoning. Whether the cheapest model is sufficient must be established through tests on home-service documents. Prioritize cost per finally confirmed record, human correction rate, and end-to-end waiting time, rather than comparing only the price per million tokens.

## Names, capabilities, and lifecycle

| Model / actual API ID | Status in the reviewed documentation | Images, PDFs, JSON, and recommended role |
|---|---|---|
| Gemini 2.5 Flash-Lite / `gemini-2.5-flash-lite` | Stable; no shutdown announced | Native image/PDF support and structured output; lowest-cost baseline. |
| Gemini 2.5 Flash / `gemini-2.5-flash` | Stable; no shutdown announced | Multimodal and structured output; comparison or escalation candidate within the 2.5 family. |
| Gemini 3 Flash / `gemini-3-flash-preview` | **Preview**; no shutdown announced | Images/PDFs and structured output; this is the precise ID to use for the model referred to in discussion as “3.0 Flash.” Do not assume that `gemini-3.0-flash` exists. |
| Gemini 3.1 Flash-Lite / `gemini-3.1-flash-lite` | Stable; the reviewed lifecycle table lists May 7, 2027 as the earliest shutdown date | Images/PDFs and structured output; a lower-priced candidate from a newer generation. |
| Gemini 3.5 Flash-Lite / `gemini-3.5-flash-lite` | Stable; no shutdown announced | Images/PDFs and structured output; the reviewed documentation includes document parsing among its use cases, making it a quality comparison candidate. |

Capabilities come from the official model pages: [2.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite), [2.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash), [3 Flash Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview), [3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite), and [3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite). Shutdown information comes from the [Gemini lifecycle table](https://ai.google.dev/gemini-api/docs/deprecations). All list approximately 1M input context and a 65,536-token output limit; this project does not need to approach those limits.

Configuration should record the exact `model_id`, prompt version, and schema version. Do not use an unversioned “latest” alias as an untraceable production dependency. Before deployment, verify the models actually available to the target project and their lifecycle status.

## Prices and cost for 10,000 receipts under consistent assumptions

For comparison, assume an average of **2,500 billable input tokens per single-page receipt, including the image/PDF and prompt, plus 600 billable output tokens**. Assume every request succeeds on the first attempt, with no caching, tools, search, retries, or additional thinking tokens. Image size, PDF page count, and output detail change actual usage. This is a budgeting scenario, **not a claim that every receipt consumes this fixed number of tokens**.

| Model | Input / million tokens | Output / million tokens | 10,000 receipts, standard real-time calls | Theoretical Batch cost for the same usage |
|---|---:|---:|---:|---:|
| 2.5 Flash-Lite | $0.10 | $0.40 | **$4.90** | $2.45 |
| 2.5 Flash | $0.30 | $2.50 | $22.50 | $11.25 |
| 3 Flash Preview | $0.50 | $3.00 | $30.50 | $15.25 |
| 3.1 Flash-Lite | $0.25 | $1.50 | $15.25 | $7.63 |
| 3.5 Flash-Lite | $0.30 | $2.50 | $22.50 | $11.25 |

Pricing source: [Google Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing). Formula: `10,000 × (2,500 × input unit price + 600 × output unit price) / 1,000,000`. Batch values are rounded to cents. Thinking tokens are also billed as output.

Illustrative calculation: run every receipt through 2.5 Flash-Lite first, then run 10% again in full through 3 Flash Preview. Under the same usage assumptions, the cost is **$4.90 + $3.05 = $7.95 per 10,000 receipts**. Starting with 3.1 Flash-Lite and applying the same 10% escalation gives **$18.30 per 10,000 receipts**. The 10% rate is an assumption for the calculation, not a measured failure rate.

If each receipt consumes an additional average of 1,200 thinking tokens, the extra cost per 10,000 receipts is $4.80, $30.00, $36.00, $18.00, and $30.00 respectively, in the table's model order. Do not count only the size of the returned JSON. Reconcile actual costs using response usage data and billing records.

**Use standard calls when users upload online and expect to review the result immediately.** Batch is for offline historical imports and evaluation. Its official target turnaround time is 24 hours, at approximately half the standard-call price. Batch pricing must not be presented as the cost of an immediate interactive experience. [Batch API](https://ai.google.dev/gemini-api/docs/batch-api)

Budget for object storage, the database, image conversion, network and backend operation, and human support as well as model charges. Recalculate long PDFs using their actual pages and tokens; one file does not necessarily equal one receipt. A free product can begin with monthly per-account quotas, per-file page limits, and an overall spending budget, with clear messages when a limit is reached.

## Input, structured output, and speed

- Gemini supports PNG, JPEG, WEBP, HEIC, and HEIF. Image token usage depends on resolution. Gemini 3's `media_resolution` affects small-text recognition, processing time, and token usage. Start by correcting orientation and cropping modestly while retaining readable numbers. Do not make receipts illegible to save a small amount of input cost. [Image documentation](https://ai.google.dev/gemini-api/docs/image-understanding)
- The official PDF limits are 50 MB and 1,000 pages, also subject to context limits. Gemini 3 supports embedded PDF text and visual processing; the documentation states that extracted embedded text is not charged additional tokens. The first product version could deliberately impose a tighter 15 MB / 10-page limit and explain it as product scope, not a provider limit. [PDF documentation](https://ai.google.dev/gemini-api/docs/document-processing)
- Use an explicit JSON Schema. Always return core keys and use `null` for unknown values, for example `{"type":["string","null"]}`. Do not fill fields with `"N/A"`, guess dates, or turn a missing amount into 0. JSON mode constrains format, but values still need validation. Google also notes the possibility of semantic errors and limitations with complex schemas. [Structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- Thinking is disabled by default for 2.5 Flash-Lite. The default for 3 Flash Preview is high thinking, with minimal available as an option. Explicitly configure a suitable thinking level or budget in the API and SDK being used, and measure total actual output usage. [Thinking documentation](https://ai.google.dev/gemini-api/docs/thinking)
- Do not claim “recognition in 2 seconds” or name a fastest model without testing. Official positioning does not substitute for measurements on this task. Record upload duration, extraction duration, p50/p95, timeout rate, and total time to confirmation. Suggested internal pilot targets could be p50 < 5 seconds and p95 < 15 seconds for clear single-page documents; label them as targets, not promises.

## A free product should use the paid API's data-processing terms

Documents may contain residential addresses, owners' names, service-provider contact details, and financial information. For a free product serving real users, use an API project linked to an active billing account. Under Google's terms, inputs and outputs from unpaid services may be used to improve products and may be reviewed by humans; the terms instruct users not to submit sensitive, confidential, or personal information. The paid API does not use this content to improve products, but still has safety logs retained for a limited period, so it should not be described as zero retention. Exceptions apply in the EEA, UK, and Switzerland; review the terms for the operating region. [Gemini data-use terms](https://ai.google.dev/gemini-api/terms)

Model requests only need to extract document content; they do not need search or external tools. Keep API keys on the server, never in the frontend. Store original attachments privately and provide short-lived authorized access. Explain to users which provider processes their files, how long files are retained, and how to delete them. Use synthetic samples in the public prototype. These are design recommendations for this project.

Rate limits apply per **project**, not per individual API key. Free and paid quotas vary with the project, model, and account status. Check actual quotas in AI Studio at launch instead of copying an online claim such as “1,000 free requests per day.” [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

## Non-Gemini comparisons worth retaining

| Option | Official capabilities / costs | Role in this project |
|---|---|---|
| Mistral OCR 4.1 | Current stable OCR in the reviewed documentation, model ID `mistral-ocr-4-1`; $4 per 1,000 pages for OCR or $5 per 1,000 annotated pages, approximately $40 / $50 per 10,000 single-page documents | If full text, layout evidence, or region-based review becomes necessary, test document annotation alongside it. Do not add a full OCR pipeline at this stage. |
| Amazon Textract AnalyzeExpense | Purpose-built invoice and receipt extraction, including summary fields and line items. The Oregon pricing example for the first million pages is $0.01 per page, or approximately $100 per 10,000 single-page documents | A reference option for an existing AWS platform or an established expense-field structure. Its fields still need mapping into Domic Home Passport's home-history structure. |

Sources: [Mistral OCR 4.1](https://docs.mistral.ai/models/ocr-4-1), [Mistral custom JSON annotation](https://docs.mistral.ai/studio/document-processing/annotations), [AWS receipt and invoice analysis](https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html), and [AWS pricing](https://aws.amazon.com/textract/pricing/). Neither option has been tested on this task. AWS prices depend on region and volume. Mistral's field semantics and retention terms need separate verification before production selection.

## Decisions that can be made within a week

1. Build a human-labeled reference set of 80–120 authorized samples: clear photos, angled shots, folds, small text, handwriting, Chinese/English, PDFs, multipage bills, invoices, estimates, and paid receipts. Include documents without a service address or service date. Publish only synthetic or sufficiently de-identified samples in the public project.
2. Use the same prompt and schema to test 2.5 Flash-Lite, 3.1 Flash-Lite, and 3.5 Flash-Lite. Include 2.5 Flash and 3 Flash Preview as comparisons for complex samples. Deprioritize models that are cheap per call but frequently require human rework.
3. Check provider, actual service date versus document date, service address versus business address, currency, total, payment status, work summary, and home-system category separately. Specifically count cases where missing information is invented.
4. Use rules to flag fields needing review: inconsistent tax and total, amount-parsing errors, ambiguous dates, address mismatches, and missing key fields. Ask users to retake low-quality images before repeatedly retrying inference.
5. Report each model's human correction rate, field accuracy, missing-value handling accuracy, escalation rate, p50/p95, and cost per confirmed record. Then select the default model. All results remain drafts until the user confirms; only the confirmation action triggers saving to the database.

Discuss with the partner: service regions and main languages, free quotas, actual monthly volume, attachment retention period, whether the first version should allow only one document per file, guidance for retaking unclear images, and whether each field needs evidence from the original text. These decisions have a more direct effect on final cost and experience than committing to the “latest model” first.
