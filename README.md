# Coral Crown N5 🏝️ — game RPG học tiếng Nhật JLPT N5

Game **HTML5 canvas, một file duy nhất, chạy offline**, chơi được trên **điện thoại (cảm ứng) và máy tính (bàn phím)**.
Phong cách GBA / Pokémon Emerald nhưng đồ hoạ vẽ vector ở độ phân giải thật của màn hình (sắc nét, có chi tiết; bản đồ logic 240×160). **IP gốc hoàn toàn**: quần đảo *Coral Crown* (Vương Miện San Hô), sinh vật **Tideling**, vật phẩm **Tidefruit**.
Giao diện tiếng Việt, giáo trình **Minna no Nihongo I (bài 1–25)**, đáp án luôn bằng tiếng Nhật.

> Đây là bản **N5** làm theo khuôn của "Pearl Archipelago" (N4), nhưng là một cuộc phiêu lưu khác (đảo, boss, NPC đều đổi tên).

## Chơi ngay

- Mở `docs/index.html` (hoặc `dist/index.html` sau khi build) bằng trình duyệt — không cần mạng, không cần server.
- Bật GitHub Pages: *Settings → Pages → Source: GitHub Actions* (đã có workflow `pages.yml`), hoặc *Deploy from branch → `/docs`*.

| Thao tác | Bàn phím | Cảm ứng |
|---|---|---|
| Di chuyển | ← ↑ → ↓ / WASD | D-pad |
| Nói chuyện / xác nhận | Z / Enter / Space | A (hoặc chạm hộp thoại) |
| Huỷ / quay lại | X / Esc | B |
| Menu | M | MENU |
| Trả lời câu hỏi | phím 1–4, hoặc ↑↓ rồi Enter | chạm đáp án |
| Mọi menu / Hải đồ / màn hình tiêu đề | ↑↓←→ chọn, Enter xác nhận, Esc quay lại | chạm |

## Vòng lặp chơi

- **Chọn 1 trong 3 nhân vật** (đầu bếp Hayato, nhà khảo cổ Rika, bác sĩ nhí Momo — thiết kế gốc, chỉ khác ngoại hình) rồi khám phá bản đồ theo ô (thị trấn, đường mòn cỏ cao, phòng boss) và **vào trong nhà**: trạm y tế (y tá chữa bệnh), cửa hàng (nói chuyện qua quầy để mua đồ), nhà dân (bà Haru giảng ngữ pháp + thử tài, bé Hiro đố từ vựng, giá sách ngữ pháp của chương). Người dân ngoài phố cũng có câu thử tài nhỏ (thưởng lần đầu). Nói chuyện NPC, luyện tập với thầy Sora, bắt Tideling bằng lưới, chữa ở trạm y tế, mua đồ, đánh trainer và **boss** cuối mỗi chương.
- NPC dân đảo, trưởng làng, bà và bé trong nhà đi lại tự nhiên (đi tới lui, đi vòng hình chữ nhật, hoặc đi quanh chỗ đứng); đứng yên khi đang nói chuyện hoặc có cảnh kịch bản.
- Vào trận có hiệu ứng: chớp sáng → màn hình khép lại theo dải ngang (chữ **VS** khi đấu trainer/boss) → mở ra, hai Tideling trượt vào; hết trận mờ dần về bản đồ. Hết PP vẫn có đòn "Gắng sức" để không bị kẹt.
- **Mọi chiêu / ném lưới / bỏ chạy đều phải trả lời đúng một câu hỏi tiếng Nhật.** Đúng → trúng (thưởng trả lời nhanh + chuỗi đúng). Sai → hụt, hiện giải thích, và **câu đó được hỏi lại sau** (lặp lại ngắt quãng kiểu Leitner, hộp 1–5).
- Sau mỗi câu (đúng *và* sai) có **bảng giải thích 5 phần**: ① câu hỏi + dịch → ② đáp án + nghĩa → ③ giải thích ngữ pháp → ④ từ trong câu (từ · cách đọc · nghĩa) → ⑤ dịch các đáp án (đọc hiểu: dịch cả đoạn văn). Không có nút "xem nghĩa" trước khi trả lời.

## Nội dung

| Chương / Đảo | Bài | Chủ đề |
|---|---|---|
| 0 · Đảo Khởi Hành (mở đầu) | — | **luyện romaji**: hiragana ⇄ romaji, katakana ⇄ romaji, âm ghép (kya, sha…), っ, âm kéo dài, từ vựng, chữ Hán đơn giản — boss: Cô Kana |
| 1 · Đảo Bình Minh | 1–3 | chào hỏi, giới thiệu, これ/それ/あれ, số, tiền, giờ — boss: Thuyền trưởng Minato |
| 2 · Đảo San Hô | 4–6 | giờ giấc, động từ ます, đi/đến/về, ăn uống, mời rủ |
| 3 · Đảo Xanh Lục | 7–9 | cho/nhận, で, tính từ, thích/giỏi/hiểu |
| 4 · Đảo Hải Đăng | 10–12 | あります/います, vị trí, đếm, so sánh, quá khứ tính từ |
| 5 · Đảo Mây | 13–15 | ～たい, thể て, ～てください, ～てもいい, ～ています |
| 6 · Đảo Hoàng Hôn | 16–19 | nối câu bằng て, ない形, thể từ điển, ～たことがある, ～たり～たり |
| 7 · Đảo Trăng | 20–22 | thể thường, ～と思います, ～と言いました, mệnh đề bổ nghĩa |
| 8 · Đảo Sao | 23–25 | ～とき, ～と, くれる/あげる/もらう, ～たら |

- **Câu hỏi tĩnh** (`src/js/11-questions.js` + `13`, `14`, `15`): 313 câu cho cả 25 bài + chương mở đầu (mỗi bài ≥ 8 câu), loại `g` ngữ pháp · `p` trợ từ · `h` chọn dạng đúng · `r` đọc hiểu · `o` sắp xếp. Độ khó d1–d3.
- **Câu hỏi sinh động** (`src/js/12-dyn.js`, mỗi câu có khoá xác định để Leitner hỏi lại đúng câu đó): `m` chữ cái (hiragana ⇄ katakana ⇄ romaji, có nhóm chữ dễ nhầm さ/ち, シ/ツ…) · `k` đọc / viết kanji từ 359 từ vựng · `v` nhóm từ (cái nào thuộc / không thuộc "のみもの", "のりもの"…) · `n` đọc **tiền** (300 さんびゃく, 8000 はっせん, 35,000…) và **giờ** (4 よじ, 7 しちじ, 9 くじ, 10 じゅっぷん…).
- **Độ khó theo vùng** (`AREA_DL`): thị trấn/luyện tập dễ → đường mòn → phòng trainer → boss khó nhất; chương sau dịch dần sang khó hơn. **Chương 1: d3 chỉ xuất hiện ở boss.** Trọng số chọn câu: câu chưa hỏi ×3, câu sai nhiều được ưu tiên, bài của chương hiện tại ×3, không lặp câu vừa hỏi.
- **Furigana tự động** từ bảng từ vựng (`10-vocab.js`): chương 1–3 hiện cho mọi chữ Hán; từ chương 4 trở đi những từ học đã lâu dần được ẩn (có thể ép "Luôn hiện" trong Cài đặt). Ghi rõ cách đọc bằng `{漢字|よみ}` khi cần.
- **Tideling: 150 loài = 3 hệ × 50** (Hệ Thú 🐾, Hệ Năng lực 🔮, Hệ Nguyên tố 🔥; 50 loại trái cây), mỗi loài **2 dạng** (tiến hoá ở cấp 12 + 3×chương), vẽ bằng thủ tục. Mỗi chương mở một nhóm 16–17 loài mới; loài chưa gặp hiện bóng đen trong **Sổ Tideling**. Khắc chế: Thú > Năng lực > Nguyên tố > Thú. Mỗi hệ có hiệu ứng chiêu riêng (vuốt cào / sóng tâm / quả cầu lửa-nước-lá-sét), số sát thương bay lên và gợi ý khắc chế ngay trong menu trận.
- **Hải đồ** (MENU → Hải đồ, SVG hình vương miện, 9 đảo): mở khoá tuyến tính (xong đảo n−1 mới mở đảo n), chỉ đi được sang đảo liền kề **hoặc qua lối tắt**. 5 lối tắt (🌳 đấu lính canh · 🛟 tìm "Dây phao" ở Đảo San Hô · 🪢 đủ 25 loài trong sổ · 🌊 cấp trung bình ≥ 30) chỉ dùng được khi **cả hai đảo đã mở** và đủ điều kiện.
- Menu: Nhật ký, Đội hình, Túi đồ, Hộp, Hải đồ, Sổ Tideling, **Tiến độ học** (hộp Leitner, tỉ lệ đúng theo loại, câu hay sai), **Ôn tập** (luyện lại câu hay sai hoặc 10 câu tổng hợp, không cần đánh nhau; mỗi câu đúng +3 💎), Lưu, Cài đặt (âm thanh, nhạc nền, furigana).
- **Kết thúc game:** thắng boss cuối (Đảo Sao) → màn hình chúc mừng kèm thống kê hành trình; sau đó vẫn chơi tiếp để bắt đủ Tideling, mở hết lối tắt.
- **Nhạc nền** chiptune tạo bằng WebAudio (khác nhau khi đi dạo / vào trận), tắt được trong Cài đặt.

## Cấu trúc & build

```
src/index.template.html   khung HTML
src/style.css             giao diện (DOM overlay cho hộp thoại, menu, câu hỏi)
src/js/00-core.js         RNG có hạt giống, coroutine (yield / yield*), input, âm thanh
src/js/05-chapters.js     9 chương (0 = mở đầu), bảng màu đảo, vị trí trên hải đồ, lối tắt
src/js/06-notes.js        ghi chú ngữ pháp từng chương (giá sách, bà Haru)
src/js/10-vocab.js        từ vựng + Hán Việt + furigana tự động
src/js/11-questions.js    kho câu hỏi tĩnh
src/js/12-dyn.js          câu hỏi sinh động
src/js/13-questions2.js   câu hỏi bổ sung bài 10–25
src/js/14-questions0.js   câu hỏi quy tắc romaji (chương mở đầu)
src/js/15-questions3.js   câu hỏi bổ sung bài 12–25 + câu sắp xếp
src/js/39-islands.js      bản đồ riêng cho cả 9 đảo, mỗi đảo một bố cục khác (đảo 3–8 dựng bởi tools/gen_islands.py: bến tàu, sông + cầu, đảo nổi, bãi biển, hồ + đền, đại lộ; có tự kiểm tra đường đi)
src/js/20-state.js        trạng thái, lưu/tải, Tideling của người chơi
src/js/21-quiz.js         chọn câu (độ khó + Leitner), giao diện hỏi, bảng giải thích
src/js/30-tideling.js     150 loài, vẽ vector
src/js/40-maps.js         bản đồ ASCII + NPC (thị trấn · đường mòn · phòng boss) × 9 đảo
src/js/41-world.js        camera, di chuyển, vẽ tile & nhân vật
src/js/42-scripts.js      cutscene / hội thoại / trainer / boss (generator)
src/js/50-battle.js       trận đấu
src/js/60-menu.js         menu, hải đồ SVG
src/js/99-main.js         vòng lặp chính, màn hình tiêu đề, API kiểm thử `window.G`
build.sh                  kiểm tra cú pháp từng file rồi ghép → dist/index.html và docs/index.html
test/                     kiểm thử Playwright + bot tự chơi
```

```bash
npm install                      # chỉ để chạy kiểm thử (playwright)
./build.sh                       # ghép một file HTML
npm test                         # build + toàn bộ kiểm thử (≈15 giây)
node test/run.js                 # kiểm thử nhanh (chỉ chương 1)
```

Sau khi sửa `src/`, nhớ chạy `./build.sh` và commit cả `docs/index.html` (CI sẽ báo lỗi nếu bản build không khớp).

## Kiểm thử (`test/`)

1. **Dữ liệu** (chạy trên bản build thật): mọi câu có 4 đáp án khác nhau, **không có tiếng Việt trong đề/đáp án**, đủ giải thích + 4 nghĩa đáp án, đủ 25 bài, **mọi chữ Hán đều có furigana**, ~5.800 câu động sinh thử (đáp án đúng, không trùng, không vượt bài của chương, không đồng âm gây nhầm), đọc số/giờ đúng, 150 loài (3×50, tên không trùng, vẽ được), bản đồ liền thông tới mọi NPC/lối ra.
2. **Bot tự chơi** (BFS trên bản đồ thật, bấm đúng nút DOM, **cố tình trả lời sai ~35%**): chơi từ đầu, nhận Tideling, học với thầy, bắt Tideling, đánh trainer + boss, ra khơi bằng Hải đồ; `--full` chơi tiếp qua **cả 9 chương**. Kiểm tra không lỗi JS, không kẹt, có câu được hỏi lại sau khi sai.
3. Hải đồ & lối tắt (điều kiện), lưu/tải, trạm y tế, cửa hàng, nhặt vật phẩm, tiến hoá, whiteout, và giao diện điện thoại (có D-pad, không cuộn ngang). Ảnh chụp màn hình lưu ở `test/out/`.

## Hạn chế còn lại

- Câu hỏi do mình tự soạn, chưa có người bản ngữ rà soát; nếu thấy câu nào có hai đáp án đúng hoặc đáp án sai, hãy sửa trong `src/js/1x-questions*.js`.
- Bảng từ vựng là từ vựng Minna I (359 từ) nên số chữ Hán (~350) vượt "~100 chữ N5"; chưa lọc riêng danh sách kanji N5 chính thức. Bảng Hán Việt đã phủ đủ các chữ này.
- Mỗi đảo có bố cục và **màu cỏ riêng** (xanh tươi, vàng chanh, ngọc, rừng sẫm, xám lam, bạc hà, vàng cát, xanh tím, hồng); các đảo 3–8 ở mức "khung chủ đề" (ít chi tiết trang trí hơn 3 đảo đầu); 3 căn nhà (y tế, cửa hàng, nhà dân) có 3 kiểu bày trí luân phiên theo đảo.
- Chưa có phần nghe (audio tiếng Nhật) trong câu hỏi.
- Trên điện thoại dọc, khung game giữ tỉ lệ 3:2 nên khá nhỏ (có gợi ý xoay ngang).
