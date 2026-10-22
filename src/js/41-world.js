'use strict';
/* ===== Thế giới: ô lưới, camera, di chuyển, NPC, vẽ tile & nhân vật dạng pixel ===== */
const cv = $('#cv'), ctx = cv.getContext('2d'), cv2 = $('#cv2'), c2 = cv2.getContext('2d');
ctx.imageSmoothingEnabled = false;
const DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
const OPP = { u: 'd', d: 'u', l: 'r', r: 'l' };
const Wd = { map: null, npcs: [], face: 'd', mv: 0, dx: 0, dy: 0, step: 0, banner: 0, mode: 'title', grassCd: 0, lastEnc: 0 };
const Fx = { fade: 0 };

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

/* ---- tile ---- */
const _tiles = new Map();
function tileImg(isl, ch, fr, path) {
  const key = isl + ch + fr + (path ? 1 : 0); if (_tiles.has(key)) return _tiles.get(key);
  const c = document.createElement('canvas'); c.width = c.height = T; const g = c.getContext('2d'), p = CH[isl].pal;
  const R = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const ground = () => {
    if (path) { R(p.path, 0, 0, 16, 16); R(shade(p.path, .92), 2, 3, 2, 1); R(shade(p.path, .92), 10, 9, 3, 1); R(shade(p.path, 1.1), 6, 12, 2, 1); }
    else { R(p.g1, 0, 0, 16, 16); R(p.g2, 3, 4, 2, 1); R(p.g2, 11, 10, 2, 1); R(p.g2, 7, 13, 2, 1); R(shade(p.g1, 1.12), 12, 3, 1, 1); }
  };
  switch (ch) {
    case '#': ground(); R('#5d4037', 7, 11, 2, 4); g.fillStyle = shade(p.tree, .75); g.beginPath(); g.arc(8, 7, 7, 0, 7); g.fill(); g.fillStyle = p.tree; g.beginPath(); g.arc(7, 6, 6, 0, 7); g.fill(); g.fillStyle = shade(p.tree, 1.25); g.beginPath(); g.arc(5, 4, 2, 0, 7); g.fill(); break;
    case 'R': R(p.roof, 0, 0, 16, 16); for (let y = 3; y < 16; y += 4) R(shade(p.roof, .78), 0, y, 16, 1); R(shade(p.roof, 1.2), 0, 0, 16, 1); break;
    case 'W': R(p.wall, 0, 0, 16, 16); R(shade(p.wall, .85), 0, 14, 16, 2); R('#7aa7c7', 4, 3, 8, 7); R('#fff', 4, 3, 8, 1); R('#fff', 7, 3, 2, 7); R('#5d7a92', 4, 10, 8, 1); break;
    case '1': case '2': case '3': R(p.wall, 0, 0, 16, 16); R(shade(p.wall, .85), 0, 14, 16, 2); R('#6d4c41', 4, 4, 8, 12); R('#8d6e63', 5, 5, 6, 11); R('#ffd54f', 9, 10, 1, 1);
      if (ch === '1') { R('#fff', 5, 0, 6, 4); R('#e53935', 7, 0, 2, 4); R('#e53935', 6, 1, 4, 2); } else if (ch === '2') { R('#fff', 5, 0, 6, 4); R('#1e88e5', 6, 1, 4, 2); R('#ffd54f', 7, 1, 2, 2); } break;
    case 'G': ground(); R('#4a3b7a', 3, 0, 10, 16); R('#6a58a8', 4, 1, 8, 15); R('#ffd54f', 7, 4, 2, 2); R('#ffd54f', 6, 5, 4, 1); R('#ffd54f', 7, 6, 2, 1); break;
    case '~': R(p.water[0], 0, 0, 16, 16); { const o = fr * 3; R(p.water[1], (2 + o) % 14, 4, 6, 1); R(p.water[1], (9 + o) % 14, 11, 5, 1); R(shade(p.water[0], 1.2), (5 + o) % 14, 8, 3, 1); } break;
    case 'g': R(p.g2, 0, 0, 16, 16); for (const [x, y] of [[2, 3], [7, 2], [12, 4], [4, 9], [10, 10], [14, 13], [1, 13]]) { R(shade(p.g2, .62), x, y, 1, 5); R(shade(p.g2, .62), x + 2, y + 1, 1, 4); R(shade(p.g1, 1.1), x + 1, y - 1, 1, 3); } break;
    case 'f': ground(); R('#fff', 3, 4, 2, 2); R('#f48fb1', 9, 8, 2, 2); R('#ffd54f', 12, 3, 2, 2); R('#fff', 5, 12, 2, 2); break;
    default: ground();
  }
  _tiles.set(key, c); return c;
}
/* ---- nhân vật ---- */
function drawPerson(g, x, y, dir, step, look) {
  const skin = '#f2c9a0', hair = look.hair, body = look.body;
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x + 8, y + 15, 5, 2, 0, 0, 7); g.fill();
  const w = step ? 1 : 0;
  g.fillStyle = '#34495e'; g.fillRect(x + 5, y + 11, 2, 4 - w); g.fillRect(x + 9, y + 11, 2, 3 + w);
  g.fillStyle = body; g.fillRect(x + 4, y + 6, 8, 6); g.fillStyle = shade(body, .8); g.fillRect(x + 4, y + 10, 8, 2);
  g.fillStyle = skin; g.fillRect(x + 3, y + 7, 1, 3); g.fillRect(x + 12, y + 7, 1, 3);
  g.fillStyle = skin; g.fillRect(x + 4, y + 0, 8, 7);
  g.fillStyle = hair; g.fillRect(x + 4, y - 1, 8, 3);
  if (dir === 'u') g.fillRect(x + 4, y + 0, 8, 6);
  else if (dir === 'd') { g.fillStyle = '#1d2433'; g.fillRect(x + 5, y + 3, 1, 2); g.fillRect(x + 10, y + 3, 1, 2); }
  else if (dir === 'l') { g.fillStyle = hair; g.fillRect(x + 8, y + 0, 4, 5); g.fillStyle = '#1d2433'; g.fillRect(x + 4, y + 3, 1, 2); }
  else { g.fillStyle = hair; g.fillRect(x + 4, y + 0, 4, 5); g.fillStyle = '#1d2433'; g.fillRect(x + 11, y + 3, 1, 2); }
}
const PLAYER_LOOK = { hair: '#2b2118', body: '#e84a5f' };
function drawItem(g, x, y, t) { const b = Math.sin(t / 10) * 1; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(x + 8, y + 14, 4, 1.5, 0, 0, 7); g.fill(); g.fillStyle = '#ffd54f'; g.beginPath(); g.arc(x + 8, y + 9 + b, 4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(x + 6, y + 7 + b, 2, 2); g.fillStyle = '#ff7043'; g.fillRect(x + 7, y + 3 + b, 2, 2); }

function renderWorld() {
  const m = Wd.map; if (!m) return;
  const rx = S.x * T + (Wd.mv ? Wd.dx * (8 - Wd.mv) * 2 : 0), ry = S.y * T + (Wd.mv ? Wd.dy * (8 - Wd.mv) * 2 : 0);
  let cx = rx + 8 - W / 2, cy = ry + 8 - H / 2;
  cx = m.w * T <= W ? -(W - m.w * T) / 2 : clamp(cx, 0, m.w * T - W);
  cy = m.h * T <= H ? -(H - m.h * T) / 2 : clamp(cy, 0, m.h * T - H);
  cx = Math.round(cx); cy = Math.round(cy);
  ctx.fillStyle = '#10202e'; ctx.fillRect(0, 0, W, H);
  const fr = (FRAME >> 5) & 1;
  const x0 = Math.max(0, Math.floor(cx / T)), x1 = Math.min(m.w - 1, Math.floor((cx + W) / T));
  const y0 = Math.max(0, Math.floor(cy / T)), y1 = Math.min(m.h - 1, Math.floor((cy + H) / T));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    let ch = m.rows[y][x]; const isPath = m.path.has(x + ',' + y);
    if (ch === 'U' || ch === 'V') ch = '.';
    ctx.drawImage(tileImg(m.isl, ch, fr, isPath && (ch === '.' || ch === 'G')), x * T - cx, y * T - cy);
  }
  const ents = Wd.npcs.map(n => ({ y: n.y * T, n })).concat([{ y: ry, p: 1 }]).sort((a, b) => a.y - b.y);
  for (const e of ents) {
    if (e.p) { drawPerson(ctx, rx - cx, ry - cy - 2, Wd.face, Wd.mv ? (Wd.mv >> 1) & 1 : 0, PLAYER_LOOK); continue; }
    const n = e.n;
    if (n.kind === 'item') drawItem(ctx, n.x * T - cx, n.y * T - cy, FRAME);
    else drawPerson(ctx, (n.ox || 0) + n.x * T - cx, (n.oy || 0) + n.y * T - cy - 2, n.dir, n.walk ? (FRAME >> 3) & 1 : 0, n.look);
    if (n.alert) { ctx.fillStyle = '#fff'; ctx.fillRect(n.x * T - cx + 6, n.y * T - cy - 12, 4, 7); ctx.fillStyle = '#e53935'; ctx.fillRect(n.x * T - cx + 7, n.y * T - cy - 11, 2, 4); ctx.fillRect(n.x * T - cx + 7, n.y * T - cy - 6, 2, 1); }
  }
  // cỏ cao che chân người chơi
  if (tileAt(m, S.x, S.y) === 'g' && !Wd.mv) ctx.drawImage(tileImg(m.isl, 'g', fr, false), 0, 8, T, 8, rx - cx, ry - cy + 8, T, 8);
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
  const [dx, dy] = DIRS[Wd.face], n = npcAt(S.x + dx, S.y + dy);
  if (n) { n.dir = OPP[Wd.face]; run(() => talk(n)); }
}
function onStep() {
  const m = Wd.map, ch = tileAt(m, S.x, S.y), key = S.x + ',' + S.y;
  if (m.warps[key]) { const w = m.warps[key]; run(() => warpTo(w.map, w.x, w.y, w.dir)); return; }
  if (ch === '1' || ch === '2' || ch === '3') { run(() => door(ch)); return; }
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
