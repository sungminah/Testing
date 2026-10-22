'use strict';
/* ===== trạng thái game, lưu/tải, modal DOM ===== */
const SAVE_KEY = 'coral_crown_n5_v1';
let S = null;
let FRAME = 0;
function newState() {
  return {
    v: 1, hero: 0, cur: 0, maxCh: 0, map: 'i0_town', x: 9, y: 11, dir: 'u',
    party: [], box: [], bag: { net: 5, fruit: 3, snet: 0 }, pearls: 100,
    seen: {}, caught: {}, flags: {}, items: {}, leit: {}, pend: [], qCount: 0, recent: [], streak: 0,
    stats: { n: 0, ok: 0, by: {} }, sc: {}, opt: { sound: 1, furi: 'auto' }, defeated: {}, taken: {}, steps: 0, badges: []
  };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); if (!j) return null; const s = JSON.parse(j); return s && s.v === 1 ? Object.assign(newState(), s) : null; } catch (e) { return null; } }
function applyOpts() { Snd.on = !!S.opt.sound; Snd.musicOn = S.opt.music !== 0; Snd.music(); FURI_MODE = S.opt.furi === 'all' ? 'all' : 'auto'; }

/* ---- modal DOM ---- */
const modalEl = $('#modal');
function showModal(html, onKey) { modalEl.innerHTML = html; modalEl.hidden = false; modalEl.scrollTop = 0; Modal.open = true; Modal.onKey = onKey || null; for (const k in Inp.held) Inp.held[k] = 0; focusFirst(modalItems()); }
function closeModal() { modalEl.hidden = true; modalEl.innerHTML = ''; Modal.open = false; Modal.onKey = null; }
function modalCard(inner) { return `<div class="card">${inner}</div>`; }

/* ---- Tideling của người chơi ---- */
const SLICES = [17, 17, 17, 17, 17, 17, 16, 16, 16];
const SLICE_START = SLICES.reduce((a, n, i) => (a.push(i ? a[i - 1] + SLICES[i - 1] : 0), a), []);
const chapterOfSp = sp => { for (let i = SLICES.length - 1; i >= 0; i--) if (sp >= SLICE_START[i]) return i; return 0; };
const speciesOfChapter = c => Array.from({ length: SLICES[c] }, (_, i) => SLICE_START[c] + i);
const grp = sp => sp % 3;
const mhp = m => 18 + m.lv * 4;
const evoLv = sp => 12 + 3 * chapterOfSp(sp);
const MOVE_LV = [1, 4, 10, 16];
const MOVES = [
  [{ n: 'Vồ', p: 14, pp: 14 }, { n: 'Cào', p: 20, pp: 10 }, { n: 'Húc', p: 28, pp: 6 }, { n: 'Gầm vang', p: 40, pp: 3 }],
  [{ n: 'Tia nhìn', p: 14, pp: 14 }, { n: 'Sóng tâm', p: 20, pp: 10 }, { n: 'Ảo ảnh', p: 28, pp: 6 }, { n: 'Bão ý niệm', p: 40, pp: 3 }],
  [{ n: 'Tia lửa', p: 14, pp: 14 }, { n: 'Sóng nước', p: 20, pp: 10 }, { n: 'Gió lá', p: 28, pp: 6 }, { n: 'Sấm sét', p: 40, pp: 3 }]
];
const GROUP_NAME = ['Hệ Thú', 'Hệ Năng lực', 'Hệ Nguyên tố'];
const GROUP_ICON = ['🐾', '🔮', '🔥'];
function newMon(sp, lv) {
  const m = { sp, lv, xp: 0, form: 1 };
  m.hp = mhp(m); m.pp = MOVES[grp(sp)].map(x => x.pp);
  syncForm(m); return m;
}
function syncForm(m) { m.form = m.lv >= evoLv(m.sp) ? 2 : 1; }
const typeMult = (a, b) => (b === (a + 1) % 3) ? 1.3 : (a === (b + 1) % 3) ? 0.8 : 1;
const needXp = m => m.lv * 10;
function healAll() { S.party.forEach(m => { m.hp = mhp(m); m.pp = MOVES[grp(m.sp)].map(x => x.pp); }); S.box.forEach(m => { m.hp = mhp(m); }); }
const alive = () => S.party.filter(m => m.hp > 0);
const avgLv = () => S.party.length ? S.party.reduce((a, m) => a + m.lv, 0) / S.party.length : 0;
const caughtCount = () => Object.keys(S.caught).length;
