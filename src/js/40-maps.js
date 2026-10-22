'use strict';
/* ===== Bản đồ: mỗi đảo gồm thị trấn – đường mòn – phòng boss. Ký tự:
   # cây  R mái  W tường  ~ nước  g cỏ cao  f hoa  . cỏ/đường  1 2 3 cửa (y tế / cửa hàng / nhà)  U V G lối đi sang bản đồ khác ===== */
const TOWN = [
  '########UU##########',
  '#..................#',
  '#.RRR..RRR..RRR....#',
  '#.W1W..W2W..W3W....#',
  '#..................#',
  '#....ff......ff..~~#',
  '#.............~~~~~#',
  '#.............~~~~~#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '####################'
];
const ROUTE = [
  '####################',
  '#......RRRRR.......#',
  '#......WWGWW.......#',
  '#..................#',
  '#.gggg.......ggggg.#',
  '#.gggg.##....ggggg.#',
  '#.gggg.##.........f#',
  '#.......#..........#',
  '#..ff.........ggg..#',
  '#.........#.ggg....#',
  '#.ggg.........ggg..#',
  '#.ggg...##.........#',
  '#.ggg...##...f.....#',
  '#..................#',
  '#...........gggg...#',
  '#...........gggg...#',
  '#..ff..............#',
  '#..................#',
  '#..................#',
  '########VV##########'
];
const GYM = [
  '##############',
  '#............#',
  '#............#',
  '#............#',
  '#..##....##..#',
  '#............#',
  '#............#',
  '#..##....##..#',
  '#............#',
  '#............#',
  '#............#',
  '######VV######'
];
/* mỗi loại phòng có 3 kiểu bày trí; đảo i dùng kiểu i%3 (vị trí NPC/quầy giữ nguyên) */
const CLINICS = [
  ['##########', '#EE.....P#', '#...KKK..#', '#........#', '#.rr...rr#', '#........#', '#L......L#', '####VV####'],
  ['##########', '#P.....LE#', '#...KKK..#', '#.E....E.#', '#.......r#', '#r.....rr#', '#L......L#', '####VV####'],
  ['##########', '#EE....PL#', '#...KKK..#', '#........#', '#.r...rr.#', '#.r......#', '#L......L#', '####VV####']];
const SHOPS = [
  ['##########', '#LL....LP#', '#...KKK..#', '#........#', '#.rr...rr#', '#........#', '#L......L#', '####VV####'],
  ['##########', '#P....LLL#', '#...KKK..#', '#L......L#', '#.rr...rr#', '#........#', '#.L....L.#', '####VV####'],
  ['##########', '#LL.....P#', '#...KKK..#', '#........#', '#r.....r.#', '#rr...rr.#', '#L......L#', '####VV####']];
const HOMES = [
  ['##########', '#E.LL..P.#', '#........#', '#..TT....#', '#........#', '#.rrrr...#', '#........#', '####VV####'],
  ['##########', '#LL.E..P.#', '#........#', '#.TT.....#', '#........#', '#...rrrr.#', '#........#', '####VV####'],
  ['##########', '#E.P..LL.#', '#........#', '#.....TT.#', '#........#', '#rrrr....#', '#........#', '####VV####']];
const SOLID = new Set(['#', 'R', 'W', '~', 'K', 'L', 'T', 'P', 'E', 'o', 'O', 'F', 'l']);
const MAPS = {};
const TRAINER_NAMES = ['Cậu bé Kai', 'Chị Yuna', 'Bác ngư dân Gen', 'Em Sora', 'Anh Riku', 'Cô Nao', 'Chú Taro', 'Bạn Mei', 'Anh Haru', 'Cô Rin', 'Cậu Ken', 'Bà Chiyo'];
const LOOKS = [
  { hair: '#3b2f22', body: '#4c8fd6' }, { hair: '#8a3b5c', body: '#e48aa6' }, { hair: '#555', body: '#6d8f5a' }, { hair: '#d9b44a', body: '#e07a3a' },
  { hair: '#2d2d3a', body: '#8a6fcf' }, { hair: '#7a4a2a', body: '#d8c04a' }
];
const baseLv = i => [3, 6, 11, 16, 21, 26, 31, 36, 41][i];
function bfsPath(rows, from, to, avoidGrass) {
  const h = rows.length, w = rows[0].length, key = (x, y) => y * w + x, prev = new Map([[key(from[0], from[1]), null]]), q = [from];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === to[0] && y === to[1]) { const out = []; let k = key(x, y); while (k != null) { out.push([k % w, Math.floor(k / w)]); k = prev.get(k); } return out; }
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const c = rows[ny][nx]; if (SOLID.has(c) || (avoidGrass && c === 'g')) continue;
      if (prev.has(key(nx, ny))) continue; prev.set(key(nx, ny), key(x, y)); q.push([nx, ny]);
    }
  }
  return null;
}
const findTiles = (m, ch) => { const out = []; m.rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === ch) out.push([x, y]); }); return out; };
/* ô đứng cạnh một cửa/lối ra (dùng làm điểm xuất hiện sau khi chuyển bản đồ) */
function arrivalNear(m, ch) {
  const t = findTiles(m, ch)[0], prefs = ch === 'V' ? [[0, -1], [0, 1], [1, 0], [-1, 0]] : [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dx, dy] of prefs) {
    const x = t[0] + dx, y = t[1] + dy, c = (m.rows[y] || '')[x];
    if (c !== undefined && !SOLID.has(c) && !'UVG123'.includes(c)) return { x, y, dir: dy > 0 ? 'd' : dy < 0 ? 'u' : dx > 0 ? 'r' : 'l' };
  }
  throw new Error('không có ô đứng cạnh ' + ch + ' trong ' + m.id);
}
function link(a, cha, b, chb) { const ar = arrivalNear(b, chb); findTiles(a, cha).forEach(([x, y]) => { a.warps[x + ',' + y] = { map: b.id, x: ar.x, y: ar.y, dir: ar.dir }; }); }
function markPath(m, from, to) {
  const p = bfsPath(m.rows, from, to, true) || bfsPath(m.rows, from, to, false);
  if (p) p.forEach(q => m.path.add(q.join(',')));
}
/* bản đồ mẫu cho đảo chưa có bản đồ riêng */
const DEFAULT_DEF = {
  town: { rows: TOWN, dock: [9, 11], npcs: h => [h.guide(9, 8, 'd'), h.sensei(5, 6, 'r'), h.phrase(0, 15, 9, 'l'), h.phrase(1, 4, 9, 'r'), h.phrase(2, 12, 6, 'r')] },
  route: { rows: ROUTE, npcs: h => [h.trainer(0, 9, 6, 'd', 4), h.trainer(1, 6, 14, 'r', 4), h.item(18, 3), h.fruit(2, 17)] },
  gym: { rows: GYM, npcs: h => [h.trainer(2, 3, 6, 'r', 5), h.trainer(3, 10, 9, 'l', 5), h.boss(6, 2, 'd')] }
};
function buildIsland(i) {
  const c = CH[i], L = i % LOOKS.length, def = ISLANDS[i] || DEFAULT_DEF;
  const tn = (n) => TRAINER_NAMES[(i * 3 + n) % TRAINER_NAMES.length];
  const mk = (id, name, rows, area, extra) => {
    const m = Object.assign({ id, name, rows, w: rows[0].length, h: rows.length, area, isl: i, warps: {}, npcs: [], path: new Set() }, extra);
    MAPS[id] = m; return m;
  };
  const town = mk(`i${i}_town`, `${c.vi} · Thị trấn`, def.town.rows, 'town');
  const route = mk(`i${i}_route`, `${c.vi} · Đường mòn`, def.route.rows, 'route');
  const gym = mk(`i${i}_gym`, `${c.vi} · Nhà ${c.boss.name.split(' ').slice(-1)[0]}`, def.gym.rows, 'gym', { style: 'room' });
  const clinic = mk(`i${i}_clinic`, `${c.vi} · Trạm y tế`, CLINICS[i % 3], 'room', { style: 'room' });
  const shop = mk(`i${i}_shop`, `${c.vi} · Cửa hàng`, SHOPS[i % 3], 'room', { style: 'room' });
  const home = mk(`i${i}_home`, `${c.vi} · Nhà dân`, HOMES[i % 3], 'room', { style: 'room' });
  // ---- nối các bản đồ bằng cách quét ký tự ----
  link(town, 'U', route, 'V'); link(route, 'V', town, 'U'); link(route, 'G', gym, 'V'); link(gym, 'V', route, 'G');
  [['1', clinic], ['2', shop], ['3', home]].forEach(([d, rm]) => { link(town, d, rm, 'V'); link(rm, 'V', town, d); });
  town.dock = { x: def.town.dock[0], y: def.town.dock[1], dir: def.town.dock[2] || 'u' }; town.heal = arrivalNear(town, '1');
  // ---- đường cát ----
  const dk = def.town.dock, ex = findTiles(town, 'U')[0];
  markPath(town, dk, ex); ['1', '2', '3'].forEach(d => { const a = arrivalNear(town, d); markPath(town, dk, [a.x, a.y]); town.path.add(a.x + ',' + a.y); });
  const rv = arrivalNear(route, 'V'), rg = arrivalNear(route, 'G'); markPath(route, [rv.x, rv.y], [rg.x, rg.y]); route.path.add(findTiles(route, 'G')[0].join(','));
  // ---- NPC dùng chung ----
  const h = {
    guide: (x, y, dir) => i === 0 ? { id: 'mika', x, y, dir, kind: 'mika', look: { hair: '#c0553a', body: '#2f9bd6' }, name: 'Cô Mika' } : { id: 'elder' + i, x, y, dir, kind: 'elder', look: LOOKS[L], name: 'Trưởng làng' },
    sensei: (x, y, dir) => ({ id: 'sensei' + i, x, y, dir, kind: 'sensei', look: { hair: '#222', body: '#8d6e63' }, name: 'Thầy Sora' }),
    phrase: (n, x, y, dir) => ({ id: 'ph' + (n + 1) + '_' + i, x, y, dir, kind: 'phrase', n, look: LOOKS[(L + 1 + n) % 6], name: n === 2 ? 'Ngư dân' : 'Dân đảo' }),
    trainer: (t, x, y, dir, reach) => ({ id: t < 2 ? `tr${i}_${'ab'[t]}` : `gt${i}_${'ab'[t - 2]}`, x, y, dir, kind: 'trainer', t, look: LOOKS[(L + 4 + t) % 6], name: tn(t), reach }),
    item: (x, y) => i === 2 ? { id: 'item_buoy', x, y, dir: 'd', kind: 'item', key: 'buoy', name: 'Dây phao' } : { id: `item${i}`, x, y, dir: 'd', kind: 'item', key: 'pouch', name: 'Túi ngọc trai' },
    fruit: (x, y) => ({ id: `item${i}_b`, x, y, dir: 'd', kind: 'item', key: 'fruit', name: 'Tidefruit' }),
    boss: (x, y, dir) => ({ id: `boss${i}`, x, y, dir, kind: 'boss', look: c.boss, name: c.boss.name, reach: 6 })
  };
  town.npcs.push(...def.town.npcs(h)); route.npcs.push(...def.route.npcs(h)); gym.npcs.push(...def.gym.npcs(h));
  clinic.npcs.push({ id: `nurse${i}`, x: 5, y: 1, dir: 'd', kind: 'nurse', look: { hair: '#6a3a5a', body: '#f4f4f8' }, name: 'Y tá Mimi' });
  shop.npcs.push({ id: `shop${i}`, x: 5, y: 1, dir: 'd', kind: 'shop', look: { hair: '#3a3a3a', body: '#e0a030' }, name: 'Chủ tiệm' });
  home.npcs.push({ id: `grandma${i}`, x: 2, y: 4, dir: 'r', kind: 'lesson', n: i % 3, look: { hair: '#d8d8e0', body: '#9a6ab0' }, name: 'Bà Haru' });
  home.npcs.push({ id: `kid${i}`, x: 7, y: 4, dir: 'l', kind: 'kid', look: { hair: '#1d1d28', body: '#3fa66a' }, name: 'Bé Hiro' });
  home.npcs.push({ id: `homeitem${i}`, x: 8, y: 1, dir: 'd', kind: 'item', key: 'fruit', name: 'Tidefruit' });
  clinic.npcs.push({ id: `patient${i}`, x: 7, y: 4, dir: 'l', kind: 'phrase', n: 1, look: { hair: '#7a4a2a', body: '#4c8fd6' }, name: 'Bệnh nhân' });
  shop.npcs.push({ id: `buyer${i}`, x: 2, y: 4, dir: 'r', kind: 'phrase', n: 2, look: { hair: '#555', body: '#d8553f' }, name: 'Khách hàng' });
}
for (let i = 0; i < CH.length; i++) buildIsland(i);
