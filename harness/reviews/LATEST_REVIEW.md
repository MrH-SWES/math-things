# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- A teacher should spot-check `apps/sentence-builder/tools/parts-of-speech.tsv`. Tags were drafted by a dictionary (WordNet) and a part-of-speech tagger, then reviewed and corrected by hand, but some may still be debatable.
- Test on a physical iPad (Safari/WebKit). Touch was tested only in Chromium with touch emulation.

Notes:
- Files changed:
  - New: `apps/sentence-builder/index.html`, `packs.js` (generated), `README.md`, `tools/build_packs.py` and `tools/parts-of-speech.tsv`.
  - New: `tests/sentence-builder.test.mjs`.
  - Changed: `more.html` (a card under Sentences), `docs/05_APP_CATALOG.md` (one row) and `harness/reviews/LATEST_REVIEW.md`.
- Behavior: Sentence Builder is a new, separate app. Build-A-Sentence (`apps/sentences/`) is unchanged. The app has:
  - A creamy off-white canvas with three discreet rails.
  - Faintly color-coded banks: Nouns, Verbs, Adjectives, Articles, Determiners, Conjunctions, Adverbs, Pronouns, Prepositions, Interjections and Punctuation.
  - Tiles that are dragged out as copies, snap onto the nearest rail at a visible marker, rearrange within and between rails, and are removed by dragging them off the canvas.
  - A capital on the first word of each rail, for display only.
  - A Clear button that needs two taps.
  - Bank drawers that fold shut or open when you tap the bank's name. A closed drawer shows its word count, and the device remembers which drawers are closed across lessons and refreshes.
- Word packs follow the Reading & Spelling lesson sequence (133 lessons, 15 stages). A pack is the words printed in the chosen lesson plus every tricky word taught so far.
  - Printed words come only from the fields the lessons' own author guide requires to be decodable. Spoken-only text is excluded.
  - Tricky words show a faint heart.
  - A word that can do two jobs (such as *fan*) appears in every bank it fits.
- Data pipeline: `tools/build_packs.py` uses the Python standard library only. It reads the lesson source ZIP and the reviewed word list and writes `packs.js`. The build is reproducible (the rebuilt file is byte-identical), and the script stops on any printed word that isn't in the word list. There are 4,298 words in total; 872 of them are in more than one bank.
- Doctrine applied: the student surface stays quiet (a lesson menu and Clear only). Teacher-facing material lives in the README. No frameworks, packages or build tools were added.
- Desktop: mouse drag-and-drop, plus tap to add a word to the current rail.
- Touch (iPad):
  - A quick up/down swipe scrolls the banks.
  - A sideways pull drags at once.
  - A short press (0.16 s) picks a word up so it can be dragged in any direction.
  - On the canvas, tiles drag freely.
  - Every tile and control is at least 44×44 px.
- Layout: banks are on the right at tablet and desktop widths and stack under the canvas below 700 px. There is no sideways page scroll.
- Accessibility: bank words are buttons, and Enter adds a word. On a placed word, ←/→ move it, ↑/↓ change sentence and Delete removes it. Changes are announced through a live region, and every control has a name.
- Remaining risks: there is no real-device iPad/WebKit test, and the part-of-speech tags still need a teacher's spot-check (see above).

Acceptance Tests (`tests/sentence-builder.test.mjs`, 11 tests, Chromium, all PASS on repeated runs; five planted bugs each caught):
- 133 lessons in 15 stages. Lesson 1's pack is exactly its printed words. Spoken-only words are excluded. Tricky words carry forward. `packs.js` matches the word list. PASS
- The lesson picker lists all lessons by stage and remembers the choice. Only banks with words are shown. PASS
- Hearts on tricky words; two-job words appear in both banks, each with its own faint color; the canvas is creamy. PASS
- Mouse drag: snaps to the nearest rail, inserts at the marker, the bank keeps its copy, and a drop outside the canvas places nothing. PASS
- Rearranging within and between rails, capitalizing any first word (display only), punctuation-first sentences, keeping capitals on names and "I", and dragging off to remove. PASS
- Touch: a flick scrolls without placing anything, a sideways pull drags, a hold-then-vertical drag works, touch-drag rearranges, targets are at least 44 px, and a portrait sentence fits on one line. PASS
- Tap adds a word to the current rail; keyboard add, move and remove work. PASS
- Clear needs two taps within 3 s; changing lessons keeps the sentences. PASS
- Bank drawers open and close by tap and by keyboard, show a word count when closed, stay closed across lesson changes and refreshes, still accept tiles dragged off the board, and have 44 px targets. PASS
- Blocked storage still works; a missing `packs.js` shows a plain message. PASS
- No uncaught page errors. PASS
- Whole `tests/` folder: 64 of 65 pass. The one failure is the existing Place Value Blocks zoom test, which fails the same way on upstream `main`. PASS (no new failures)
