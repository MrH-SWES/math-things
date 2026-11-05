"""Build apps/sentence-builder/packs.js from the Reading & Spelling lesson source.

Usage:
    python build_packs.py PATH_TO_SOURCE [--lexicon parts-of-speech.tsv] [--out ../packs.js]

PATH_TO_SOURCE is the Sub-Ready Edition source ZIP (or a folder extracted from it)
containing lessons/L001.json ... L133.json and lesson_index.csv.

Only words a student sees in print are used: the fields the lesson author guide
requires to be decodable at that lesson (blending chain, read/spell lists, build chain
minus "silly" words, Kids' Page and dictation sentences, story and its title, bonus,
sort, extension and quick-check words) plus the lesson's new tricky words. Spoken-only
text (warm-up words, adult scripts, quick-check spelling sentences) is ignored.

Every word must be listed in the lexicon (parts-of-speech.tsv), which says which word
banks it goes in. The build stops and lists any word that is missing.
Standard library only.
"""
import argparse, csv, io, json, os, re, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
BANKS = ['noun', 'pronoun', 'verb', 'adjective', 'adverb', 'article', 'determiner',
         'preposition', 'conjunction', 'interjection']


def fix(s):
    """Undo UTF-8-read-as-cp1252 mojibake in the source, and use straight quotes."""
    if not isinstance(s, str):
        return s
    for _ in range(2):
        try:
            t = s.encode('cp1252').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
        if t == s:
            break
        s = t
    return s.replace('’', "'").replace('‘', "'")


class Source:
    def __init__(self, path):
        self.zip = zipfile.ZipFile(path) if zipfile.is_zipfile(path) else None
        self.root = path

    def names(self):
        if self.zip:
            return [n for n in self.zip.namelist() if re.fullmatch(r'(?:.*/)?lessons/L\d{3}\.json', n)]
        folder = os.path.join(self.root, 'lessons')
        return [os.path.join(folder, n) for n in os.listdir(folder) if re.fullmatch(r'L\d{3}\.json', n)]

    def read(self, name):
        if self.zip:
            return self.zip.read(name).decode('utf-8')
        with open(name, encoding='utf-8') as fh:
            return fh.read()

    def index_csv(self):
        if self.zip:
            name = next(n for n in self.zip.namelist() if n.endswith('lesson_index.csv'))
            return self.zip.read(name).decode('utf-8')
        with open(os.path.join(self.root, 'lesson_index.csv'), encoding='utf-8') as fh:
            return fh.read()


def printed_text(d):
    """(is_list_item, text) for every decodable-checked printed field of a lesson."""
    out = []
    lists = list(d['blending']['chain'])
    for k in ('read_watch', 'read_with', 'spell_watch', 'spell_with'):
        lists += d['concept'].get(k, [])
    lists += [x['w'] for x in d['build']['chain'] if not x.get('silly')]
    lists += d.get('bonus', [])
    ext = d.get('extension') or {}
    if ext.get('sort'):
        for col in ext['sort'].get('columns', []):
            lists += col.get('words', [])
    qc = ext.get('quick_check') or {}
    lists += qc.get('read', []) + [x['word'] for x in qc.get('spell', [])]
    out += [(True, fix(x)) for x in lists]
    texts = d['sentences']['read'] + d['sentences']['dictate'] + d['story']['paragraphs'] + ext.get('more_words', [])
    out += [(False, fix(x)) for x in texts + [d['story']['title']]]
    return out


TOKEN = re.compile(r"[A-Za-z][A-Za-z'\-]*")


def tokens(text):
    for m in TOKEN.finditer(text):
        t = m.group(0).strip('-')
        if t.endswith("'") and not t.lower().endswith("s'"):
            t = t[:-1]  # closing quote, not a plural possessive
        if t:
            yield t


def load_lexicon(path):
    lex = {}
    with open(path, encoding='utf-8') as fh:
        rows = [l for l in fh.read().splitlines() if l and not l.startswith('#')]
    for line in rows[1:]:
        word, banks = line.split('\t')[:2]
        parts = [b.strip() for b in banks.split(',') if b.strip()]
        bad = [b for b in parts if b not in BANKS]
        if not parts or bad:
            raise SystemExit(f'lexicon: "{word}" has bad banks {banks!r}')
        if word in lex:
            raise SystemExit(f'lexicon: "{word}" is listed twice')
        lex[word] = parts
    return lex


def canonical(token, lex, lower_map):
    """The lexicon's written form for a printed token (sentence-start capitals, all-caps signs)."""
    if token in lex:
        return token
    if len(token) > 1 and token.isupper():
        token = token.lower()
    for cand in (token, token[0].lower() + token[1:], token.lower()):
        if cand in lex:
            return cand
    return lower_map.get(token.lower())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('source')
    ap.add_argument('--lexicon', default=os.path.join(HERE, 'parts-of-speech.tsv'))
    ap.add_argument('--out', default=os.path.join(HERE, '..', 'packs.js'))
    args = ap.parse_args()

    lex = load_lexicon(args.lexicon)
    lower_map = {w.lower(): w for w in lex}
    src = Source(args.source)
    index = {row['lesson']: row for row in csv.DictReader(io.StringIO(src.index_csv()))}

    lessons, missing = [], {}
    for name in sorted(src.names()):
        d = json.loads(src.read(name))
        lid = 'L%03d' % d['num']
        words = set()
        for _, text in printed_text(d):
            for t in tokens(text):
                c = canonical(t, lex, lower_map)
                if c is None:
                    missing.setdefault(t, lid)
                else:
                    words.add(c)
        tricky = []
        for t in d['tricky'].get('new', []):
            c = canonical(fix(t['word']), lex, lower_map)
            if c is None:
                missing.setdefault(t['word'], lid)
            else:
                tricky.append(c)
                words.add(c)
        row = index.get(lid, {})
        lessons.append({'id': lid, 'n': d['num'], 'title': row.get('title') or fix(d['title']),
                        'stage': row.get('stage', ''), 'words': sorted(words), 'tricky': tricky})

    if missing:
        print('These printed words are not in the lexicon. Add them to parts-of-speech.tsv:', file=sys.stderr)
        for w, lid in sorted(missing.items(), key=lambda x: (x[1], x[0].lower())):
            print(f'  {w}\t(first in {lid})', file=sys.stderr)
        raise SystemExit(1)

    used = sorted({w for L in lessons for w in L['words']}, key=lambda w: (w.lower(), w))
    unused = sorted(set(lex) - set(used), key=str.lower)
    pos = {w: i for i, w in enumerate(used)}
    data = {
        'source': 'Reading & Spelling, Sub-Ready Edition (133 lessons)',
        'banks': BANKS,
        'words': [[w, [BANKS.index(b) for b in lex[w]]] for w in used],
        'lessons': [{'id': L['id'], 'title': L['title'], 'stage': L['stage'],
                     'words': [pos[w] for w in L['words']], 'tricky': [pos[w] for w in L['tricky']]}
                    for L in sorted(lessons, key=lambda L: L['n'])],
    }
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    with open(args.out, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('// Generated by tools/build_packs.py from the Reading & Spelling lesson source. Do not edit by hand.\n')
        fh.write('// words: [word, [bank index...]]; each lesson lists the words it prints and its new tricky words.\n')
        fh.write('window.SENTENCE_BUILDER_DATA = ' + body + ';\n')
    sizes = [len(L['words']) for L in lessons]
    print(f'{len(lessons)} lessons, {len(used)} words, lesson word counts {min(sizes)}-{max(sizes)} -> {os.path.normpath(args.out)}')
    if unused:
        print(f'note: {len(unused)} lexicon words are not printed in any lesson: {" ".join(unused[:20])}')


if __name__ == '__main__':
    main()
