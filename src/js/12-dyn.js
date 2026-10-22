'use strict';
/* ===== Câu hỏi SINH ĐỘNG (kana, đọc kanji, viết kanji, nhóm từ, tiền, giờ) =====
   Mỗi câu có "khoá" xác định (vd 'num:3000') để Leitner hỏi lại đúng câu đó. */
const ROM = 'a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n ga gi gu ge go za ji zu ze zo da de do ba bi bu be bo pa pi pu pe po'.split(' ');
const HIRA = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだでどばびぶべぼぱぴぷぺぽ'];
const KATA = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダデドバビブベボパピプペポ'];
const SIM_H = ['さち', 'ぬめ', 'ねれわ', 'はほま', 'るろ', 'きさ', 'いり', 'こに', 'おあ', 'すむ', 'まも', 'ふへ', 'うつ', 'ぬね'];
const SIM_K = ['シツ', 'ソン', 'クタ', 'ワウフ', 'ヌス', 'アマ', 'コユ', 'ナメ', 'ラフ', 'ヲヨ', 'チテ', 'ケゲ', 'ノメ', 'セヤ'];
const VOCK = VOC.map((v, i) => ({ ...v, i })).filter(v => [...v.w].some(isKanji) && !['何', '方', '家', '人', '上', '一人'].includes(v.w));
const CATS = {
  'のみもの': ['お茶', '水', '牛乳', 'コーヒー', 'ジュース', 'ビール'],
  'たべもの': ['パン', '卵', '肉', '魚', '野菜', '果物', '料理', '朝ご飯', '昼ご飯', '晩ご飯'],
  'どうぶつ': ['犬', '猫', '鳥', '馬', '魚'],
  'のりもの': ['電車', '飛行機', '船', '自転車', 'バス', 'タクシー', '車', '地下鉄', '新幹線'],
  'ばしょ': ['学校', '銀行', '図書館', '駅', '公園', '病院', '郵便局', '美術館', '食堂', '教室', '大学', '会社', '喫茶店', '事務所', '会議室', '大使館', '町', '庭', '部屋', '寮', '山', '玄関', '受付', '国', '所'],
  'かぞく': ['父', '母', '兄', '姉', '弟', '妹', '家族', '子供', '彼', '彼女'],
  'きせつ': ['春', '夏', '秋', '冬'],
  'からだ': ['手', '足', '目', '耳', '口', '頭', '歯', '顔', '体', '髪'],
  'しごと': ['先生', '医者', '会社員', '銀行員', '研究者', '通訳'],
  'いろ': ['白い', '黒い', '赤い', '青い']
};
const vocByW = {}; VOC.forEach(v => { vocByW[v.w] = v; });
const catWords = (cat, maxL) => CATS[cat].map(w => vocByW[w]).filter(v => v && v.l <= maxL);

/* ---- đọc số ---- */
const D_ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const D_HUND = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
const D_THOU = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];
const WR_HUND = { 3: ['さんひゃく'], 6: ['ろくひゃく', 'ろくびゃく'], 8: ['はちひゃく', 'はちびゃく'], 1: ['いちひゃく', 'いっぴゃく'], 4: ['よんびゃく'] };
const WR_THOU = { 3: ['さんせん'], 8: ['はちせん', 'はっぜん'], 4: ['よんぜん'], 1: ['いちせん'], 7: ['しちせん'] };
function numRead(n, wrongAt) { // wrongAt: 't' | 'h' | null -> thay 1 phần bằng cách đọc sai
  const man = Math.floor(n / 10000), th = Math.floor(n / 1000) % 10, hu = Math.floor(n / 100) % 10, te = Math.floor(n / 10) % 10, on = n % 10;
  let s = '';
  if (man) s += D_ONES[man] + 'まん';
  if (th) s += (wrongAt === 't' && WR_THOU[th]) ? pick(WR_THOU[th]) : D_THOU[th];
  if (hu) s += (wrongAt === 'h' && WR_HUND[hu]) ? pick(WR_HUND[hu]) : D_HUND[hu];
  if (te) s += (te === 1 ? '' : D_ONES[te]) + 'じゅう';
  s += D_ONES[on];
  return s;
}
function numDistractors(n) {
  const correct = numRead(n), out = new Set();
  [numRead(n, 't'), numRead(n, 'h')].forEach(x => { if (x !== correct) out.add(x); });
  let guard = 0;
  while (out.size < 3 && guard++ < 60) {
    const s = String(n).split(''); const k = ri(s.length); s[k] = String((+s[k] + 1 + ri(8)) % 10); if (k === 0 && s[0] === '0') s[0] = '1';
    const m = +s.join(''); if (m !== n && m > 0) out.add(numRead(m));
  }
  return [...out].filter(x => x !== correct).slice(0, 3).map(x => x + 'えん');
}
const HOUR_R = ['', 'いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ', 'しちじ', 'はちじ', 'くじ', 'じゅうじ', 'じゅういちじ', 'じゅうにじ'];
const HOUR_W = { 4: ['よんじ', 'しじ'], 7: ['ななじ'], 9: ['きゅうじ'], 1: ['ひとじ'], 6: ['ろっじ'] };
const MIN_U = ['', 'いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん', 'ろっぷん', 'ななふん', 'はっぷん', 'きゅうふん'];
const TENS = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'];
function minRead(m) {
  const t = Math.floor(m / 10), u = m % 10;
  if (!m) return '';
  if (!u) return TENS[t].replace(/う$/, '') + 'っぷん';
  return TENS[t] + MIN_U[u];
}
function timeRead(h, m, wrongHour) {
  const hr = wrongHour && HOUR_W[h] ? pick(HOUR_W[h]) : HOUR_R[h];
  if (m === 0) return hr;
  if (m === 30) return hr + 'はん';
  return hr + minRead(m);
}
/* ---- cách đọc: biến thể sai thường gặp ---- */
const DAK = { 'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご', 'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ', 'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど', 'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ' };
const UNDAK = {}; Object.keys(DAK).forEach(k => { UNDAK[DAK[k]] = k; });
function mutateReading(r) {
  const chars = [...r], outs = new Set();
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]; let m = null;
    if (DAK[c]) m = DAK[c]; else if (UNDAK[c]) m = UNDAK[c];
    if (m) { const a = chars.slice(); a[i] = m; outs.add(a.join('')); }
  }
  for (let i = 1; i < chars.length; i++) { // chèn / bỏ っ, kéo dài / rút ngắn nguyên âm
    if (chars[i] === 'っ') { const a = chars.slice(); a.splice(i, 1); outs.add(a.join('')); }
    else if ('かきくけこさしすせそたちつてとぱぴぷぺぽ'.includes(chars[i]) && chars[i - 1] !== 'っ') { const a = chars.slice(); a.splice(i, 0, 'っ'); outs.add(a.join('')); }
    if (chars[i] === 'う' && 'おこそとのほもよろょ'.includes(chars[i - 1])) { const a = chars.slice(); a.splice(i, 1); outs.add(a.join('')); }
    else if ('おこそとのほもよろ'.includes(chars[i])) { const a = chars.slice(); a.splice(i + 1, 0, 'う'); outs.add(a.join('')); }
    if (i < chars.length - 1) { const a = chars.slice(); [a[i], a[i + 1]] = [a[i + 1], a[i]]; outs.add(a.join('')); }
  }
  outs.delete(r);
  return [...outs];
}
const kanjiNote = w => [...w].filter(c => KANJI[c]).map(c => `${c} (${KANJI[c].hv}) = ${KANJI[c].m}`).join(' · ');

/* ---- tạo câu hỏi từ khoá ---- */
function dynMake(key, ch) {
  const [type, ...a] = key.split(':'); const maxL = lessonEnd(ch == null ? 7 : ch);
  if (type === 'kana') {
    const [mode, rom] = a, i = ROM.indexOf(rom), h = HIRA[i], k = KATA[i];
    let q, ans, pool, sim;
    if (mode === 'rh') { q = `「${rom}」を ひらがなで かくと どれですか。`; ans = h; pool = HIRA; sim = SIM_H; }
    else if (mode === 'rk') { q = `「${rom}」を カタカナで かくと どれですか。`; ans = k; pool = KATA; sim = SIM_K; }
    else if (mode === 'kh') { q = `「${k}」と おなじ おとの ひらがなは どれですか。`; ans = h; pool = HIRA; sim = SIM_H; }
    else { q = `「${h}」と おなじ おとの カタカナは どれですか。`; ans = k; pool = KATA; sim = SIM_K; }
    const near = sim.filter(g => g.includes(ans)).join('').split('').filter(x => x !== ans);
    const set = []; shuffle(near).forEach(x => { if (set.length < 3 && !set.includes(x)) set.push(x); });
    while (set.length < 3) { const x = pick(pool); if (x !== ans && !set.includes(x)) set.push(x); }
    const romOf = x => ROM[pool.indexOf(x)];
    const c = [ans, ...set];
    return { id: key, t: 'm', d: 1, l: 1, q, qv: `Chữ cái phát âm "${rom}".`, c, ex: `Âm "${rom}": hiragana là 「${h}」, katakana là 「${k}」. Hiragana dùng cho từ thuần Nhật và ngữ pháp; katakana dùng cho từ mượn nước ngoài và tên nước ngoài.`, w: [[h, rom, 'hiragana'], [k, rom, 'katakana']], cv: c.map(x => `phát âm "${romOf(x)}"`), nf: true };
  }
  if (type === 'read' || type === 'write') {
    const v = VOC[+a[0]], w = v.w;
    if (type === 'read') {
      const mut = shuffle(mutateReading(v.r)); const others = shuffle(VOCK.filter(x => x.r !== v.r && Math.abs(x.r.length - v.r.length) <= 1 && x.l <= maxL)).map(x => x.r);
      const set = []; [...mut.slice(0, 2), ...others, ...mut.slice(2)].forEach(x => { if (set.length < 3 && x !== v.r && !set.includes(x)) set.push(x); });
      const c = [v.r, ...set];
      return { id: key, t: 'k', d: v.r.length <= 3 ? 1 : v.r.length <= 5 ? 2 : 3, l: v.l, qh: `「${esc(w)}」の よみかたは どれですか。`, q: `「${w}」の よみかたは どれですか。`, qv: `Cách đọc của 「${w}」 là gì?`, c, ex: `「${w}」 đọc là 「${v.r}」 — ${v.m}. ${kanjiNote(w) ? 'Hán Việt: ' + kanjiNote(w) + '.' : ''}`, w: [[w, v.r, v.m]], cv: [v.m, ...set.map(() => '(cách đọc sai)')], nf: true };
    }
    const same = x => x.r === v.r;
    const share = VOCK.filter(x => !same(x) && x.l <= maxL && [...x.w].some(c => isKanji(c) && w.includes(c)));
    const len = VOCK.filter(x => !same(x) && x.l <= maxL && Math.abs(x.w.length - w.length) <= 1);
    const any = VOCK.filter(x => !same(x) && x.l <= maxL), all = VOCK.filter(x => !same(x));
    const set = []; [...shuffle(share), ...shuffle(len), ...shuffle(any), ...shuffle(all)].forEach(x => { if (set.length < 3 && !set.some(y => y.w === x.w) && x.w !== w) set.push(x); });
    const c = [w, ...set.map(x => x.w)];
    return { id: key, t: 'k', d: w.length <= 2 ? 1 : w.length <= 3 ? 2 : 3, l: v.l, qh: `「${esc(v.r)}」を かんじで かくと どれですか。`, q: `「${v.r}」を かんじで かくと どれですか。`, qv: `Viết 「${v.r}」 bằng chữ Hán.`, c, ex: `「${v.r}」 viết là 「${w}」 — ${v.m}. ${kanjiNote(w) ? 'Hán Việt: ' + kanjiNote(w) + '.' : ''}`, w: [[w, v.r, v.m], ...set.map(x => [x.w, x.r, x.m])], cv: c.map((x, i) => i === 0 ? v.m : set[i - 1].m), nf: true };
  }
  if (type === 'cat' || type === 'catx') {
    const [cat, word] = a; const own = catWords(cat, maxL), target = vocByW[word];
    const otherCats = Object.keys(CATS).filter(k => k !== cat);
    const outside = () => { const c2 = pick(otherCats), ws = catWords(c2, maxL).filter(v => !CATS[cat].includes(v.w)); return ws.length ? pick(ws) : null; };
    let c, set = [];
    if (type === 'cat') {
      let g = 0; while (set.length < 3 && g++ < 60) { const o = outside(); if (o && !set.some(x => x.w === o.w) && o.w !== word) set.push(o); }
      for (const x of shuffle(VOCK.filter(v => v.l <= maxL && !CATS[cat].includes(v.w) && v.w !== word))) { if (set.length >= 3) break; if (!set.some(y => y.w === x.w)) set.push(x); }
      c = [target, ...set];
      return { id: key, t: 'v', d: 1, l: target.l, q: `「${cat}」は どれですか。`, qv: `Từ nào thuộc nhóm 「${cat}」?`, c: c.map(x => x.w), ex: `「${target.w}」(${target.r}) = ${target.m}, thuộc nhóm 「${cat}」.`, w: c.map(x => [x.w, x.r, x.m]), cv: c.map(x => x.m) };
    }
    shuffle(own.filter(x => x.w !== word)).slice(0, 3).forEach(x => set.push(x));
    c = [target, ...set];
    return { id: key, t: 'v', d: 2, l: target.l, q: `つぎの なかで 「${cat}」では ない ものは どれですか。`, qv: `Từ nào KHÔNG thuộc nhóm 「${cat}」?`, c: c.map(x => x.w), ex: `「${target.w}」(${target.r}) = ${target.m}, không phải 「${cat}」. Ba từ còn lại đều thuộc nhóm 「${cat}」.`, w: c.map(x => [x.w, x.r, x.m]), cv: c.map(x => x.m) };
  }
  if (type === 'num') {
    const n = +a[0], r = numRead(n) + 'えん', set = numDistractors(n);
    const d = n % 1000 === 0 && n < 10000 || (n % 100 === 0 && n < 1000) ? 1 : n < 10000 ? 2 : 3;
    return { id: key, t: 'n', d, l: 3, q: `「${n.toLocaleString('en')}円」の よみかたは どれですか。`, qv: `Cách đọc của ${n.toLocaleString('en')} yên.`, c: [r, ...set], ex: `${n.toLocaleString('en')} = ${numRead(n)}. Lưu ý biến âm: 300 さんびゃく · 600 ろっぴゃく · 800 はっぴゃく · 3000 さんぜん · 8000 はっせん. Số 10.000 = いちまん.`, w: [['円', 'えん', 'yên']], cv: [`đúng (${n.toLocaleString('en')} yên)`, ...set.map(() => '(cách đọc sai)')] };
  }
  if (type === 'time') {
    const h = +a[0], m = +a[1], r = timeRead(h, m), mm = String(m).padStart(2, '0');
    const set = new Set(); let g = 0;
    while (set.size < 3 && g++ < 80) { const x = g < 3 ? timeRead(h, m, true) : timeRead(clamp(h + (ri(2) ? 1 : -1), 1, 12), pick([m, 0, 30])); if (x !== r) set.add(x); }
    const c = [r, ...set];
    return { id: key, t: 'n', d: m === 0 ? 1 : m === 30 ? 2 : 3, l: 4, q: `「${h}:${mm}」の よみかたは どれですか。`, qv: `Cách đọc giờ ${h}:${mm}.`, c, ex: `${h}:${mm} đọc là 「${r}」. Giờ cần nhớ: 4 giờ = よじ · 7 giờ = しちじ · 9 giờ = くじ. 30 phút = はん. Phút: 1 いっぷん · 3 さんぷん · 4 よんぷん · 6 ろっぷん · 8 はっぷん · 10 じゅっぷん.`, w: [['時', 'じ', 'giờ'], ['分', 'ふん/ぷん', 'phút'], ['半', 'はん', 'rưỡi']], cv: [`đúng (${h}:${mm})`, ...[...set].map(() => '(cách đọc sai)')] };
  }
  return null;
}
/* ---- chọn khoá ngẫu nhiên theo chương & độ khó ---- */
function dynKey(type, ch, d) {
  const maxL = lessonEnd(ch);
  if (type === 'kana') {
    const modes = ch === 0 ? ['rh', 'rk', 'kh', 'hk'] : ['kh', 'hk'];
    const rom = pick(ch === 0 && d === 1 ? ROM.slice(0, 46) : ROM);
    return `kana:${pick(modes)}:${rom}`;
  }
  if (type === 'read' || type === 'write') {
    const pool = VOCK.filter(v => v.l <= maxL && !/[ー]/.test(v.w));
    const fit = pool.filter(v => type === 'read' ? (v.r.length <= 3 ? 1 : v.r.length <= 5 ? 2 : 3) === d : (v.w.length <= 2 ? 1 : v.w.length <= 3 ? 2 : 3) === d);
    const v = pick(fit.length ? fit : pool);
    return `${type}:${v.i}`;
  }
  if (type === 'cat') {
    const cats = Object.keys(CATS).filter(c => catWords(c, maxL).length >= (d === 1 ? 1 : 3));
    const cat = pick(cats);
    const own = catWords(cat, maxL);
    if (d === 1) return `cat:${cat}:${pick(own).w}`;
    const others = Object.keys(CATS).filter(c => c !== cat).flatMap(c => catWords(c, maxL)).filter(v => !CATS[cat].includes(v.w));
    return others.length ? `catx:${cat}:${pick(others).w}` : `cat:${cat}:${pick(own).w}`;
  }
  if (type === 'num') {
    let n;
    if (d === 1) n = pick([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]);
    else if (d === 2) n = (1 + ri(9)) * 1000 + (1 + ri(9)) * 100 + pick([0, 0, 50].map(x => x - x % 50));
    else n = (1 + ri(9)) * 10000 + ri(10) * 1000 + ri(10) * 100 + pick([0, 0, 0, 50]);
    n = Math.max(100, n - n % 10);
    return `num:${n}`;
  }
  if (type === 'time') {
    const h = 1 + ri(12);
    if (d === 1) return `time:${h}:0`;
    if (d === 2) return `time:${h}:${pick([0, 30])}`;
    return `time:${h}:${pick([5, 10, 15, 20, 25, 40, 45, 50, 55, 1, 3, 4, 6, 8, 12, 24])}`;
  }
  return null;
}
/* tỉ trọng từng loại động theo chương (kana nhiều ở chương 1) */
const DYN_W = [
  { kana: 3, num: 2, time: 2, read: 3, write: 2, cat: 2 },
  { kana: 0.4, num: 1, time: 2, read: 3, write: 2, cat: 2 },
  { kana: 0.2, num: 0.6, time: 1, read: 3, write: 2, cat: 2 },
  { kana: 0.1, num: 0.5, time: 0.8, read: 3, write: 2, cat: 1.5 },
  { kana: 0.1, num: 0.4, time: 0.6, read: 3, write: 2, cat: 1.2 },
  { kana: 0.1, num: 0.4, time: 0.5, read: 3, write: 2, cat: 1 },
  { kana: 0.1, num: 0.3, time: 0.4, read: 3, write: 2, cat: 1 },
  { kana: 0.1, num: 0.3, time: 0.4, read: 3, write: 2, cat: 1 }
];
