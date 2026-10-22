'use strict';
/* ===== Trận đấu: mỗi chiêu / lưới / bỏ chạy đều phải trả lời đúng một câu hỏi tiếng Nhật ===== */
const B = { on: false, foe: null, me: null, kind: '', area: 'route', shake: { me: 0, foe: 0 }, flash: { me: 0, foe: 0 }, ball: null, hp: { me: 0, foe: 0 }, sink: { me: 0, foe: 0 }, hudKey: '' };
function* note(text, n = 46) {
  const d = $('#dlg'); let go = false; d.innerHTML = `<div class="vi" style="opacity:1">${esc(text)}</div>`; d.hidden = false; d.onclick = () => { go = true; };
  Inp.a = Inp.b = 0; let k = n;
  yield () => { if (Inp.a || Inp.b || go) { Inp.a = Inp.b = 0; return true; } return --k <= 0; };
}
const hpPct = (h, m) => Math.max(0, Math.min(100, h / m * 100));
function battleHud() {
  if (!B.on) { $('#hud').innerHTML = ''; B.hudKey = ''; return; }
  const f = B.foe, m = B.me; if (!f || !m) return;
  B.hp.foe += (f.hp - B.hp.foe) * 0.15; B.hp.me += (m.hp - B.hp.me) * 0.15;
  if (Math.abs(B.hp.foe - f.hp) < .5) B.hp.foe = f.hp; if (Math.abs(B.hp.me - m.hp) < .5) B.hp.me = m.hp;
  const bar = (h, mx, xp) => { const p = hpPct(h, mx); return `<div class="bar ${p < 25 ? 'cr' : p < 50 ? 'lo' : ''}"><i style="width:${p}%"></i></div>`; };
  const key = [f.sp, f.lv, Math.round(B.hp.foe), m.sp, m.lv, Math.round(B.hp.me), m.xp, m.hp, f.hp, S.party.length].join();
  if (key === B.hudKey) return; B.hudKey = key;
  $('#hud').innerHTML =
    `<div class="hb" style="left:calc(var(--u)*5);top:calc(var(--u)*5)"><b>${spName(f.sp, f.form)}</b><span class="lv">Lv${f.lv}</span><br><small>${GROUP_ICON[grp(f.sp)]} ${GROUP_NAME[grp(f.sp)]}</small>${bar(B.hp.foe, mhp(f))}</div>` +
    `<div class="hb" style="right:calc(var(--u)*5);top:calc(var(--u)*66)"><b>${spName(m.sp, m.form)}</b><span class="lv">Lv${m.lv}</span>${bar(B.hp.me, mhp(m))}<small>HP ${Math.max(0, Math.ceil(B.hp.me))}/${mhp(m)}</small><div class="bar xp"><i style="width:${m.xp / needXp(m) * 100}%"></i></div></div>`;
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
  c2.clearRect(0, 0, 720, 480);
  const draw = (mon, who, x, y, r, flip) => {
    if (!mon) return;
    const sx = B.shake[who] ? Math.sin(FRAME * 1.6) * 6 * B.shake[who] / 10 : 0;
    c2.save(); c2.globalAlpha = B.flash[who] && (FRAME & 2) ? .35 : 1 - B.sink[who] / 30;
    drawTideling(c2, mon.sp, mon.form, (x + sx) * 3, (y + B.sink[who] * .8) * 3, r * 3, { t: FRAME, flip });
    c2.restore();
  };
  if (B.foe && !(B.ball && B.ball.hide)) draw(B.foe, 'foe', 172, 44, B.ball && B.ball.shrink ? 20 * B.ball.shrink : 20, false);
  draw(B.me, 'me', 62, 78, 24, true);
  if (B.ball) { const b = B.ball; c2.fillStyle = '#e53935'; c2.beginPath(); c2.arc(b.x * 3, b.y * 3, 14, Math.PI, 0); c2.fill(); c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(b.x * 3, b.y * 3, 14, 0, Math.PI); c2.fill(); c2.strokeStyle = '#1d2433'; c2.lineWidth = 3; c2.beginPath(); c2.arc(b.x * 3, b.y * 3, 14, 0, 7); c2.moveTo(b.x * 3 - 14, b.y * 3); c2.lineTo(b.x * 3 + 14, b.y * 3); c2.stroke(); }
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
function* battle(o) {
  B.on = true; B.kind = o.kind; B.area = o.area; B.foes = o.foes.slice(); B.fi = 0; B.foe = B.foes[0]; B.ball = null;
  B.me = S.party.find(m => m.hp > 0); B.hp.foe = B.foe.hp; B.hp.me = B.me.hp; B.sink = { me: 0, foe: 0 }; B.shake = { me: 0, foe: 0 }; B.flash = { me: 0, foe: 0 };
  S.seen[B.foe.sp] = 1; Wd.mode = 'battle'; B.hudKey = '';
  yield* fade(0, 1);
  if (o.kind === 'wild') yield* note(`Một ${spName(B.foe.sp, B.foe.form)} hoang dã (Lv${B.foe.lv}) xuất hiện!`);
  else yield* note(`${o.name} đưa ra ${spName(B.foe.sp, B.foe.form)} (Lv${B.foe.lv})!`);
  yield* note(`Đi nào, ${spName(B.me.sp, B.me.form)}!`, 30);
  let result = null;
  while (!result) {
    const tr = o.kind === 'wild';
    const a = yield* choose(`${spName(B.me.sp, B.me.form)}: HP ${B.me.hp}/${mhp(B.me)} — Làm gì?`, [
      { t: '⚔ Chiêu thức' }, { t: '🕸 Lưới', dis: !tr || (S.bag.net + S.bag.snet) <= 0, s: tr ? `${S.bag.net}+${S.bag.snet}` : 'không dùng được' },
      { t: '🍎 Tidefruit', dis: S.bag.fruit <= 0, s: `x${S.bag.fruit}` }, { t: '🔁 Đổi', dis: alive().length < 2 }, { t: '🏃 Chạy', dis: !tr }], 3);
    let acted = false;
    if (a === 0) {
      const mvs = MOVES[grp(B.me.sp)];
      const opts = mvs.map((mv, i) => ({ t: mv.n, s: B.me.lv < MOVE_LV[i] ? `Mở ở Lv${MOVE_LV[i]}` : `Sức mạnh ${mv.p} · ${B.me.pp[i]}/${mv.pp}`, dis: B.me.lv < MOVE_LV[i] || B.me.pp[i] <= 0 }));
      opts.push({ t: '← Quay lại' }); opts.cancel = 4;
      const mi = yield* choose('Chọn chiêu — rồi trả lời câu hỏi để chiêu trúng!', opts);
      if (mi < 4) {
        const mv = mvs[mi]; B.me.pp[mi]--;
        const r = yield* Quiz.ask({ area: o.area });
        yield* note(`${spName(B.me.sp, B.me.form)} dùng ${mv.n}!`, 22);
        if (r.ok) {
          const tm = typeMult(grp(B.me.sp), grp(B.foe.sp));
          const dmg = Math.max(1, Math.round(mv.p * (0.7 + B.me.lv * 0.07) * tm * r.fast * (1 + Math.min(r.streak, 5) * 0.04) * (0.92 + rand() * 0.16)));
          B.foe.hp = Math.max(0, B.foe.hp - dmg); B.shake.foe = 14; B.flash.foe = 14; Snd.hit(); yield 22;
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
      for (let f = 0; f < 24; f++) { B.sink.foe = f * 30 / 24; yield 1; }
      const out = [], base = o.kind === 'wild' ? 6 : o.kind === 'trainer' ? 9 : 12, amt = B.foe.lv * base;
      yield* note(`${spName(B.foe.sp, B.foe.form)} đã gục! Nhận ${amt} XP.`, 34);
      S.party.forEach(m => { if (m.hp > 0) gainXp(m, m === B.me ? amt : Math.ceil(amt / 2), out); });
      if (o.kind === 'wild') S.pearls += B.foe.lv * 3;
      for (const t of out) { Snd.lvl(); yield* note(t, 50); }
      B.sink.foe = 0; B.fi++;
      if (B.fi >= B.foes.length) { result = 'win'; break; }
      B.foe = B.foes[B.fi]; B.hp.foe = B.foe.hp; S.seen[B.foe.sp] = 1; B.hudKey = '';
      yield* note(`${o.name} đưa ra ${spName(B.foe.sp, B.foe.form)} (Lv${B.foe.lv})!`, 40); continue;
    }
    // ---- đối thủ phản công ----
    if (rand() < 0.9) {
      yield* note(`${spName(B.foe.sp, B.foe.form)} tấn công!`, 22);
      const tm = typeMult(grp(B.foe.sp), grp(B.me.sp)), dmg = Math.max(1, Math.round((6 + B.foe.lv * 1.1) * tm * (0.85 + rand() * 0.3) * (o.kind === 'boss' ? 1.1 : 1)));
      B.me.hp = Math.max(0, B.me.hp - dmg); B.shake.me = 14; B.flash.me = 14; Snd.hit(); yield 22;
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
  B.on = false; B.foe = B.me = null; B.ball = null; Wd.mode = 'world'; c2.clearRect(0, 0, 720, 480); $('#hud').innerHTML = '';
  $('#dlg').hidden = true; $('#bmenu').hidden = true; save();
  return result;
}
