# Teaching Table curriculum integration

Branch: `teaching-table-curriculum`

## First prototype

Teaching Table can load an EPUB directly from the teacher's device and browse its EPUB 3 table of contents.

- Curriculum content remains local to the browser; no EPUB content is committed to this public repository.
- The curriculum drawer exposes the source book's own navigation hierarchy.
- Selecting a section opens it as a draggable/resizable Teaching Table window.
- Previous/next controls move through the source TOC.
- Images, local stylesheets, fonts, and other packaged assets are resolved from the EPUB in-browser.
- Scripts/embeds and external lesson links are stripped from rendered source content.

This establishes the source layer without hard-coding i-Ready-specific markup into Teaching Table.

## Intended layers

1. **Source layer** — faithful local EPUB content and its native hierarchy.
2. **Curriculum model** — normalized grade/unit/lesson/session/problem/representation metadata.
3. **Math Things mapping** — recommendations and launch state for relevant manipulatives.

The first prototype deliberately implements only layer 1. The next pass should normalize a representative Grade 4 lesson and add Math Things mappings without mutating the source representation.

## Files

- `index.html` — curriculum launcher and drawer shell.
- `curriculum.css` — curriculum drawer/window presentation.
- `curriculum.js` — local EPUB parsing, asset resolution, navigation, and reader window.

## Copyright / repository boundary

Do not commit extracted proprietary curriculum EPUBs or lesson content into this repository. The application should consume teacher-provided/licensed source files locally or through an explicitly authorized private service.
