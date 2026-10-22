'use strict';
/* ===== Thế giới: ô lưới, camera, di chuyển, NPC. Đồ hoạ vẽ vector ở độ phân giải thật của màn hình (sắc nét, có chi tiết) ===== */
const cv = $('#cv'), ctx = cv.getContext('2d'), cv2 = $('#cv2'), c2 = cv2.getContext('2d');
let SC = 4; // số pixel thật trên 1 đơn vị logic (240×160)
const DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
const OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };
const Wd = { map: null, npcs: [], face: 'd', mv: 0, dx: 0, dy: 0, step: 0, banner: 0, mode: 'title', grassCd: 0, lastEnc: 0 };
const Fx = { fade: 0 };
const _tiles = new Map();
function resizeCanvas() {
  const w = $('#screen').clientWidth || 720, dpr = Math.min(window.devicePixelRatio || 1, 3);
  const pw = Math.max(480, Math.round(w * dpr / 2) * 2);
  if (cv.width !== pw) { cv.width = cv2.width = pw; cv.height = cv2.height = Math.round(pw * 2 / 3); SC = pw / W; _tiles.clear(); }
  ctx.imageSmoothingEnabled = true; c2.imageSmoothingEnabled = true;
}
const clear2 = () => { c2.save(); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, cv2.width, cv2.height); c2.restore(); };
const logicalT = () => { ctx.setTransform(SC, 0, 0, SC, 0, 0); c2.setTransform(SC, 0, 0, SC, 0, 0); };

function loadMap(id, x, y, dir) {
  const m = MAPS[id]; Wd.map = m; S.map = id; S.x = x; S.y = y; S.dir = dir || 'd'; Wd.face = S.dir; Wd.mv = 0;
  const taken = S.taken[id] || {};
  Wd.npcs = m.npcs.filter(n => !(n.kind === 'item' && taken[n.id])).map(n => Object.assign({}, n));
  Wd.banner = 110; Wd.bannerText = m.name; Wd.grassCd = 3;
  if (S.cur !== m.isl) S.cur = m.isl;
}
const tileAt = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? '#' : m.rows[y][x];
const npcAt = (x, y) => Wd.npcs.find(n => n.x === x && n.y === y);
const canWalk = (x, y) => !SOLID.has(tileAt(Wd.map, x, y)) && !npcAt(x, y);

/* ---- vẽ tile (toạ độ 0..16, vector) ---- */
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const ell = (g, x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); };
const lin = (g, y0, y1, c0, c1, x0 = 0, x1 = 0) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
function paintTile(g, ch, p, fr, path, v, room) {
  const R = mulberry(v * 977 + ch.charCodeAt(0) * 31 + 5);
  const F = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const grass = (base) => {
    g.fillStyle = base; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 3; i++) { g.fillStyle = R() < .5 ? 'rgba(0,0,0,.045)' : 'rgba(255,255,255,.05)'; ell(g, R() * 16, R() * 16, 3 + R() * 3, 2 + R() * 2, R() * 3); g.fill(); }
    g.strokeStyle = shade(base, .78); g.lineWidth = .45; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const x = R() * 15 + .5, y = R() * 14 + 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - .7, y - 1.7); g.moveTo(x, y); g.lineTo(x + .8, y - 1.5); g.stroke(); }
    g.fillStyle = shade(base, 1.18); for (let i = 0; i < 5; i++) { ell(g, R() * 16, R() * 16, .6, .35); g.fill(); }
  };
  const sand = () => {
    g.fillStyle = p.path; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 9; i++) { g.fillStyle = R() < .5 ? shade(p.path, .86) : shade(p.path, 1.14); ell(g, R() * 16, R() * 16, .5 + R() * .9, .35 + R() * .4, R()); g.fill(); }
  };
  const ground = () => (path ? sand() : grass(p.g1));
  const wall = () => {
    g.fillStyle = lin(g, 0, 16, shade(p.wall, 1.06), shade(p.wall, .92)); g.fillRect(0, 0, 16, 16);
    g.fillStyle = lin(g, 0, 4, 'rgba(0,0,0,.28)', 'rgba(0,0,0,0)'); g.fillRect(0, 0, 16, 4);
    F(shade(p.wall, .72), 0, 13, 16, 3); g.strokeStyle = shade(p.wall, .55); g.lineWidth = .35;
    for (let x = 0; x < 16; x += 4) { g.beginPath(); g.moveTo(x + (x % 8 ? 2 : 0), 13); g.lineTo(x + (x % 8 ? 2 : 0), 16); g.stroke(); }
    g.beginPath(); g.moveTo(0, 14.5); g.lineTo(16, 14.5); g.stroke();
  };
  const door = () => {
    g.fillStyle = '#5a3a28'; rr(g, 3.6, 2.6, 8.8, 13.6, 3); g.fill();
    g.fillStyle = lin(g, 3, 16, '#a87650', '#7a5232'); rr(g, 4.4, 3.4, 7.2, 12.8, 2.4); g.fill();
    g.strokeStyle = '#5a3a28'; g.lineWidth = .4; rr(g, 5.4, 5, 2.4, 4.4, .6); g.stroke(); rr(g, 8.2, 5, 2.4, 4.4, .6); g.stroke(); rr(g, 5.4, 10.2, 2.4, 4.4, .6); g.stroke(); rr(g, 8.2, 10.2, 2.4, 4.4, .6); g.stroke();
    g.fillStyle = '#ffd54f'; ell(g, 10.6, 10.2, .55, .55); g.fill();
    F('#cfc7b8', 3, 15.2, 10, .8);
  };
  switch (ch) {
    case '.': case 'U': case 'V': case ',':
      if (room) { floor(g, p, v, R); if (ch === 'V') { F('#6b4a34', 2.5, 6, 11, 8); F('#8b6444', 3, 6.6, 10, 7); g.strokeStyle = '#5a3a28'; g.lineWidth = .4; for (let y = 8; y < 13; y += 2) { g.beginPath(); g.moveTo(3, y); g.lineTo(13, y); g.stroke(); } } } else ground(); break;
    case 'r': floor(g, p, v, R); g.fillStyle = shade(p.roof, .85); g.fillRect(0, 1, 16, 14); g.fillStyle = 'rgba(255,233,168,.9)'; g.fillRect(0, 1, 16, .7); g.fillRect(0, 14.3, 16, .7); g.fillStyle = 'rgba(255,233,168,.45)'; for (let x = 2; x < 16; x += 4) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 1.2, 8); g.lineTo(x, 12); g.lineTo(x - 1.2, 8); g.fill(); } break;
    case '#':
      if (room) {
        g.fillStyle = lin(g, 0, 16, shade(p.wall, 1.02), shade(p.wall, .86)); g.fillRect(0, 0, 16, 16);
        g.strokeStyle = shade(p.wall, .78); g.lineWidth = .45; for (let x = 2; x < 16; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 11); g.stroke(); }
        g.fillStyle = lin(g, 11, 16, '#8d6a48', '#6a4a30'); g.fillRect(0, 11, 16, 5); F('#a88058', 0, 11, 16, .8); F('rgba(0,0,0,.18)', 0, 0, 16, 1.2);
      } else { grass(p.g1); F('rgba(0,0,0,.18)', 0, 0, 0, 0); g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, 8, 14.6, 6.6, 2.1); g.fill();
        g.fillStyle = lin(g, 9, 15, '#8a5e3f', '#5d3b26', 7, 10); rr(g, 6.6, 9, 2.8, 6, .7); g.fill();
        const can = (cx, cy, r, c) => { const gr = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r); gr.addColorStop(0, shade(c, 1.35)); gr.addColorStop(.6, c); gr.addColorStop(1, shade(c, .68)); g.fillStyle = gr; ell(g, cx, cy, r, r * .95); g.fill(); };
        can(5.2, 7.6, 4.6, shade(p.tree, .9)); can(10.8, 7.4, 4.8, shade(p.tree, .95)); can(8, 4.6, 5.2, p.tree);
        g.fillStyle = shade(p.tree, 1.45); for (let i = 0; i < 6; i++) { ell(g, 3.5 + R() * 9, 2 + R() * 8, .5, .3, R() * 3); g.fill(); }
        if (v === 2) { g.fillStyle = '#e53935'; for (let i = 0; i < 3; i++) { ell(g, 4 + R() * 8, 4 + R() * 6, .7, .7); g.fill(); } } }
      break;
    case 'R': {
      g.fillStyle = shade(p.roof, .82); g.fillRect(0, 0, 16, 16);
      for (let r2 = 0; r2 < 4; r2++) for (let x = -2 + (r2 % 2) * 2; x < 18; x += 4) { g.fillStyle = (r2 + (x >> 2)) & 1 ? p.roof : shade(p.roof, 1.1); g.beginPath(); g.arc(x + 2, r2 * 4 + 1.4, 2.5, 0, Math.PI); g.lineTo(x - .5, r2 * 4 + 1.4); g.fill(); g.strokeStyle = shade(p.roof, .6); g.lineWidth = .35; g.beginPath(); g.arc(x + 2, r2 * 4 + 1.4, 2.5, 0, Math.PI); g.stroke(); }
      F('rgba(255,255,255,.22)', 0, 0, 16, 1); F('rgba(0,0,0,.2)', 0, 15, 16, 1); break; }
    case 'W': wall(); g.fillStyle = shade(p.roof, .9); rr(g, 1.2, 3.8, 2.3, 6.4, .5); g.fill(); rr(g, 12.5, 3.8, 2.3, 6.4, .5); g.fill();
      g.fillStyle = '#5a3a28'; rr(g, 3.6, 3.4, 8.8, 7.4, .8); g.fill(); g.fillStyle = lin(g, 4, 10.4, '#cfeaf8', '#7fb2d4'); g.fillRect(4.3, 4.1, 7.4, 6); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(4.3, 4.1); g.lineTo(8, 4.1); g.lineTo(4.3, 8.4); g.fill();
      g.fillStyle = '#5a3a28'; g.fillRect(7.7, 4.1, .6, 6); g.fillRect(4.3, 7, 7.4, .6); F('#d8cdb8', 3.2, 10.8, 9.6, 1); break;
    case '1': case '2': case '3': wall(); door();
      g.fillStyle = '#fff'; g.strokeStyle = '#5a3a28'; g.lineWidth = .5; rr(g, 5.2, .6, 5.6, 2.4, .6); g.fill(); g.stroke();
      if (ch === '1') { F('#e53935', 7.6, .9, .8, 1.8); F('#e53935', 7.1, 1.4, 1.8, .8); } else if (ch === '2') { g.fillStyle = '#1e88e5'; ell(g, 8, 1.8, .9, .9); g.fill(); F('#ffd54f', 7.7, 1.5, .6, .6); } else { g.fillStyle = '#d8553f'; g.beginPath(); g.moveTo(6.2, 2.3); g.lineTo(8, .9); g.lineTo(9.8, 2.3); g.fill(); }
      break;
    case 'G': ground(); g.fillStyle = '#4a3b7a'; rr(g, 2, 0, 12, 16, 1); g.fill(); g.fillStyle = lin(g, 1, 16, '#7a68b8', '#4a3b7a'); rr(g, 3.2, 1.2, 9.6, 14.8, 4.5); g.fill();
      g.fillStyle = '#ffd54f'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i & 1 ? 1.2 : 2.7; g.lineTo(8 + Math.cos(a) * rad, 7 + Math.sin(a) * rad); } g.fill(); F('#2a1f4a', 7.6, 11, .8, 5); break;
    case '~': { g.fillStyle = lin(g, 0, 16, shade(p.water[1], 1.1), shade(p.water[0], .85)); g.fillRect(0, 0, 16, 16);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = .5; g.lineCap = 'round'; for (let r2 = 0; r2 < 3; r2++) { g.beginPath(); for (let x = 0; x <= 16; x += 1) { const y = 3 + r2 * 5 + Math.sin((x + fr * 4 + r2 * 3) * .6) * .9; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 3; i++) { ell(g, (R() * 16 + fr * 3) % 16, R() * 16, .5, .3); g.fill(); } break; }
    case 'g': { g.fillStyle = shade(p.g2, .88); g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 20; i++) { const x = R() * 16, y = 3 + R() * 13, h = 3 + R() * 3, lean = (R() - .5) * 2.4; g.strokeStyle = [shade(p.g2, .55), shade(p.g2, .75), shade(p.g1, 1.12)][i % 3]; g.lineWidth = .55; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * .4, y - h * .6, x + lean, y - h); g.stroke(); } break; }
    case 'f': ground(); for (let i = 0; i < 6; i++) { const x = 1.5 + R() * 13, y = 2 + R() * 12, c = ['#fff', '#f48fb1', '#ffd54f', '#b39ddb'][i & 3]; g.strokeStyle = '#3c8a3c'; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 2); g.stroke(); g.fillStyle = c; for (let a = 0; a < 5; a++) { ell(g, x + Math.cos(a * 1.257) * .8, y + Math.sin(a * 1.257) * .8, .55, .55); g.fill(); } g.fillStyle = '#ffb300'; ell(g, x, y, .4, .4); g.fill(); } break;
    case 'K': floor(g, p, v, R); g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, 0, 9, 16, 7, 0); g.fill(); g.fillStyle = lin(g, 4, 16, '#a67c52', '#6d4a30'); rr(g, 0, 5, 16, 11, 1); g.fill(); F('#d2a672', 0, 4, 16, 3); F('rgba(255,255,255,.35)', 0, 4, 16, .6); g.strokeStyle = '#5a3a28'; g.lineWidth = .4; rr(g, 1.5, 9, 13, 5.5, .6); g.stroke(); break;
    case 'L': g.fillStyle = '#3f2a1c'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#5d4030'; g.fillRect(.8, .8, 14.4, 14.4);
      for (let r2 = 0; r2 < 3; r2++) { const y = .8 + r2 * 4.8; g.fillStyle = '#2a1c12'; g.fillRect(.8, y + 4, 14.4, .8); let x = 1.4; while (x < 14) { const w = .9 + R() * 1.1, h = 2.2 + R() * 1.4; g.fillStyle = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#eceff1'][Math.floor(R() * 7)]; g.fillRect(x, y + 4 - h, w, h); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x, y + 4 - h, .25, h); x += w + .15; } } break;
    case 'T': floor(g, p, v, R); g.fillStyle = 'rgba(0,0,0,.22)'; ell(g, 8, 13.4, 7, 2); g.fill(); g.fillStyle = '#6d4a30'; g.fillRect(7.2, 8, 1.6, 5.5); g.fillStyle = lin(g, 3, 10, '#fff5e6', '#e2cfae'); ell(g, 8, 7, 7.2, 4); g.fill(); g.strokeStyle = shade(p.roof, .9); g.lineWidth = .6; ell(g, 8, 7, 6, 3.2); g.stroke(); g.fillStyle = '#fff'; ell(g, 6, 6.4, 1.2, .8); g.fill(); g.fillStyle = '#8d5a3a'; ell(g, 6, 6.2, .8, .5); g.fill(); break;
    case 'P': floor(g, p, v, R); g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, 8, 14.5, 4.5, 1.4); g.fill(); g.fillStyle = lin(g, 9, 15, '#d8704a', '#a0472c'); g.beginPath(); g.moveTo(4.5, 9); g.lineTo(11.5, 9); g.lineTo(10.4, 15); g.lineTo(5.6, 15); g.fill(); F('#e88a62', 4.2, 8.4, 7.6, 1.2);
      for (let i = 0; i < 7; i++) { const a = -2.6 + i * .75; g.fillStyle = ['#2e9e4a', '#3fb55a', '#278a3e'][i % 3]; ell(g, 8 + Math.cos(a) * 3.2, 6 + Math.sin(a) * 3.4, 1.1, 2.6, a + 1.57); g.fill(); } break;
    case 'E': floor(g, p, v, R); g.fillStyle = '#6d4a30'; rr(g, .6, 1, 14.8, 14.4, 1.4); g.fill(); g.fillStyle = '#fff'; rr(g, 1.6, 2, 12.8, 5, 1.6); g.fill(); g.strokeStyle = '#d8d8e0'; g.lineWidth = .3; rr(g, 3, 2.8, 9.6, 3.4, 1.2); g.stroke(); g.fillStyle = lin(g, 7, 15, shade(p.roof, 1.1), shade(p.roof, .8)); rr(g, 1.6, 7, 12.8, 7.8, 1); g.fill(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .4; g.beginPath(); g.moveTo(1.6, 8.8); g.lineTo(14.4, 8.8); g.stroke(); break;
    case 's': { g.fillStyle = '#f0dca6'; g.fillRect(0, 0, 16, 16); g.strokeStyle = 'rgba(190,150,80,.45)'; g.lineWidth = .4; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const y = 3 + i * 5 + R() * 2, x = R() * 6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y - 1.2, x + 6, y); g.quadraticCurveTo(x + 9, y + 1.2, x + 12, y); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 4; i++) { ell(g, R() * 16, R() * 16, .5, .3, R() * 3); g.fill(); }
      if (R() < .35) { g.fillStyle = '#f6b8c0'; ell(g, 3 + R() * 10, 3 + R() * 10, .9, .6, R()); g.fill(); } break; }
    case 'b': { g.fillStyle = lin(g, 0, 16, shade(p.water[1], 1.1), shade(p.water[0], .85)); g.fillRect(0, 0, 16, 16);
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(2, 1, 12.6, 15); g.fillStyle = lin(g, 0, 16, '#b8875a', '#8d6340', 0, 16); g.fillRect(1.5, 0, 13, 16);
      g.strokeStyle = '#5a3a28'; g.lineWidth = .4; for (let y = 0; y <= 16; y += 4) { g.beginPath(); g.moveTo(1.5, y); g.lineTo(14.5, y); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = .3; for (let y = 1; y < 16; y += 4) { g.beginPath(); g.moveTo(2.5, y); g.lineTo(13.5, y); g.stroke(); }
      g.fillStyle = '#6a4a30'; g.fillRect(0, 0, 1.6, 16); g.fillRect(14.4, 0, 1.6, 16); g.fillStyle = '#8d6a48'; for (let y = 1; y < 16; y += 8) { g.fillRect(-.2, y, 2.2, 2.4); g.fillRect(14, y, 2.2, 2.4); } break; }
    case 'o': if (room) { floor(g, p, v, R); g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, 8, 14.6, 6, 1.8); g.fill(); g.fillStyle = lin(g, 0, 0, '#a9a39a', '#d9d3c8', 3, 13); g.fillRect(3.5, 2, 9, 12.5); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(10.8, 2, 1.7, 12.5); g.fillStyle = '#e6e0d4'; rr(g, 2.4, 0, 11.2, 3, .8); g.fill(); rr(g, 2.4, 13, 11.2, 3, .8); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = .3; for (const x of [6.2, 8.4]) { g.beginPath(); g.moveTo(x, 3); g.lineTo(x, 13); g.stroke(); } }
      else { grass(p.g1); g.fillStyle = 'rgba(0,0,0,.22)'; ell(g, 8, 13.4, 6.4, 2); g.fill();
        g.fillStyle = lin(g, 3, 14, '#9a9aa0', '#6e6e76'); g.beginPath(); g.moveTo(2, 13); g.quadraticCurveTo(1.5, 7, 6, 4.5); g.quadraticCurveTo(10, 2.5, 13, 6.5); g.quadraticCurveTo(15, 10, 14, 13); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)'; ell(g, 6, 6.6, 2.2, 1.1, -.5); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .35; g.beginPath(); g.moveTo(8, 6); g.lineTo(9.5, 10); g.moveTo(5, 9); g.lineTo(7, 12); g.stroke(); } break;
    case 'O': { g.fillStyle = '#f0dca6'; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, 8, 13.8, 6, 1.8); g.fill();
      g.fillStyle = lin(g, 3, 14, '#ff9aa8', '#e8708a'); g.beginPath(); g.moveTo(2, 13); g.quadraticCurveTo(1.5, 7, 6, 4.5); g.quadraticCurveTo(10, 2.5, 13, 6.5); g.quadraticCurveTo(15, 10, 14, 13); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; ell(g, 6, 6.6, 2.2, 1.1, -.5); g.fill(); g.strokeStyle = '#e8708a'; g.lineWidth = .8; g.lineCap = 'round'; for (const [x, a2] of [[5, -.3], [10.5, .3], [8, 0]]) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x + a2 * 4, 1.4); g.stroke(); } break; }
    case 'F': grass(p.g1);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 12.5, 16, 1.8); g.fillStyle = lin(g, 4, 14, '#c9976a', '#8d6340'); g.fillRect(0, 5.6, 16, 1.7); g.fillRect(0, 9.2, 16, 1.7);
      for (const x of [1.6, 7.4, 13.2]) { g.fillStyle = lin(g, 3, 14, '#d8a878', '#8d6340'); rr(g, x - .2, 3.2, 2.2, 10.8, .6); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x, 3.6, .4, 9.6); } break;
    case 'l': if (path) sand(); else grass(p.g1);
      g.fillStyle = 'rgba(0,0,0,.22)'; ell(g, 8, 14.6, 3, 1); g.fill(); g.fillStyle = '#4a4a56'; g.fillRect(7.4, 5, 1.2, 10); rr(g, 6, 13.4, 4, 1.8, .6); g.fill();
      { const gl = g.createRadialGradient(8, 4, 0, 8, 4, 6); gl.addColorStop(0, 'rgba(255,230,140,.75)'); gl.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gl; g.beginPath(); g.arc(8, 4, 6, 0, 7); g.fill(); }
      g.fillStyle = '#ffe28a'; rr(g, 5.8, 2, 4.4, 4, 1); g.fill(); g.strokeStyle = '#4a4a56'; g.lineWidth = .5; rr(g, 5.8, 2, 4.4, 4, 1); g.stroke(); g.fillStyle = '#4a4a56'; g.beginPath(); g.moveTo(5.2, 2.2); g.lineTo(8, .2); g.lineTo(10.8, 2.2); g.fill(); break;
    default: ground();
  }
}
function floor(g, p, v, R) {
  g.fillStyle = lin(g, 0, 16, '#d6aa72', '#c49560'); g.fillRect(0, 0, 16, 16);
  for (let y = 0; y < 16; y += 4) { g.fillStyle = (y / 4 + v) & 1 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.06)'; g.fillRect(0, y, 16, 4); g.fillStyle = 'rgba(80,50,25,.45)'; g.fillRect(0, y, 16, .35); }
  g.strokeStyle = 'rgba(100,65,35,.35)'; g.lineWidth = .3; for (let i = 0; i < 4; i++) { const y = R() * 16; g.beginPath(); g.moveTo(R() * 6, y); g.lineTo(6 + R() * 10, y + .3); g.stroke(); }
  for (let y = 0; y < 16; y += 4) { const x = ((y / 4 + v) * 5) % 16; g.fillStyle = 'rgba(80,50,25,.4)'; g.fillRect(x, y, .35, 4); }
}
function tileImg(isl, ch, fr, path, v, room) {
  const key = isl + ch + fr + (path ? 1 : 0) + v + (room ? 'r' : ''); if (_tiles.has(key)) return _tiles.get(key);
  const ts = Math.ceil(T * SC) + 1, c = document.createElement('canvas'); c.width = c.height = ts; const g = c.getContext('2d');
  g.scale(ts / 16, ts / 16); g.save(); g.beginPath(); g.rect(0, 0, 16, 16); g.clip();
  paintTile(g, ch, CH[isl].pal, fr, path, v, room); g.restore();
  _tiles.set(key, c); return c;
}

/* ---- nhân vật (vector chibi) ---- */
function drawPerson(g, X, Y, dir, step, look) { // X,Y: góc trên-trái ô, theo pixel thật; g ở hệ pixel thật
  const k = SC, skin = look.skin || '#f6d2ad', hair = look.hair, body = look.body, sc = look.scale || 1;
  g.save(); g.translate(X + 8 * k * (1 - sc), Y + 16 * k * (1 - sc)); g.scale(k * sc, k * sc);
  g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, 8, 15.4, 5.2, 1.6); g.fill();
  const sw = step ? 1 : 0;
  g.fillStyle = '#3b4a5e'; rr(g, 5.1, 11, 2.5, 4.3 - sw * .9, 1); g.fill(); rr(g, 8.4, 11, 2.5, 3.4 + sw * .9, 1); g.fill();
  g.fillStyle = '#2a2a33'; ell(g, 6.4, 15 - sw * .9, 1.7, .9); g.fill(); ell(g, 9.6, 14.2 + sw * .9, 1.7, .9); g.fill();
  if (look.acc === 'long' && dir !== 'd') { g.fillStyle = hair; rr(g, 3.2, 1.2, 9.6, 10.4, 3.6); g.fill(); }
  g.fillStyle = lin(g, 6, 12, shade(body, 1.18), shade(body, .82)); rr(g, 3.9, 6.2, 8.2, 6, 2); g.fill();
  if (look.suit && dir !== 'u') { g.fillStyle = '#f4f4f8'; g.beginPath(); g.moveTo(6.3, 6.3); g.lineTo(9.7, 6.3); g.lineTo(8, 10); g.fill(); g.fillStyle = '#c0334a'; g.beginPath(); g.moveTo(7.5, 6.8); g.lineTo(8.5, 6.8); g.lineTo(8.8, 9.6); g.lineTo(8, 10.2); g.lineTo(7.2, 9.6); g.fill(); }
  g.fillStyle = shade(body, .6); g.fillRect(3.9, 10.2, 8.2, .8); g.fillStyle = '#ffd54f'; g.fillRect(7.4, 10.1, 1.2, 1);
  g.fillStyle = shade(body, .95); if (dir === 'l' || dir === 'r') { rr(g, dir === 'l' ? 5.4 : 8.4, 7, 2.2, 3.8, 1); g.fill(); } else { rr(g, 2.5, 7, 1.9, 3.6, .9); g.fill(); rr(g, 11.6, 7, 1.9, 3.6, .9); g.fill(); g.fillStyle = skin; ell(g, 3.4, 10.9, .9, .9); g.fill(); ell(g, 12.6, 10.9, .9, .9); g.fill(); }
  // đầu
  const side = dir === 'l' || dir === 'r';
  g.save(); if (dir === 'r') { g.translate(16, 0); g.scale(-1, 1); }
  const hg = g.createRadialGradient(7, 2.4, .5, 8, 3.8, 4.6); hg.addColorStop(0, '#fff0de'); hg.addColorStop(1, skin);
  g.fillStyle = hg; ell(g, 8, 3.7, 4.3, 4); g.fill();
  if (!side) { g.fillStyle = skin; ell(g, 3.8, 4.2, .8, 1); g.fill(); ell(g, 12.2, 4.2, .8, 1); g.fill(); }
  g.fillStyle = hair;
  if (dir === 'u') { ell(g, 8, 3.6, 4.5, 4.2); g.fill(); g.fillStyle = shade(hair, 1.3); ell(g, 6.5, 1.8, 1.4, .8, -.5); g.fill(); }
  else if (dir === 'd') { g.beginPath(); g.moveTo(3.5, 4.2); g.quadraticCurveTo(3.2, -.6, 8, -.5); g.quadraticCurveTo(12.8, -.6, 12.5, 4.2); g.quadraticCurveTo(11.6, 1.6, 9.6, 1.9); g.quadraticCurveTo(8, 1, 6.2, 1.9); g.quadraticCurveTo(4.4, 1.6, 3.5, 4.2); g.fill(); g.fillStyle = shade(hair, 1.3); ell(g, 6.2, .5, 1.3, .6, -.4); g.fill(); }
  else { // quay sang trái (bên phải được lật gương): tóc phủ đỉnh đầu + sau gáy, chừa mặt
    g.fillStyle = skin; ell(g, 10.6, 4.5, .9, 1.1); g.fill(); g.fillStyle = hair;
    g.beginPath(); g.moveTo(12.3, 6.4); g.quadraticCurveTo(13, -.2, 8, -.6); g.quadraticCurveTo(3.6, -.4, 3.8, 2.6); g.quadraticCurveTo(5.4, 1.5, 7, 2); g.quadraticCurveTo(9.4, 2.2, 10.2, 4); g.lineTo(10.2, 6.6); g.closePath(); g.fill();
    g.fillStyle = shade(hair, 1.3); ell(g, 6.4, .5, 1.3, .6, -.3); g.fill();
    g.fillStyle = '#1d2433'; ell(g, 5.6, 4.4, .75, 1.05); g.fill(); g.fillStyle = '#fff'; ell(g, 5.4, 4, .28, .28); g.fill();
    g.fillStyle = 'rgba(255,120,140,.4)'; ell(g, 6.2, 5.6, .8, .5); g.fill();
    g.strokeStyle = '#8a4a3a'; g.lineWidth = .3; g.beginPath(); g.arc(4.9, 5.9, .6, .3, Math.PI - .6); g.stroke();
  }
  if (dir === 'd') { for (const sx of [-1, 1]) { g.fillStyle = '#1d2433'; ell(g, 8 + sx * 1.7, 4.3, .75, 1.05); g.fill(); g.fillStyle = '#fff'; ell(g, 8 + sx * 1.7 - .2, 3.9, .28, .28); g.fill(); g.fillStyle = 'rgba(255,120,140,.4)'; ell(g, 8 + sx * 2.9, 5.5, .8, .5); g.fill(); }
    g.strokeStyle = '#8a4a3a'; g.lineWidth = .3; g.beginPath(); g.arc(8, 5.7, .9, .2, Math.PI - .2); g.stroke(); }
  if (look.acc === 'long' && dir === 'd') { g.fillStyle = hair; rr(g, 3, 2.4, 1.9, 8.4, .95); g.fill(); rr(g, 11.1, 2.4, 1.9, 8.4, .95); g.fill(); }
  if (look.acc === 'fringe' && dir === 'd') { g.fillStyle = hair; g.beginPath(); g.moveTo(7.6, .6); g.quadraticCurveTo(12.4, 1, 11.6, 5.8); g.quadraticCurveTo(10.6, 4.4, 9.4, 4.8); g.quadraticCurveTo(8.2, 3.2, 7.6, .6); g.fill(); }
  if (look.acc === 'deer') {
    g.strokeStyle = '#8a5a34'; g.lineWidth = .7; g.lineCap = 'round';
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(8 + sx * 2.4, 0); g.quadraticCurveTo(8 + sx * 4.6, -2.2, 8 + sx * 4, -4.4); g.moveTo(8 + sx * 3.9, -1.6); g.lineTo(8 + sx * 6, -2.4); g.stroke(); }
    g.fillStyle = skin; ell(g, 3.2, 1.8, 1.2, 1.7, -.5); g.fill(); ell(g, 12.8, 1.8, 1.2, 1.7, .5); g.fill();
    g.fillStyle = '#ff7fa5'; g.beginPath(); g.moveTo(3.8, 2.4); g.quadraticCurveTo(8, -3.4, 12.2, 2.4); g.lineTo(3.8, 2.4); g.fill(); g.fillStyle = '#fff'; g.fillRect(7.5, -1.3, 1, 2.6); g.fillRect(6.7, -.5, 2.6, 1);
    if (dir === 'd') { g.fillStyle = '#d84a4a'; ell(g, 8, 5.6, .7, .55); g.fill(); }
  }
  if (look.acc === 'cap') { g.fillStyle = '#e84a5f'; g.beginPath(); g.moveTo(3.4, 2.6); g.quadraticCurveTo(8, -3.4, 12.6, 2.6); g.lineTo(3.4, 2.6); g.fill(); g.fillStyle = '#c0334a'; if (dir === 'd') { rr(g, 4.2, 1.9, 7.6, 1.2, .5); g.fill(); } else if (side) { rr(g, 1.4, 1.9, 5.4, 1.2, .5); g.fill(); } g.fillStyle = '#fff'; ell(g, 8, .2, .9, .9); g.fill(); }
  else if (look.acc === 'crown' || look.boss) { g.fillStyle = '#ffd54f'; g.beginPath(); g.moveTo(4.6, 1); g.lineTo(5.4, -1.8); g.lineTo(6.8, .2); g.lineTo(8, -2.2); g.lineTo(9.2, .2); g.lineTo(10.6, -1.8); g.lineTo(11.4, 1); g.fill(); }
  g.restore();
  g.restore();
}
/* 3 nguyên mẫu nhân vật (thiết kế gốc) */
const HEROES = [
  { id: 'cook', name: 'Hayato', role: 'Đầu bếp', desc: 'Tóc vàng, mái che một bên mắt, vest đen và cà vạt. Lịch lãm, nấu ăn giỏi.', look: { hair: '#f3d36a', body: '#252b3d', acc: 'fringe', suit: 1 } },
  { id: 'scholar', name: 'Rika', role: 'Nhà khảo cổ', desc: 'Tóc đen dài, áo tím thanh lịch. Điềm tĩnh, mê đọc chữ cổ và tìm kho báu.', look: { hair: '#1b1b26', body: '#7a4fb0', acc: 'long' } },
  { id: 'doctor', name: 'Momo', role: 'Bác sĩ nhí', desc: 'Chú tuần lộc nhỏ đội mũ hồng có dấu thập, luôn muốn chữa lành cho mọi Tideling.', look: { hair: '#7b4a2a', body: '#d85f8a', skin: '#c89560', acc: 'deer', scale: .84 } }
];
const playerLook = () => HEROES[(S && S.hero) || 0].look;
const _heroImg = {};
function heroCanvas(i) {
  if (_heroImg[i]) return _heroImg[i];
  const c = document.createElement('canvas'); c.width = 128; c.height = 150; const g = c.getContext('2d'), old = SC; SC = 7; drawPerson(g, 8, 24, 'd', 0, HEROES[i].look); SC = old; return (_heroImg[i] = c);
}
function drawItem(g, X, Y, t) {
  const k = SC, b = Math.sin(t / 10) * .8; g.save(); g.translate(X, Y); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,.22)'; ell(g, 8, 14, 4, 1.3); g.fill();
  const gr = g.createRadialGradient(8, 8 + b, 0, 8, 8 + b, 6); gr.addColorStop(0, 'rgba(255,240,150,.9)'); gr.addColorStop(1, 'rgba(255,240,150,0)'); g.fillStyle = gr; g.beginPath(); g.arc(8, 8 + b, 6, 0, 7); g.fill();
  const og = g.createRadialGradient(7, 7 + b, .5, 8, 8.5 + b, 4); og.addColorStop(0, '#fffbe0'); og.addColorStop(.5, '#ffd54f'); og.addColorStop(1, '#e08a00'); g.fillStyle = og; ell(g, 8, 8.5 + b, 3.6, 3.6); g.fill();
  g.fillStyle = '#43a047'; ell(g, 9.6, 4.8 + b, 1.6, .8, -.5); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = .35; const s2 = (Math.sin(t / 7) + 1) * .8; g.beginPath(); g.moveTo(12, 3 + b - s2); g.lineTo(12, 3 + b + s2); g.moveTo(11.2, 3 + b); g.lineTo(12.8, 3 + b); g.stroke();
  g.restore();
}
function drawAlert(g, X, Y) { const k = SC; g.save(); g.translate(X, Y); g.scale(k, k); g.fillStyle = '#fff'; g.strokeStyle = '#1d2433'; g.lineWidth = .5; rr(g, 4.4, -9.5, 7.2, 8, 1.6); g.fill(); g.stroke(); g.beginPath(); g.moveTo(7, -1.6); g.lineTo(8, .2); g.lineTo(9, -1.6); g.fill(); g.fillStyle = '#e53935'; g.fillRect(7.5, -8.3, 1, 3.8); g.fillRect(7.5, -3.8, 1, 1); g.restore(); }

function renderWorld() {
  const m = Wd.map; if (!m) return;
  const k = SC, room = m.style === 'room';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const rx = S.x * T + (Wd.mv ? Wd.dx * (8 - Wd.mv) * 2 : 0), ry = S.y * T + (Wd.mv ? Wd.dy * (8 - Wd.mv) * 2 : 0);
  let cx = rx + 8 - W / 2, cy = ry + 8 - H / 2;
  cx = m.w * T <= W ? -(W - m.w * T) / 2 : clamp(cx, 0, m.w * T - W);
  cy = m.h * T <= H ? -(H - m.h * T) / 2 : clamp(cy, 0, m.h * T - H);
  cx = Math.round(cx * k) / k; cy = Math.round(cy * k) / k;
  ctx.fillStyle = room ? '#1a1420' : '#10202e'; ctx.fillRect(0, 0, cv.width, cv.height);
  const fr = (FRAME >> 5) & 1, ts = Math.ceil(T * k) + 1;
  const x0 = Math.max(0, Math.floor(cx / T)), x1 = Math.min(m.w - 1, Math.floor((cx + W) / T));
  const y0 = Math.max(0, Math.floor(cy / T)), y1 = Math.min(m.h - 1, Math.floor((cy + H) / T));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ch = m.rows[y][x], isPath = m.path.has(x + ',' + y), v = (x * 7 + y * 13) & 3;
    ctx.drawImage(tileImg(m.isl, ch, fr, isPath && !room && (ch === '.' || ch === 'G' || ch === 'U' || ch === 'V'), room ? (x + y) & 1 : v, room), Math.round((x * T - cx) * k), Math.round((y * T - cy) * k));
  }
  const ents = Wd.npcs.map(n => ({ y: n.y * T, n })).concat([{ y: ry, p: 1 }]).sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.p) { drawPerson(ctx, (rx - cx) * k, (ry - cy - 2) * k, Wd.face, Wd.mv ? (Wd.mv >> 1) & 1 : 0, playerLook()); continue; }
    const n = e.n, X = ((n.ox || 0) + n.x * T - cx) * k, Y = ((n.oy || 0) + n.y * T - cy) * k;
    if (n.kind === 'item') drawItem(ctx, X, Y, FRAME);
    else drawPerson(ctx, X, Y - 2 * k, n.dir, n.walk ? (FRAME >> 3) & 1 : 0, n.look);
    if (n.alert) drawAlert(ctx, X, Y - 2 * k);
  }
  if (tileAt(m, S.x, S.y) === 'g' && !Wd.mv) { const im = tileImg(m.isl, 'g', fr, false, (S.x * 7 + S.y * 13) & 3, false); ctx.drawImage(im, 0, ts / 2, ts, ts / 2, Math.round((rx - cx) * k), Math.round((ry - cy + 8) * k), ts, ts / 2); }
  if (!room) { // ánh sáng nhẹ
    const gr = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * .35, cv.width / 2, cv.height / 2, cv.height * .95); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(1, 'rgba(10,30,60,.22)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, cv.width, cv.height);
  }
  logicalT();
}

/* ---- cập nhật mỗi frame ---- */
function worldUpdate() {
  if (busy()) { script.step(); return; }
  if (!$('#dlg').hidden || !$('#bmenu').hidden) { $('#dlg').hidden = true; $('#bmenu').hidden = true; }
  if (Wd.mv > 0) {
    Wd.mv--;
    if (Wd.mv === 0) { S.x += Wd.dx; S.y += Wd.dy; S.steps++; onStep(); }
    return;
  }
  if (Inp.m) { Inp.m = 0; run(mainMenu); return; }
  if (Inp.a) { Inp.a = 0; interact(); return; }
  Inp.b = 0;
  for (const d of ['u', 'd', 'l', 'r']) {
    if (!Inp.held[d]) continue;
    Wd.face = d; S.dir = d;
    const [dx, dy] = DIRS[d];
    if (canWalk(S.x + dx, S.y + dy)) { Wd.dx = dx; Wd.dy = dy; Wd.mv = 8; }
    break;
  }
}
function interact() {
  const [dx, dy] = DIRS[Wd.face], tx = S.x + dx, ty = S.y + dy, c = tileAt(Wd.map, tx, ty);
  let n = npcAt(tx, ty);
  if (!n && c === 'K') n = npcAt(tx + dx, ty + dy); // nói chuyện qua quầy
  if (n) { n.dir = OPP[Wd.face]; run(() => talk(n)); }
  else if (c === 'L') run(() => bookshelf());
}
function onStep() {
  const m = Wd.map, ch = tileAt(m, S.x, S.y), key = S.x + ',' + S.y;
  if (m.warps[key]) { const w = m.warps[key]; run(() => warpTo(w.map, w.x, w.y, w.dir)); return; }
  // tầm nhìn của trainer
  for (const n of Wd.npcs) {
    if ((n.kind !== 'trainer' && n.kind !== 'boss') || S.defeated[n.id]) continue;
    const [dx, dy] = DIRS[n.dir];
    for (let k = 1; k <= (n.reach || 4); k++) {
      const x = n.x + dx * k, y = n.y + dy * k;
      if (SOLID.has(tileAt(m, x, y)) || npcAt(x, y) && !(x === S.x && y === S.y)) break;
      if (x === S.x && y === S.y) { run(() => trainerSpot(n, k)); return; }
    }
  }
  if (ch === 'g' && Wd.grassCd-- <= 0 && alive().length && S.flags.starter) {
    if (rand() < 0.16) { Wd.grassCd = 3; run(() => wildEncounter()); return; }
  }
  if (S.steps % 40 === 0) save();
}
