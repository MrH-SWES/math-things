// The clutter the prologue clears away: an original parody of the busy edtech screen (title sign,
// points, timer, mascot with directions, flashing GO, levels, score, premature praise), laid over the
// real rekenrek for the film only. It imitates a genre, not any real product.

const star = (r1, r2, n = 5) => [...Array(n * 2)].map((_, k) => {
  const r = k % 2 ? r2 : r1, a = -Math.PI / 2 + k * Math.PI / n;
  return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
}).join(' ');
const STAR = `<svg viewBox="0 0 100 100"><polygon points="${star(48, 21)}" fill="#FFD23F" stroke="#E0A100" stroke-width="4" stroke-linejoin="round"/></svg>`;
const BURST = `<svg viewBox="0 0 100 100"><polygon points="${star(50, 38, 14)}" fill="#FFE14D" stroke="#F29F05" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const BOLTS = '<i class="bolt" style="left:10px;top:10px"></i><i class="bolt" style="right:10px;top:10px"></i><i class="bolt" style="left:10px;bottom:10px"></i><i class="bolt" style="right:10px;bottom:10px"></i>';

const OWL = `<svg viewBox="0 0 220 300">
  <ellipse cx="80" cy="288" rx="24" ry="10" fill="#F5A623"/><ellipse cx="140" cy="288" rx="24" ry="10" fill="#F5A623"/>
  <ellipse cx="28" cy="190" rx="26" ry="60" transform="rotate(-14 28 190)" fill="#6F4520"/>
  <g class="wave"><ellipse cx="196" cy="150" rx="24" ry="58" transform="rotate(38 196 150)" fill="#6F4520"/></g>
  <polygon points="42,92 58,40 84,86" fill="#6F4520"/><polygon points="136,86 162,40 178,92" fill="#6F4520"/>
  <ellipse cx="110" cy="180" rx="92" ry="108" fill="#8A5A2B" stroke="#5B3A1A" stroke-width="5"/>
  <ellipse cx="110" cy="205" rx="58" ry="70" fill="#F4DBA8"/>
  <path d="M92 190q8 8 16 0M112 190q8 8 16 0M102 214q8 8 16 0M92 238q8 8 16 0M112 238q8 8 16 0" stroke="#C9A06A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="74" cy="134" r="34" fill="#fff" stroke="#5B3A1A" stroke-width="5"/><circle cx="146" cy="134" r="34" fill="#fff" stroke="#5B3A1A" stroke-width="5"/>
  <circle cx="80" cy="138" r="15" fill="#1D1D1F"/><circle cx="140" cy="138" r="15" fill="#1D1D1F"/>
  <circle cx="85" cy="132" r="5" fill="#fff"/><circle cx="145" cy="132" r="5" fill="#fff"/>
  <polygon points="98,160 122,160 110,184" fill="#F5A623" stroke="#C47A00" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="36,62 110,30 184,62 110,94" fill="#26262A"/><rect x="76" y="62" width="68" height="22" fill="#26262A"/>
  <path d="M110 62L170 72v34" stroke="#FFD23F" stroke-width="4" fill="none"/><circle cx="170" cy="110" r="8" fill="#FFD23F"/>
</svg>`;
const CLOCK = '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="15" fill="#fff" stroke="#E04848" stroke-width="4"/><path d="M20 22V13M20 22l7 4" stroke="#E04848" stroke-width="4" stroke-linecap="round"/><rect x="15" y="1" width="10" height="5" rx="2" fill="#E04848"/></svg>';
const BULB = '<svg viewBox="0 0 40 40"><path d="M20 4a12 12 0 0 0-7 21.7V30h14v-4.3A12 12 0 0 0 20 4z" fill="#FFF6B8" stroke="#8A6D00" stroke-width="3"/><path d="M14 34h12M16 38h8" stroke="#8A6D00" stroke-width="3" stroke-linecap="round"/></svg>';

export const FONTS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Comic+Neue:wght@700&family=Lexend:wght@600&display=swap';

export const CSS = `
  #slop-wall { position: fixed; inset: 0; z-index: -1; overflow: hidden;
    background: repeating-linear-gradient(90deg, #2F62C4 0 64px, #2958B3 64px 128px); }
  #slop-wall .floor { position: absolute; left: 0; right: 0; bottom: 0; height: 24%;
    background: repeating-linear-gradient(0deg, #00000022 0 3px, transparent 3px 52px), repeating-linear-gradient(90deg, #D99F58 0 236px, #B9823F 236px 240px); border-top: 10px solid #9C6A33; }
  #slop-wall .curtain { position: absolute; top: -30px; width: 300px; height: 720px;
    background: repeating-linear-gradient(90deg, #D8352C 0 38px, #B5221B 38px 56px); box-shadow: 0 12px 30px #0006; }
  #slop-wall .curtain.l { left: -70px; border-bottom-right-radius: 100% 80%; }
  #slop-wall .curtain.r { right: -70px; border-bottom-left-radius: 100% 80%; }
  #slop-wall .valance { position: absolute; left: 0; right: 0; top: 0; height: 26px; background: #F2B705; box-shadow: 0 4px 0 #C98F00; }
  #slop-wall .s { position: absolute; width: 70px; opacity: 0.9; animation: twinkle 1.3s ease-in-out infinite alternate; }
  #slop-wall .ball { position: absolute; left: 1290px; top: 860px; width: 170px; height: 170px; border-radius: 50%;
    background: conic-gradient(#E53935 0 60deg, #FDD835 0 120deg, #1E88E5 0 180deg, #fff 0 240deg, #43A047 0 300deg, #FB8C00 0); box-shadow: inset -18px -14px 30px #0005, 0 10px 18px #0004; }
  @keyframes twinkle { to { transform: scale(0.75) rotate(20deg); opacity: 0.55; } }

  #slop { position: fixed; inset: 0; z-index: 10; pointer-events: none; font-family: 'Fredoka', sans-serif; color: #2B1B0E; }
  #slop .fl { position: absolute; }
  #slop .panel { position: absolute; inset: 0; background: #FFFBF2; border: 6px solid #B0703A; border-radius: 22px; box-shadow: 0 10px 0 #7A4A20, 0 18px 26px #0005; }
  #slop .bolt { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff, #9a9a9a 60%, #555); }

  #banner .rope { position: absolute; top: -40px; width: 8px; height: 60px; background: #8A5A2B; }
  #banner .board { position: absolute; inset: 0; background: #FFF3DC; border: 9px solid #B0703A; border-radius: 26px; box-shadow: 0 10px 0 #7A4A20, 0 20px 30px #0006;
    display: grid; place-content: center; font-weight: 700; font-size: 78px; letter-spacing: 1px; color: #3B2312;
    text-shadow: 3px 3px 0 #fff, -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 6px 7px 0 #F2B705; }

  #points .panel { border-color: #F2B705; box-shadow: 0 8px 0 #C98F00, 0 14px 22px #0005; }
  #points .row { position: absolute; left: 24px; top: 14px; display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 34px; }
  #points .row svg { width: 52px; animation: twinkle 0.9s ease-in-out infinite alternate; }
  #points .row b { font-size: 56px; color: #E04848; margin-left: 18px; }
  #points .bar { position: absolute; left: 24px; right: 24px; bottom: 16px; height: 22px; border-radius: 11px; border: 3px solid #C98F00; overflow: hidden;
    background: repeating-linear-gradient(45deg, #FFE9A8 0 14px, #FFF6D6 14px 28px); background-size: 40px 40px; animation: stripes 0.6s linear infinite; }
  #points .bar i { position: absolute; left: 0; top: 0; bottom: 0; width: 4%; background: #43A047; }
  @keyframes stripes { to { background-position: 40px 0; } }

  #timer .panel { border-color: #E04848; box-shadow: 0 8px 0 #A82C2C, 0 14px 22px #0005; }
  #timer .t { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 16px; font-weight: 700; font-size: 78px; color: #E04848; }
  #timer .t svg { width: 64px; }
  #timer .colon { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0; } }

  #badge .in { position: absolute; inset: 0; transform: rotate(-12deg); animation: throb 0.7s ease-in-out infinite alternate; }
  #badge svg { position: absolute; inset: 0; }
  #badge span { position: absolute; inset: 0; display: grid; place-content: center; font-family: 'Comic Neue', cursive; font-weight: 700; font-size: 38px; color: #D81B60; text-align: center; line-height: 1; }
  @keyframes throb { to { transform: rotate(-6deg) scale(1.1); } }

  #level .h { position: absolute; top: 18px; left: 0; right: 0; text-align: center; font-weight: 600; font-size: 34px; }
  #level .b { position: absolute; left: 32px; width: 96px; height: 96px; border: 5px solid #2B1B0E; border-radius: 16px; background: #fff;
    display: grid; place-content: center; font-weight: 700; font-size: 58px; box-shadow: 0 6px 0 #0003; }
  #level .b.on { background: #FFD23F; }

  #card .q { position: absolute; inset: 0; display: grid; place-content: center; font-weight: 700; font-size: 190px; line-height: 1; }
  #hint .in { position: absolute; inset: 0; background: #FFD23F; border: 5px solid #8A6D00; border-radius: 40px; box-shadow: 0 7px 0 #8A6D00;
    display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; font-size: 40px; }
  #hint svg { width: 44px; }

  #bubble .in { position: absolute; inset: 0; background: #fff; border: 6px solid #2B1B0E; border-radius: 46px; box-shadow: 0 10px 22px #0004;
    padding: 22px 34px; font-family: 'Comic Neue', cursive; font-weight: 700; font-size: 40px; line-height: 1.15; color: #1D1D1F; }
  #bubble .tail { position: absolute; left: 70px; bottom: -44px; width: 0; height: 0; border-left: 26px solid transparent; border-right: 26px solid transparent; border-top: 48px solid #2B1B0E; transform: rotate(18deg); }
  #bubble .tail::after { content: ''; position: absolute; left: -17px; top: -52px; border-left: 17px solid transparent; border-right: 17px solid transparent; border-top: 34px solid #fff; }

  #owl .in { position: absolute; inset: 0; animation: bob 0.55s ease-in-out infinite alternate; }
  #owl .wave { transform-origin: 180px 120px; animation: wave 0.35s ease-in-out infinite alternate; }
  @keyframes bob { to { transform: translateY(-12px); } }
  @keyframes wave { to { transform: rotate(-22deg); } }

  #directions .in { position: absolute; inset: 0; background: #FFF7C2; border: 5px dashed #E04848; border-radius: 18px; box-shadow: 0 10px 22px #0004;
    padding: 18px 210px 18px 28px; font-family: 'Comic Neue', cursive; font-weight: 700; font-size: 33px; line-height: 1.2; color: #1D1D1F; }
  #directions .in u { color: #E04848; }
  #directions .check { position: absolute; right: 24px; top: 50%; transform: translateY(-50%); background: #43A047; color: #fff; border-radius: 16px;
    padding: 14px 24px; font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 36px; box-shadow: 0 6px 0 #2E7D32; }

  #score .panel { border-color: #2B1B0E; border-width: 5px; box-shadow: 0 7px 0 #0003; }
  #score .in { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-around; font-weight: 600; font-size: 36px; }

  #go .base { position: absolute; inset: 0; background: #2F7DE1; border: 6px solid #1B4F96; border-radius: 34px; box-shadow: 0 10px 0 #1B4F96, 0 18px 28px #0006; }
  #go .btn { position: absolute; left: 34px; top: 22px; width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle at 38% 30%, #9BF59B, #2FBF3A 45%, #13831D); border: 7px solid #0D5E14;
    display: grid; place-content: center; font-weight: 700; font-size: 104px; color: #fff; -webkit-text-stroke: 5px #0D5E14; paint-order: stroke fill;
    animation: flash 0.42s ease-in-out infinite alternate; }
  @keyframes flash { from { transform: scale(1); box-shadow: 0 0 0 0 #FFF59D00; } to { transform: scale(1.09); box-shadow: 0 0 40px 18px #FFF59DCC; } }

  .touch { position: fixed; z-index: 50; width: 76px; height: 76px; border-radius: 50%; pointer-events: none; opacity: 0;
    background: rgba(60, 60, 67, 0.32); border: 3px solid rgba(255, 255, 255, 0.85); box-shadow: 0 2px 10px #0003; }

  #doctrine { position: fixed; z-index: 5; top: 822px; white-space: pre; font-family: 'Lexend', sans-serif; font-weight: 600; font-size: 64px; letter-spacing: -0.01em; color: #1D1D1F; }
  #doctrine .caret { display: inline-block; width: 5px; height: 72px; margin-left: 6px; vertical-align: -12px; background: #1D1D1F; border-radius: 2px; animation: blink 1.05s steps(1) infinite; }
  #doctrine.typing .caret { animation: none; }
`;

const place = (id, x, y, w, h, inner) => `<div class="fl" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${inner}</div>`;

export const WALL = `<div id="slop-wall"><div class="valance"></div><div class="curtain l"></div><div class="curtain r"></div><div class="floor"></div><div class="ball"></div>
  ${[[300, 190], [520, 300], [1380, 330], [1600, 190], [430, 560], [1500, 600], [860, 230], [1150, 640]].map(([x, y], k) => `<div class="s" style="left:${x}px;top:${y}px;animation-delay:${-k * 0.37}s">${STAR}</div>`).join('')}</div>`;

export const HTML = `<div id="slop">
  ${place('banner', 560, 34, 800, 150, '<i class="rope" style="left:110px"></i><i class="rope" style="right:110px"></i><div class="board">Bead Counting Fun!</div>')}
  ${place('points', 36, 36, 360, 130, `<div class="panel"></div><div class="row">${STAR}POINTS<b>0</b></div><div class="bar"><i></i></div>`)}
  ${place('timer', 1524, 36, 360, 130, `<div class="panel">${BOLTS}</div><div class="t">${CLOCK}<span>0<span class="colon">:</span><span class="sec">30</span></span></div>`)}
  ${place('badge', 1390, 196, 230, 230, `<div class="in">${BURST}<span>Great<br>Job!</span></div>`)}
  ${place('level', 1716, 300, 160, 430, `<div class="panel">${BOLTS}</div><div class="h">Level</div><div class="b on" style="top:76px">1</div><div class="b" style="top:190px">2</div><div class="b" style="top:304px">3</div>`)}
  ${place('card', 64, 214, 250, 250, `<div class="panel">${BOLTS}</div><div class="q">?</div>`)}
  ${place('hint', 84, 494, 210, 80, `<div class="in">${BULB}Hint</div>`)}
  ${place('bubble', 250, 600, 600, 170, '<div class="in">Hi friend! Slide the beads to make 10! Then press GO!</div><i class="tail"></i>')}
  ${place('owl', 36, 708, 240, 330, `<div class="in">${OWL}</div>`)}
  ${place('directions', 560, 790, 800, 162, '<div class="in"><u>Directions:</u> Use the rekenrek to show the number on the card. Click CHECK when you are done!<span class="check">CHECK</span></div>')}
  ${place('score', 690, 978, 540, 84, '<div class="panel"></div><div class="in"><span>Correct 0</span><span>Wrong 0</span><span>Score 0%</span></div>')}
  ${place('go', 1560, 748, 290, 266, '<div class="base"></div><div class="btn">GO</div>')}
</div>`;

// Flicks and untyping. Every motion is a Web Animation, so it runs on the capture's clock.
export const RUNTIME = `
window.__slop = {
  // press, flick, let go: the piece leaves at the finger's speed and slides off the screen
  fling(id, dx, dy, spin, heavy, gx, gy) {
    const el = document.getElementById(id), r = el.getBoundingClientRect(), n = Math.hypot(dx, dy);
    dx /= n; dy /= n;
    const press = heavy ? 110 : 90, drag = heavy ? 70 : 50, fly = heavy ? 820 : 620, pull = heavy ? 150 : 120, L = 2700, D = press + drag + fly;
    const at = (d, rot, s) => 'translate(' + (dx * d).toFixed(1) + 'px, ' + (dy * d).toFixed(1) + 'px) rotate(' + rot + 'deg) scale(' + s + ')';
    el.animate([
      { transform: at(0, 0, 1), offset: 0, easing: 'ease-out' },
      { transform: at(0, 0, heavy ? 1 : 1.035), offset: press / D, easing: 'ease-in' },
      { transform: at(pull, spin * 0.06, heavy ? 1 : 1.035), offset: (press + drag) / D, easing: 'cubic-bezier(0.25, 0.55, 0.55, 1)' },
      { transform: at(L, spin, heavy ? 1 : 1.035), offset: 1 },
    ], { duration: D, fill: 'forwards' });
    const x = gx ?? r.left + r.width / 2, y = gy ?? r.top + r.height / 2, T = press + drag + 170;
    const dot = document.createElement('div');
    dot.className = 'touch'; dot.style.left = x + 'px'; dot.style.top = y + 'px';
    document.body.appendChild(dot);
    const f = (d, s) => 'translate(calc(-50% + ' + (dx * d).toFixed(1) + 'px), calc(-50% + ' + (dy * d).toFixed(1) + 'px)) scale(' + s + ')';
    dot.animate([
      { transform: f(0, 0.6), opacity: 0, offset: 0 },
      { transform: f(0, 1), opacity: 1, offset: press / T, easing: 'ease-in' },
      { transform: f(pull, 1), opacity: 1, offset: (press + drag) / T, easing: 'ease-out' },
      { transform: f(pull + 70, 0.75), opacity: 0, offset: 1 },
    ], { duration: T, fill: 'forwards' });
  },
  // the doctrine, set left-aligned at its centred width so the line holds still as it untypes
  say(text) {
    const d = document.createElement('div');
    d.id = 'doctrine';
    d.innerHTML = [...text].map(c => '<span class="ch">' + c + '</span>').join('') + '<i class="caret"></i>';
    document.body.appendChild(d);
    const w = d.getBoundingClientRect().width;
    d.style.left = (innerWidth / 2 - w / 2) + 'px';
    return w;
  },
  untype() {
    const d = document.getElementById('doctrine'), all = d.querySelectorAll('.ch:not(.gone)'), c = all[all.length - 1];
    d.classList.add('typing');
    if (!c) return 0;
    c.classList.add('gone');
    c.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(3px)' }], { duration: 70, fill: 'forwards' }).onfinish = () => c.remove();
    return all.length - 1;
  },
  tick(s) { document.querySelector('#timer .sec').textContent = s; },
  rest() { document.getElementById('doctrine').classList.remove('typing'); },
  clear() { ['slop', 'slop-wall', 'doctrine'].forEach(id => document.getElementById(id)?.remove()); document.querySelectorAll('.touch').forEach(t => t.remove()); },
};
`;
