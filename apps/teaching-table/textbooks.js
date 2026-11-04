/* Teaching Table — textbooks.
 *
 * Opens the packaged i-Ready Classroom Mathematics EPUBs (K–8) or a local EPUB,
 * lists their lessons and renders one section as a self-contained, script-free
 * page. It keeps the on-device library of the original Teaching Table, so a book
 * already downloaded there opens here without a download.
 * Licensed books are served only by the access-controlled deployment (books/).
 */
(() => {
  'use strict';

  const BOOKS = new URL('books/', location.href);
  const COVERS = new URL('covers/', location.href);
  const PACKAGED = [
    { grade: 'K', name: 'iRCM0K_NN_EN_SW.epub', size: 260866814 },
    { grade: '1', name: 'iRCM01_NN_EN_SW.epub', size: 219147927 },
    { grade: '2', name: 'iRCM02_NN_EN_SW.epub', size: 254660290 },
    { grade: '3', name: 'iRCM03_NN_EN_SW.epub', size: 150737463 },
    { grade: '4', name: 'iRCM04_NN_EN_SW.epub', size: 113912690 },
    { grade: '5', name: 'iRCM05_NN_EN_SW.epub', size: 142733845 },
    { grade: '6', name: 'iRCM06_NN_EN_SW.epub', size: 199036068 },
    { grade: '7', name: 'iRCM07_NN_EN_SW.epub', size: 222962162 },
    { grade: '8', name: 'iRCM08_NN_EN_SW.epub', size: 213820188 },
  ];

  // ── The shared on-device library (same database as the original table) ──
  const DB_NAME = 'teaching-table-curriculum-v1', STORE = 'books';
  function openDb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error || new Error('Could not open the textbook library.'));
    });
  }
  async function tx(mode, fn) {
    const db = await openDb();
    try {
      return await new Promise((res, rej) => {
        const t = db.transaction(STORE, mode), q = fn(t.objectStore(STORE));
        t.oncomplete = () => res(q?.result ?? null);
        t.onerror = t.onabort = () => rej(t.error);
      });
    } finally { db.close(); }
  }
  const getSaved = id => tx('readonly', s => s.get(id));
  const saveBook = file => tx('readwrite', s => s.put({
    id: file.name, name: file.name, label: file.name.replace(/\.epub$/i, ''),
    size: file.size, type: 'application/epub+zip', modified: file.lastModified || Date.now(),
    savedAt: Date.now(), blob: file,
  }));
  async function savedNames() {
    try { return new Set(((await tx('readonly', s => s.getAllKeys())) || []).map(String)); }
    catch { return new Set(); }
  }

  // Downloads in 4 MB ranges through the signed-in worker, with retries.
  async function download(book, onProgress) {
    const url = new URL(encodeURIComponent(book.name), BOOKS), size = book.size, step = 4 * 1024 * 1024;
    const chunks = [];
    let got = 0;
    while (got < size) {
      const end = Math.min(got + step, size) - 1;
      let fail = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          onProgress?.(got / size);
          const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store', headers: { Range: `bytes=${got}-${end}` } });
          if (r.status === 401 || r.status === 403) throw new Error('Sign in to the Teaching Table again to open textbooks.');
          if (r.status === 404) throw new Error('Textbooks open on the signed-in Teaching Table.');
          if (r.status !== 206) throw new Error('Textbook download error ' + r.status);
          const bytes = await r.arrayBuffer();
          if (bytes.byteLength !== end - got + 1) throw new Error('Incomplete textbook download.');
          chunks.push(bytes); got = end + 1; fail = null; break;
        } catch (err) {
          fail = err;
          if (/Sign in|signed-in/.test(err.message)) break;
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 800));
        }
      }
      if (fail) throw fail;
    }
    onProgress?.(1);
    return new File(chunks, book.name, { type: 'application/epub+zip', lastModified: Date.now() });
  }

  // ── EPUB ──
  const parse = t => new DOMParser().parseFromString(t, 'application/xml');
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const dirname = p => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
  function resolve(base, rel) {
    let r = (rel || '').split('#')[0].split('?')[0];
    if (!r) return base;
    try { r = decodeURIComponent(r); } catch {}
    const parts = r.startsWith('/') ? [] : dirname(base).split('/').filter(Boolean);
    r.replace(/^\/+/, '').split('/').forEach(x => {
      if (!x || x === '.') return;
      if (x === '..') parts.pop(); else parts.push(x);
    });
    return parts.join('/');
  }
  // Verified menu-only corrections for the Grade 4/5 books.
  const NAV_FIXES = {
    4: {
      'OEBPS/xhtml/04_Unit01.xhtml': 'Unit 1: Whole Numbers: Place Value, Comparison, Addition, and Subtraction',
      'OEBPS/xhtml/59_Lesson_29.xhtml': 'Lesson 29: Problems About Length, Liquid Volume, Mass, and Weight',
      'OEBPS/xhtml/67_Lesson_30.xhtml': 'Lesson 30: Points, Lines, Rays, and Angles',
    },
    5: {
      'OEBPS/xhtml/16_unit_02.xhtml': 'Unit 2: Decimals and Fractions: Place Value, Addition, and Subtraction',
      'OEBPS/xhtml/20_chapter_16.xhtml': 'Lesson 7: Understand Powers of 10',
      'OEBPS/xhtml/30_Lesson_30.xhtml': 'Lesson 30: Evaluate, Write, and Interpret Expressions',
      'OEBPS/xhtml/31_Lesson_31.xhtml': 'Lesson 31: Understand the Coordinate Plane',
      'OEBPS/xhtml/32_Lesson_32.xhtml': 'Lesson 32: Represent Problems in the Coordinate Plane',
      'OEBPS/xhtml/33_Lesson_33.xhtml': 'Lesson 33: Analyze Patterns and Relationships',
    },
  };
  const extUrl = u => /^(?:[a-z]+:)?\/\//i.test(u) || /^(?:data|blob|mailto|tel):/i.test(u);
  const mime = p => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', svg: 'image/svg+xml',
    webp: 'image/webp', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf' })
    [(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';

  let book = null;          // { name, title, grade, zip, navPath, toc: [{label, href, depth}] }
  const urls = new Set();
  const revoke = () => { urls.forEach(URL.revokeObjectURL); urls.clear(); };
  async function asset(path) {
    const f = book?.zip.file(path);
    if (!f) return '';
    const b = await f.async('blob'), u = URL.createObjectURL(b.type ? b : new Blob([b], { type: mime(path) }));
    urls.add(u); return u;
  }

  async function openFile(file) {
    if (!window.JSZip) throw new Error('The textbook reader did not load.');
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const container = zip.file('META-INF/container.xml');
    if (!container) throw new Error('That file is not an EPUB textbook.');
    const opfPath = parse(await container.async('text')).getElementsByTagNameNS('*', 'rootfile')[0]?.getAttribute('full-path');
    const opf = opfPath && zip.file(opfPath) && parse(await zip.file(opfPath).async('text'));
    if (!opf) throw new Error('The EPUB package is missing.');
    const navItem = [...opf.getElementsByTagNameNS('*', 'item')]
      .find(i => (i.getAttribute('properties') || '').split(/\s+/).includes('nav'));
    const navPath = navItem && resolve(opfPath, navItem.getAttribute('href'));
    const nav = navPath && zip.file(navPath) && parse(await zip.file(navPath).async('text'));
    if (!nav) throw new Error('The EPUB has no table of contents.');
    const navs = [...nav.getElementsByTagNameNS('*', 'nav')];
    const tocNav = navs.find(n => (n.getAttribute('epub:type') || n.getAttributeNS('http://www.idpf.org/2007/ops', 'type') || '')
      .split(/\s+/).includes('toc')) || navs[0];
    const parent = new Map();
    tocNav.querySelectorAll('*').forEach(p => [...p.children].forEach(c => parent.set(c, p)));
    const depth = a => { let d = 0, p = parent.get(a); while (p && p !== tocNav) { if (p.localName === 'ol') d++; p = parent.get(p) } return Math.max(0, d - 1) };
    const title = clean(opf.getElementsByTagNameNS('*', 'title')[0]?.textContent) || file.name.replace(/\.epub$/i, '');
    const grade = file.name.match(/^iRCM(0K|\d{2})_/i)?.[1]?.replace(/^0(?=\d)/, '') || '';
    revoke();
    book = {
      name: file.name, title, grade, zip, navPath,
      toc: [...tocNav.getElementsByTagNameNS('*', 'a')].map((a, i) => {
        const href = a.getAttribute('href') || '';
        const fixed = !href.includes('#') && NAV_FIXES[grade]?.[resolve(navPath, href)];
        return { label: fixed || clean(a.textContent) || 'Section ' + (i + 1), href, depth: depth(a) };
      }).filter(x => x.href),
    };
    return book;
  }

  async function openPackaged(grade, onProgress) {
    const b = PACKAGED.find(x => x.grade === String(grade));
    if (!b) throw new Error('Unknown grade.');
    const saved = await getSaved(b.name).catch(() => null);
    let file;
    if (saved?.blob) file = new File([saved.blob], b.name, { type: 'application/epub+zip' });
    else {
      file = await download(b, onProgress);
      try { await navigator.storage?.persist?.(); await saveBook(file); } catch (e) { console.warn('Textbook not saved on this device', e); }
    }
    return openFile(file);
  }

  // Reopen a book already on this device (packaged or local); null if it is not here.
  async function openSaved(name) {
    const saved = await getSaved(name).catch(() => null);
    return saved?.blob ? openFile(new File([saved.blob], name, { type: 'application/epub+zip' })) : null;
  }
  // A local EPUB is kept on the device too, so it reopens next time.
  async function openLocal(file) {
    try { await saveBook(file); } catch (e) { console.warn('Textbook not saved on this device', e); }
    return openFile(file);
  }

  // One section as a self-contained page: no scripts, no outside requests, links inert.
  async function renderSection(i) {
    const item = book?.toc[i];
    if (!item) throw new Error('No such page.');
    const path = resolve(book.navPath, item.href.split('#')[0]);
    const f = book.zip.file(path);
    if (!f) throw new Error('That page is missing from the book.');
    revoke();
    const raw = await f.async('text'), doc = parse(raw);
    if (doc.querySelector('parsererror')) throw new Error('That page could not be read.');
    doc.querySelectorAll('script,iframe,object,embed').forEach(e => e.remove());
    doc.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => { if (/^on/i.test(a.name)) e.removeAttribute(a.name) }));
    const styles = [];
    for (const link of [...doc.querySelectorAll('link[rel~="stylesheet"][href]')]) {
      const cssPath = resolve(path, link.getAttribute('href')), cssFile = book.zip.file(cssPath);
      if (cssFile) {
        let css = await cssFile.async('text');
        for (const m of [...css.matchAll(/url\(([^)]+)\)/g)]) {
          const u = (m[1] || '').trim().replace(/^['"]|['"]$/g, '');
          if (u && !u.startsWith('#') && !extUrl(u)) { const b = await asset(resolve(cssPath, u)); if (b) css = css.split(m[0]).join(`url("${b}")`) }
        }
        styles.push(css);
      }
      link.remove();
    }
    for (const [sel, attr] of [['img', 'src'], ['source', 'src'], ['video', 'poster'], ['image', 'href']]) {
      for (const el of [...doc.querySelectorAll(`${sel}[${attr}]`)]) {
        const src = el.getAttribute(attr);
        if (!src || extUrl(src) || src.startsWith('#')) continue;
        const u = await asset(resolve(path, src)); if (u) el.setAttribute(attr, u);
      }
    }
    doc.querySelectorAll('a[href]').forEach(a => a.removeAttribute('href'));
    const inline = [...doc.querySelectorAll('style')].map(s => s.textContent || '').join('\n');
    const body = doc.querySelector('body')?.innerHTML || raw;
    return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data:; media-src blob: data:; font-src blob: data:; style-src 'unsafe-inline' blob:;">
<style>html,body{margin:0;background:#fff;color:#1d1d1f;overflow:hidden}body{line-height:1.45}
img,svg,video{max-width:100%;height:auto}table{max-width:100%}
${styles.join('\n')}
${inline}</style></head><body>${body}</body></html>`;
  }

  window.TTBooks = {
    PACKAGED, COVERS, savedNames, openPackaged, openSaved, openLocal, renderSection,
    get book() { return book },
  };
})();
