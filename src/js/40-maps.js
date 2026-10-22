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
const CLINIC = ['##########', '#EE.....P#', '#...KKK..#', '#........#', '#.rr...rr#', '#........#', '#L......L#', '####VV####'];
const SHOP = ['##########', '#LL....LP#', '#...KKK..#', '#........#', '#.rr...rr#', '#........#', '#L......L#', '####VV####'];
const HOME = ['##########', '#E.LL..P.#', '#........#', '#..TT....#', '#........#', '#.rrrr...#', '#........#', '####VV####'];
const SOLID = new Set(['#', 'R', 'W', '~', 'K', 'L', 'T', 'P', 'E']);
const MAPS = {};
const TRAINER_NAMES = ['Cậu bé Kai', 'Chị Yuna', 'Bác ngư dân Gen', 'Em Sora', 'Anh Riku', 'Cô Nao', 'Chú Taro', 'Bạn Mei', 'Anh Haru', 'Cô Rin', 'Cậu Ken', 'Bà Chiyo'];
const LOOKS = [
  { hair: '#3b2f22', body: '#4c8fd6' }, { hair: '#8a3b5c', body: '#e48aa6' }, { hair: '#555', body: '#6d8f5a' }, { hair: '#d9b44a', body: '#e07a3a' },
  { hair: '#2d2d3a', body: '#8a6fcf' }, { hair: '#7a4a2a', body: '#d8c04a' }
];
const baseLv = i => [4, 10, 16, 22, 28, 34, 40, 46][i];
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
function buildIsland(i) {
  const c = CH[i], L = i % LOOKS.length;
  const tn = (n) => TRAINER_NAMES[(i * 3 + n) % TRAINER_NAMES.length];
  const mk = (id, name, rows, area, extra) => {
    const m = Object.assign({ id, name, rows, w: rows[0].length, h: rows.length, area, isl: i, warps: {}, npcs: [], path: new Set() }, extra);
    MAPS[id] = m; return m;
  };
  const town = mk(`i${i}_town`, `${c.vi} · Thị trấn`, TOWN, 'town');
  const route = mk(`i${i}_route`, `${c.vi} · Đường mòn`, ROUTE, 'route');
  const gym = mk(`i${i}_gym`, `${c.vi} · Nhà ${c.boss.name.split(' ').slice(-1)[0]}`, GYM, 'gym');
  const clinic = mk(`i${i}_clinic`, `${c.vi} · Trạm y tế`, CLINIC, 'room');
  const shop = mk(`i${i}_shop`, `${c.vi} · Cửa hàng`, SHOP, 'room');
  const home = mk(`i${i}_home`, `${c.vi} · Nhà dân`, HOME, 'room');
  [[3, clinic], [8, shop], [13, home]].forEach(([dx, rm]) => {
    town.warps[`${dx},3`] = { map: rm.id, x: 4, y: 6, dir: 'u' };
    for (const x of [4, 5]) rm.warps[`${x},7`] = { map: town.id, x: dx, y: 4, dir: 'd' };
  });
  clinic.npcs.push({ id: `nurse${i}`, x: 5, y: 1, dir: 'd', kind: 'nurse', look: { hair: '#6a3a5a', body: '#f4f4f8' }, name: 'Y tá Mimi' });
  shop.npcs.push({ id: `shop${i}`, x: 5, y: 1, dir: 'd', kind: 'shop', look: { hair: '#3a3a3a', body: '#e0a030' }, name: 'Chủ tiệm' });
  home.npcs.push({ id: `grandma${i}`, x: 2, y: 4, dir: 'r', kind: 'lesson', n: i % 3, look: { hair: '#d8d8e0', body: '#9a6ab0' }, name: 'Bà Haru' });
  home.npcs.push({ id: `kid${i}`, x: 7, y: 4, dir: 'l', kind: 'kid', look: { hair: '#1d1d28', body: '#3fa66a' }, name: 'Bé Hiro' });
  home.npcs.push({ id: `homeitem${i}`, x: 8, y: 1, dir: 'd', kind: 'item', key: 'fruit', name: 'Tidefruit' });
  clinic.npcs.push({ id: `patient${i}`, x: 7, y: 4, dir: 'l', kind: 'phrase', n: 1, look: { hair: '#7a4a2a', body: '#4c8fd6' }, name: 'Bệnh nhân' });
  shop.npcs.push({ id: `buyer${i}`, x: 2, y: 4, dir: 'r', kind: 'phrase', n: 2, look: { hair: '#555', body: '#d8553f' }, name: 'Khách hàng' });
  for (const x of [8, 9]) town.warps[`${x},0`] = { map: route.id, x: 9, y: 18, dir: 'u' };
  for (const x of [8, 9]) route.warps[`${x},19`] = { map: town.id, x: 9, y: 1, dir: 'd' };
  route.warps['9,2'] = { map: gym.id, x: 6, y: 10, dir: 'u' };
  for (const x of [6, 7]) gym.warps[`${x},11`] = { map: route.id, x: 9, y: 3, dir: 'd' };
  // đường đi (vẽ màu cát)
  for (let y = 0; y < town.h; y++) for (let x = 0; x < town.w; x++) if ((x === 8 || x === 9) && y <= 12 || y === 4 && x >= 3 && x <= 14 || (y === 4 && (x === 3 || x === 8 || x === 13))) town.path.add(x + ',' + y);
  [[3, 4], [8, 4], [13, 4]].forEach(p => town.path.add(p.join(',')));
  const rp = bfsPath(ROUTE, [9, 18], [9, 3], true) || bfsPath(ROUTE, [9, 18], [9, 3], false);
  rp.forEach(p => route.path.add(p.join(','))); route.path.add('9,2');
  for (let y = 1; y <= 10; y++) gym.path.add(`6,${y}`), gym.path.add(`7,${y}`);
  // NPC thị trấn
  town.npcs.push(i === 0
    ? { id: 'mika', x: 9, y: 8, dir: 'd', kind: 'mika', look: { hair: '#c0553a', body: '#2f9bd6' }, name: 'Cô Mika' }
    : { id: 'elder' + i, x: 9, y: 8, dir: 'd', kind: 'elder', look: LOOKS[L], name: 'Trưởng làng' });
  town.npcs.push({ id: 'sensei' + i, x: 5, y: 6, dir: 'r', kind: 'sensei', look: { hair: '#222', body: '#8d6e63' }, name: 'Thầy Sora' });
  town.npcs.push({ id: 'ph1_' + i, x: 15, y: 9, dir: 'l', kind: 'phrase', n: 0, look: LOOKS[(L + 1) % 6], name: 'Dân đảo' });
  town.npcs.push({ id: 'ph2_' + i, x: 4, y: 9, dir: 'r', kind: 'phrase', n: 1, look: LOOKS[(L + 2) % 6], name: 'Dân đảo' });
  town.npcs.push({ id: 'ph3_' + i, x: 12, y: 6, dir: 'r', kind: 'phrase', n: 2, look: LOOKS[(L + 3) % 6], name: 'Ngư dân' });
  // đường mòn
  route.npcs.push({ id: `tr${i}_a`, x: 9, y: 6, dir: 'd', kind: 'trainer', t: 0, look: LOOKS[(L + 4) % 6], name: tn(0), reach: 4 });
  route.npcs.push({ id: `tr${i}_b`, x: 6, y: 14, dir: 'r', kind: 'trainer', t: 1, look: LOOKS[(L + 5) % 6], name: tn(1), reach: 4 });
  route.npcs.push(i === 1
    ? { id: 'item_buoy', x: 18, y: 3, dir: 'd', kind: 'item', key: 'buoy', name: 'Dây phao' }
    : { id: `item${i}`, x: 18, y: 3, dir: 'd', kind: 'item', key: 'pouch', name: 'Túi ngọc trai' });
  route.npcs.push({ id: `item${i}_b`, x: 2, y: 17, dir: 'd', kind: 'item', key: 'fruit', name: 'Tidefruit' });
  // phòng boss
  gym.npcs.push({ id: `gt${i}_a`, x: 3, y: 6, dir: 'r', kind: 'trainer', t: 2, look: LOOKS[(L + 1) % 6], name: tn(2), reach: 5 });
  gym.npcs.push({ id: `gt${i}_b`, x: 10, y: 9, dir: 'l', kind: 'trainer', t: 3, look: LOOKS[(L + 3) % 6], name: tn(3), reach: 5 });
  gym.npcs.push({ id: `boss${i}`, x: 6, y: 2, dir: 'd', kind: 'boss', look: c.boss, name: c.boss.name, reach: 6 });
}
for (let i = 0; i < 8; i++) buildIsland(i);
const DOCK = { x: 9, y: 11, dir: 'u' };
