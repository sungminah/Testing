'use strict';
/* ===== Trận đấu: mỗi chiêu / lưới / bỏ chạy đều phải trả lời đúng một câu hỏi tiếng Nhật ===== */
const B = { on: false, foe: null, me: null, kind: '', area: 'route', shake: { me: 0, foe: 0 }, flash: { me: 0, foe: 0 }, ball: null, hp: { me: 0, foe: 0 }, sink: { me: 0, foe: 0 }, hudKey: '', slide: 1, fx: [], appear: 1, sparks: [], floats: [], lvlFx: 0, rings: [] };
function* note(text, n = 46) {
  const d = $('#dlg'); let go = false; d.innerHTML = `<div class="vi" style="opacity:1">${esc(text)}</div>`; d.hidden = false; d.onclick = () => { go = true; };
  Inp.a = Inp.b = 0; let k = Math.round(n * 1.6) + 14; yield 6;
  yield () => { if (Inp.a || Inp.b || go) { Inp.a = Inp.b = 0; return true; } return --k <= 0; };
}
const hpPct = (h, m) => Math.max(0, Math.min(100, h / m * 100));
function battleHud() {
  if (B.on && B.slide < .7) { $('#hud').innerHTML = ''; B.hudKey = ''; return; }
  if (!B.on) { $('#hud').innerHTML = ''; B.hudKey = ''; return; }
  const f = B.foe, m = B.me; if (!f || !m) return;
  B.hp.foe += (f.hp - B.hp.foe) * 0.15; B.hp.me += (m.hp - B.hp.me) * 0.15;
  if (Math.abs(B.hp.foe - f.hp) < .5) B.hp.foe = f.hp; if (Math.abs(B.hp.me - m.hp) < .5) B.hp.me = m.hp;
  const bar = (h, mx, xp) => { const p = hpPct(h, mx); return `<div class="bar ${p < 25 ? 'cr' : p < 50 ? 'lo' : ''}"><i style="width:${p}%"></i></div>`; };
  const key = [f.sp, f.lv, Math.round(B.hp.foe), m.sp, m.lv, Math.round(B.hp.me), Math.round(m.xp * 4), m.hp, f.hp, S.party.length].join();
  if (key === B.hudKey) return; B.hudKey = key;
  $('#hud').innerHTML =
    `<div class="hb" style="left:calc(var(--u)*5);top:calc(var(--u)*5)"><b>${spName(f.sp, f.form)}</b><span class="lv">Lv${f.lv}</span><br><small>${GROUP_ICON[grp(f.sp)]} ${GROUP_NAME[grp(f.sp)]}</small>${bar(B.hp.foe, mhp(f))}</div>` +
    `<div class="hb" style="right:calc(var(--u)*5);top:calc(var(--u)*66)"><b>${spName(m.sp, m.form)}</b><span class="lv">Lv${m.lv}</span>${bar(B.hp.me, mhp(m))}<small>HP ${Math.max(0, Math.ceil(B.hp.me))}/${mhp(m)}</small><div class="bar xp"><i style="width:${m.xp / needXp(m) * 100}%"></i></div><small style="opacity:.75">EXP ${Math.floor(m.xp)}/${needXp(m)}</small></div>`;
}
function renderBattle() {
  const gym = B.area === 'gym' || B.area === 'boss', p = CH[S.cur].pal;
  if (gym) { const g = ctx.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#2c2350'); g.addColorStop(1, '#4a3c7c'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 100); ctx.fillStyle = '#5a4a8a'; ctx.fillRect(0, 100, W, 60); for (let x = 0; x < W; x += 24) { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, 100, 12, 60); } }
  else {
    const g = ctx.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, '#8fd0f2'); g.addColorStop(1, '#d9f1fb'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 70);
    ctx.fillStyle = p.water[0]; ctx.fillRect(0, 62, W, 14); ctx.fillStyle = p.water[1]; for (let x = 0; x < W; x += 20) ctx.fillRect((x + (FRAME >> 3)) % W, 66 + (x / 20 & 1) * 4, 8, 1);
    ctx.fillStyle = p.g1; ctx.fillRect(0, 76, W, 84); ctx.fillStyle = p.g2; for (let x = 0; x < W; x += 16) ctx.fillRect(x, 90 + (x / 16 % 3) * 20, 6, 1);
  }
  ctx.fillStyle = gym ? '#6b5aa0' : shade(p.g2, 1.1); ctx.beginPath(); ctx.ellipse(172, 66, 36, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(62, 102, 42, 9, 0, 0, 7); ctx.fill();
  clear2();
  const draw = (mon, who, x, y, r, flip) => {
    if (!mon) return;
    const sx = B.shake[who] ? Math.sin(FRAME * 1.6) * 6 * B.shake[who] / 10 : 0;
    c2.save(); c2.globalAlpha = B.flash[who] && (FRAME & 2) ? .35 : 1 - B.sink[who] / 30;
    drawTideling(c2, mon.sp, mon.form, x + sx, y + B.sink[who] * .8, r, { t: FRAME, flip });
    c2.restore();
  };
  const so = (1 - (1 - Math.min(1, B.slide)) ** 3); const off = (1 - so) * 130;
  if (B.foe && !(B.ball && B.ball.hide)) draw(B.foe, 'foe', 172 + off, 44, (B.ball && B.ball.shrink ? 20 * B.ball.shrink : 20) * (.15 + .85 * Math.min(1, B.appear)), false);
  draw(B.me, 'me', 62 - off, 78, 24, true);
  if (B.ball) { const b = B.ball; c2.fillStyle = '#e53935'; c2.beginPath(); c2.arc(b.x, b.y, 4.6, Math.PI, 0); c2.fill(); c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(b.x, b.y, 4.6, 0, Math.PI); c2.fill(); c2.strokeStyle = '#1d2433'; c2.lineWidth = 1; c2.beginPath(); c2.arc(b.x, b.y, 4.6, 0, 7); c2.moveTo(b.x - 4.6, b.y); c2.lineTo(b.x + 4.6, b.y); c2.stroke(); c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(b.x, b.y, 1.4, 0, 7); c2.fill(); c2.stroke(); }
  if (B.appear < 1) B.appear += 1 / 26;
  // hiệu ứng chiêu thức theo hệ
  for (const e of B.fx) {
    e.t++; if (e.t < 0) continue; const k = e.t / e.dur; c2.save(); c2.lineCap = 'round';
    if (e.kind === 'slash') { // Hệ Thú: những vết cào chéo
      for (let i = 0; i <= e.tier; i++) { const ox = (i - e.tier / 2) * 7, p = Math.min(1, k * 2 - i * .12); if (p <= 0) continue; c2.globalAlpha = Math.max(0, 1 - k); c2.strokeStyle = '#fff'; c2.lineWidth = 2.4; c2.beginPath(); c2.moveTo(e.x - 12 + ox, e.y - 16); c2.lineTo(e.x - 12 + ox + 24 * p, e.y - 16 + 32 * p); c2.stroke(); c2.strokeStyle = '#ffd54f'; c2.lineWidth = 1; c2.stroke(); }
    } else if (e.kind === 'rings') { // Hệ Năng lực: sóng tâm lan toả
      for (let i = 0; i < 2 + e.tier; i++) { const p = k * 1.4 - i * .18; if (p <= 0 || p > 1) continue; c2.globalAlpha = 1 - p; c2.strokeStyle = i & 1 ? '#e1b6ff' : '#9c6bff'; c2.lineWidth = 2.2 - p; c2.beginPath(); c2.arc(e.x, e.y, 4 + p * 30, 0, 7); c2.stroke(); }
      c2.globalAlpha = .5 * (1 - k); const gr = c2.createRadialGradient(e.x, e.y, 0, e.x, e.y, 26); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(156,107,255,0)'); c2.fillStyle = gr; c2.beginPath(); c2.arc(e.x, e.y, 26, 0, 7); c2.fill();
    } else if (e.kind === 'orb') { // Hệ Nguyên tố: quả cầu bay tới rồi nổ
      const p = Math.min(1, k / .7), x = e.sx + (e.tx - e.sx) * p, y = e.sy + (e.ty - e.sy) * p - Math.sin(p * Math.PI) * 14;
      if (k < .72) { for (let i = 5; i >= 0; i--) { const q = Math.max(0, p - i * .05), tx = e.sx + (e.tx - e.sx) * q, ty = e.sy + (e.ty - e.sy) * q - Math.sin(q * Math.PI) * 14; c2.globalAlpha = (1 - i / 6) * .6; c2.fillStyle = e.c; c2.beginPath(); c2.arc(tx, ty, 5 - i * .6, 0, 7); c2.fill(); }
        c2.globalAlpha = 1; const g2 = c2.createRadialGradient(x, y, 0, x, y, 7); g2.addColorStop(0, '#fff'); g2.addColorStop(.5, e.c); g2.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = g2; c2.beginPath(); c2.arc(x, y, 7, 0, 7); c2.fill(); }
      else { const q = (k - .72) / .28; c2.globalAlpha = 1 - q; c2.fillStyle = e.c; c2.beginPath(); c2.arc(e.tx, e.ty, 6 + q * 18, 0, 7); c2.fill(); c2.globalAlpha = (1 - q) * .9; c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(e.tx, e.ty, 3 + q * 8, 0, 7); c2.fill(); }
    }
    c2.restore();
  }
  B.fx = B.fx.filter(e => e.t < e.dur);
  // vòng sáng, tia sáng, chữ nổi
  for (const r of B.rings) { r.t++; if (r.t < 0) continue; const k = r.t / 40; c2.strokeStyle = `rgba(255,240,150,${1 - k})`; c2.lineWidth = 1.6 * (1 - k) + .3; c2.beginPath(); c2.arc(r.x, r.y, 6 + k * 34, 0, 7); c2.stroke(); }
  B.rings = B.rings.filter(r => r.t < 40);
  for (const p of B.sparks) { p.t++; p.x += p.vx; p.y += p.vy; p.vy += .02; const a = 1 - p.t / p.life; c2.fillStyle = p.c; c2.globalAlpha = Math.max(0, a); c2.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, rad = i & 1 ? p.s * .35 : p.s; c2.lineTo(p.x + Math.cos(an) * rad, p.y + Math.sin(an) * rad); } c2.fill(); c2.globalAlpha = 1; }
  B.sparks = B.sparks.filter(p => p.t < p.life);
  if (B.lvlFx > 0) { const k = 1 - B.lvlFx / 90, pop = k < .15 ? k / .15 : 1; c2.save(); c2.translate(62, 40 - k * 10); c2.scale(.6 + .5 * pop, .6 + .5 * pop); c2.globalAlpha = k > .8 ? (1 - k) / .2 : 1; c2.font = '800 13px system-ui, sans-serif'; c2.textAlign = 'center'; c2.lineWidth = 3; c2.strokeStyle = '#7a3b00'; c2.strokeText('LEVEL UP!', 0, 0); const g = c2.createLinearGradient(0, -10, 0, 3); g.addColorStop(0, '#fff7b0'); g.addColorStop(1, '#ffb300'); c2.fillStyle = g; c2.fillText('LEVEL UP!', 0, 0); c2.restore(); B.lvlFx--; }
  for (const f of B.floats) { f.t++; if (f.t < 0) continue; const k = f.t / 70; c2.save(); c2.globalAlpha = k > .7 ? (1 - k) / .3 : 1; c2.font = '700 8px system-ui, sans-serif'; c2.textAlign = 'center'; c2.lineWidth = 2.4; c2.strokeStyle = '#0b2a44'; c2.strokeText(f.text, f.x, f.y - k * 12); c2.fillStyle = f.col; c2.fillText(f.text, f.x, f.y - k * 12); c2.restore(); }
  B.floats = B.floats.filter(f => f.t < 70);
  for (const w of ['me', 'foe']) { if (B.shake[w] > 0) B.shake[w]--; if (B.flash[w] > 0) B.flash[w]--; }
}
function gainXp(m, amt, out) {
  m.xp += amt;
  while (m.lv < 60 && m.xp >= needXp(m)) {
    m.xp -= needXp(m); m.lv++; m.hp = Math.min(mhp(m), m.hp + 4);
    out.push(`${spName(m.sp, m.form)} lên cấp ${m.lv}!`);
    const f0 = m.form; syncForm(m); if (m.form !== f0) out.push(`✨ ${spName(m.sp, 1)} tiến hoá thành ${spName(m.sp, 2)}!`);
    MOVE_LV.forEach((l, i) => { if (m.lv === l && i > 0) out.push(`${spName(m.sp, m.form)} học được chiêu ${MOVES[grp(m.sp)][i].n}!`); });
  }
}
function burst(x, y, n, cols) { for (let i = 0; i < n; i++) { const a = rand() * 6.283, sp = .4 + rand() * 1.5; B.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - .6, s: 1.2 + rand() * 2, life: 45 + ri(40), t: 0, c: pick(cols || ['#fff7b0', '#ffd54f', '#ffb300', '#ffffff']) }); } if (B.sparks.length > 160) B.sparks.splice(0, B.sparks.length - 160); }
function* gainXpAnim(m, amt) {
  const nm = () => spName(m.sp, m.form);
  B.floats.push({ t: 0, text: `+${amt} EXP`, x: 62, y: 56, col: '#7fd6ff' });
  yield* note(`${nm()} nhận ${amt} điểm kinh nghiệm!`, 36);
  let left = amt;
  while (left > 0 && m.lv < 60) {
    const need = needXp(m), take = Math.min(left, need - m.xp), start = m.xp, fr = Math.max(18, Math.min(60, Math.round(take / need * 90)));
    for (let f = 1; f <= fr; f++) { m.xp = start + take * (f / fr); if (f % 6 === 0) Snd.tone(500 + f * 8, .04, 'triangle', .02); yield 1; }
    m.xp = start + take; left -= take;
    if (m.xp >= need) {
      yield 12; m.xp = 0; m.lv++; m.hp = Math.min(mhp(m), m.hp + 4); B.hudKey = '';
      B.lvlFx = 90; B.rings.push({ x: 62, y: 78, t: 0 }, { x: 62, y: 78, t: -12 }); burst(62, 78, 34); Snd.lvl();
      yield* note(`${nm()} lên cấp ${m.lv}!`, 56);
      for (let i = 1; i < 4; i++) if (m.lv === MOVE_LV[i]) yield* note(`${nm()} học được chiêu ${MOVES[grp(m.sp)][i].n}!`, 56);
      if (m.form === 1 && m.lv >= evoLv(m.sp)) {
        yield* note(`Ồ? ${nm()} đang phát sáng...`, 40);
        for (let f = 0; f < 80; f++) { B.flash.me = 3; if (f % 10 === 0) { burst(62, 78, 8, ['#ffffff', '#cfefff']); B.rings.push({ x: 62, y: 78, t: 0 }); } yield 1; }
        const old = nm(); syncForm(m); B.flash.me = 0; burst(62, 78, 44); B.rings.push({ x: 62, y: 78, t: 0 }); Snd.lvl(); B.hudKey = '';
        yield* note(`✨ ${old} tiến hoá thành ${nm()}!`, 70);
      }
      yield 10;
    }
  }
  if (m.lv >= 60) m.xp = 0;
}
const FX_COLORS = ['#ff7a2a', '#3aa0ff', '#5ccf5a', '#ffe14a'];
const SPOT = { me: [62, 74], foe: [172, 42] };
/* chạy hiệu ứng chiêu thức theo hệ; tier = 0..3 (chiêu càng mạnh càng hoành tráng) */
function* moveFx(side, g, tier) {
  const A = SPOT[side], Tg = SPOT[side === 'me' ? 'foe' : 'me'];
  if (g === 0) { B.fx.push({ kind: 'slash', x: Tg[0], y: Tg[1], tier, t: 0, dur: 24 }); Snd.tone(300, .06, 'sawtooth', .05); Snd.tone(220, .08, 'sawtooth', .05, .07); yield 10; }
  else if (g === 1) { B.fx.push({ kind: 'rings', x: Tg[0], y: Tg[1], tier, t: 0, dur: 32 }); Snd.tone(520, .12, 'sine', .05); Snd.tone(780, .14, 'sine', .04, .1); yield 8; }
  else { B.fx.push({ kind: 'orb', sx: A[0], sy: A[1], tx: Tg[0], ty: Tg[1], c: FX_COLORS[tier], t: 0, dur: 28 }); Snd.tone(260, .16, 'triangle', .05); yield 20; Snd.tone(110, .12, 'square', .06); }
  yield 12;
  burst(Tg[0], Tg[1], 10 + tier * 5, g === 1 ? ['#e1b6ff', '#fff', '#9c6bff'] : g === 2 ? [FX_COLORS[tier], '#fff'] : ['#fff7b0', '#ffffff', '#ffd54f']);
}
/* hiệu ứng trước khi vào trận */
function* battleIntro(o) {
  const wild = o.kind === 'wild';
  for (let k = 0; k < (wild ? 2 : 3); k++) { Snd.tone(900 - k * 150, .07, 'square', .05); Fx.flash = .85; yield 3; Fx.flash = 0; yield 3; }
  Snd.tone(220, .35, 'sawtooth', .04);
  for (let f = 1; f <= 26; f++) { Fx.wipe = f / 26; yield 1; }
  if (!wild) { Fx.vs = 'VS'; Fx.vsName = o.name; Fx.vsT = FRAME; Snd.tone(330, .2, 'square', .05); yield 40; Fx.vs = ''; } else yield 6;
}
function* battle(o) {
  yield* battleIntro(o); Snd.music('battle');
  B.on = true; B.slide = 0; B.appear = 1; B.sparks = []; B.fx = []; B.floats = []; B.rings = []; B.lvlFx = 0; B.kind = o.kind; B.area = o.area; B.foes = o.foes.slice(); B.fi = 0; B.foe = B.foes[0]; B.ball = null;
  B.me = S.party.find(m => m.hp > 0); B.hp.foe = B.foe.hp; B.hp.me = B.me.hp; B.sink = { me: 0, foe: 0 }; B.shake = { me: 0, foe: 0 }; B.flash = { me: 0, foe: 0 };
  S.seen[B.foe.sp] = 1; Wd.mode = 'battle'; B.hudKey = '';
  for (let f = 0; f <= 32; f++) { B.slide = f / 32; Fx.wipe = Math.max(0, 1 - f / 22); yield 1; }
  Fx.wipe = 0; B.slide = 1;
  if (o.kind === 'wild') yield* note(`Một ${spName(B.foe.sp, B.foe.form)} hoang dã (Lv${B.foe.lv}) xuất hiện!`);
  else yield* note(`${o.name} đưa ra ${spName(B.foe.sp, B.foe.form)} (Lv${B.foe.lv})!`);
  yield* note(`Đi nào, ${spName(B.me.sp, B.me.form)}!`, 30);
  let result = null;
  while (!result) {
    const tr = o.kind === 'wild';
    const a = yield* choose(`${spName(B.me.sp, B.me.form)}: HP ${B.me.hp}/${mhp(B.me)} · ${typeMult(grp(B.me.sp), grp(B.foe.sp)) > 1 ? '👍 hệ bạn khắc chế đối thủ' : typeMult(grp(B.me.sp), grp(B.foe.sp)) < 1 ? '⚠ đối thủ khắc chế hệ bạn' : 'hai hệ ngang nhau'} — Làm gì?`, [
      { t: '⚔ Chiêu thức' }, { t: '🕸 Lưới', dis: !tr || (S.bag.net + S.bag.snet) <= 0, s: tr ? `${S.bag.net}+${S.bag.snet}` : 'không dùng được' },
      { t: '🍎 Tidefruit', dis: S.bag.fruit <= 0, s: `x${S.bag.fruit}` }, { t: '🔁 Đổi', dis: alive().length < 2 }, { t: '🏃 Chạy', dis: !tr }], 3);
    let acted = false;
    if (a === 0) {
      const mvs = MOVES[grp(B.me.sp)];
      const opts = mvs.map((mv, i) => ({ t: mv.n, s: B.me.lv < MOVE_LV[i] ? `Mở ở Lv${MOVE_LV[i]}` : `Sức mạnh ${mv.p} · ${B.me.pp[i]}/${mv.pp}`, dis: B.me.lv < MOVE_LV[i] || B.me.pp[i] <= 0 }));
      const noPp = opts.every(op => op.dis); // hết PP: vẫn có đòn yếu để không bị kẹt
      opts.push({ t: '💢 Gắng sức', s: noPp ? 'Sức mạnh 8 · không giới hạn' : 'Chỉ dùng khi hết PP', dis: !noPp });
      opts.push({ t: '← Quay lại' }); opts.cancel = 5;
      const mi = yield* choose('Chọn chiêu — rồi trả lời câu hỏi để chiêu trúng!', opts);
      if (mi < 5) {
        const mv = mi === 4 ? { n: 'Gắng sức', p: 8 } : mvs[mi]; if (mi < 4) B.me.pp[mi]--;
        const r = yield* Quiz.ask({ area: o.area });
        yield* note(`${spName(B.me.sp, B.me.form)} dùng ${mv.n}!`, 22);
        if (r.ok) {
          const tm = typeMult(grp(B.me.sp), grp(B.foe.sp));
          const dmg = Math.max(1, Math.round(mv.p * (0.7 + B.me.lv * 0.07) * tm * r.fast * (1 + Math.min(r.streak, 5) * 0.04) * (0.92 + rand() * 0.16)));
          yield* moveFx('me', grp(B.me.sp), Math.min(mi, 3));
          B.foe.hp = Math.max(0, B.foe.hp - dmg); B.shake.foe = 14; B.flash.foe = 14; Snd.hit();
          B.floats.push({ t: 0, text: `-${dmg}`, x: 172, y: 30, col: tm > 1 ? '#ffd54f' : '#ff6b6b' }); if (tm !== 1) B.floats.push({ t: -8, text: tm > 1 ? 'Hiệu quả cao!' : 'Không hiệu quả', x: 172, y: 16, col: tm > 1 ? '#ffd54f' : '#b0bec5' });
          yield 22;
          yield* note(`Trúng đích! Gây ${dmg} sát thương.${tm > 1 ? ' Hiệu quả cao!' : tm < 1 ? ' Không hiệu quả lắm...' : ''}`, 30);
        } else yield* note('Chiêu thức bị hụt!', 30);
        acted = true;
      }
    } else if (a === 1) {
      const sup = S.bag.snet > 0 && S.bag.net <= 0 ? true : S.bag.snet > 0 ? ((yield* choose('Chọn lưới', [{ t: `Lưới thường x${S.bag.net}` }, { t: `Siêu lưới x${S.bag.snet}` }])) === 1) : false;
      if (sup) S.bag.snet--; else S.bag.net--;
      const r = yield* Quiz.ask({ area: o.area });
      yield* note('Bạn ném lưới Tideling!', 14);
      B.ball = { x: 62, y: 70 }; for (let f = 0; f < 22; f++) { B.ball.x += (172 - 62) / 22; B.ball.y = 70 - Math.sin(f / 22 * Math.PI) * 40 + (44 - 70 + 8) * f / 22; yield 1; }
      B.ball.shrink = .01; B.ball.hide = true; yield 28;
      const p = clamp(0.28 + (1 - B.foe.hp / mhp(B.foe)) * 0.55 + (sup ? .2 : 0) + (r.fast - 1) * .3, .1, .95);
      if (r.ok && rand() < p) {
        const m = B.foe; m.xp = 0; (S.party.length < 6 ? S.party : S.box).push(m); S.caught[m.sp] = 1; S.seen[m.sp] = 1; S.flags.caught0 = 1; Snd.lvl();
        yield* note(`Bắt được ${spName(m.sp, m.form)}! ${S.party.includes(m) ? 'Gia nhập đội hình.' : 'Đã gửi vào Hộp.'}`, 60);
        B.ball = null; result = 'caught'; break;
      }
      B.ball = null; yield* note(r.ok ? 'Ôi! Tideling thoát ra khỏi lưới!' : 'Câu trả lời sai nên lưới ném trượt!', 40); acted = true;
    } else if (a === 2) {
      S.bag.fruit--; const h = Math.min(40, mhp(B.me) - B.me.hp); B.me.hp += h; Snd.ok(); yield* note(`${spName(B.me.sp, B.me.form)} hồi ${h} HP.`, 30); acted = true;
    } else if (a === 3) {
      const cand = S.party.filter(m => m.hp > 0 && m !== B.me);
      const r = yield* choose('Đổi sang', cand.map(m => ({ t: `${spName(m.sp, m.form)} Lv${m.lv}`, s: `HP ${m.hp}/${mhp(m)}` })));
      B.me = cand[r]; B.hp.me = B.me.hp; yield* note(`Đi nào, ${spName(B.me.sp, B.me.form)}!`, 26); acted = true;
    } else if (a === 4) {
      const r = yield* Quiz.ask({ area: o.area });
      if (r.ok) { yield* note('Bạn chạy thoát an toàn!', 30); result = 'run'; break; }
      yield* note('Không chạy thoát được!', 30); acted = true;
    }
    if (!acted) continue;
    // ---- hạ gục đối thủ? ----
    if (B.foe.hp <= 0) {
      for (let f = 0; f < 30; f++) { B.sink.foe = f; yield 1; }
      burst(172, 50, 14, ['#ffffff', '#cfefff']);
      const base = o.kind === 'wild' ? 6 : o.kind === 'trainer' ? 9 : 12, amt = B.foe.lv * base;
      yield* note(`${spName(B.foe.sp, B.foe.form)} đã gục!`, 40);
      yield 16;
      yield* gainXpAnim(B.me, amt);
      for (const m of S.party) if (m !== B.me && m.hp > 0) { const out = []; gainXp(m, Math.ceil(amt / 2), out); for (const t of out) { Snd.lvl(); yield* note(t, 50); } }
      if (o.kind === 'wild') { S.pearls += B.foe.lv * 3; yield* note(`Nhặt được ${B.foe.lv * 3} 💎`, 30); }
      B.sink.foe = 0; B.fi++;
      if (B.fi >= B.foes.length) { result = 'win'; break; }
      yield 20;
      B.foe = B.foes[B.fi]; B.hp.foe = B.foe.hp; S.seen[B.foe.sp] = 1; B.hudKey = ''; B.appear = 0; Snd.tap();
      yield* note(`${o.name} đưa ra ${spName(B.foe.sp, B.foe.form)} (Lv${B.foe.lv})!`, 50); continue;
    }
    // ---- đối thủ phản công ----
    if (rand() < 0.9) {
      yield* note(`${spName(B.foe.sp, B.foe.form)} tấn công!`, 22);
      const tm = typeMult(grp(B.foe.sp), grp(B.me.sp)), dmg = Math.max(1, Math.round((6 + B.foe.lv * 1.1) * tm * (0.85 + rand() * 0.3) * (o.kind === 'boss' ? 1.1 : 1)));
      yield* moveFx('foe', grp(B.foe.sp), Math.min(3, Math.floor(B.foe.lv / 12)));
      B.me.hp = Math.max(0, B.me.hp - dmg); B.shake.me = 14; B.flash.me = 14; Snd.hit();
      B.floats.push({ t: 0, text: `-${dmg}`, x: 62, y: 62, col: '#ff6b6b' }); if (tm !== 1) B.floats.push({ t: -8, text: tm > 1 ? 'Hiệu quả cao!' : 'Không hiệu quả', x: 62, y: 48, col: tm > 1 ? '#ffd54f' : '#b0bec5' });
      yield 22;
      yield* note(`${spName(B.me.sp, B.me.form)} chịu ${dmg} sát thương.`, 28);
    } else yield* note(`${spName(B.foe.sp, B.foe.form)} đánh trượt!`, 28);
    if (B.me.hp <= 0) {
      for (let f = 0; f < 24; f++) { B.sink.me = f * 30 / 24; yield 1; }
      yield* note(`${spName(B.me.sp, B.me.form)} đã kiệt sức!`, 40); B.sink.me = 0;
      const cand = S.party.filter(m => m.hp > 0);
      if (!cand.length) { result = 'lose'; break; }
      const r = yield* choose('Chọn Tideling tiếp theo', cand.map(m => ({ t: `${spName(m.sp, m.form)} Lv${m.lv}`, s: `HP ${m.hp}/${mhp(m)}` })));
      B.me = cand[r]; B.hp.me = B.me.hp; B.hudKey = ''; yield* note(`Đi nào, ${spName(B.me.sp, B.me.form)}!`, 26);
    }
  }
  yield* fade(1, 14); Snd.music('world');
  B.on = false; B.foe = B.me = null; B.ball = null; B.slide = 1; Wd.mode = 'world'; clear2(); $('#hud').innerHTML = '';
  $('#dlg').hidden = true; $('#bmenu').hidden = true; save();
  yield 4; yield* fade(0, 14);
  return result;
}
