'use strict';
/* ===== 8 chương = 8 đảo của quần đảo "Coral Crown" (Vương Miện San Hô) ===== */
const CH = [
  { id: 'hajime', name: 'Hajime-jima', vi: 'Đảo Khởi Hành', lessons: [0, 0], topic: 'Romaji, hiragana, katakana và chữ Hán đơn giản',
    boss: { name: 'Cô Kana', hair: '#e08a3a', body: '#f0c040' },
    pal: { g1: '#7fd36a', g2: '#5cb85a', path: '#ecd9a2', roof: '#e0703a', wall: '#fbf0d6', tree: '#2f9a52', water: ['#45a5de', '#62bff0'] },
    phrases: [['ありがとう。 (arigatou)', 'Cảm ơn.'], ['おはよう。 (ohayou)', 'Chào buổi sáng.'], ['さようなら。 (sayounara)', 'Tạm biệt.']] },
  { id: 'asahi', name: 'Asahi-jima', vi: 'Đảo Bình Minh', lessons: [1, 3], topic: 'Chào hỏi, giới thiệu, これ/それ/あれ, số, tiền, giờ',
    boss: { name: 'Thuyền trưởng Minato', hair: '#27406b', body: '#d8453a' },
    pal: { g1: '#c8dc6a', g2: '#a6c04c', path: '#f0e0a0', roof: '#e48a3a', wall: '#fbf1d8', tree: '#5f9a3a', water: ['#3f9bd8', '#59b3ea'] },
    phrases: [['はじめまして。わたしは ～です。', 'Chào lần đầu gặp. Tôi là ～.'], ['これは なんですか。', 'Đây là cái gì?'], ['これは いくらですか。', 'Cái này bao nhiêu tiền?']] },
  { id: 'sango', name: 'Sango-jima', vi: 'Đảo San Hô', lessons: [4, 6], topic: 'Giờ giấc, động từ ます, đi/đến/về, ăn uống, mời rủ',
    boss: { name: 'Bà Hanae', hair: '#8a3b5c', body: '#e48aa6' },
    pal: { g1: '#79d9bd', g2: '#56bd9e', path: '#f4dcc0', roof: '#e3708a', wall: '#fbeee6', tree: '#2f9a8a', water: ['#37a9c8', '#5cc4de'] },
    phrases: [['いま なんじですか。', 'Bây giờ là mấy giờ?'], ['まいあさ ６じに おきます。', 'Mỗi sáng tôi dậy lúc 6 giờ.'], ['いっしょに ごはんを たべませんか。', 'Cùng ăn cơm nhé?']] },
  { id: 'midori', name: 'Midori-jima', vi: 'Đảo Xanh Lục', lessons: [7, 9], topic: 'Cho/nhận, thể hiện bằng で, tính từ, thích/giỏi/hiểu',
    boss: { name: 'Chú Daichi', hair: '#3b2f22', body: '#3f7a4a' },
    pal: { g1: '#4fae62', g2: '#378d4a', path: '#d9c690', roof: '#3f8f6b', wall: '#eef3dc', tree: '#1f6f3a', water: ['#3a8fb8', '#55a9d0'] },
    phrases: [['はしで ごはんを たべます。', 'Tôi ăn cơm bằng đũa.'], ['もう ひるごはんを たべましたか。', 'Bạn đã ăn trưa chưa?'], ['わたしは おんがくが すきです。', 'Tôi thích âm nhạc.']] },
  { id: 'todai', name: 'Todai-jima', vi: 'Đảo Hải Đăng', lessons: [10, 12], topic: 'あります/います, vị trí, đếm, so sánh, quá khứ tính từ',
    boss: { name: 'Cô Ayame', hair: '#4b3a8c', body: '#6a5fcf' },
    pal: { g1: '#a9c3a4', g2: '#88a688', path: '#e4dcc8', roof: '#5a64c8', wall: '#f4f1e8', tree: '#4f7a5a', water: ['#3d7fcf', '#5e9be4'] },
    phrases: [['つくえの 上に 本が あります。', 'Trên bàn có sách.'], ['きのうは 雨でした。', 'Hôm qua trời mưa.'], ['夏より 冬の ほうが 好きです。', 'Tôi thích mùa đông hơn mùa hè.']] },
  { id: 'kumo', name: 'Kumo-jima', vi: 'Đảo Mây', lessons: [13, 15], topic: '～たいです, thể て, ～てください, ～てもいいです, ～ています',
    boss: { name: 'Anh Ren', hair: '#2d2d3a', body: '#3d8fd6' },
    pal: { g1: '#b6e0d8', g2: '#92c6be', path: '#f4f0e0', roof: '#4aa0e0', wall: '#fbfbf4', tree: '#4a9aa0', water: ['#4aa3dc', '#78c0f0'] },
    phrases: [['日本へ 行きたいです。', 'Tôi muốn đi Nhật.'], ['ちょっと 待って ください。', 'Xin chờ một chút.'], ['ここで 写真を 撮っても いいですか。', 'Chụp ảnh ở đây được không?']] },
  { id: 'yuhi', name: 'Yuhi-jima', vi: 'Đảo Hoàng Hôn', lessons: [16, 19], topic: 'Nối câu bằng て, ない形, thể từ điển, ～たことがあります, ～たり～たり',
    boss: { name: 'Cô Akane', hair: '#b4452a', body: '#ee8a3a' },
    pal: { g1: '#dccb72', g2: '#c0ae54', path: '#f0c890', roof: '#e07a3a', wall: '#fff0d2', tree: '#8aa03a', water: ['#e08a5a', '#f0a878'] },
    phrases: [['朝 起きて、シャワーを 浴びます。', 'Sáng dậy rồi tắm vòi sen.'], ['ここで たばこを 吸わないで ください。', 'Xin đừng hút thuốc ở đây.'], ['富士山に 登った ことが あります。', 'Tôi đã từng leo núi Phú Sĩ.']] },
  { id: 'tsuki', name: 'Tsuki-jima', vi: 'Đảo Trăng', lessons: [20, 22], topic: 'Thể thường, ～と思います, ～と言いました, mệnh đề bổ nghĩa danh từ',
    boss: { name: 'Thầy Tsubasa', hair: '#d8dce8', body: '#7a8cc8' },
    pal: { g1: '#9db4d8', g2: '#7c97c2', path: '#d6d8e4', roof: '#6a78b8', wall: '#eceef8', tree: '#3a5a8a', water: ['#2f5fa0', '#4a7cc0'] },
    phrases: [['あした 行く？ — うん、行く。', 'Mai bạn đi không? — Ừ, đi.'], ['明日は 雨が 降ると 思います。', 'Tôi nghĩ ngày mai trời sẽ mưa.'], ['これは 母が 作った ケーキです。', 'Đây là bánh do mẹ tôi làm.']] },
  { id: 'hoshi', name: 'Hoshi-jima', vi: 'Đảo Sao', lessons: [23, 25], topic: '～とき, ～と, くれる/あげる/もらう, ～たら, ～ても',
    boss: { name: 'Nữ vương Hoshino', hair: '#f0d070', body: '#c8409a' },
    pal: { g1: '#e6a9c6', g2: '#c98aac', path: '#f6e8b0', roof: '#c8409a', wall: '#fff6dc', tree: '#a85a8a', water: ['#2c4fa8', '#4a70c8'] },
    phrases: [['まっすぐ 行くと、駅が あります。', 'Đi thẳng thì có nhà ga.'], ['友達に 本を 貸して あげました。', 'Tôi đã cho bạn mượn sách.'], ['雨が 降ったら、行きません。', 'Nếu trời mưa thì tôi không đi.']] }
];
const chLabel = i => i === 0 ? 'Chương mở đầu' : 'Chương ' + i;
const lessonEnd = c => CH[c].lessons[1];
const lessonStart = c => CH[c].lessons[0];
function chapterOfLesson(l) { for (let i = 0; i < CH.length; i++) if (l <= CH[i].lessons[1]) return i; return CH.length - 1; }
/* hải đồ: toạ độ trên viewBox 360x240 */
const ISLE_POS = (() => { const out = []; for (let i = 0; i < 9; i++) { const th = (200 + i * 40) * Math.PI / 180; out.push([Math.round(180 + 148 * Math.cos(th)), Math.round(124 + 86 * Math.sin(th))]); } return out; })(); // vòng "vương miện"
/* lối tắt: cần CẢ HAI đảo đã mở + điều kiện. bend = độ cong của đường trên hải đồ */
const SHORTCUTS = [
  { id: 'root', a: 1, b: 3, bend: -26, icon: '🌳', name: 'Đường rễ cây', cond: 'duel', text: 'Đấu với lính canh rễ cây', guard: { name: 'Lính canh rễ cây', lv: 13 } },
  { id: 'buoy', a: 2, b: 5, bend: 22, icon: '🛟', name: 'Chuỗi phao', cond: 'item', item: 'buoy', text: 'Tìm "Dây phao" trên Đảo San Hô' },
  { id: 'rope', a: 3, b: 6, bend: -24, icon: '🪢', name: 'Cầu dây', cond: 'dex', n: 25, text: 'Bắt đủ 25 loài trong Sổ Tideling' },
  { id: 'root2', a: 4, b: 7, bend: 26, icon: '🌳', name: 'Đường rễ cổ thụ', cond: 'duel', text: 'Đấu với lính canh cổ thụ', guard: { name: 'Lính canh cổ thụ', lv: 33 } },
  { id: 'current', a: 5, b: 8, bend: -22, icon: '🌊', name: 'Hải lưu', cond: 'lv', n: 30, text: 'Cấp trung bình đội hình ≥ 30' }
];
