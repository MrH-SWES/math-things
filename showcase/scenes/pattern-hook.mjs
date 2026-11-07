// Capture-only handle into Pattern Blocks, injected for filming (never part of the app): it seeds
// trays and pre-solved arrangements and sets the camera distance (the app's edge length S).
// Every move the film shows as an action — the wrong approach, the turn, the fit — is real pointer
// input handled by the app itself.
const FILE = '/apps/pattern-blocks/index.html';

export const PATTERN_PATCH = {
  [FILE]: [
    // camera distance: the app's own layout, at a chosen edge length when the film sets one
    ['    S = Math.min(72, W /', '    S = window.__S || Math.min(72, W /'],
    ['  paintOutlineBin();\n  layout();\n  changed();\n})();',
      `  paintOutlineBin();
  layout();
  changed();
  window.__pb = {
    OUTLINES, SHAPES, H,
    trayIndex: name => OUTLINES.findIndex(o => o && o.name === name),
    // a tray at a camera distance (null: the app's own fit)
    tray(index, s = null) { window.__S = s; changeOutline(index); paintOutlineBin(); },
    // a piece is placed only where the app would accept it
    add(type, x, y, rot) {
      const vs = verts({ type, x, y, rot });
      if (trayBlocked(vs) || pieces.some(o => overlaps(vs, verts(o)))) throw new Error('illegal ' + type + ' at ' + [x, y, rot]);
      return addPiece(type, x, y, rot).id;
    },
    clear() { select(null); pieces.forEach(p => p.g.remove()); pieces = []; },
    px: (x, y) => toPx(x, y),
    get S() { return S; },
    piece: id => { const p = pieces.find(q => q.id === id); return p && { id, type: p.type, x: p.x, y: p.y, rot: p.rot, reach: SHAPES[p.type].reach }; },
    pieces: () => pieces.map(p => ({ id: p.id, type: p.type, x: p.x, y: p.y, rot: p.rot })),
    selected: () => selected && selected.id,
    // the piece (x, y, rot) whose corners are exactly these points, in edge units
    fit(type, pts) {
      const x = pts.reduce((a, p) => a + p[0], 0) / pts.length, y = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      for (let rot = 0; rot < 360; rot += 30) {
        const a = -rot * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
        const vs = SHAPES[type].local.map(v => [x + v.x * c - v.y * s, y + v.x * s + v.y * c]);
        if (vs.length === pts.length && vs.every(v => pts.some(p => Math.hypot(p[0] - v[0], p[1] - v[1]) < 1e-6))) return { type, x, y, rot };
      }
      throw new Error('no ' + type + ' fits ' + JSON.stringify(pts));
    },
  };
})();`]],
};
