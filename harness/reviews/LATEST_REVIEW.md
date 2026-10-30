# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Open the Teaching Table once on the private site to confirm sign-in, books and covers. Their addresses are unchanged (/apps/teaching-table/books/ and /covers/), but the page now sits one folder higher.

Notes:
- Files changed:
  - apps/teaching-table/: v3 moved up and the old table removed.
  - apps/teaching-table/v3/index.html: now a redirect.
  - tests/teaching-table-scan.test.mjs: points at the new path.
  - index.html and more.html.
  - harness/reviews/LATEST_REVIEW.md.
- Teaching Table:
  - What was v3 is now the Teaching Table, at apps/teaching-table/. Its own title was already "Teaching Table".
  - The original "i-Ready Table" is removed, along with its support files: accessibility, curriculum, table-v2 and tts-client.
  - apps/teaching-table/v3/ redirects to the Teaching Table and keeps any query or #fragment, so old bookmarks work.
  - Saved boards and downloaded books are kept. Both live in browser storage shared across the site, under unchanged names (math-things-teaching-table-v3 and teaching-table-curriculum-v1); the "v3" in the first is internal only.
  - Paths now relative to the new folder: the home page, the shared home-link script, books/ and covers/.
- Place Value Blocks:
  - What was Place Value Blocks v2 is now just "Place Value Blocks" on the menu (Base Ten, grade 1). Its folder is still place-value-blocks-v2, so links keep working.
  - The original Place Value Blocks (with the decimal change) moves to the More page as "Place Value Blocks (original)".
- The menu cards no longer carry hidden family labels; only the removed table read them. Teaching Table shelves apps by the domain headings.
- The menu has 60 apps; More has 8.
- Checks:
  - The 15 Teaching Table tests pass at the new path, as they did before the move.
  - The v3 address redirects with its query and fragment.
  - The Teaching Table's Math Things shelf lists all 60 apps by domain.
  - All 62 menu links resolve.
  - No console errors at 1440, 1280, 768 or 390 wide.

Acceptance Tests:
- Teaching Table opens the former v3; the old table is gone; old v3 links still arrive. PASS
- Place Value Blocks on the menu is the former v2; the original is on More. PASS
- Teaching Table tests pass (15/15). PASS
- No frameworks, bundlers, or package managers added. PASS
