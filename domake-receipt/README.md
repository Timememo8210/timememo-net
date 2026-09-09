[English](README.md) · [中文](README.zh.md)

# Domic Home Passport

An interactive prototype and partner handoff for the receipt module of the existing home-passport project. Updated September 9, 2026. The workspace and project brief default to English, with a Chinese language switch.

- [Prototype](https://timememo.net/domake-receipt/)
- [Project brief](https://timememo.net/domake-receipt/project/)
- [中文原型](https://timememo.net/domake-receipt/zh.html)
- [中文项目说明](https://timememo.net/domake-receipt/project/zh.html)
- [Output schema](docs/receipt.schema.json) / [field rules](docs/output-format.en.md)
- [Partner handoff](docs/implementation-plan.en.md)

The user chose to defer real AI extraction. Actual files are previewed locally and entered manually; three fictional examples demonstrate the review workflow. Confirmed records and originals are stored in IndexedDB in this browser. There is no cloud database, login, model key or background model call.

## Run locally

Node.js 22+ for development validation, plus a static web server:

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Use localhost or HTTPS rather than opening file:// directly. The website does not need node_modules at runtime. Development dependencies support validation only; no third-party runtime scripts are loaded. Google Fonts falls back to system fonts if unavailable.

## Review the prototype

1. Choose the plumbing sample; service date and issue date are separate.
2. Edit the total, review the confirmation dialog, tick the confirmation box and save.
3. View, edit and export the saved record; delete only after confirmation.
4. Choose a real photo/PDF: it must show the original and blank manual fields, never invented extraction results.
5. Enter a property and work summary. Other unknown values remain null; drafts may omit core fields.
6. Add the same actual file again to open its existing record. Unsupported, empty or oversized files are rejected.
7. The HVAC sample has missing service information. The roof estimate cannot be marked as paid or completed.
8. Switch between English and Chinese. Unsaved work prompts before navigation; saved records remain in the same browser database. User-authored content is not translated.

Automated checks use non-browser DOM, business-rule and storage tests. Real mobile-camera testing and real model accuracy/latency measurements have not been performed. The language switch is page navigation; it does not translate source documents. The English interface does not imply Arabic OCR support.

## Source and compatibility

This folder is independent of the rest of the existing TimeMemo static site. A partner can copy it to another repository. The source archive excludes dependencies, credentials and user files. Public GitHub access allows reading/downloading; editing the repository requires collaborator access.

The existing URL, schema $id and IndexedDB name are retained for compatibility. User-facing branding is Domic Home Passport. Downloads use the Domic Home Passport name; the older archive URL remains a compatibility alias.

Research references were not copied into the runtime. See the English/Chinese research documents for sources, assumptions and limitations. Next.js, Supabase and private R2 are proposed next-phase components, not implemented services.
