# Amy's Cybersecurity Notebook

Public URL: https://timememo.net/amy-cybersecurity/

English is the default on every unqualified visit. `?lang=zh` opens Chinese; switching languages updates the URL. There is no saved language preference to accidentally make a shared English link open Chinese. All 14 lesson entries have equivalent English and Chinese explanations, examples and review prompts.

Content: original study notes aligned with the 14 lessons in the course's outer Modules 1-4, reviewed 2026-10-27. Inner lesson module numbering differs from the outer assignment folders. This is not a full course reproduction; use source links for official lessons, videos, labs and assessments. No credentials, chat content, quiz answers or student progress are included.

## Add content later

- Append a module in `content.json` with a unique ID, number, bilingual title/tagline, bilingual summary array and units.
- Each unit requires a unique ID, bilingual title, bilingual points, bilingual example/check, sourceTitle and the observed official assignment identifier.
- The summary cards, module navigation, detailed entries and bilingual search render from the module array. Keep every English/Chinese pair aligned.
- New standalone collections can be added as sibling pages. Update the learning-library section and `library` metadata to link them, retaining existing URLs.
- Regenerate the English revision PDF when its scope changes. Do not silently change its Modules 1-4 label to cover different material.
- Test English default, Chinese toggle, topic search, all lesson entries and PDF download before publishing.

Buildless HTML/CSS/JS. No third-party fonts, trackers or backend. Deployed through the existing TimeMemo GitHub Pages repository.

PDF regeneration: install Python reportlab and pypdf, then run `python3 scripts/build_pdf.py`. Render and inspect both pages before deploying.
