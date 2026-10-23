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
  if (type === 'rom') return romQuestion(key);
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
  if (type === 'rom') return romKey(d);
  if (type === 'kana') {
    const modes = ch <= 1 ? ['rh', 'rk', 'kh', 'hk'] : ['kh', 'hk'];
    const rom = pick(ch <= 1 && d === 1 ? ROM.slice(0, 46) : ROM);
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
/* ===== Chương mở đầu: luyện romaji (kana → romaji, romaji → kana, từ, chữ Hán đơn giản) ===== */
const toKata = t => t.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
const HIRA_Y = 'きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ'.split(' ');
const ROM_Y = 'kya kyu kyo sha shu sho cha chu cho nya nyu nyo hya hyu hyo mya myu myo rya ryu ryo gya gyu gyo ja ju jo bya byu byo pya pyu pyo'.split(' ');
const KANA_ALL = ROM.map((r, i) => ({ r, h: HIRA[i], k: KATA[i], y: 0, base: i < 46 })).concat(ROM_Y.map((r, i) => ({ r, h: HIRA_Y[i], k: toKata(HIRA_Y[i]), y: 1, base: false })));
const HW = [['ねこ', 'neko', 'con mèo'], ['いぬ', 'inu', 'con chó'], ['さくら', 'sakura', 'hoa anh đào'], ['みず', 'mizu', 'nước'], ['やま', 'yama', 'núi'], ['かわ', 'kawa', 'sông'], ['うみ', 'umi', 'biển'], ['そら', 'sora', 'bầu trời'], ['はな', 'hana', 'hoa'], ['つき', 'tsuki', 'mặt trăng'], ['ひと', 'hito', 'người'], ['ちず', 'chizu', 'bản đồ'],
  ['ともだち', 'tomodachi', 'bạn bè'], ['わたし', 'watashi', 'tôi'], ['おんがく', 'ongaku', 'âm nhạc'], ['にほんご', 'nihongo', 'tiếng Nhật'], ['ふじさん', 'fujisan', 'núi Phú Sĩ'], ['しんぶん', 'shinbun', 'tờ báo'], ['ありがとう', 'arigatou', 'cảm ơn'], ['おはよう', 'ohayou', 'chào buổi sáng'], ['こんにちは', 'konnichiwa', 'xin chào'], ['さようなら', 'sayounara', 'tạm biệt'],
  ['がっこう', 'gakkou', 'trường học'], ['せんせい', 'sensei', 'giáo viên'], ['おおきい', 'ookii', 'to lớn'], ['きって', 'kitte', 'con tem'], ['ざっし', 'zasshi', 'tạp chí'], ['さんぽ', 'sanpo', 'đi dạo'], ['りょこう', 'ryokou', 'du lịch'], ['じてんしゃ', 'jitensha', 'xe đạp'], ['しゅくだい', 'shukudai', 'bài tập'], ['ちょっと', 'chotto', 'một chút'], ['びょういん', 'byouin', 'bệnh viện'], ['ちゅうごく', 'chuugoku', 'Trung Quốc']];
const KW = [['パン', 'pan', 'bánh mì'], ['バス', 'basu', 'xe buýt'], ['ペン', 'pen', 'cây bút'], ['アイス', 'aisu', 'kem'], ['ホテル', 'hoteru', 'khách sạn'], ['カメラ', 'kamera', 'máy ảnh'], ['テレビ', 'terebi', 'tivi'], ['ピアノ', 'piano', 'đàn piano'], ['ビール', 'biiru', 'bia'], ['コーヒー', 'koohii', 'cà phê'], ['ケーキ', 'keeki', 'bánh kem'], ['ノート', 'nooto', 'quyển vở'], ['ゲーム', 'geemu', 'trò chơi'], ['メール', 'meeru', 'thư điện tử'], ['チーズ', 'chiizu', 'phô mai'], ['ラーメン', 'raamen', 'mì ramen'], ['ジュース', 'juusu', 'nước ép'], ['タクシー', 'takushii', 'taxi'], ['スポーツ', 'supootsu', 'thể thao'], ['シャツ', 'shatsu', 'áo sơ mi']];
const PK = [['山', 'やま', 'yama', 'sơn', 'núi'], ['川', 'かわ', 'kawa', 'xuyên', 'sông'], ['木', 'き', 'ki', 'mộc', 'cây'], ['水', 'みず', 'mizu', 'thủy', 'nước'], ['火', 'ひ', 'hi', 'hỏa', 'lửa'], ['月', 'つき', 'tsuki', 'nguyệt', 'mặt trăng'], ['花', 'はな', 'hana', 'hoa', 'hoa'], ['犬', 'いぬ', 'inu', 'khuyển', 'chó'], ['猫', 'ねこ', 'neko', 'miêu', 'mèo'], ['魚', 'さかな', 'sakana', 'ngư', 'cá'], ['人', 'ひと', 'hito', 'nhân', 'người'], ['目', 'め', 'me', 'mục', 'mắt'], ['口', 'くち', 'kuchi', 'khẩu', 'miệng'], ['手', 'て', 'te', 'thủ', 'bàn tay'], ['足', 'あし', 'ashi', 'túc', 'bàn chân'], ['耳', 'みみ', 'mimi', 'nhĩ', 'tai'], ['車', 'くるま', 'kuruma', 'xa', 'xe hơi'], ['雨', 'あめ', 'ame', 'vũ', 'mưa'], ['本', 'ほん', 'hon', 'bản', 'sách'], ['一', 'いち', 'ichi', 'nhất', 'một'], ['二', 'に', 'ni', 'nhị', 'hai'], ['三', 'さん', 'san', 'tam', 'ba'], ['五', 'ご', 'go', 'ngũ', 'năm'], ['六', 'ろく', 'roku', 'lục', 'sáu'], ['七', 'なな', 'nana', 'thất', 'bảy'], ['八', 'はち', 'hachi', 'bát', 'tám'], ['九', 'きゅう', 'kyuu', 'cửu', 'chín'], ['十', 'じゅう', 'juu', 'thập', 'mười'], ['百', 'ひゃく', 'hyaku', 'bách', 'trăm'], ['千', 'せん', 'sen', 'thiên', 'nghìn'], ['上', 'うえ', 'ue', 'thượng', 'trên'], ['下', 'した', 'shita', 'hạ', 'dưới'], ['中', 'なか', 'naka', 'trung', 'giữa, trong'], ['右', 'みぎ', 'migi', 'hữu', 'bên phải'], ['左', 'ひだり', 'hidari', 'tả', 'bên trái'], ['男', 'おとこ', 'otoko', 'nam', 'đàn ông'], ['女', 'おんな', 'onna', 'nữ', 'phụ nữ']];
const TRICKY = { shi: 'し đọc "shi" (không phải "si")', chi: 'ち đọc "chi" (không phải "ti")', tsu: 'つ đọc "tsu" (không phải "tu")', fu: 'ふ đọc "fu" (không phải "hu")', ji: 'じ đọc "ji" (không phải "zi")', wo: 'を đọc là "o" (khi là trợ từ), gõ bàn phím là "wo"', n: 'ん luôn là "n"', wa: 'わ đọc "wa"' };
function mutRomaji(r) {
  const out = new Set(), reps = [['shi', 'si'], ['chi', 'ti'], ['tsu', 'tu'], ['fu', 'hu'], ['ji', 'zi'], ['sh', 's'], ['ch', 't'], ['ou', 'o'], ['oo', 'o'], ['ii', 'i'], ['aa', 'a'], ['ei', 'e'], ['kk', 'k'], ['ss', 's'], ['tt', 't'], ['pp', 'p'], ['ky', 'k'], ['ry', 'r'], ['ja', 'za'], ['n', 'm']];
  for (const [a, b] of reps) if (r.includes(a)) out.add(r.replace(a, b));
  if (!/[kstp]{2}/.test(r)) { const m = r.match(/[aiueo]([ktsp])[aiueo]/); if (m) out.add(r.replace(m[0], m[0][0] + m[1] + m[1] + m[0][2])); }
  if (r.length > 3) out.add(r.slice(0, 2) + r[3] + r[2] + r.slice(4));
  out.add(r.replace(/[aiueo]/, v => 'aiueo'[('aiueo'.indexOf(v) + 1) % 5]));
  out.add(r + (/[aiueo]$/.test(r) ? r[r.length - 1] : 'u'));
  out.delete(r); return [...out].filter(x => x && x !== r);
}
function romQuestion(key) {
  const [, mode, idx] = key.split(':'), I = +idx;
  const pickSet = (ans, pool, near) => { const set = []; shuffle(near.filter(x => x !== ans)).forEach(x => { if (set.length < 3 && !set.includes(x)) set.push(x); }); for (const x of shuffle(pool)) { if (set.length >= 3) break; if (x !== ans && !set.includes(x)) set.push(x); } return set; };
  if (mode === 'hr' || mode === 'kr' || mode === 'hk2') {
    const K = KANA_ALL[I], ch = mode === 'kr' ? K.k : K.h, script = mode === 'kr' ? 'katakana' : 'hiragana';
    const near = KANA_ALL.filter(x => x.y === K.y && (x.r[0] === K.r[0] || x.r.slice(-1) === K.r.slice(-1))).map(x => x.r).concat(mutRomaji(K.r));
    const set = pickSet(K.r, KANA_ALL.filter(x => x.y === K.y).map(x => x.r), near), c = [K.r, ...set];
    return { id: key, t: 'm', d: K.y ? 3 : K.base ? 1 : 2, l: 0, q: `「${ch}」を ローマ字で かくと どれですか。`, qv: `Chữ ${script} 「${ch}」 đọc là gì (romaji)?`, c, ex: `「${K.h}」 (hiragana) = 「${K.k}」 (katakana) = "${K.r}". ${TRICKY[K.r] ? TRICKY[K.r] + '.' : ''}${K.y ? ' Chữ nhỏ ゃ ゅ ょ ghép với chữ đứng trước thành một âm tiết.' : ''}`, w: [[K.h, K.r, 'hiragana'], [K.k, K.r, 'katakana']], cv: c.map((x, n) => n === 0 ? 'đúng' : 'romaji khác'), nf: true };
  }
  if (mode === 'wr' || mode === 'kw') {
    const lst = mode === 'wr' ? HW : KW, [w, r, m] = lst[I], script = mode === 'wr' ? 'hiragana' : 'katakana';
    const near = mutRomaji(r), pool = lst.map(x => x[1]);
    const set = pickSet(r, pool.filter(x => Math.abs(x.length - r.length) <= 2), near), c = [r, ...set];
    const rules = [/っ|ッ/.test(w) ? 'Chữ っ/ッ nhỏ nhân đôi phụ âm sau nó.' : '', /ー/.test(w) ? 'Dấu ー kéo dài nguyên âm: lặp lại nguyên âm trước đó (koohii).' : '', /[おこそとのほもよろ]う|[えけせてねへめれ]い/.test(w) ? 'おう → "ou", えい → "ei" (âm kéo dài).' : '', /[ゃゅょ]/.test(w) ? 'ゃ ゅ ょ nhỏ ghép với chữ trước (しゃ = sha).' : ''].filter(Boolean).join(' ');
    return { id: key, t: 'm', d: w.length <= 3 ? 1 : w.length <= 5 ? 2 : 3, l: 0, q: `「${w}」を ローマ字で かくと どれですか。`, qv: `Từ ${script} 「${w}」 (${m}) viết bằng romaji?`, c, ex: `「${w}」 = "${r}" (${m}). ${rules}`, w: [[w, r, m]], cv: c.map((x, n) => n === 0 ? m : 'romaji sai'), nf: true };
  }
  const [k, yomi, romaji, hv, mean] = PK[I];
  if (mode === 'jr') { // kanji → hiragana
    const near = PK.filter(x => x[1] !== yomi).map(x => x[1]), set = pickSet(yomi, near, near.filter(x => Math.abs(x.length - yomi.length) <= 1)), c = [yomi, ...set];
    return { id: key, t: 'k', d: 1, l: 0, qh: `「${esc(k)}」の よみかたは どれですか。`, q: `「${k}」の よみかたは どれですか。`, qv: `Chữ Hán 「${k}」 đọc là gì?`, c, ex: `「${k}」 (${hv}) = ${mean}, đọc là 「${yomi}」 (${romaji}).`, w: [[k, yomi, mean]], cv: c.map((x, n) => n === 0 ? mean : '(cách đọc khác)'), nf: true };
  }
  if (mode === 'jo') { // kanji → romaji
    const near = PK.filter(x => x[2] !== romaji).map(x => x[2]), set = pickSet(romaji, near, mutRomaji(romaji).concat(near.filter(x => Math.abs(x.length - romaji.length) <= 1))), c = [romaji, ...set];
    return { id: key, t: 'k', d: 2, l: 0, qh: `「${esc(k)}」を ローマ字で よむと どれですか。`, q: `「${k}」を ローマ字で よむと どれですか。`, qv: `Chữ Hán 「${k}」 đọc bằng romaji?`, c, ex: `「${k}」 (${hv}) = ${mean}, đọc là 「${yomi}」 = "${romaji}".`, w: [[k, yomi, mean]], cv: c.map((x, n) => n === 0 ? mean : '(sai)'), nf: true };
  }
  // 'jj': hiragana → kanji
  const near = PK.filter(x => x[0] !== k).map(x => x[0]), set = pickSet(k, near, near), c = [k, ...set];
  return { id: key, t: 'k', d: 2, l: 0, q: `「${yomi}」を かんじで かくと どれですか。`, qv: `Viết 「${yomi}」 (${mean}) bằng chữ Hán.`, c, ex: `「${yomi}」 = 「${k}」 (${hv}) — ${mean}.`, w: [[k, yomi, mean]], cv: c.map((x, n) => n === 0 ? mean : (PK.find(p2 => p2[0] === x) || [])[4] || ''), nf: true };
}
function romKey(d) {
  if (d === 1) { const m = pick(['hr', 'hr', 'kr', 'kr', 'jr', 'jr', 'wr']); if (m === 'jr') return `rom:jr:${ri(PK.length)}`; if (m === 'wr') return `rom:wr:${ri(12)}`; return `rom:${m}:${ri(46)}`; }
  if (d === 2) { const m = pick(['hr', 'kr', 'wr', 'kw', 'jo', 'jj', 'jj']); if (m === 'jo' || m === 'jj') return `rom:${m}:${ri(PK.length)}`; if (m === 'wr') return `rom:wr:${12 + ri(HW.length - 12 - 8)}`; if (m === 'kw') return `rom:kw:${ri(10)}`; return `rom:${m}:${46 + ri(23)}`; }
  const m = pick(['hr', 'kr', 'wr', 'kw']); if (m === 'wr') return `rom:wr:${HW.length - 12 + ri(12)}`; if (m === 'kw') return `rom:kw:${10 + ri(KW.length - 10)}`; return `rom:${m}:${69 + ri(33)}`;
}
/* tỉ trọng từng loại động theo chương (chương 0 chỉ luyện romaji; kana nhiều ở chương 1) */
const DYN_W = [
  { rom: 10 },
  { kana: 3, num: 2, time: 2, read: 3, write: 2, cat: 2 },
  { kana: 0.4, num: 1, time: 2, read: 3, write: 2, cat: 2 },
  { kana: 0.2, num: 0.6, time: 1, read: 3, write: 2, cat: 2 },
  { kana: 0.1, num: 0.5, time: 0.8, read: 3, write: 2, cat: 1.5 },
  { kana: 0.1, num: 0.4, time: 0.6, read: 3, write: 2, cat: 1.2 },
  { kana: 0.1, num: 0.4, time: 0.5, read: 3, write: 2, cat: 1 },
  { kana: 0.1, num: 0.3, time: 0.4, read: 3, write: 2, cat: 1 },
  { kana: 0.1, num: 0.3, time: 0.4, read: 3, write: 2, cat: 1 }
];
