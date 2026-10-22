'use strict';
/* ===== Hệ câu hỏi: chọn câu (độ khó theo vùng + Leitner), giao diện hỏi, bảng giải thích ===== */
const TYPE_NAME = { g: 'Ngữ pháp', p: 'Trợ từ', h: 'Chọn dạng đúng', r: 'Đọc hiểu', o: 'Sắp xếp câu', k: 'Kanji', v: 'Từ vựng', m: 'Chữ cái', n: 'Số & giờ' };
const DIFF_NAME = ['', 'Dễ', 'Vừa', 'Khó'];
/* hệ số độ khó theo vùng [d1,d2,d3]; chương sau dịch dần sang khó hơn */
const AREA_DL = { town: [9, 1, 0], route: [7, 3, 0.4], gym: [4, 5, 1.2], boss: [2, 4, 4], drill: [8, 2, 0] };
function diffWeights(ch, area) {
  const b = AREA_DL[area] || AREA_DL.route; let w = [b[0] * (1 - 0.08 * ch), b[1], b[2] * (1 + 0.3 * ch)];
  if (ch === 0 && area !== 'boss') w[2] = 0; // chương 1: d3 chỉ ở boss
  return w;
}
const Quiz = {
  cur: null, // câu đang hiển thị (cho bot/kiểm thử)
  byId(id) { if (id[0] === 's') return SQ.find(q => q.id === id) || null; return dynMake(id, S.cur); },
  leitW(q, ch) {
    const r = S.leit[q.id]; let w = 1;
    const inCh = q.l >= lessonStart(ch) && q.l <= lessonEnd(ch);
    w *= inCh ? 3 : 1;
    if (!r) w *= 3; else { w *= 1 + 2 * Math.min(r.wrong, 3); w *= (6 - r.b) / 3; }
    if (S.recent.includes(q.id)) w *= 0.03;
    return w;
  },
  next(ctx) {
    const ch = ctx.ch != null ? ctx.ch : S.cur;
    // 1) câu sai đến hạn hỏi lại (Leitner)
    if (!ctx.noRepeat) {
      const i = S.pend.findIndex(p => p.due <= S.qCount);
      if (i >= 0) { const p = S.pend.splice(i, 1)[0]; const q = this.byId(p.id); if (q && lessonStartOK(q, ch)) return q; }
    }
    const dw = diffWeights(ch, ctx.area || 'route');
    const d = 1 + [0, 1, 2].indexOf(wpick([0, 1, 2], i => dw[i]));
    const maxL = lessonEnd(ch);
    const gw = { st: 5 }; const dwt = DYN_W[ch];
    for (const k in dwt) gw[k] = dwt[k];
    for (let tries = 0; tries < 8; tries++) {
      const g = wpick(Object.keys(gw), k => gw[k]);
      let cands;
      if (g === 'st') {
        cands = SQ.filter(q => q.l <= maxL && q.d === d);
        if (!cands.length) cands = SQ.filter(q => q.l <= maxL && Math.abs(q.d - d) <= 1);
      } else {
        cands = [];
        for (let i = 0; i < 6; i++) { const key = dynKey(g, ch, d); if (!key) continue; const q = dynMake(key, ch); if (q && q.c.length === 4 && new Set(q.c).size === 4) cands.push(q); }
      }
      if (cands.length) return wpick(cands, q => this.leitW(q, ch));
    }
    return wpick(SQ.filter(q => q.l <= maxL), q => this.leitW(q, ch));
  },
  record(q, ok) {
    const r = S.leit[q.id] || (S.leit[q.id] = { b: 1, seen: 0, wrong: 0 });
    r.seen++; S.qCount++;
    if (ok) { r.b = Math.min(5, r.b + 1); S.streak++; } else {
      r.b = 1; r.wrong++; S.streak = 0;
      if (!S.pend.some(p => p.id === q.id)) S.pend.push({ id: q.id, due: S.qCount + 3 + ri(4) });
    }
    S.recent.push(q.id); if (S.recent.length > 8) S.recent.shift();
    const st = S.stats; st.n++; if (ok) st.ok++;
    const b = st.by[q.t] || (st.by[q.t] = { n: 0, ok: 0 }); b.n++; if (ok) b.ok++;
  },
  /* hỏi 1 câu: trả về {ok, fast, q} — dùng bằng yield* */
  *ask(ctx) {
    const q = this.next(ctx || {});
    return yield* this.show(q, ctx || {});
  },
  *show(q, ctx) {
    const order = shuffle([0, 1, 2, 3]);
    const choices = order.map(i => q.c[i]), cidx = order.indexOf(0);
    const st = { done: false, pick: -1, t0: FRAME };
    this.cur = { q, order, choices, cidx, st };
    const qHtml = q.qh || furi(q.q); // câu đọc/viết kanji (q.nf): không furigana để khỏi lộ đáp án
    const head = `<div class="row"><span class="chip t">${TYPE_NAME[q.t] || ''}</span><span class="chip d${q.d}">${DIFF_NAME[q.d]}</span><span class="chip">Bài ${q.l}</span>${S.streak > 1 ? `<span class="chip" style="background:#ffe9a8">🔥 ${S.streak}</span>` : ''}</div>`;
    const html = modalCard(`${head}<div class="timer"><i id="tbar"></i></div>
      ${q.p ? `<div class="q pass">${furi(q.p)}</div>` : ''}
      <div class="q">${qHtml}</div>
      <div class="choices">${choices.map((c, i) => `<button class="ch" data-i="${i}"><span class="n">${i + 1}</span><span>${q.nf ? esc(plain(c)) : furi(c)}</span></button>`).join('')}</div>`);
    const choose = i => { if (st.done) return; st.done = true; st.pick = i; st.t1 = FRAME; };
    showModal(html, e => {
      if (e.key >= '1' && e.key <= '4') { choose(+e.key - 1); return true; }
      return false;
    });
    $$('.ch', modalEl).forEach(b => b.addEventListener('click', () => choose(+b.dataset.i)));
    yield () => st.done;
    const ok = st.pick === cidx, el_ = st.t1 - st.t0;
    const fast = ok && el_ < 240 ? 1.3 : ok && el_ < 420 ? 1.15 : 1;
    this.record(q, ok);
    if (ok) Snd.ok(); else Snd.ng();
    yield* this.explain(q, choices, cidx, st.pick, ok, fast, ctx);
    this.cur = null;
    return { ok, fast, q, streak: S.streak };
  },
  *explain(q, choices, cidx, pick_, ok, fast, ctx) {
    const J = t => furi(t);
    const cv = q.cv || [];
    const mean = i => (cv[q.c.indexOf(choices[i])] || '');
    let h = `<div class="res ${ok ? 'ok' : 'ng'}">${ok ? '✔ Chính xác!' : '✘ Chưa đúng'}${ok && fast > 1 ? ` · trả lời nhanh x${fast}` : ''}${ok && S.streak > 2 ? ` · chuỗi ${S.streak}` : ''}</div>`;
    if (!ok) h += `<div class="vi" style="font-size:13px">Câu này sẽ được hỏi lại sau ít phút (ôn tập ngắt quãng).</div>`;
    h += `<h3>1 · Câu hỏi</h3><div class="box">${q.p ? `<div class="q pass" style="font-size:17px">${J(q.p)}</div>` : ''}<div class="q" style="font-size:19px;margin:2px 0">${J(q.q)}</div><div class="vi">${esc(q.qv || '')}</div></div>`;
    h += `<h3>2 · Đáp án</h3><div class="box"><div style="font-size:20px"><b>${J(choices[cidx])}</b></div><div class="vi">${esc(mean(cidx))}</div>${!ok ? `<div style="margin-top:4px;color:var(--bad)">Bạn chọn: ${J(choices[pick_])} <span class="vi">${esc(mean(pick_))}</span></div>` : ''}</div>`;
    h += `<h3>3 · Giải thích</h3><div class="box">${esc(q.ex || '')}</div>`;
    if (q.w && q.w.length) h += `<h3>4 · Từ trong câu</h3><div class="box"><div class="wl">${q.w.map(w => `<b>${J(w[0])}${w[1] && w[1] !== w[0] ? ` <span class="vi" style="font-weight:400">(${esc(w[1])})</span>` : ''}</b><span>${esc(w[2] || '')}</span>`).join('')}</div></div>`;
    h += `<h3>5 · Dịch</h3><div class="box">${q.pv ? `<div class="vi" style="margin-bottom:6px">📖 ${esc(q.pv)}</div>` : ''}<div class="wl">${choices.map((c, i) => `<b>${i === cidx ? '✔ ' : ''}${J(c)}</b><span>${esc(mean(i))}</span>`).join('')}</div></div>`;
    h += `<div class="foot"><button class="btn" id="qnext">Tiếp tục ⏎</button></div>`;
    let go = false;
    showModal(modalCard(h), e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') { go = true; return true; } return false; });
    $('#qnext', modalEl).addEventListener('click', () => { go = true; });
    this.expl = true;
    yield () => go;
    this.expl = false;
    closeModal();
  },
  tick() { // thanh thời gian
    const b = this.cur && $('#tbar'); if (!b || this.cur.st.done) return;
    b.style.width = Math.max(0, 100 - (FRAME - this.cur.st.t0) / 9) + '%';
  }
};
function lessonStartOK(q, ch) { return q.l <= lessonEnd(ch); }
