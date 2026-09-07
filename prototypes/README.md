# Third-round homepage prototypes

- `/prototypes/person/`: original implementation inspired by the layout and
  motion of https://dennissnellenberg.com/ — portrait-led full-screen opening,
  moving name, circular magnetic links, typographic project index.
- `/prototypes/lab/`: original implementation inspired by
  https://patrickheng.com/ — cobalt-and-lime interactive opening, reactive geometric
  wafer diagrams, scroll-driven horizontal chapters. Mobile uses a vertical
  reading flow with the same chapter controls and all 16 project links.

Reference pages were inspected in the browser, including their project
sections. No third-party source code, photography, or project content was copied.
All profile content comes from the existing TimeMemo homepage.

User requirements: preserve the original portrait colors and skin tone;
no grayscale, tinting, desaturation or color-changing hover effects. All
prototypes and the `/designs/` index are password-free. Existing research-page
access settings are preserved. The original `/avatar.jpg` is unchanged.

`/designs/` provides a static HTML catalog with all 10 designs and visible
full addresses. The homepage has a banner and an always-visible link to it.
The formal homepage design is retained until the user selects a prototype.

Motion supports a pause control and reduced-motion preferences. The interactive
wafer field is a visual diagram, not a representation of measured process data.

## Motion refinement

- Person: native scroll drives color-preserving portrait parallax, the large
  name, masked statement lines, opposing technical text strips, staggered project
  rows and a curved contact reveal. The hover preview follows with easing.
- Lab: the existing native scroll / horizontal chapter structure remains.
  Independent heading and list layers move through each chapter. Wafer diagrams
  rotate, scan, interpolate between modes and respond to scroll and pointer.
  Mobile uses vertical reading with scroll-driven reveals and moving grid diagrams.
- The system reduced-motion preference is honored initially; an explicit toggle
  can enable motion. Pausing reveals all content and freezes decorative motion,
  while chapter navigation and the diagram mode buttons remain usable.
- Asset URLs use the motion2 revision so previous previews load the changed
  CSS and JavaScript. Both existing routes and the ten-design catalog remain.
