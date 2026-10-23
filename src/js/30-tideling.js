'use strict';
/* ===== 150 Tideling = 50 trái cây × 3 nhóm (Thú / Năng lực / Nguyên tố), mỗi loài 2 dạng. Vẽ bằng vector theo thủ tục. ===== */
const FRUITS = [
  ['Apple', '#e53935', '#43a047', 'plain'], ['Mango', '#ffb300', '#ef6c00', 'grad'], ['Peach', '#ffab91', '#f06292', 'grad'], ['Plum', '#7b1fa2', '#ab47bc', 'plain'],
  ['Pear', '#c0ca33', '#827717', 'dots'], ['Cherry', '#c62828', '#8d6e63', 'plain'], ['Grape', '#6a1b9a', '#4caf50', 'dots'], ['Lemon', '#fdd835', '#f9a825', 'plain'],
  ['Lime', '#7cb342', '#33691e', 'plain'], ['Melon', '#aed581', '#fff59d', 'stripes'], ['Berry', '#d81b60', '#f8bbd0', 'dots'], ['Kiwi', '#8d6e63', '#7cb342', 'seeds'],
  ['Fig', '#6d4c41', '#e91e63', 'plain'], ['Date', '#5d4037', '#8d6e63', 'stripes'], ['Guava', '#9ccc65', '#f48fb1', 'seeds'], ['Papaya', '#ffa726', '#ef5350', 'seeds'],
  ['Lychee', '#ef5350', '#ffcdd2', 'dots'], ['Durian', '#aeb74a', '#6d7a1c', 'spikes'], ['Banana', '#ffee58', '#8d6e63', 'stripes'], ['Coconut', '#6d4c41', '#efebe9', 'plain'],
  ['Orange', '#fb8c00', '#ffcc80', 'dots'], ['Yuzu', '#fbc02d', '#f57f17', 'dots'], ['Ume', '#f48fb1', '#ad1457', 'dots'], ['Nashi', '#d4c26a', '#8d6e63', 'dots'],
  ['Mikan', '#ff9800', '#4caf50', 'plain'], ['Citron', '#fff176', '#c0ca33', 'dots'], ['Quince', '#ffd54f', '#a1887f', 'plain'], ['Apricot', '#ffb74d', '#e65100', 'grad'],
  ['Pomelo', '#dce775', '#fff9c4', 'plain'], ['Tangelo', '#ff7043', '#ffe0b2', 'dots'], ['Pitaya', '#ec407a', '#f8bbd0', 'spikes'], ['Passion', '#7e57c2', '#fff176', 'seeds'],
  ['Mulberry', '#4a148c', '#ce93d8', 'dots'], ['Cranberry', '#b71c1c', '#ef9a9a', 'dots'], ['Currant', '#d32f2f', '#212121', 'dots'], ['Olive', '#827717', '#cddc39', 'plain'],
  ['Granat', '#c2185b', '#ffcdd2', 'seeds'], ['Tamarind', '#8d6e63', '#d7ccc8', 'stripes'], ['Jackfruit', '#cddc39', '#9e9d24', 'spikes'], ['Rambutan', '#e53935', '#fff59d', 'spikes'],
  ['Longan', '#d7b377', '#fff8e1', 'plain'], ['Soursop', '#7cb342', '#e8f5e9', 'spikes'], ['Starfruit', '#ffeb3b', '#fff59d', 'stripes'], ['Loquat', '#ffa000', '#ffe082', 'plain'],
  ['Medlar', '#a1887f', '#efebe9', 'plain'], ['Sapote', '#bf7a47', '#ffcc80', 'plain'], ['Salak', '#8d6e63', '#d7ccc8', 'scales'], ['Cashew', '#ff7043', '#ffe082', 'plain'],
  ['Acerola', '#ef5350', '#ffcdd2', 'plain'], ['Jujube', '#a1362c', '#e57373', 'stripes']
];
const SUF = [['paw', 'fang'], ['eye', 'sage'], ['wisp', 'storm']];
const NSPECIES = FRUITS.length * 3;
function spInfo(id) { const g = id % 3, f = FRUITS[Math.floor(id / 3)]; return { id, g, fruit: f[0], c1: f[1], c2: f[2], pat: f[3] }; }
const spName = (id, form = 1) => { const i = spInfo(id); return i.fruit + SUF[i.g][form - 1]; };

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shade(hex, k) { // k<1 tối hơn, k>1 sáng hơn (trộn trắng)
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k <= 1) { r *= k; g *= k; b *= k; } else { const m = k - 1; r += (255 - r) * m; g += (255 - g) * m; b += (255 - b) * m; }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}
function drawTideling(g, sp, form, cx, cy, r, o = {}) {
  const I = spInfo(sp), R = mulberry(sp * 7919 + 13), t = o.t || 0, f2 = form === 2;
  g.save(); g.translate(cx, cy + Math.sin(t / 22) * r * 0.035); if (o.flip) g.scale(-1, 1);
  const sc = f2 ? 1.1 : 1; g.scale(sc, sc);
  // bóng
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, r * 1.02, r * 0.85, r * 0.16, 0, 0, 7); g.fill();
  const dk = shade(I.c1, .7), lt = shade(I.c1, 1.35);
  const eyeR = r * (0.13 + R() * 0.05), eyeX = r * (0.3 + R() * 0.1), eyeY = -r * (0.02 + R() * 0.1);
  // ---- phần phía sau ----
  if (I.g === 0) { // Thú: đuôi
    g.strokeStyle = dk; g.lineWidth = r * 0.2; g.lineCap = 'round'; g.beginPath();
    g.moveTo(r * .7, r * .5); g.bezierCurveTo(r * 1.3, r * .5, r * 1.3, -r * .2 - (f2 ? r * .2 : 0), r * 1.0, -r * .35); g.stroke();
    g.fillStyle = I.c2; g.beginPath(); g.arc(r * 1.0, -r * .38, r * .13, 0, 7); g.fill();
  } else if (I.g === 1) { // Năng lực: vòng hào quang / quỹ đạo
    g.strokeStyle = shade(I.c2, 1.2); g.globalAlpha = .55; g.lineWidth = r * .06;
    g.beginPath(); g.ellipse(0, 0, r * (f2 ? 1.5 : 1.28), r * (f2 ? .55 : .42), -.35, 0, 7); g.stroke(); g.globalAlpha = 1;
  } else { // Nguyên tố: hào quang
    const a = g.createRadialGradient(0, 0, r * .4, 0, 0, r * (f2 ? 1.7 : 1.4)); a.addColorStop(0, shade(I.c2, 1.3) + ''); a.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalAlpha = .45; g.fillStyle = a; g.beginPath(); g.arc(0, 0, r * (f2 ? 1.7 : 1.4), 0, 7); g.fill(); g.globalAlpha = 1;
    const nf = f2 ? 5 : 3; // lửa/giọt phía sau
    for (let i = 0; i < nf; i++) { const ang = Math.PI * (0.15 + i / (nf - 1 || 1) * 0.7) + Math.PI, wob = Math.sin(t / 8 + i) * r * .06; wisp(g, Math.cos(ang) * r * .75, Math.sin(ang) * r * .75, r * (.35 + R() * .15), ang + Math.PI / 2 + wob / r, I.c2, I.c1); }
  }
  // ---- thân ----
  const body = g.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.05);
  if (I.pat === 'grad') { body.addColorStop(0, shade(I.c2, 1.25)); body.addColorStop(.6, I.c1); body.addColorStop(1, shade(I.c1, .75)); } else { body.addColorStop(0, lt); body.addColorStop(.55, I.c1); body.addColorStop(1, dk); }
  if (I.pat === 'spikes' || I.pat === 'scales') { g.fillStyle = shade(I.c2, .8); const n = 12; for (let i = 0; i < n; i++) { const a = i / n * 6.283; g.beginPath(); g.moveTo(Math.cos(a - .18) * r * .92, Math.sin(a - .18) * r * .92); g.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2); g.lineTo(Math.cos(a + .18) * r * .92, Math.sin(a + .18) * r * .92); g.fill(); } }
  g.fillStyle = body; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
  if (I.pat === 'dots') { g.fillStyle = I.c2; g.globalAlpha = .55; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((R() - .5) * r * 1.6, (R() - .3) * r * 1.5, r * (.05 + R() * .05), 0, 7); g.fill(); } g.globalAlpha = 1; }
  else if (I.pat === 'stripes') { g.strokeStyle = I.c2; g.globalAlpha = .45; g.lineWidth = r * .1; for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(i * r * .3, 0, r * .12, r * 1.1, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; }
  else if (I.pat === 'seeds') { g.fillStyle = '#3e2723'; g.globalAlpha = .7; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse((R() - .5) * r * 1.5, r * (.15 + R() * .7), r * .035, r * .06, R() * 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
  else if (I.pat === 'scales') { g.strokeStyle = shade(I.c1, .6); g.globalAlpha = .5; g.lineWidth = r * .03; for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { g.beginPath(); g.arc(x * r * .3 + (y & 1) * r * .15, y * r * .28, r * .14, 0, Math.PI); g.stroke(); } g.globalAlpha = 1; }
  // bụng sáng
  g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.ellipse(0, r * .5, r * .55, r * .42, 0, 0, 7); g.fill();
  g.restore();
  // bóng sáng
  g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-r * .45, -r * .55, r * .17, r * .09, -.6, 0, 7); g.fill();
  // cuống + lá
  g.strokeStyle = '#6d4c41'; g.lineWidth = r * .08; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * .96); g.lineTo(r * .04, -r * 1.2); g.stroke();
  g.fillStyle = f2 ? '#2e9e4a' : '#4caf50'; g.beginPath(); g.ellipse(r * .24, -r * 1.16, r * .26, r * .11, -.5, 0, 7); g.fill();
  if (f2) { g.beginPath(); g.ellipse(-r * .2, -r * 1.12, r * .22, r * .1, .6, 0, 7); g.fill(); }
  // ---- đặc trưng nhóm ----
  if (I.g === 0) { // Thú: tai + chân
    for (const sx of [-1, 1]) {
      g.fillStyle = dk; g.beginPath(); g.moveTo(sx * r * .45, -r * .78); g.lineTo(sx * r * (f2 ? .92 : .8), -r * (f2 ? 1.45 : 1.2)); g.lineTo(sx * r * .85, -r * .35); g.closePath(); g.fill();
      g.fillStyle = '#f8bbd0'; g.beginPath(); g.moveTo(sx * r * .55, -r * .72); g.lineTo(sx * r * .78, -r * (f2 ? 1.2 : 1.05)); g.lineTo(sx * r * .78, -r * .45); g.closePath(); g.fill();
      g.fillStyle = dk; g.beginPath(); g.ellipse(sx * r * .5, r * .92, r * .22, r * .14, 0, 0, 7); g.fill();
    }
    if (f2) { g.fillStyle = '#fff'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * r * .18, r * .42); g.lineTo(sx * r * .1, r * .62); g.lineTo(sx * r * .26, r * .5); g.fill(); } }
  } else if (I.g === 1) { // Năng lực: ngọc trán, ăng-ten, quả cầu bay
    const gem = shade(I.c2, 1.4);
    g.fillStyle = gem; g.strokeStyle = '#fff'; g.lineWidth = r * .03; g.beginPath(); g.moveTo(0, -r * .62); g.lineTo(r * .11, -r * .5); g.lineTo(0, -r * .36); g.lineTo(-r * .11, -r * .5); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#5c6bc0'; g.lineWidth = r * .04; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * r * .3, -r * .9); g.quadraticCurveTo(sx * r * .7, -r * 1.2, sx * r * .75, -r * (f2 ? 1.55 : 1.35)); g.stroke(); g.fillStyle = '#ffeb3b'; g.beginPath(); g.arc(sx * r * .75, -r * (f2 ? 1.55 : 1.35), r * .09, 0, 7); g.fill(); }
    const no = f2 ? 4 : 2; for (let i = 0; i < no; i++) { const a = t / 30 + i * 6.283 / no; g.fillStyle = shade(I.c2, 1.2); g.globalAlpha = .85; g.beginPath(); g.arc(Math.cos(a) * r * 1.3, Math.sin(a) * r * .45 - r * .1, r * .1, 0, 7); g.fill(); g.globalAlpha = 1; }
    g.fillStyle = dk; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * r * .4, r * .93, r * .2, r * .12, 0, 0, 7); g.fill(); }
  } else { // Nguyên tố: ngọn lửa/giọt trên đầu + đuôi
    for (let i = 0; i < 3; i++) wisp(g, (i - 1) * r * .45, r * .85, r * (.5 + R() * .15), Math.PI + (i - 1) * .35 + Math.sin(t / 9 + i) * .08, I.c2, I.c1);
    wisp(g, 0, -r * .95, r * (f2 ? .8 : .5), Math.sin(t / 10) * .15, I.c2, I.c1);
    if (f2) { wisp(g, -r * .55, -r * .8, r * .5, -.5, I.c2, I.c1); wisp(g, r * .55, -r * .8, r * .5, .5, I.c2, I.c1); }
  }
  // ---- mặt ----
  for (const sx of [-1, 1]) {
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx * eyeX, eyeY, eyeR * 1.1, eyeR * 1.3, 0, 0, 7); g.fill();
    g.fillStyle = '#1d2433'; g.beginPath(); g.ellipse(sx * eyeX + eyeR * .1, eyeY + eyeR * .1, eyeR * .65, eyeR * .85, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(sx * eyeX - eyeR * .1, eyeY - eyeR * .3, eyeR * .26, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(255,120,140,.45)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * r * .58, eyeY + r * .26, r * .1, r * .06, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#1d2433'; g.lineWidth = r * .045; g.lineCap = 'round'; g.beginPath(); g.arc(0, eyeY + r * .22, r * .13, .2, Math.PI - .2); g.stroke();
  g.restore();
}
function wisp(g, x, y, h, rot, c2, c1) { // giọt/ngọn lửa
  g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createLinearGradient(0, 0, 0, -h); gr.addColorStop(0, c1); gr.addColorStop(1, shade(c2, 1.4));
  g.fillStyle = gr; g.globalAlpha = .9; g.beginPath(); g.moveTo(-h * .28, 0); g.quadraticCurveTo(-h * .35, -h * .55, 0, -h); g.quadraticCurveTo(h * .35, -h * .55, h * .28, 0); g.closePath(); g.fill(); g.restore();
}
const _tcache = new Map();
function tidelingCanvas(sp, form, size, sil) {
  const key = sp + ':' + form + ':' + size + ':' + (sil ? 1 : 0);
  if (_tcache.has(key)) return _tcache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  drawTideling(g, sp, form, size / 2, size * 0.5, size * 0.28);
  if (sil) { g.globalCompositeOperation = 'source-in'; g.fillStyle = '#1d2433'; g.fillRect(0, 0, size, size); }
  _tcache.set(key, c); return c;
}
