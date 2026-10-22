'use strict';
/* ===== Khởi động, vòng lặp chính, màn hình tiêu đề, API kiểm thử ===== */
function sizeUI() {
  const sc = $('#screen'), u = sc.clientWidth / 240; document.documentElement.style.setProperty('--u', u + 'px');
  const pad = $('#pad'); document.documentElement.style.setProperty('--padh', (getComputedStyle(pad).display === 'none' ? 0 : pad.offsetHeight + 12) + 'px');
  resizeCanvas();
}
window.addEventListener('resize', sizeUI);

function renderTitle() {
  logicalT();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#79c8ee'); g.addColorStop(.55, '#bfe8f7'); g.addColorStop(.56, '#2f86c4'); g.addColorStop(1, '#17517f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(((i * 37 + FRAME / 4) % (W + 20)) - 10, 92 + i * 7, 14 + (i % 3) * 6, 1); }
  [[40, 84, 22], [120, 80, 16], [190, 86, 26]].forEach(([x, y, r], i) => { ctx.fillStyle = '#f1dca0'; ctx.beginPath(); ctx.ellipse(x, y, r, r / 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = CH[i].pal.g1; ctx.beginPath(); ctx.ellipse(x, y - 1, r * .75, r / 4, 0, 0, 7); ctx.fill(); });
  clear2();
  drawTideling(c2, 0, 1, 43, 115, 17, { t: FRAME }); drawTideling(c2, 1, 1, 120, 110, 20, { t: FRAME + 10 }); drawTideling(c2, 5, 2, 197, 115, 17, { t: FRAME + 20, flip: true });
}
function showTitle() {
  Wd.mode = 'title'; $('#hud').innerHTML = ''; $('#dlg').hidden = true; $('#bmenu').hidden = true;
  const has = !!loadSave(); let t = $('.title'); if (t) t.remove();
  t = el('div', 'title', `<h1>Coral Crown</h1><p>Quần đảo San Hô · Học tiếng Nhật JLPT <b>N5</b></p>
    ${has ? '<button class="mb" id="bt-cont">▶ Tiếp tục</button>' : ''}<button class="mb" id="bt-new">${has ? '★ Chơi mới' : '★ Bắt đầu'}</button>
    ${innerWidth < innerHeight && innerWidth < 700 ? '<p style="font-size:calc(var(--u)*5);color:#ffe9a8">📱 Xoay ngang điện thoại để chơi rộng và rõ hơn</p>' : ''}
    <p style="font-size:calc(var(--u)*4.5);opacity:.8">Mũi tên/WASD = di chuyển & chọn · Enter/Z = A · Esc/X = B · M = Menu · 1–4 = đáp án</p>`);
  t.style.cssText = 'position:absolute;inset:0;z-index:5;padding-top:calc(var(--u)*10)'; $('#screen').appendChild(t);
  focusFirst($$('#screen .title button'));
  if (has) $('#bt-cont').onclick = () => { t.remove(); continueGame(); };
  $('#bt-new').onclick = () => { if (has && !confirm('Chơi mới sẽ ghi đè bản lưu hiện tại. Tiếp tục?')) return; t.remove(); newGame(); };
}
function continueGame() { S = loadSave(); applyOpts(); loadMap(S.map, S.x, S.y, S.dir); Wd.mode = 'world'; Wd.banner = 90; }
function newGame() {
  S = newState(); applyOpts(); const tm = MAPS['i0_town']; loadMap('i0_town', tm.dock.x, tm.dock.y, tm.dock.dir); Wd.mode = 'world';
  run(function* () {
    yield* fade(1, 1); yield* fade(0, 20);
    S.hero = yield* pickHero(); yield* say('', `Xin chào, ${HEROES[S.hero].name} — ${HEROES[S.hero].role.toLowerCase()} mới của Quần đảo San Hô!`, 'よろしく！');
    yield* say('', 'Con thuyền cập bến Đảo Bình Minh (Asahi-jima) — đảo đầu tiên của Quần đảo San Hô. Có một người đang đợi bạn ở bến cảng.', 'ようこそ！');
    const mk = Wd.npcs.find(n => n.id === 'mika'), path = [];
    while (Math.abs(mk.x - S.x) + Math.abs(mk.y - S.y) > 1) { const d = Math.abs(S.y - mk.y) >= Math.abs(S.x - mk.x) ? (S.y > mk.y ? 'd' : 'u') : (S.x > mk.x ? 'r' : 'l'); path.push(d); yield* npcStep(mk, d); }
    if (path.length) { Wd.face = OPP[path[path.length - 1]]; S.dir = Wd.face; }
    yield* mika();
    for (const d of path.reverse()) yield* npcStep(mk, OPP[d]);
    mk.dir = 'd';
  });
}
function frame() {
  FRAME++;
  try {
    if (Wd.mode !== 'title') worldUpdate();
    if (Wd.mode === 'title') renderTitle();
    else if (Wd.mode === 'battle') { logicalT(); renderBattle(); battleHud(); }
    else { clear2(); renderWorld(); worldHud(); }
    if (Fx.fade > 0) { ctx.fillStyle = `rgba(8,16,28,${Fx.fade})`; ctx.fillRect(0, 0, W, H); }
    drawFx();
    Quiz.tick();
  } catch (e) { (window.__errors = window.__errors || []).push(String(e && e.stack || e)); console.error(e); }
}
/* mô phỏng không vẽ (nhanh gấp nhiều lần) — dùng cho bot kiểm thử */
function sim(n) { for (let i = 0; i < n; i++) { FRAME++; if (Wd.mode !== 'title') worldUpdate(); } }
function drawNow() {
  if (Wd.mode === 'title') renderTitle(); else if (Wd.mode === 'battle') { logicalT(); renderBattle(); B.hudKey = ''; battleHud(); } else { clear2(); renderWorld(); worldHud(); }
  if (Fx.fade > 0) { ctx.fillStyle = `rgba(8,16,28,${Fx.fade})`; ctx.fillRect(0, 0, W, H); }
  drawFx();
}
/* hiệu ứng vào trận: chớp sáng + khép/mở màn theo các dải ngang + chữ VS */
function drawFx() {
  if (Fx.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Fx.flash})`; ctx.fillRect(0, 0, W, H); }
  if (Fx.wipe > 0) {
    const n = 8, bh = H / n; ctx.fillStyle = '#0b1b2b';
    for (let i = 0; i < n; i++) { const w = Math.min(1, Fx.wipe * 1.25) * W; if (i & 1) ctx.fillRect(0, i * bh, w, bh + .6); else ctx.fillRect(W - w, i * bh, w, bh + .6); }
    if (Fx.vs && Fx.wipe >= .99) {
      ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      const k = Math.min(1, (FRAME - (Fx.vsT || FRAME)) / 10), s = .6 + .5 * Math.min(1, k * 1.2);
      ctx.translate(W / 2, H / 2 - 2); ctx.scale(s, s); ctx.font = '900 34px system-ui, sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#7a1f12'; ctx.strokeText(Fx.vs, 0, 8);
      const g = ctx.createLinearGradient(0, -20, 0, 12); g.addColorStop(0, '#fff7b0'); g.addColorStop(1, '#ff8a3a'); ctx.fillStyle = g; ctx.fillText(Fx.vs, 0, 8);
      ctx.font = '700 9px system-ui, sans-serif'; ctx.lineWidth = 2.6; ctx.strokeStyle = '#0b1b2b'; ctx.strokeText(Fx.vsName, 0, 24); ctx.fillStyle = '#fff'; ctx.fillText(Fx.vsName, 0, 24); ctx.restore();
    }
  }
}
let _hudK = '';
function worldHud() {
  if (Fx.wipe > 0 || Fx.flash > 0) { $('#hud').innerHTML = ''; _hudK = ''; return; }
  const k = [Wd.banner > 0 ? Wd.bannerText : '', S.pearls, S.party[0] ? S.party[0].lv : 0].join('|');
  if (Wd.banner > 0) Wd.banner--;
  if (k === _hudK) return; _hudK = k;
  $('#hud').innerHTML = (Wd.banner > 0 ? `<div class="hb" style="left:calc(var(--u)*5);top:calc(var(--u)*5)"><b>${esc(Wd.bannerText)}</b></div>` : '') +
    `<div class="hb" style="right:calc(var(--u)*5);top:calc(var(--u)*5);min-width:0;padding:calc(var(--u)*1.5) calc(var(--u)*3)">💎 ${S.pearls}${S.party[0] ? ` · ${GROUP_ICON[grp(S.party[0].sp)]} Lv${S.party[0].lv}` : ''}</div>`;
}
let _last = performance.now(), _acc = 0;
function loop(now) { _acc += Math.min(100, now - _last); _last = now; while (_acc >= 1000 / 60) { frame(); _acc -= 1000 / 60; } requestAnimationFrame(loop); }

/* ---- API cho kiểm thử / bot ---- */
window.G = {
  get S() { return S; }, Wd, B, baseLv, MAPS, CH, SQ, VOC, Quiz, frame, seed, rand, ri,
  step(n = 1) { for (let i = 0; i < n; i++) frame(); }, sim, drawNow,
  newGame, continueGame, showTitle, run, busy, Inp, dynMake, dynKey, furi, plain, numRead, timeRead, spName, spInfo, speciesOfChapter, SLICES, FRUITS, newMon, drawTideling, tidelingCanvas,
  get mode() { return Wd.mode; }, get errors() { return window.__errors || []; }, get missingFuri() { return [...window.__missingFuri]; },
  ui() { // mô tả giao diện hiện tại (cho bot)
    if (Modal.open) {
      if ($('#qnext')) return 'explain';
      if (Quiz.cur) return 'quiz';
      return 'modal';
    }
    if (!$('#bmenu').hidden && $$('.mb', $('#bmenu')).length) return 'choose';
    if (!$('#dlg').hidden) return 'dialog';
    return busy() ? 'script' : 'world';
  }
};
window.addEventListener('DOMContentLoaded', () => { });
sizeUI(); showTitle();
if (!/[?&]manual\b/.test(location.search)) requestAnimationFrame(loop);
