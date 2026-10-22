'use strict';
/* ===== Kịch bản (generator): hội thoại, lựa chọn, chuyển cảnh, NPC, cửa, trainer, boss ===== */
function* say(name, vi, jp) {
  const d = $('#dlg'); let go = false;
  d.innerHTML = `${name ? `<div class="nm">${esc(name)}</div>` : ''}${jp ? `<div class="jp">${furi(jp)}</div>` : ''}<div class="vi">${esc(vi || '')}</div><div class="nx">▼</div>`;
  d.hidden = false; d.onclick = () => { go = true; };
  Inp.a = Inp.b = 0; yield 4;
  yield () => { if (Inp.a || Inp.b || go) { Inp.a = Inp.b = 0; return true; } return false; };
  d.hidden = true; Snd.tap();
}
function* choose(title, opts, cols) {
  const m = $('#bmenu'); let r = -1, fi = opts.findIndex(o => !o.dis); const prev = { u: 0, d: 0, l: 0, r: 0 };
  m.className = cols === 3 ? 'col3' : '';
  m.innerHTML = (title ? `<div class="ti">${title}</div>` : '') + opts.map((o, i) => `<button class="mb" data-i="${i}" ${o.dis ? 'disabled' : ''}>${o.t}${o.s ? `<small>${o.s}</small>` : ''}</button>`).join('');
  m.hidden = false; $$('.mb', m).forEach(b => b.addEventListener('click', () => { if (r < 0) r = +b.dataset.i; }));
  const btns = $$('.mb', m); const focus = () => btns.forEach((b, i) => { b.style.outline = i === fi ? '3px solid #2f9bd6' : ''; }); focus();
  Inp.a = Inp.b = 0; yield 4;
  yield () => {
    for (const k of ['u', 'd', 'l', 'r']) {
      if (Inp.held[k] && !prev[k]) { const n = opts.length; let j = fi; for (let t = 0; t < n; t++) { j = (j + (k === 'u' || k === 'l' ? -1 : 1) + n) % n; if (!opts[j].dis) break; } fi = j; focus(); }
      prev[k] = Inp.held[k];
    }
    if (Inp.a && fi >= 0) { Inp.a = 0; r = fi; }
    if (Inp.b && opts.cancel != null) { Inp.b = 0; r = opts.cancel; }
    return r >= 0;
  };
  m.hidden = true; Snd.tap(); return r;
}
function* fade(to, n = 10) { const a = Fx.fade, step = (to - a) / n; for (let i = 0; i < n; i++) { Fx.fade = clamp(Fx.fade + step, 0, 1); yield 1; } Fx.fade = to; }
function* warpTo(map, x, y, dir) { yield* fade(1, 8); loadMap(map, x, y, dir); yield 2; yield* fade(0, 8); }
function* npcStep(n, d) {
  const [dx, dy] = DIRS[d]; n.dir = d; n.walk = true;
  for (let f = 1; f <= 8; f++) { n.ox = dx * f * 2; n.oy = dy * f * 2; yield 1; }
  n.x += dx; n.y += dy; n.ox = n.oy = 0; n.walk = false;
}
function* whiteout() {
  yield* say('', 'Tất cả Tideling của bạn đã kiệt sức... Bạn được đưa về trạm y tế.');
  yield* fade(1, 10); healAll(); loadMap(`i${S.cur}_town`, 3, 4, 'd'); yield 4; yield* fade(0, 10); save();
}

/* ---- NPC ---- */
function objective() {
  const i = S.cur, c = CH[i];
  if (!S.flags.starter) return 'Gặp cô Mika ở giữa thị trấn để nhận Tideling đầu tiên.';
  if (!S.flags.drill0 && i === 0) return 'Học bảng chữ cái với Thầy Sora (người đứng gần hồ nước).';
  if (!S.flags.caught0 && i === 0) return 'Đi lên đường mòn phía bắc, bắt một Tideling hoang dã bằng lưới.';
  if (!S.flags['boss' + i]) return `Đánh bại ${c.boss.name} trong ngôi nhà ở cuối đường mòn. (Nên đạt cấp ${baseLv(i) + 3} trở lên.)`;
  if (i < 7 && S.maxCh <= i) return 'Hãy mở Hải đồ để ra khơi.';
  if (i < 7) return `Mở Hải đồ (MENU → Hải đồ) và đi tiếp tới ${CH[i + 1].vi}.`;
  return 'Bạn đã hoàn thành cuộc phiêu lưu! Hãy bắt đủ 150 Tideling và ôn lại câu sai.';
}
function* talk(n) {
  const i = S.cur, c = CH[i];
  if (n.kind === 'mika') return yield* mika();
  if (n.kind === 'elder') {
    yield* say(n.name, `Chào mừng đến ${c.vi}! Ở đây chúng ta học: ${c.topic}.`, 'ようこそ！');
    yield* say(n.name, c.phrases[0][1], c.phrases[0][0]);
    yield* say(n.name, 'Việc cần làm: ' + objective());
    return;
  }
  if (n.kind === 'phrase') { const p = c.phrases[n.n % c.phrases.length]; yield* say(n.name, p[1], p[0]); return yield* offerChallenge(n, 1, 10); }
  if (n.kind === 'nurse') return yield* nurse(n);
  if (n.kind === 'shop') return yield* shopMenu(n);
  if (n.kind === 'lesson') return yield* lessonNpc(n);
  if (n.kind === 'kid') return yield* kidNpc(n);
  if (n.kind === 'sensei') return yield* sensei(n);
  if (n.kind === 'item') return yield* pickup(n);
  if (n.kind === 'trainer' || n.kind === 'boss') {
    if (S.defeated[n.id]) return yield* say(n.name, n.kind === 'boss' ? 'Trận đấu hay lắm! Hãy tiếp tục ôn tập nhé.' : 'Bạn mạnh thật đấy!', 'またね！');
    return yield* fightTrainer(n);
  }
}
function* pickup(n) {
  const m = Wd.map; (S.taken[m.id] = S.taken[m.id] || {})[n.id] = 1; Wd.npcs = Wd.npcs.filter(x => x !== n);
  if (n.key === 'buoy') { S.items.buoy = 1; yield* say('', 'Bạn nhặt được "Dây phao"! Có thể dùng để mở lối tắt chuỗi phao trên Hải đồ.'); }
  else if (n.key === 'pouch') { S.pearls += 60; yield* say('', 'Bạn nhặt được túi ngọc trai: +60 💎'); }
  else { S.bag.fruit += 2; yield* say('', 'Bạn nhặt được 2 Tidefruit 🍎 (hồi 40 HP).'); }
  Snd.ok();
}
function* mika() {
  if (!S.flags.starter) {
    yield* say('Cô Mika', 'Chào mừng đến Quần đảo San Hô! Cô là Mika, người dẫn đường cho các thuyền viên mới.', 'はじめまして。わたしは ミカです。');
    yield* say('Cô Mika', 'Ở đây, mỗi chiêu của Tideling đều cần bạn TRẢ LỜI ĐÚNG một câu hỏi tiếng Nhật. Đúng → chiêu trúng. Sai → chiêu hụt, và câu đó sẽ được hỏi lại sau.');
    yield* say('Cô Mika', 'Tideling chia 3 hệ: Thú 🐾 thắng Năng lực, Năng lực 🔮 thắng Nguyên tố, Nguyên tố 🔥 thắng Thú. Hãy chọn người bạn đầu tiên!', 'どれが いいですか。');
    for (; ;) {
      const opts = [0, 1, 2].map(sp => ({ t: `${GROUP_ICON[sp]} ${spName(sp)}`, s: GROUP_NAME[sp] }));
      const r = yield* choose('Chọn Tideling đầu tiên', opts, 3);
      yield* say('', `Bạn chọn ${spName(r)} (${GROUP_NAME[r]})?`);
      const ok = yield* choose('Xác nhận', [{ t: 'Chọn bạn này' }, { t: 'Xem lại' }]);
      if (ok === 0) {
        const m = newMon(r, 5); S.party.push(m); S.seen[r] = 1; S.caught[r] = 1;
        S.flags.starter = 1; S.bag.net = Math.max(S.bag.net, 5);
        yield* say('Cô Mika', `${spName(r)} đã là bạn của bạn! Cô tặng thêm 5 lưới Tideling 🕸 và 3 Tidefruit 🍎.`, 'がんばって ください！');
        break;
      }
    }
    yield* say('Cô Mika', 'Nhớ nói chuyện với Thầy Sora bên hồ để luyện bảng chữ cái, rồi đi lên phía bắc nhé. Nhấn MENU để mở Hải đồ, Sổ Tideling và Tiến độ học.');
    save();
  } else {
    yield* say('Cô Mika', 'Việc cần làm: ' + objective(), 'がんばって！');
  }
}
function* sensei(n) {
  const i = S.cur, c = CH[i], first = !S.flags['drill' + i];
  yield* say(n.name, i === 0 ? 'Chào em! Thầy dạy chữ cái và những câu đầu tiên. Làm 3 câu luyện tập nhé? (Làm đúng ít nhất 2 câu lần đầu sẽ có thưởng.)' : `Thầy ôn bài ${c.lessons[0]}–${c.lessons[1]} cho em. Làm 3 câu nhé?`, i === 0 ? 'ひらがなを れんしゅう しましょう。' : 'れんしゅう しましょう。');
  const r = yield* choose('', [{ t: 'Luyện tập 3 câu' }, { t: 'Để sau' }]);
  if (r !== 0) return;
  let ok = 0;
  for (let k = 0; k < 3; k++) { const res = yield* Quiz.ask({ area: 'drill' }); if (res.ok) ok++; }
  if (ok >= 2 && first) { S.flags['drill' + i] = 1; S.pearls += 40; S.bag.fruit += 1; yield* say(n.name, `Giỏi lắm! ${ok}/3 câu đúng. Thưởng 40 💎 và 1 Tidefruit 🍎.`, 'すばらしい！'); }
  else yield* say(n.name, `${ok}/3 câu đúng. ${ok >= 2 ? 'Rất tốt!' : 'Đừng lo, câu sai sẽ được hỏi lại. Cứ luyện thêm nhé!'}`, ok >= 2 ? 'いいですね！' : 'もういちど！');
  save();
}
function* nurse(n) {
  yield* say(n.name, 'Chào mừng đến trạm y tế! Để cô chữa cho các Tideling của bạn nhé.', 'おだいじに。');
  yield* fade(1, 8); healAll(); yield 20; Snd.lvl(); yield* fade(0, 8);
  yield* say(n.name, 'Xong rồi! Tideling của bạn đã khoẻ mạnh hoàn toàn. Chúc bạn may mắn!', 'いってらっしゃい！'); save();
}
function* shopMenu(n) {
  yield* say(n.name, 'Xin chào quý khách! Tiệm bán đồ cho thuyền viên đây.', 'いらっしゃいませ！');
  for (; ;) {
    const opts = [
      { t: '🕸 Lưới Tideling', s: '20 💎', dis: S.pearls < 20 }, { t: '🍎 Tidefruit (hồi 40 HP)', s: '15 💎', dis: S.pearls < 15 },
      { t: '🕸 Siêu lưới (+20% bắt)', s: '60 💎', dis: S.pearls < 60 }, { t: 'Thoát', s: `Bạn có ${S.pearls} 💎` }];
    const r = yield* choose('Mua gì nào?', opts);
    if (r === 0) { S.pearls -= 20; S.bag.net++; } else if (r === 1) { S.pearls -= 15; S.bag.fruit++; } else if (r === 2) { S.pearls -= 60; S.bag.snet++; } else break;
    Snd.ok();
  }
  yield* say(n.name, 'Cảm ơn quý khách!', 'ありがとうございました！');
}
/* thẻ ghi chú ngữ pháp */
function noteHtml(note) { return `<div class="box"><b>${furi(note.t)}</b><div style="margin:4px 0">${esc(note.b)}</div>${note.ex.map(e => `<div style="margin-top:4px"><span style="font-size:19px">${furi(e[0])}</span><div class="vi" style="font-size:13px">${esc(e[1])}</div></div>`).join('')}</div>`; }
function* showNotes(notes, title) {
  yield* modalRun(done => { showModal(modalCard(`<h2>${title}</h2>${notes.map(noteHtml).join('')}<div class="foot"><button class="btn" data-k="back">Đã hiểu ⏎</button></div>`)); wireBack(done); }, escBack);
}
function* bookshelf() {
  yield* say('', 'Giá sách chất đầy sách ngữ pháp. Bạn mở ra đọc...');
  yield* showNotes(NOTES[S.cur], `📚 Ngữ pháp ${CH[S.cur].vi} (bài ${CH[S.cur].lessons[0]}–${CH[S.cur].lessons[1]})`);
}
function* challenge(n, count, reward) {
  const key = 'ch_' + n.id; let ok = 0;
  for (let k = 0; k < count; k++) { const r = yield* Quiz.ask({ area: 'drill' }); if (r.ok) ok++; }
  const need = Math.ceil(count * 2 / 3);
  if (ok >= need && !S.flags[key]) { S.flags[key] = 1; S.pearls += reward; Snd.lvl(); yield* say(n.name, `Giỏi quá! ${ok}/${count} câu đúng. Thưởng ${reward} 💎!`, 'すごい！'); }
  else yield* say(n.name, `${ok}/${count} câu đúng. ${ok >= need ? 'Rất tốt!' : 'Cố lên, lần sau sẽ tốt hơn!'}`, ok >= need ? 'いいですね！' : 'がんばって！');
  save();
}
function* offerChallenge(n, count, reward, text) {
  const first = !S.flags['ch_' + n.id];
  const r = yield* choose('', [{ t: `Thử tài (${count} câu)`, s: first ? `Lần đầu thưởng ${reward} 💎` : 'Luyện tập thêm' }, { t: 'Để sau' }]);
  if (r === 0) yield* challenge(n, count, reward);
}
function* lessonNpc(n) {
  const note = NOTES[S.cur][n.n % NOTES[S.cur].length];
  yield* say(n.name, 'Lại đây, bà giảng cho cháu một chút ngữ pháp nhé.', 'いらっしゃい。');
  yield* showNotes([note], '📖 Bài học nhỏ');
  yield* say(n.name, 'Giờ thử tài nào! Trả lời đúng sẽ có thưởng (lần đầu).', 'やってみましょう！');
  yield* offerChallenge(n, 2, 30);
}
function* kidNpc(n) {
  const v = pick(VOC.filter(x => x.l >= CH[S.cur].lessons[0] && x.l <= CH[S.cur].lessons[1] && x.w !== x.r));
  yield* say(n.name, `Anh/chị ơi, từ này nghĩa là "${v.m}". Đọc là gì nhỉ?`, v.w);
  yield* say(n.name, `Đọc là "${v.r}"!`, v.r);
  yield* say(n.name, 'Em thi đố anh/chị nhé!', 'クイズを しましょう！');
  yield* offerChallenge(n, 3, 45);
}
function* fightTrainer(n) {
  const i = S.cur, c = CH[i], boss = n.kind === 'boss';
  const ph = c.phrases[ri(c.phrases.length)];
  if (boss) {
    yield* say(n.name, `Ta là ${n.name}, người gác đảo ${c.vi}. Chủ đề ở đây: ${c.topic}. Cho ta xem bạn học được gì!`, 'しょうぶ です！');
  } else yield* say(n.name, 'Đấu với tôi nào!' + (rand() < .5 ? '' : ' Thử trả lời câu hỏi cho kịp nhé.'), 'しょうぶ しましょう！');
  const foes = teamFor(i, boss ? 'boss' : Wd.map.area === 'gym' ? 'gym' : 'route', n.t || 0);
  const res = yield* battle({ kind: boss ? 'boss' : 'trainer', name: n.name, foes, area: boss ? 'boss' : Wd.map.area === 'gym' ? 'gym' : 'route' });
  if (res === 'lose') return yield* whiteout();
  if (res !== 'win') return;
  S.defeated[n.id] = 1;
  const gain = boss ? 250 + i * 60 : 30 + i * 12; S.pearls += gain;
  if (boss) {
    S.flags['boss' + i] = 1; if (!S.badges.includes(i)) S.badges.push(i);
    const next = Math.min(7, i + 1); S.maxCh = Math.max(S.maxCh, next);
    yield* say(n.name, `Bạn thắng rồi! Nhận ${gain} 💎 và Huy hiệu ${c.vi}.`, 'おめでとう！');
    yield* say('', i < 7 ? `Hoàn thành Chương ${i + 1}! Đảo ${CH[next].vi} đã mở khoá — mở Hải đồ (MENU) để ra khơi.` : 'Bạn đã chinh phục cả Quần đảo San Hô! Chúc mừng thuyền trưởng!');
    Snd.lvl();
  } else yield* say(n.name, `Bạn mạnh thật! Nhận ${gain} 💎.`, 'つよいですね！');
  save();
}
function* trainerSpot(n, k) {
  n.alert = true; Snd.tap(); yield 24; n.alert = false;
  for (let j = 1; j < k; j++) yield* npcStep(n, n.dir);
  Wd.face = OPP[n.dir]; S.dir = Wd.face;
  yield* fightTrainer(n);
}
function* wildEncounter() {
  const i = S.cur, base = baseLv(i);
  let sp = pick(speciesOfChapter(i)); if (i > 0 && rand() < .15) sp = pick(speciesOfChapter(ri(i)));
  const lv = clamp(base - 1 + ri(4), 2, 60), foe = newMon(sp, lv); S.seen[sp] = 1;
  const res = yield* battle({ kind: 'wild', name: '', foes: [foe], area: Wd.map.area === 'gym' ? 'gym' : 'route' });
  if (res === 'lose') yield* whiteout();
}
function teamFor(i, role, t) {
  const b = baseLv(i), pool = speciesOfChapter(i);
  const mon = (lvOff, k) => newMon(pool[(i * 5 + t * 7 + k * 4) % pool.length], clamp(b + lvOff, 2, 60));
  if (role === 'boss') return [mon(3, 0), mon(4, 1), mon(5, 2)].map(m => { S.seen[m.sp] = 1; return m; });
  if (role === 'gym') return [mon(2, t), mon(2, t + 1)].map(m => { S.seen[m.sp] = 1; return m; });
  return [mon(1, t)].map(m => { S.seen[m.sp] = 1; return m; });
}
