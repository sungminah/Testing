'use strict';
/* ===== core: tiện ích, RNG, coroutine, input, âm thanh ===== */
const W = 240, H = 160, T = 16;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
let _rng = Math.random;
function seed(n) { let a = n >>> 0; _rng = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = () => _rng();
const ri = n => Math.floor(rand() * n);
const pick = a => a[ri(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function wpick(items, wf) {
  let tot = 0; const ws = items.map(x => { const w = Math.max(0, wf(x)); tot += w; return w; });
  if (tot <= 0) return pick(items);
  let r = rand() * tot;
  for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

/* ---- coroutine: yield n = chờ n frame; yield fn = chờ tới khi fn() true; yield* gen ---- */
class Co {
  constructor(g) { this.it = g; this.w = 0; this.pred = null; this.done = false; }
  step() {
    if (this.done) return;
    if (this.w > 0) { this.w--; return; }
    if (this.pred) { if (!this.pred()) return; this.pred = null; }
    let r;
    try { r = this.it.next(); } catch (e) { this.done = true; (window.__errors = window.__errors || []).push(String(e && e.stack || e)); console.error(e); return; }
    if (r.done) { this.done = true; return; }
    const v = r.value;
    if (typeof v === 'number') this.w = v; else if (typeof v === 'function') this.pred = v;
  }
}
let script = null;
function run(genFn) { if (script && !script.done) return false; script = new Co(genFn()); return true; }
const busy = () => !!(script && !script.done);

/* ---- input ---- */
const Inp = { held: { u: 0, d: 0, l: 0, r: 0 }, a: 0, b: 0, m: 0 };
const KEYMAP = { ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
const Modal = { open: false, onKey: null };
function pressKey(k, down) {
  if (k === 'u' || k === 'd' || k === 'l' || k === 'r') Inp.held[k] = down ? 1 : 0;
  else if (down) { if (k === 'a') Inp.a = 1; else if (k === 'b') Inp.b = 1; else if (k === 'm') Inp.m = 1; }
}
/* điều hướng bằng phím trong menu/câu hỏi/tiêu đề: ↑← = trước, ↓→ = sau, Enter/Space/Z = chọn */
function navKeys(items, e) {
  if (!items.length) return false;
  const i = items.indexOf(document.activeElement), k = e.key;
  if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd') { items[(i + 1) % items.length].focus({ preventScroll: false }); return true; }
  if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a') { items[(i <= 0 ? items.length : i) - 1].focus(); return true; }
  if ((k === 'Enter' || k === ' ' || k === 'z') && i >= 0) { items[i].dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
  return false;
}
const modalItems = () => $$('#modal button:not(:disabled), #modal [tabindex="0"]');
function focusFirst(items) { if (items[0]) items[0].focus({ preventScroll: true }); }
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (Modal.open) { if ((Modal.onKey && Modal.onKey(e)) || navKeys(modalItems(), e)) e.preventDefault(); return; }
  if (typeof Wd !== 'undefined' && Wd.mode === 'title') { if (navKeys($$('#screen .title button'), e)) e.preventDefault(); return; }
  if (KEYMAP[e.key]) { pressKey(KEYMAP[e.key], 1); e.preventDefault(); return; }
  if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter' || e.key === ' ') { pressKey('a', 1); e.preventDefault(); }
  else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape' || e.key === 'Backspace') { pressKey('b', 1); e.preventDefault(); }
  else if (e.key === 'm' || e.key === 'M') { pressKey('m', 1); e.preventDefault(); }
});
document.addEventListener('keyup', e => { if (KEYMAP[e.key]) pressKey(KEYMAP[e.key], 0); });
window.addEventListener('blur', () => { for (const k in Inp.held) Inp.held[k] = 0; });
$$('#pad button').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); pressKey(k, 1); });
  const up = () => pressKey(k, 0);
  b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
});

/* ---- âm thanh (WebAudio, rất nhẹ) ---- */
const Snd = {
  on: true, ac: null,
  tone(f, d = .08, type = 'square', v = .04, when = 0) {
    if (!this.on) return;
    try {
      if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
      const ac = this.ac, o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + when;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + d + .02);
    } catch (e) { /* không có audio */ }
  },
  ok() { this.tone(660, .09); this.tone(880, .12, 'square', .04, .09); },
  ng() { this.tone(180, .22, 'sawtooth', .05); },
  hit() { this.tone(120, .1, 'square', .06); },
  lvl() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .12, 'square', .04, i * .09)); },
  tap() { this.tone(440, .03, 'square', .02); }
};
