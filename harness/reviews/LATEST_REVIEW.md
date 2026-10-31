# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- None.

Notes:
- Files changed:
  - apps/model-audition-* and auditions/: removed.
  - apps/color-sorter/index.html and apps/division-machine/index.html: page titles.
  - apps/place-value-blocks*: folders swapped.
  - apps/rounding-blocks/index.html: one comment.
  - tests/place-value-blocks-zoom*.test.mjs: new path.
  - index.html, more.html, harness/reviews/LATEST_REVIEW.md.
- Removed the three model-audition prototypes (Quadrilateral Jig, Scaling Wire, Share Mill) and their originals in auditions/. Nothing linked to them.
- Page titles:
  - Color Sorter: "The Sorter v13" is now "Math Things. | Color Sorter".
  - Division Machine: "Division Bar | Water Focus Pass" is now "Math Things. | Division Machine".
- Place Value Blocks:
  - The former v2 now lives at apps/place-value-blocks/.
  - The original lives at apps/place-value-blocks-original/ and is listed on the More page.
  - apps/place-value-blocks-v2/ redirects to apps/place-value-blocks/, keeping any query or #fragment.
  - Old links to apps/place-value-blocks/ now open the current Place Value Blocks, including Curriculum Hub's links.
- Checks:
  - Place Value Blocks tests pass at the new path (23/23), as they did before the rename.
  - Teaching Table tests pass (15/15).
  - The v2 address redirects.
  - The original renders at its new folder.
  - All 62 menu links resolve, and every app folder is on the menu, on More, or is the Teaching Table.
  - No console errors.

Acceptance Tests:
- Audition apps deleted; nothing references them. PASS
- No version labels left in page titles or menu names. PASS
- Place Value Blocks lives at apps/place-value-blocks/; old v2 links still arrive. PASS
- No frameworks, bundlers, or package managers added. PASS
