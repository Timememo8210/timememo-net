# AI Material — independent homepage motion demo

Preview: https://timememo.net/prototypes/ai-material/

This is a separate design review, not a replacement for the production homepage.

- Graphite canvas, ice-silver/green metal wafer, restrained mint accents and a pale mineral project section.
- Native scrolling: a metal wafer separates into 177 3D chip tiles, becomes a connected network, and regroups into two panels before the project section.
- One WebGL render loop, instanced tiles, reusable buffers, local procedural studio reflections and textures. Three.js 0.169.0 and Manrope are vendored with their licenses; no CDN dependencies at runtime.
- Continuous motion, pointer-controlled lighting, touch ripple. No motion switch, as requested. Rendering pauses offscreen or in a hidden tab.
- Chinese/English side drawer; Chinese name 陈晓波 stays on one line. Demo language uses a separate local-storage key so review does not change the live homepage preference.
- Real project links: Sky Portal, Server Silicon & Intel Foundry, and the recent Scholastic writing guide. Existing access gates are unchanged.
- Animated CSS wafer and readable links remain if WebGL/module loading fails. This fallback does not reproduce the full 3D transformation.

## Local preview

Serve the repository root, for example `python3 -m http.server 8767 --bind 127.0.0.1`, then visit `/prototypes/ai-material/`.

## Validation

Evidence and temporary Playwright scripts are in the workspace output folder `outputs/timememo-material-demo-20261003/`. Browser plugin was not available; regular Playwright was used for Chrome and CUA for native Safari. Mobile viewport testing is not physical iPhone hardware testing.

`preview.mp4` is a recording of the actual 390 × 844 browser preview, including scrolling through both transitions. It is a viewing aid, not a phone performance benchmark.
