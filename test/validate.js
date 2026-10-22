// Kiểm tra dữ liệu chạy TRONG trình duyệt (dùng bản build thật): câu hỏi, furigana, câu động, Tideling, bản đồ.
module.exports = function validateInPage() {
  const out = { errors: [], info: {} };
  const err = m => out.errors.push(m);
  const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;
  // --- câu hỏi tĩnh ---
  const ids = new Set();
  G.SQ.forEach((q, n) => {
    const tag = `SQ#${n}[${q.id}] ${q.q.slice(0, 24)}`;
    if (ids.has(q.id)) err(tag + ': trùng id'); ids.add(q.id);
    if (q.c.length !== 4 || new Set(q.c).size !== 4) err(tag + ': cần 4 đáp án khác nhau');
    if (q.c.some(c => VI.test(c))) err(tag + ': đáp án chứa tiếng Việt');
    if (VI.test(q.q) || (q.p && VI.test(q.p))) err(tag + ': đề chứa tiếng Việt');
    if (!q.ex || !q.qv) err(tag + ': thiếu giải thích/dịch');
    if (!q.cv || q.cv.length !== 4) err(tag + ': cv phải có 4 mục (có ' + (q.cv ? q.cv.length : 0) + ')');
    if (q.t === 'r' && (!q.p || !q.pv)) err(tag + ': đọc hiểu thiếu đoạn văn/dịch');
    if (![1, 2, 3].includes(q.d) || q.l < 1 || q.l > 25) err(tag + ': d/l sai');
    const lens = q.c.map(c => G.plain(c).length);
    if (Math.max(...lens) > 3 * Math.max(1, Math.min(...lens)) + 6) err(tag + ': độ dài đáp án chênh lệch quá lớn ' + lens);
  });
  out.info.staticQuestions = G.SQ.length;
  out.info.byDiff = [1, 2, 3].map(d => G.SQ.filter(q => q.d === d).length);
  out.info.byType = G.SQ.reduce((a, q) => (a[q.t] = (a[q.t] || 0) + 1, a), {});
  const lessonCount = {}; G.SQ.forEach(q => { lessonCount[q.l] = (lessonCount[q.l] || 0) + 1; });
  for (let l = 1; l <= 25; l++) if (!lessonCount[l]) err('Bài ' + l + ' chưa có câu hỏi tĩnh');
  // --- furigana phủ hết kanji ---
  window.__missingFuri.clear();
  G.SQ.forEach(q => { G.furi(q.q); if (q.p) G.furi(q.p); q.c.forEach(c => G.furi(c)); });
  if (window.__missingFuri.size) err('Kanji chưa có furigana (thiếu trong VOC): ' + [...window.__missingFuri].join(''));
  // --- câu hỏi động ---
  const dynErr = {}; window.__missingFuri.clear(); let nd = 0;
  const types = ['kana', 'read', 'write', 'cat', 'num', 'time'];
  for (let ch = 0; ch < 8; ch++) for (const t of types) for (let d = 1; d <= 3; d++) for (let k = 0; k < 40; k++) {
    let key; try { key = G.dynKey(t, ch, d); } catch (e) { err(`dynKey ${t} ch${ch} d${d}: ${e.message}`); continue; }
    if (!key) continue;
    let q; try { q = G.dynMake(key, ch); } catch (e) { err(`dynMake ${key}: ${e.stack}`); continue; }
    nd++;
    if (!q) { dynErr[key] = 'null'; continue; }
    if (q.c.length !== 4 || new Set(q.c).size !== 4) dynErr[key] = '4 đáp án khác nhau: ' + JSON.stringify(q.c);
    else if (q.c.some(c => VI.test(c))) dynErr[key] = 'VI trong đáp án';
    else if (!q.ex || !q.cv || q.cv.length !== 4) dynErr[key] = 'thiếu ex/cv';
    else if (q.l > [3, 6, 9, 12, 15, 19, 22, 25][ch] && t !== 'num' && t !== 'time') dynErr[key] = 'bài vượt chương: ' + q.l;
    if (t === 'num') { const n = +key.split(':')[1]; if (q.c[0] !== G.numRead(n) + 'えん') dynErr[key] = 'num đáp án đầu sai'; }
    if (t === 'read' || t === 'write') { const v = G.VOC[+key.split(':')[1]]; const want = t === 'read' ? v.r : v.w; if (q.c[0] !== want) dynErr[key] = 'đáp án đúng không ở đầu'; if (t === 'write') { const dup = q.c.slice(1).filter(w => { const o = G.VOC.find(x => x.w === w); return o && o.r === v.r; }); if (dup.length) dynErr[key] = 'đồng âm trong đáp án sai: ' + dup; } }
  }
  const ek = Object.keys(dynErr); if (ek.length) err(`Câu động lỗi (${ek.length}/${nd}): ` + ek.slice(0, 8).map(k => k + ' → ' + dynErr[k]).join(' ; '));
  out.info.dynChecked = nd;
  // --- đọc số / giờ: một số trường hợp đã biết ---
  const known = { 300: 'さんびゃく', 600: 'ろっぴゃく', 800: 'はっぴゃく', 3000: 'さんぜん', 8000: 'はっせん', 10000: 'いちまん', 35800: 'さんまんごせんはっぴゃく', 1500: 'せんごひゃく', 12000: 'いちまんにせん' };
  for (const n in known) if (G.numRead(+n) !== known[n]) err(`numRead(${n}) = ${G.numRead(+n)} ≠ ${known[n]}`);
  const tk = [[4, 0, 'よじ'], [7, 30, 'しちじはん'], [9, 5, 'くじごふん'], [10, 10, 'じゅうじじゅっぷん'], [3, 1, 'さんじいっぷん'], [12, 45, 'じゅうにじよんじゅうごふん'], [6, 8, 'ろくじはっぷん']];
  tk.forEach(([h, m, w]) => { if (G.timeRead(h, m) !== w) err(`timeRead(${h},${m}) = ${G.timeRead(h, m)} ≠ ${w}`); });
  // --- Tideling ---
  const ns = G.SLICES.reduce((a, b) => a + b, 0);
  if (ns !== 150) err('Tổng loài ≠ 150: ' + ns);
  if (G.FRUITS.length !== 50) err('Số trái cây ≠ 50');
  const names = new Set(); for (let i = 0; i < 150; i++) { names.add(G.spName(i, 1)); names.add(G.spName(i, 2)); }
  if (names.size !== 300) err('Tên loài/dạng không duy nhất: ' + names.size);
  const grpCount = [0, 0, 0]; for (let i = 0; i < 150; i++) grpCount[i % 3]++;
  if (grpCount.join() !== '50,50,50') err('3 nhóm × 50 sai: ' + grpCount);
  const seen = new Set(); for (let c = 0; c < 8; c++) G.speciesOfChapter(c).forEach(s => { if (seen.has(s)) err('loài trùng chương ' + s); seen.add(s); });
  if (seen.size !== 150) err('Các chương không phủ đủ 150 loài');
  out.info.slices = G.SLICES.join('/');
  // vẽ thử mọi loài (không lỗi)
  try { for (let i = 0; i < 150; i++) for (const f of [1, 2]) G.tidelingCanvas(i, f, 64, false); } catch (e) { err('Vẽ Tideling lỗi: ' + e.stack); }
  // --- bản đồ ---
  for (const id in G.MAPS) {
    const m = G.MAPS[id], lens = new Set(m.rows.map(r => r.length)); if (lens.size !== 1) err(id + ': hàng không đều');
    const free = (x, y) => !'#RW~'.includes(m.rows[y][x]);
    m.npcs.forEach(n => { if (!free(n.x, n.y)) err(`${id}: NPC ${n.id} đứng trên ô cứng`); });
    for (const k in m.warps) { const w = m.warps[k], t = G.MAPS[w.map]; if (!t || !'#RW~'.includes(t.rows[w.y][w.x]) === false) err(`${id}: warp ${k} đích sai`); }
    // tới được mọi NPC và lối ra từ ô đầu tiên của mỗi bản đồ?
    const start = m.warps ? Object.values(G.MAPS).flatMap(mm => Object.values(mm.warps)).filter(w => w.map === id)[0] || { x: 9, y: 11 } : null;
    const seenT = new Set([start.x + ',' + start.y]); const q = [[start.x, start.y]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || !free(nx, ny) || seenT.has(nx + ',' + ny)) continue; if (m.npcs.some(n => n.x === nx && n.y === ny && n.kind !== 'item' && false)) continue; seenT.add(nx + ',' + ny); q.push([nx, ny]); } }
    for (const k in m.warps) if (!seenT.has(k)) err(`${id}: không tới được warp ${k}`);
    m.npcs.forEach(n => { const adj = [[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dx, dy]) => seenT.has((n.x + dx) + ',' + (n.y + dy))); if (!adj) err(`${id}: không tới gần được NPC ${n.id}`); });
  }
  return out;
};
