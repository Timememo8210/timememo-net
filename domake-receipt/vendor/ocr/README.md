# Self-hosted OCR runtime

Tesseract.js 7.0.0 (Apache-2.0), tesseract.js-core 6.1.2 (Apache-2.0), and tessdata_fast 4.1.0 English data (Apache-2.0). License files are included alongside the assets. Runtime code and language data are served from this site; document images are not sent to a third-party OCR service. Browser OCR uses LSTM mode; all six core builds are retained for feature compatibility.

Sources: https://github.com/naptha/tesseract.js · https://github.com/naptha/tesseract.js-core · https://github.com/tesseract-ocr/tessdata_fast/tree/4.1.0

The pinned npm packages are recorded in package-lock.json. The language archive was downloaded from the tagged official repository and gzip-compressed with deterministic headers. See checksums.json for SHA-256 hashes of shipped assets.
