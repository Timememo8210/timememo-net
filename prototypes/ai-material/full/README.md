# AI Material — complete independent homepage preview

Preview: https://timememo.net/prototypes/ai-material/full/

This is the complete **Ink / Ember** direction requested after the static palette review. On 2026-10-04 the owner approved promotion. `/index.html` now uses this direction with a more dimensional AI finish and About before the full directory. This route preserves the approved prelaunch design for comparison; its footer links to the current homepage. The former cobalt homepage is preserved separately at `/designs/silicon-lab-20261004/`.

## Complete page

- Full-bleed wafer → intelligence network → AI, followed by selected projects, a latest-update shortcut, six latest substantive updates, browser-local recently opened links, all catalog categories with keyword/month/date ordering, and the full About/education/career/footer sections.
- Sky Portal stays featured. The existing catalog is the content source; project bodies and access-code gates stay at their existing routes.
- Chinese and English content and controls switch together. 陈晓波 remains one line. Language uses the independent `timememo-full-language` key. Link history deliberately shares `timememo-home-history` with the existing homepage so users can find earlier opened entries.
- Always-on animation, with no motion switch. Rendering pauses offscreen or in hidden tabs. The language drawer is available at the top; footer language controls remain available at the end.
- This copy uses the same vendored Three.js and Manrope assets/licenses in `../vendor/`. No external font or graphics CDN is needed.

## Letter correction

The previous hand-drawn grid made the A's lower legs vertical and its crossbar too heavy. `glyph-layout.js` samples the actual **Manrope 650** A and I outlines in font coordinates. A's legs remain sloped below the crossbar, the letters share a cap height and baseline, and all 177 original instances are retained (123 A, 54 I). The last scroll phase now holds this composition. `ai-fallback.svg` uses the same outlines if WebGL is unavailable. The older color-study still image has also been corrected.

## Career, confirmed by the owner

Intel is the current employer, emphasized first and largest: **Portland, Oregon**. The smaller previous-employer column runs in reverse order: **GlobalFoundries — Germany / United States**, **Chartered Semiconductor — Singapore**, **Hua Hong NEC — Shanghai**. No job titles or employment dates were inferred. Chartered uses the existing vector paths with a corrected viewport, removing the source SVG's excessive display padding. Other logo files and provenance remain in `/assets/home/`.

## Verification

Evidence and temporary scripts: workspace `outputs/timememo-full-preview-20261004/`. Browser plugin was not available; regular Playwright/Chrome and native Safari were used. Five viewport widths (320, 390, 768, 1024, 1440) were checked in both languages. Tests cover real animation-frame changes, three chapter anchors, all categories, keyword/month sorting, recently opened links and clearing, language persistence, company order and relative logo sizes, and layout overflow.

Additional checks cover seven rapid scroll-out/return cycles with one render loop, offscreen pause/resume, WebGL context recovery, card motion with stable text, filter preservation across language changes, graphics/module failure, missing catalog fallback, no-JavaScript directory links, local link/asset existence, and actual Safari language/chapter/career rendering.

`preview.mp4` is a recording of the actual 390 × 844 browser page. It is a viewing aid, not a physical iPhone performance test.
