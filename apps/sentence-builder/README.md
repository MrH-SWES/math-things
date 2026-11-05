# Sentence Builder

Teacher notes for `apps/sentence-builder/`. They live outside the app so the student screen stays quiet.

Sentence Builder is a blank, creamy canvas with three sentence rails, plus color-coded word banks. Students drag word tiles onto a rail and rearrange them. That is all it does: it never checks or grades a sentence.

## Using it

- **Choose the lesson** from the menu at the top (Lesson 1 to Lesson 133, grouped by stage). The device remembers the last lesson chosen.
- **Drag a word** from a bank onto any of the three rails. A tile always snaps onto the rail nearest where it's dropped, and a thin marker shows where it will land. Dragging out of a bank makes a copy, so a bank never runs out of a word.
- **Rearrange** by dragging tiles along a rail or onto another rail.
- **Remove a tile** by dragging it off the canvas (for example, back over the banks).
- **The first word on each rail always shows a capital letter.** The word itself is unchanged: drag it later in the sentence and it shows lowercase again. Names (Sam, Pam) and "I" are always capitalized.
- **Punctuation:** the last bank has `.` `?` `!` `,`.
- **Fold a bank's drawer shut** by tapping its name (Nouns, Verbs, and so on), and tap the name again to open it. A closed drawer shows how many words are inside. The device remembers which drawers are closed, even after you change lessons or refresh.
- **Clear** empties all three rails. Tap it, then tap **Clear all?** within 3 seconds, so one stray tap can't wipe the board.
- Changing the lesson leaves the sentences on the board.

### Without dragging

- Tap (or click) a bank word to add it to the end of the current rail. The current rail is the one used most recently, starting with the top rail.
- Keyboard: Tab to a bank word and press Enter to add it. On a placed word, ← and → move it within the sentence, ↑ and ↓ move it to the sentence above or below, and Delete removes it.

On an iPad, a quick swipe up or down on the banks scrolls them. Pulling a word sideways toward the canvas drags it right away. To drag a word straight up or down, press it for a moment until it lifts, then move it.

## What is in each lesson's word banks

For the chosen lesson, the banks hold:

1. **Every word printed in that lesson**: the words the lesson's own author guide requires to be decodable at that lesson. These come from the blending chain, the read and spell lists, the letter-tile chain (minus "silly" words), the Kids' Page and dictation sentences, the story and its title, and the bonus, sort, extension and quick-check words.
2. **Every tricky (heart) word taught up to and including that lesson**, so sentences can always use words like *the*, *a*, *is* and *was*. Tricky words show a small ♥.

Spoken-only text is never used: warm-up words, the adult's script, and the sentences the adult reads aloud for spelling. Many of those words are not decodable yet.

Words are shown exactly as printed in the lessons. Nothing is pluralized, conjugated or corrected.

### Banks and colors

Nouns (rose), Verbs (blue), Adjectives (yellow), Articles (warm gray), Determiners (lavender), Conjunctions (peach), Adverbs (green), Pronouns (pink), Prepositions (teal), Interjections (olive), and Punctuation (white). A bank only appears when the lesson has words for it.

A word that can do more than one job gets a tile in every bank it fits. For example, *fan* is in both Nouns and Verbs, so the tile's color matches how the student is using it. Possessive determiners (*my*, *your*, *their*) are in Determiners. Possessive nouns (*Sam's*, *cats'*) are in Nouns. Contractions go in the bank of their first part: *can't* is in Verbs, *I'm* in Pronouns.

## The word list: check and correct it

`tools/parts-of-speech.tsv` lists every word printed in the 133 lessons (4,298 words) and the banks each one goes in. It is the source of truth for the banks, and it opens in any spreadsheet or text editor.

How it was made: a dictionary (WordNet) and an automatic part-of-speech tagger, which read how each word is used in the lesson sentences, produced a first draft. Closed word classes (articles, determiners, pronouns, prepositions, conjunctions, interjections) were listed by hand. The draft was then reviewed and corrected by hand. Even so, some tags may be debatable or wrong. If a word is in the wrong bank, fix its line in the file and rebuild.

Rare uses are left out on purpose; for example, *cat* is not in Verbs.

## Rebuilding after the lessons or the word list change

`packs.js` is generated. Don't edit it by hand. To rebuild it from the lesson source (Python 3, no extra packages):

```bash
python apps/sentence-builder/tools/build_packs.py "path/to/Sub-Ready-Edition-source-for-review.zip"
```

The script reads `lessons/L001.json` to `L133.json` and `lesson_index.csv` from that ZIP (or from a folder extracted from it), then writes `packs.js`. If a printed word is missing from `parts-of-speech.tsv`, it stops and lists the word so you can add it.

## Tests

`tests/sentence-builder.test.mjs` uses only Node 22+ and Chromium:

```bash
CHROMIUM=/path/to/chrome node --test tests/sentence-builder.test.mjs
```
