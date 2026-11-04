# Build-A-Sentence: word packs

Teacher notes for `apps/sentences/index.html`. These notes live outside the app so the student screen stays quiet.

A **word pack** is a short, reusable list of words for one lesson, such as the decodable words for a phonics lesson. When a pack is chosen, students see only that pack's words. They can build any sentence they like with them.

## Make a pack

1. Tap **Word packs**, under the sentence area.
2. Tap **New pack** and type a **pack name**. **Lesson**, **Reading level**, and **Skill** are optional labels.
3. Type or paste words into **Nouns**, **Verbs**, or **Helpers**. Separate words with commas or new lines, then tap **Add** or press Enter.
   - Each word appears as a chip. Tap ✕ on a chip to remove that word.
   - If a word is already in that list, it isn't added a second time. Students can still use any word more than once in a sentence.
   - Any list can be empty.
4. Tap **Save pack**. You can also tap **Use on board**, which saves the pack and shows it to students.

You can switch to another saved pack under **Editing** and change it. **Duplicate** saves a copy, which is useful for making a "day 2" version. **Delete** asks you to confirm first. **Undo changes** goes back to the last saved version.

Two packs can't have the same name (capital letters don't make names different).

## Use a pack with students

Choose the pack from the **Words** menu. The pack's labels appear next to the menu. **Original word bank** brings back the full built-in bank with its tabs, tense and plural options, and the step pills.

- Switching between packs or the original bank **never clears the sentence on the board**. Tap **Clear All** to start over.
- Students tap a word to add it. They can add words in any order, use a word more than once, and type their own word. In a pack, they choose Noun, Verb, or Helper for a typed word.
- To move or remove a tile, either drag it, or tap it to show **←**, **✕**, and **→**. With a keyboard, Tab to a tile and press Enter to select it. Then use ← and → to move it, Delete to remove it, and Escape to let go.
- **Read Aloud**, **Statement / Question / Exclamation** punctuation, and **Diagram Sentence** all work with pack words.

### Exact spelling

Pack words are shown and read **exactly as you typed them**. The app never pluralizes them, changes their tense, makes them agree with the subject, or switches between *a* and *an*. Two things are added only in the sentence preview and when it is read aloud: a capital letter at the start of the sentence (a word that already has a capital letter in it, such as *iPad*, stays as typed), and end punctuation. The word tiles themselves never change.

Helper words get no guessed part of speech. When you diagram a sentence, any words before the first **verb** are underlined as the subject. Helper words are never labeled as an object. The example packs are illustrations only and aren't aligned to any curriculum.

The original word bank still uses automatic agreement, tense and plural options, and *a/an* correction.

## Saving, backup, and moving packs

Packs are saved in **this browser on this device only**:

- They **do not sync** to other devices, other browsers, or any account.
- Clearing browser data, or using private browsing, deletes them.
- If the browser blocks saved data, the panel shows a warning. Packs then last only until the page is refreshed.

To back up packs or move them to another device:

1. On the first device, open **Word packs** and tap **Export all packs** (or **Export this pack**). A `.json` file is saved to Downloads. On iPad, it goes to the Files app.
2. Move the file to the other device, for example through email, a shared drive, or AirDrop.
3. On the other device, open **Word packs**, tap **Import file…**, and choose the file.

Import is checked before anything changes:

- If anything in the file is wrong, **nothing** is imported, and the panel lists the problems.
- Otherwise you see a preview. Nothing is added until you tap **Import**.
- Existing packs are never overwritten. An imported pack whose name is already used is added with a number, such as `Short a (2)`.

**Download example file** in the panel saves a sample file you can open or import.

## File format

The file is plain JSON in UTF-8:

```json
{
  "format": "build-a-sentence-word-packs",
  "version": 1,
  "exportedAt": "2026-11-04T19:00:00.000Z",
  "packs": [
    {
      "name": "Example: short a",
      "lesson": "Example only",
      "readingLevel": "",
      "skill": "short a",
      "nouns": ["cat", "hat", "map", "van", "Sam"],
      "verbs": ["sat", "ran", "has", "can"],
      "helpers": ["the", "a", "and", "is", "on", "I"]
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `format` | no | If present, must be `"build-a-sentence-word-packs"`. |
| `version` | no | If present, must be `1`. |
| `exportedAt` | no | Information only. It is ignored on import. |
| `packs` | yes | A list of 1–200 packs. |
| `name` | yes | Text, up to 60 characters. |
| `lesson`, `readingLevel`, `skill` | no | Text, up to 60 characters each. |
| `nouns`, `verbs`, `helpers` | at least one | A list of up to 300 words. Each word is text of up to 40 characters, with no commas or line breaks. A list can be empty. |

You can also import a single pack object, such as `{"name": "…", "nouns": […]}`, or a bare list of packs. Spaces at the start and end of a word are trimmed. Runs of spaces inside a word become one space. Apostrophes (`can't`, `Sam’s`) and characters such as `<`, `>`, and `&` are kept and shown as plain text. A word repeated inside one list is kept once. Unknown fields are ignored. The largest file you can import is 1 MB.

## Tests (for developers)

`tests/sentences-word-packs.test.mjs` covers packs, import and export, exact spelling, touch and keyboard controls, storage failures, and the original word bank. Like the other files in `tests/`, it has no dependencies. It needs Node 22+ and Chromium:

```bash
CHROMIUM=/path/to/chrome node --test tests/sentences-word-packs.test.mjs
```
