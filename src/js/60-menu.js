'use strict';
/* ===== Menu: Nhật ký, Đội hình, Túi đồ, Hộp, Hải đồ, Sổ Tideling, Tiến độ học, Lưu, Cài đặt ===== */
const cvThumb = (sp, form, sil) => `<canvas data-sp="${sp}" data-form="${form}" data-sil="${sil ? 1 : 0}" width="104" height="104"></canvas>`;
function paintThumbs(root) { $$('canvas[data-sp]', root).forEach(c => { c.getContext('2d').drawImage(tidelingCanvas(+c.dataset.sp, +c.dataset.form, 104, c.dataset.sil === '1'), 0, 0); }); }
/* mở modal, chờ đến khi done(value) được gọi */
function* modalRun(build, onKey) {
  let res; let fin = false; const done = v => { if (!fin) { fin = true; res = v; } };
  build(done); paintThumbs(modalEl);
  if (onKey) Modal.onKey = e => onKey(e, done);
  yield () => fin; closeModal(); return res;
}
const bar = (v, m, cls) => `<div class="bar ${cls || (v / m < .25 ? 'cr' : v / m < .5 ? 'lo' : '')}" style="background:#cfd6df"><i style="width:${Math.max(0, v / m * 100)}%"></i></div>`;
function monRow(m, extra) { return `<div class="item">${cvThumb(m.sp, m.form)}<div class="grow"><b>${spName(m.sp, m.form)}</b> <span class="chip">Lv${m.lv}</span> <span class="chip">${GROUP_ICON[grp(m.sp)]} ${GROUP_NAME[grp(m.sp)]}</span><div style="font-size:13px">HP ${m.hp}/${mhp(m)} · XP ${m.xp}/${needXp(m)}</div>${bar(m.hp, mhp(m))}</div>${extra || ''}</div>`; }

function* mainMenu() {
  for (; ;) {
    const pick_ = yield* modalRun(done => {
      const items = [['journal', '📜 Nhật ký'], ['party', '🐾 Đội hình'], ['bag', '🎒 Túi đồ'], ['box', '📦 Hộp'], ['sea', '🧭 Hải đồ'], ['dex', '📖 Sổ Tideling'], ['prog', '📊 Tiến độ học'], ['save', '💾 Lưu'], ['opt', '⚙ Cài đặt']];
      showModal(modalCard(`<h2>Menu</h2><div class="list">${items.map(([k, t]) => `<button class="btn g" data-k="${k}" style="text-align:left">${t}</button>`).join('')}</div><div class="foot"><button class="btn" data-k="close">Đóng (Esc)</button></div>`));
      $$('[data-k]', modalEl).forEach(b => b.addEventListener('click', () => done(b.dataset.k)));
    }, (e, done) => { if (e.key === 'Escape' || e.key === 'm' || e.key === 'x') { done('close'); return true; } return false; });
    if (pick_ === 'close' || pick_ == null) return;
    if (pick_ === 'journal') yield* scrJournal();
    else if (pick_ === 'party') yield* scrParty();
    else if (pick_ === 'bag') yield* scrBag();
    else if (pick_ === 'box') yield* scrBox();
    else if (pick_ === 'sea') { const r = yield* scrSea(); if (r) { yield* afterSea(r); return; } }
    else if (pick_ === 'dex') yield* scrDex();
    else if (pick_ === 'prog') yield* scrProgress();
    else if (pick_ === 'save') yield* scrSave();
    else if (pick_ === 'opt') { const r = yield* scrOpt(); if (r === 'reset') return; }
  }
}
const backBtn = `<div class="foot"><button class="btn" data-k="back">← Quay lại</button></div>`;
const wireBack = done => { $$('[data-k=back]', modalEl).forEach(b => b.addEventListener('click', () => done('back'))); };
const escBack = (e, done) => { if (e.key === 'Escape' || e.key === 'x') { done('back'); return true; } return false; };

function* scrJournal() {
  yield* modalRun(done => {
    const rows = CH.map((c, i) => {
      const cleared = !!S.flags['boss' + i], open = i <= S.maxCh;
      return `<div class="item"><div style="font-size:22px">${cleared ? '✅' : open ? '▶️' : '🔒'}</div><div class="grow"><b>Chương ${i + 1} · ${c.vi}</b> <span class="chip">Bài ${c.lessons[0]}–${c.lessons[1]}</span><div style="font-size:13px" class="vi">${c.topic}<br>Boss: ${c.boss.name}</div></div></div>`;
    }).join('');
    showModal(modalCard(`<h2>📜 Nhật ký</h2><div class="box"><b>Việc cần làm:</b> ${esc(objective())}</div><div class="row" style="margin:6px 0"><span class="chip">💎 ${S.pearls}</span><span class="chip">🏅 Huy hiệu: ${S.badges.length}/8</span><span class="chip">📖 Sổ: ${caughtCount()}/150</span></div><div class="list">${rows}</div>${backBtn}`));
    wireBack(done);
  }, escBack);
}
function* scrParty() {
  for (; ;) {
    const r = yield* modalRun(done => {
      showModal(modalCard(`<h2>🐾 Đội hình (${S.party.length}/6)</h2><div class="list">${S.party.map((m, i) => monRow(m, i ? `<button class="btn g" data-lead="${i}">Lên đầu</button>` : '<span class="chip t">Dẫn đầu</span>')).join('')}</div>${backBtn}`));
      wireBack(done); $$('[data-lead]', modalEl).forEach(b => b.addEventListener('click', () => done(+b.dataset.lead)));
    }, escBack);
    if (r === 'back' || r == null) return;
    const m = S.party.splice(r, 1)[0]; S.party.unshift(m);
  }
}
function* scrBag() {
  for (; ;) {
    const r = yield* modalRun(done => {
      showModal(modalCard(`<h2>🎒 Túi đồ</h2><div class="list">
        <div class="item"><div style="font-size:26px">🕸</div><div class="grow"><b>Lưới Tideling</b> x${S.bag.net}<div class="vi" style="font-size:13px">Dùng trong trận với Tideling hoang dã (cần trả lời đúng một câu hỏi).</div></div></div>
        <div class="item"><div style="font-size:26px">🕸✨</div><div class="grow"><b>Siêu lưới</b> x${S.bag.snet}<div class="vi" style="font-size:13px">+20% tỉ lệ bắt.</div></div></div>
        <div class="item"><div style="font-size:26px">🍎</div><div class="grow"><b>Tidefruit</b> x${S.bag.fruit}<div class="vi" style="font-size:13px">Hồi 40 HP.</div></div><button class="btn g" data-use="1" ${S.bag.fruit <= 0 ? 'disabled' : ''}>Dùng</button></div>
        <div class="item"><div style="font-size:26px">🛟</div><div class="grow"><b>Dây phao</b> ${S.items.buoy ? '✔' : '— chưa có'}<div class="vi" style="font-size:13px">Vật phẩm đặc biệt để mở lối tắt "Chuỗi phao".</div></div></div>
        <div class="item"><div style="font-size:26px">💎</div><div class="grow"><b>Ngọc trai</b> ${S.pearls}</div></div></div>${backBtn}`));
      wireBack(done); $$('[data-use]', modalEl).forEach(b => b.addEventListener('click', () => done('use')));
    }, escBack);
    if (r !== 'use') return;
    const t = yield* modalRun(done => {
      showModal(modalCard(`<h2>Dùng Tidefruit cho ai?</h2><div class="list">${S.party.map((m, i) => monRow(m, `<button class="btn g" data-t="${i}" ${m.hp >= mhp(m) ? 'disabled' : ''}>Chọn</button>`)).join('')}</div>${backBtn}`));
      wireBack(done); $$('[data-t]', modalEl).forEach(b => b.addEventListener('click', () => done(+b.dataset.t)));
    }, escBack);
    if (typeof t === 'number') { const m = S.party[t]; m.hp = Math.min(mhp(m), m.hp + 40); S.bag.fruit--; Snd.ok(); }
  }
}
function* scrBox() {
  for (; ;) {
    const r = yield* modalRun(done => {
      showModal(modalCard(`<h2>📦 Hộp (${S.box.length})</h2><div class="list">${S.box.length ? S.box.map((m, i) => monRow(m, `<button class="btn g" data-sw="${i}">${S.party.length < 6 ? 'Vào đội' : 'Đổi với đội cuối'}</button>`)).join('') : '<div class="box vi">Hộp trống. Tideling bắt được khi đội đã đủ 6 con sẽ được gửi vào đây.</div>'}</div>${backBtn}`));
      wireBack(done); $$('[data-sw]', modalEl).forEach(b => b.addEventListener('click', () => done(+b.dataset.sw)));
    }, escBack);
    if (typeof r !== 'number') return;
    const m = S.box.splice(r, 1)[0];
    if (S.party.length < 6) S.party.push(m); else { const o = S.party.pop(); S.box.push(o); S.party.push(m); }
  }
}
function* scrDex() {
  let g = 0;
  for (; ;) {
    const r = yield* modalRun(done => {
      const ids = Array.from({ length: 50 }, (_, i) => i * 3 + g);
      const seen = ids.filter(i => S.seen[i]).length, got = ids.filter(i => S.caught[i]).length;
      showModal(modalCard(`<h2>📖 Sổ Tideling</h2><div class="row" style="margin-bottom:6px"><span class="chip t">Đã bắt ${caughtCount()}/150</span><span class="chip">Đã thấy ${Object.keys(S.seen).length}</span></div>
        <div class="tabs">${GROUP_NAME.map((n, k) => `<button class="tab ${k === g ? 'on' : ''}" data-g="${k}">${GROUP_ICON[k]} ${n} (${ids.length && k === g ? got : '·'})</button>`).join('')}</div>
        <div class="dexg">${ids.map(i => { const sn = S.seen[i], ct = S.caught[i]; const m = S.party.concat(S.box).find(x => x.sp === i); return `<div class="dc ${ct ? 'ct' : ''}">${cvThumb(i, ct && m ? m.form : 1, !sn)}<div>${sn ? spName(i) : '???'}</div><div style="opacity:.6">#${String(Math.floor(i / 3) * 3 + g + 1).padStart(3, '0')} · Đảo ${chapterOfSp(i) + 1}</div></div>`; }).join('')}</div>${backBtn}`));
      wireBack(done); $$('[data-g]', modalEl).forEach(b => b.addEventListener('click', () => done(+b.dataset.g)));
    }, escBack);
    if (typeof r !== 'number') return; g = r;
  }
}
function* scrProgress() {
  yield* modalRun(done => {
    const st = S.stats, acc = st.n ? Math.round(st.ok / st.n * 100) : 0;
    const boxes = [0, 0, 0, 0, 0]; Object.values(S.leit).forEach(r => boxes[r.b - 1]++);
    const tot = Object.keys(S.leit).length || 1;
    const types = Object.entries(st.by).map(([t, v]) => `<div>${TYPE_NAME[t] || t} <span class="vi">(${v.ok}/${v.n})</span></div><div style="min-width:120px"><div class="pgb"><i style="width:${v.n ? v.ok / v.n * 100 : 0}%"></i></div></div>`).join('');
    const weak = Object.entries(S.leit).filter(([, r]) => r.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 6).map(([id, r]) => { const q = Quiz.byId(id); return q ? `<div class="item"><div class="grow">${furi(q.q).slice(0, 400)}<div class="vi" style="font-size:12px">Sai ${r.wrong} lần · hộp ${r.b}/5</div></div></div>` : ''; }).join('');
    const kn = new Set(); VOC.filter(v => v.l <= lessonEnd(S.maxCh)).forEach(v => [...v.w].forEach(c => { if (isKanji(c)) kn.add(c); }));
    showModal(modalCard(`<h2>📊 Tiến độ học</h2>
      <div class="kv"><div>Số câu đã trả lời</div><b>${st.n}</b><div>Tỉ lệ đúng</div><b>${acc}%</b><div>Câu đang chờ hỏi lại</div><b>${S.pend.length}</b><div>Chữ Hán đã gặp (đến bài ${lessonEnd(S.maxCh)})</div><b>${kn.size}</b><div>Từ vựng đã mở</div><b>${VOC.filter(v => v.l <= lessonEnd(S.maxCh)).length}/${VOC.length}</b></div>
      <h3>Hộp Leitner (1 = cần ôn nhiều → 5 = đã thuộc)</h3><div class="row">${boxes.map((n, i) => `<div style="flex:1;min-width:48px;text-align:center"><div class="pgb" style="height:44px;display:flex;align-items:flex-end"><i style="width:100%;height:${Math.round(n / tot * 100)}%"></i></div><b>${i + 1}</b> <span class="vi">(${n})</span></div>`).join('')}</div>
      <h3>Theo loại câu hỏi</h3><div class="kv">${types || '<div class="vi">Chưa có dữ liệu</div>'}</div>
      <h3>Câu hay sai</h3><div class="list">${weak || '<div class="vi">Chưa có câu nào sai — tuyệt vời!</div>'}</div>${backBtn}`));
    wireBack(done);
  }, escBack);
}
function* scrSave() {
  const ok = save();
  yield* modalRun(done => { showModal(modalCard(`<h2>💾 Lưu game</h2><p>${ok ? 'Đã lưu vào trình duyệt này.' : 'Không lưu được (trình duyệt chặn bộ nhớ).'}</p>${backBtn}`)); wireBack(done); }, escBack);
}
function* scrOpt() {
  for (; ;) {
    const r = yield* modalRun(done => {
      showModal(modalCard(`<h2>⚙ Cài đặt</h2><div class="list">
        <button class="btn g" data-k="snd" style="text-align:left">🔊 Âm thanh: <b>${S.opt.sound ? 'Bật' : 'Tắt'}</b></button>
        <button class="btn g" data-k="furi" style="text-align:left">ふ Furigana: <b>${S.opt.furi === 'all' ? 'Luôn hiện' : 'Tự động (giảm dần theo chương)'}</b></button>
        <button class="btn g" data-k="reset" style="text-align:left;color:#b33">🗑 Xoá dữ liệu & chơi lại từ đầu</button></div>${backBtn}`));
      wireBack(done); $$('[data-k]:not([data-k=back])', modalEl).forEach(b => b.addEventListener('click', () => done(b.dataset.k)));
    }, escBack);
    if (r === 'snd') { S.opt.sound = S.opt.sound ? 0 : 1; applyOpts(); }
    else if (r === 'furi') { S.opt.furi = S.opt.furi === 'all' ? 'auto' : 'all'; applyOpts(); }
    else if (r === 'reset') {
      const c = yield* modalRun(done => { showModal(modalCard(`<h2>Xoá dữ liệu?</h2><p>Mọi tiến độ sẽ mất.</p><div class="foot"><button class="btn g" data-k="no">Huỷ</button><button class="btn" style="background:#c33" data-k="yes">Xoá</button></div>`)); $$('[data-k]', modalEl).forEach(b => b.addEventListener('click', () => done(b.dataset.k))); });
      if (c === 'yes') { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* bỏ qua */ } location.reload(); return 'reset'; }
    } else return;
  }
}

/* ===== Hải đồ (SVG) ===== */
const scCond = sc => sc.cond === 'duel' ? { ok: true, txt: sc.text } : sc.cond === 'item' ? { ok: !!S.items[sc.item], txt: sc.text + (S.items[sc.item] ? ' ✔' : '') }
  : sc.cond === 'dex' ? { ok: caughtCount() >= sc.n, txt: `${sc.text} (${caughtCount()}/${sc.n})` } : { ok: avgLv() >= sc.n, txt: `${sc.text} (hiện ${avgLv().toFixed(1)})` };
function canSail(to) {
  if (to === S.cur || to > S.maxCh) return false;
  if (Math.abs(to - S.cur) === 1) return true;
  return SHORTCUTS.some(sc => S.sc[sc.id] && ((sc.a === S.cur && sc.b === to) || (sc.b === S.cur && sc.a === to)));
}
function seaSvg(sel) {
  const P = ISLE_POS; let s = `<svg id="sea" viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b9fd8"/><stop offset="1" stop-color="#1d5f9a"/></linearGradient></defs><rect width="360" height="240" fill="url(#sg)"/>`;
  for (let i = 0; i < 26; i++) { const x = (i * 83) % 350, y = (i * 47) % 230; s += `<path d="M${x} ${y} q4 -3 8 0 t8 0" stroke="#ffffff55" fill="none" stroke-width="1"/>`; }
  s += `<g transform="translate(26 28)"><circle r="14" fill="#fff8" stroke="#fff" stroke-width="1"/><path d="M0 -11 L3 0 L0 11 L-3 0Z" fill="#e53935"/><path d="M-11 0 L0 -3 L11 0 L0 3Z" fill="#fff"/><text y="-16" text-anchor="middle" font-size="7" fill="#fff" font-weight="700">N</text></g>`;
  for (let i = 0; i < 7; i++) { const [x1, y1] = P[i], [x2, y2] = P[i + 1], op = i + 1 <= S.maxCh; s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="${op ? 2 : 1.2}" stroke-dasharray="${op ? '5 3' : '2 4'}" opacity="${op ? .85 : .35}"/>`; }
  SHORTCUTS.forEach(sc => {
    const [x1, y1] = P[sc.a], [x2, y2] = P[sc.b], len = Math.hypot(x2 - x1, y2 - y1), nx = (y2 - y1) / len, ny = -(x2 - x1) / len;
    const mx = (x1 + x2) / 2 + nx * sc.bend * 2, my = (y1 + y2) / 2 + ny * sc.bend * 2;
    const both = sc.b <= S.maxCh, open = !!S.sc[sc.id], col = open ? '#ffd54f' : both ? '#fff' : '#ffffff55';
    const qx = .25 * x1 + .5 * mx + .25 * x2, qy = .25 * y1 + .5 * my + .25 * y2;
    s += `<g class="scg" data-sc="${sc.id}" tabindex="0" style="cursor:pointer"><path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="${open ? 3 : 1.6}" stroke-dasharray="${open ? '' : '3 3'}" opacity="${both || open ? 1 : .5}"/><circle cx="${qx}" cy="${qy}" r="8.5" fill="${open ? '#ffd54f' : '#1d2433'}" stroke="${sel && sel.sc === sc.id ? '#fff' : col}" stroke-width="${sel && sel.sc === sc.id ? 2.5 : 1.2}" opacity="${both || open ? 1 : .55}"/><text x="${qx}" y="${qy + 3.6}" text-anchor="middle" font-size="10" opacity="${both || open ? 1 : .55}">${sc.icon}</text></g>`;
  });
  CH.forEach((c, i) => {
    const [x, y] = P[i], open = i <= S.maxCh, done = !!S.flags['boss' + i], selI = sel && sel.i === i;
    s += `<g class="isl" data-i="${i}" tabindex="0" opacity="${open ? 1 : .55}"><ellipse cx="${x}" cy="${y + 2}" rx="25" ry="15" fill="#0003"/><ellipse cx="${x}" cy="${y}" rx="24" ry="14.5" fill="#f1dca0" stroke="${selI ? '#fff' : '#d8c07a'}" stroke-width="${selI ? 3 : 1.2}"/><ellipse cx="${x}" cy="${y - 1.5}" rx="18" ry="10" fill="${open ? c.pal.g1 : '#8a9a98'}"/><circle cx="${x - 8}" cy="${y - 3}" r="3.6" fill="${open ? c.pal.tree : '#6c7a78'}"/><circle cx="${x + 7}" cy="${y + 1}" r="3" fill="${open ? c.pal.tree : '#6c7a78'}"/><circle cx="${x + 1}" cy="${y - 7}" r="2.4" fill="${open ? c.pal.tree : '#6c7a78'}"/>
      <circle cx="${x - 20}" cy="${y - 13}" r="7" fill="#1d2433" stroke="#fff" stroke-width="1"/><text x="${x - 20}" y="${y - 10}" text-anchor="middle" font-size="9" fill="#fff" font-weight="800">${i + 1}</text>
      <text x="${x}" y="${y + 24}" text-anchor="middle" font-size="7.5" fill="#fff" stroke="#0b2a44" stroke-width="2" paint-order="stroke" font-weight="700">${esc(c.vi)}</text>
      ${!open ? `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="12">🔒</text>` : ''}${done ? `<text x="${x + 18}" y="${y - 10}" font-size="11">🏅</text>` : ''}
      ${i === S.cur ? `<text x="${x + 2}" y="${y - 16}" text-anchor="middle" font-size="15">⛵</text>` : ''}</g>`;
  });
  return s + '</svg>';
}
function* scrSea() {
  let sel = { i: S.cur };
  for (; ;) {
    const r = yield* modalRun(done => {
      let info = '', act = '';
      if (sel.sc) {
        const sc = SHORTCUTS.find(x => x.id === sel.sc), cd = scCond(sc), both = sc.b <= S.maxCh, open = !!S.sc[sc.id];
        info = `<b>${sc.icon} ${sc.name}</b> — nối ${CH[sc.a].vi} ↔ ${CH[sc.b].vi}<div class="vi">Điều kiện: ${esc(cd.txt)}</div><div class="vi">${open ? '✔ Đã mở. Dùng để đi thẳng giữa hai đảo.' : both ? (cd.ok ? 'Đủ điều kiện!' : 'Chưa đủ điều kiện.') : '🔒 Cần mở khoá cả hai đảo trước.'}</div>`;
        if (!open) act = `<button class="btn" data-k="open" ${both && cd.ok ? '' : 'disabled'}>${sc.cond === 'duel' ? '⚔️ Thách đấu lính canh' : 'Mở lối tắt'}</button>`;
      } else {
        const c = CH[sel.i], open = sel.i <= S.maxCh;
        info = `<b>Chương ${sel.i + 1} · ${c.vi}</b> <span class="chip">Bài ${c.lessons[0]}–${c.lessons[1]}</span><div class="vi">${c.topic}</div><div class="vi">${open ? (S.flags['boss' + sel.i] ? '🏅 Đã hoàn thành' : 'Đã mở') : '🔒 Hoàn thành đảo trước để mở khoá'}${sel.i === S.cur ? ' · Bạn đang ở đây' : ''}</div>`;
        if (sel.i !== S.cur && open) act = canSail(sel.i) ? `<button class="btn" data-k="sail">⛵ Giương buồm</button>` : `<span class="vi">Chỉ đi được sang đảo liền kề, hoặc qua lối tắt đã mở.</span>`;
      }
      showModal(modalCard(`<h2>🧭 Hải đồ Coral Crown</h2>${seaSvg(sel)}<div class="box">${info}</div><div class="foot">${act}<button class="btn g" data-k="back">Đóng</button></div>`));
      { const cf = sel.sc ? $(`.scg[data-sc="${sel.sc}"]`, modalEl) : $(`.isl[data-i="${sel.i}"]`, modalEl); if (cf) cf.focus({ preventScroll: true }); }
      $$('.isl', modalEl).forEach(g => g.addEventListener('click', () => done({ sel: { i: +g.dataset.i } })));
      $$('.scg', modalEl).forEach(g => g.addEventListener('click', () => done({ sel: { sc: g.dataset.sc } })));
      $$('[data-k]', modalEl).forEach(b => b.addEventListener('click', () => done({ k: b.dataset.k })));
    }, (e, done) => { if (e.key === 'Escape' || e.key === 'x') { done({ k: 'back' }); return true; } return false; });
    if (r.sel) { sel = r.sel; continue; }
    if (r.k === 'sail') return { sail: sel.i };
    if (r.k === 'open') return { open: sel.sc };
    return null;
  }
}
function* afterSea(r) {
  if (r.sail != null) { yield* fade(1, 10); S.cur = r.sail; loadMap(`i${r.sail}_town`, DOCK.x, DOCK.y, 'u'); yield 6; yield* fade(0, 10); save(); return; }
  const sc = SHORTCUTS.find(x => x.id === r.open);
  if (sc.cond === 'duel') {
    yield* say(sc.guard.name, 'Muốn đi qua đường này à? Thắng ta trước đã!', 'しょうぶ しましょう！');
    const foes = [newMon(speciesOfChapter(sc.a)[3], sc.guard.lv), newMon(speciesOfChapter(sc.b)[5], sc.guard.lv + 1)]; foes.forEach(m => { S.seen[m.sp] = 1; });
    const res = yield* battle({ kind: 'trainer', name: sc.guard.name, foes, area: 'gym' });
    if (res === 'lose') return yield* whiteout();
    if (res !== 'win') return;
    S.sc[sc.id] = 1; yield* say('', `${sc.icon} Lối tắt "${sc.name}" đã mở!`);
  } else { S.sc[sc.id] = 1; Snd.lvl(); yield* say('', `${sc.icon} Lối tắt "${sc.name}" đã mở! Giờ bạn có thể đi thẳng giữa hai đảo.`); }
  save();
}
