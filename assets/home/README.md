# Time Memo homepage

The production homepage is `/index.html`. Its visual reference is the preserved J concept at `/prototypes/lab/`.

- `/assets/home/catalog.js` is the curated directory of canonical project entry points. Each entry has a stable URL, category, Chinese and English title/description, and recorded content update date. Preserve dates when merely changing the homepage layout. Keep research/private material at its existing destination; do not copy protected page bodies into the public homepage.
- When publishing a project, add/update the catalog entry and the static fallback links in `#catalog-results`. Update `#recent .recent-list` with the newest substantive content. Keep Sky Portal featured independently.
- Visible text and accessibility labels must switch together between Chinese and English. New static text uses `data-zh` / `data-en`; catalog entries contain both languages.
- Recently opened links, chosen language and motion preference are local to the browser. No browsing history is uploaded or synchronized.
- Wafer animation uses one time-based frame loop, pauses offscreen/when hidden, caps pixel density, and respects reduced motion. Native page scrolling must remain intact.
- The old homepage is preserved at `/designs/previous/`; `/designs/` contains it plus all ten earlier concepts. Do not overwrite the archive when editing the live homepage.
- Preserve the homepage's robots/googlebot/referrer policies and all existing access-code gates.

Logo provenance is listed in `logo-sources.txt`. Employment organization names were confirmed by the site owner; no employment dates or specific job titles have been inferred.
