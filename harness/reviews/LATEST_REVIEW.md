# Latest Review

Status: PASS

Must Fix:
- None.

Should Fix Soon:
- Test on a physical iPad (Safari/WebKit). Automated touch tests ran in Chromium with touch emulation only.
- Pre-existing, original bank only: after *a/an* correction, the preview updates right away, but the bank tile shows the corrected article only on the next render. The order in `render()` is unchanged from before.

Notes:
- Files changed: `apps/sentences/index.html`, `apps/sentences/README.md` (new, teacher-facing), `harness/reviews/LATEST_REVIEW.md`.
- Behavior changed:
  - Teachers can make reusable **word packs** in a "Word packs" dialog. Each pack has a name, optional lesson, reading level, and skill labels, and lists of nouns, verbs, and helpers. Words can be pasted (commas or new lines) or removed one at a time. Packs can be saved, edited, duplicated, deleted, and undone back to the last save.
  - Packs are saved in `localStorage` (`mathThings.sentences.wordPacks.v1`), so they last through a refresh. The panel says plainly that packs do not sync. JSON export (all packs or one) and import are validated all-or-nothing, show a preview before anything changes, and never overwrite: a name already in use gets a number. **Download example file** gives a sample. If storage is blocked or full, the app keeps working and says so. If saved data can't be read, it is backed up instead of deleted.
  - A **Words** selector shows either the original bank or one pack, plus the pack's labels. In pack mode, students see only the pack's words, and the tabs, filters, and step pills are hidden. Switching never clears the sentence.
  - Pack words (and words typed while a pack is active) are marked `exact`. They are never pluralized, conjugated, made to agree, or changed between *a* and *an*. The only change is a capital letter on the first word of the sentence, in the preview and read-aloud, and only when that word is all lowercase. Helper words get no guessed part of speech. The original bank behaves as before.
  - Tiles can be moved without dragging: tap or click a tile to show ← ✕ →. Keyboard: Enter selects a tile, ←/→ move it, Delete removes it, Escape lets go. Word-bank cards are now `<button>`s. Focus is kept after each change, and changes are announced through a polite live region.
  - Only newly added tiles play the pop-in animation (before, every tile re-animated on every change). The animation is off when the user prefers reduced motion.
  - Touch: hover-only ✕ is hidden on `hover: none` devices. Word tiles are ≥44px tall, the ← ✕ → buttons are ≥44×44, and other controls are ≥40px on coarse pointers. The desktop look is unchanged.
- Doctrine principles applied: Teacher-facing text (the storage explanation, the editor, import/export) lives in a closed dialog and `README.md`, not on the student surface. No dashboards, points, or new dependencies. Single-file app.
- Desktop behavior: Same as before, plus the Words selector, the Word packs button, and click-to-select tiles. Mouse drag-and-drop still works.
- Mobile behavior: Tested at iPad size (1024×768, touch emulation): tap to add, tap a tile for ← ✕ →, touch-drag reorder. At phone width (375px) there is no horizontal scroll with the panel open.
- Accessibility notes: Every control has an accessible name (checked by script). The panel is a modal `<dialog>`, and Escape closes it. Tile help is linked with `aria-describedby`. All user text is rendered as text, never HTML.
- Remaining risks: Not tested on real WebKit or iPadOS. Speech is checked by capturing `speechSynthesis.speak` text, not by listening. Real file pickers and downloads on iPad were not tested.

Acceptance Tests (Playwright + Chromium, 171 checks, all PASS):
- Create, name, edit, remove a word, undo changes, duplicate, load into the editor, delete (confirm and cancel), alphabetical menus. PASS
- Name required; duplicate names (any capitalization) refused; empty lists and a pack with no words save; repeated pasted words skipped; over-long words rejected. PASS
- Refresh keeps the packs and the selected pack. PASS
- Export all and export one; re-import into a clean browser gives identical packs; re-import on the same device adds numbered copies and leaves existing packs untouched; Cancel imports nothing. PASS
- Invalid files rejected with nothing imported (16 cases: not JSON, unrelated JSON, wrong format, newer version, empty/non-list packs, one good plus one bad pack, missing name, non-list list, non-text/blank/too-long/control-character words, non-text label, long name, file over 1 MB). PASS
- BOM, single-pack, and bare-array files import; the example file downloads, imports, and matches the README. PASS
- Exact spelling: "a owl", "an cat", "cats/I + runs/is", "iPad", "can't", "Sam’s", `<b>on</b>`, `&amp;`, and `<img onerror>` survive the tiles, preview, read-aloud, export, and diagram; no HTML is injected. PASS
- Switching packs or back to the bank keeps the sentence. PASS
- Mouse, keyboard, and touch reorder and remove; focus kept; touch target sizes. PASS
- Storage blocked, storage full (save and import), unreadable saved data, and two tabs. PASS
- Original bank regression: tabs, filters, agreement, I→am, tense and plural toggles, advanced tenses, a/an, steps, diagram (Verb / Ind. Object / Direct Object), punctuation, read aloud, undo, custom word, mouse drag. PASS
- No page errors in any run. PASS
