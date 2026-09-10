# Image generation record

All calls used the built-in `image_gen` tool in edit mode with the local reference noted below. No CLI or external API key was used.

## 07-handheld-readable.png

Reference: `../../test-assets/01-clear-company.png`

Prompt:

Use case: precise-object-edit. Edit target: the attached fictional service receipt. Create ONE realistic portrait smartphone snapshot of this exact synthetic paper receipt lying on a warm oak tabletop. Simulate an ordinary quick handheld photo: paper rotated about 6 degrees clockwise in the frame, camera perspective slightly oblique, subtle paper folds/creases, natural window shadow on one corner, imperfect framing with the entire receipt and footer still in view. The receipt should occupy about 85% of the photo and most text should remain sharply readable, enough for a realistic but not pristine OCR test. Preserve the dark teal header, arrangement, and exact printed content of the reference as closely as possible. In particular visibly preserve: Company: Cedar Home Services; Technician: Omar Hassan; Customer: Lina Patel; Receipt number: CHS-260901-07; Issue date: 2026-09-02; Service date: 2026-09-01; Service address: Villa 18, Example Lane, Dubai; Work: Replace kitchen faucet; Total: AED 420.00; footer FICTIONAL TEST DATA - NOT A VALID RECEIPT. Do not add any new merchant details or real personal information. The fictional test footer must remain visible and readable. No hands or phone in frame, no additional receipts, no added illustration, no annotation, no collages. This is a synthetic test photo, not a valid financial document.

## 08-handheld-partial.png

Reference: `07-handheld-readable.png`

Prompt:

Use case: precise-object-edit. Edit target: this exact synthetic handheld photo of the Cedar Home Services receipt on a wooden tabletop. Create ONE second smartphone snapshot of the SAME paper and SAME text but with a noticeably worse capture: mild handheld motion blur across the image, focus falloff and a broad uneven glare/shadow across the middle date/address section. This should be a partially readable receipt photo, NOT totally unreadable. Keep the large CEDAR HOME SERVICES header and Total: AED 420.00 readable by a human, and retain enough legibility around Work: Replace kitchen faucet to see some service information. Make the smaller issue date, service date, receipt number and address details difficult to read confidently at normal display size. The technician line may be partially blurred but DO NOT replace it with another person. Preserve actual printed content as closely as possible, no fabricated extra data. Keep the clearly readable footer FICTIONAL TEST DATA - NOT A VALID RECEIPT, preserving the fact this is a fake test document. Retain full paper in frame, oak table, oblique camera angle and natural folds. Do not add annotations, explanatory overlays, redacted bars, another receipt, hands, logos, or split panels. The result should feel like a quick unsuccessful phone capture, with some important fields visible and others genuinely uncertain.

## 09-handheld-uk.png

Reference: `07-handheld-readable.png`

Prompt:

Use case: precise-object-edit. Edit target: the attached synthetic receipt-on-desk phone photograph. Create ONE NEW UK version of this fictional test receipt as a natural portrait smartphone photo on a wooden tabletop, with slight perspective and a 4 degree paper tilt, subtle paper folds, natural window shadows, and very mild softness while most text stays readable. Preserve the teal header and professional receipt layout, but REPLACE ALL printed details with the following exact UK details, with no remaining UAE/Dubai/AED wording anywhere:

Header: CEDAR HOME SERVICES
Subheader: SERVICE RECEIPT
Company: Cedar Home Services
Receipt number: CHS-UK-260901-09
Issue date: 2026-09-02
Technician: James Turner
Customer: Emma Wright
Service date: 2026-09-01
Service address: 14 Example Mews, Bristol, BS1 2AB
Work: Replace kitchen mixer tap
Work type: Replacement
Status: Completed
Line item: Kitchen mixer tap and installation    GBP 200.00
VAT    GBP 40.00
Total: GBP 240.00
Payment status: Paid
Footer: FICTIONAL TEST DATA - NOT A VALID RECEIPT

Make the entire paper and fictional footer visible. Keep the names, date, address, service content and GBP total especially legible. Avoid extreme skew or dramatic blur; this should be a normal handheld capture of an English receipt for a UK homeowner, not a flat perfect digital scan. No hands, phone, collages, annotations, added real client data, logos, extra documents, or watermark.
