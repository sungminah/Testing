# Hướng dẫn đăng bán sách tô màu "Mandala Calm"

Tài liệu này đi từ file đã có sẵn đến lúc sách lên Amazon KDP và Etsy. Các con số về phí, giá in, quy định đều là **ước tính tại thời điểm viết**: hãy kiểm tra lại trên trang chính thức của KDP/Etsy trước khi làm.

## 0. Bạn đang có gì (thư mục `output/`)

| File | Dùng để |
|---|---|
| `interior_kdp.pdf` | Ruột sách cho **Amazon KDP**: 84 trang, khổ 8.5x11 in, mỗi hình in một mặt, mặt sau để trắng |
| `cover_kdp_fullwrap.pdf` | Bìa trọn bộ (bìa sau + gáy + bìa trước) cho KDP |
| `printable_digital.pdf` | Bản PDF tải về để bán trên **Etsy/Gumroad** (43 trang, không có trang trắng) |
| `preview_sheet.png` | Ảnh tổng hợp 40 hình, dùng làm ảnh quảng cáo |
| `cover_fullwrap_preview.png` | Ảnh xem nhanh bìa |

Cả 40 hình do chương trình tự vẽ (đường nét vector sạch, không có vùng xám hay đen đặc), nên in rất nét.

## 1. Việc BẮT BUỘC làm trước khi đăng

### 1.1 Đổi tên tác giả

Mở `config.json`, đổi `"author": "Your Name"` thành **bút danh** bạn muốn in trên bìa (không nhất thiết là tên thật; tên thật chỉ cần điền đúng trong tài khoản KDP để nhận tiền và thuế).

Bạn cũng có thể đổi `title`, `subtitle`, `tagline`, `back_blurb` (mô tả mặt sau bìa).

### 1.2 Tạo lại file

```bash
cd coloring-book
pip install -r requirements.txt
python3 build_book.py
```

Lệnh trên ghi lại toàn bộ file trong `output/`. Cần có `pdftoppm` (gói `poppler-utils`) nếu muốn có ảnh xem nhanh bìa; nếu thiếu thì chỉ mất ảnh đó.

### 1.3 Muốn hình khác đi

Đổi `"seed_start"` trong `config.json` (ví dụ 100 thành 500) để ra 40 hình hoàn toàn khác. Cùng một số thì luôn ra cùng bộ hình, nên có thể làm "Vol. 2", "Vol. 3" bằng cách đổi số này.

### 1.4 Nhìn lại bằng mắt

Mở `interior_kdp.pdf` và `cover_kdp_fullwrap.pdf` xem từng trang. Nếu muốn chỉnh bìa thêm (đổi màu, thêm chữ), bạn có thể làm bìa trước bằng Canva rồi xuất theo đúng kích thước mà KDP Cover Calculator cho (xem mục 2, bước 5).

## 2. Đăng sách giấy lên Amazon KDP

### Bước 1. Tạo tài khoản

1. Vào **kdp.amazon.com**, đăng nhập bằng tài khoản Amazon của bạn hoặc tạo mới.
2. Hoàn thành **Tax Interview** (khai thuế). Người không ở Mỹ thường điền biểu mẫu W-8BEN. Điền trung thực và theo hướng dẫn trên màn hình; nếu không chắc về thuế, hãy hỏi người am hiểu thuế ở Việt Nam.
3. Điền **thông tin thanh toán** (tài khoản ngân hàng nhận tiền). Hãy xem lại các hình thức KDP hỗ trợ cho Việt Nam trong phần Payment của tài khoản.

### Bước 2. Tạo sách mới

**Bookshelf → Create → Paperback.**

### Bước 3. Tab "Paperback Details"

| Ô | Điền gì |
|---|---|
| Language | English |
| Book Title | `Mandala Calm` |
| Subtitle | `A Coloring Book for Adults with 40 Relaxing Mandala Designs for Stress Relief and Mindfulness` |
| Series | Bỏ trống (hoặc tạo series nếu sau này làm nhiều tập) |
| Edition number | Bỏ trống |
| Author | Bút danh trong `config.json` (**phải trùng với tên in trên bìa**) |
| Contributors | Bỏ trống |

**Description** (dán nguyên văn, bạn có thể sửa):

```
Unwind one page at a time with 40 original mandala designs made for relaxing, creative coloring.

WHAT'S INSIDE
• 40 unique mandalas, from simple floral patterns to detailed ornamental designs
• Single-sided pages, so markers and gel pens will not bleed onto the next design
• Large 8.5 x 11 inch pages with plenty of space for color
• Clean, crisp lines that are easy to color inside

PERFECT FOR
• Stress relief and mindful downtime
• Beginners and experienced colorists
• A thoughtful gift for friends and family

No experience needed. Just pick your favorite colors and enjoy a calm, creative break.
```

**Keywords** (7 ô, mỗi ô tối đa 50 ký tự):

1. `mandala coloring book for adults`
2. `stress relief coloring pages`
3. `relaxation gift for women`
4. `mindfulness art activity`
5. `anxiety relief coloring`
6. `adult coloring book single sided pages`
7. `meditation coloring patterns for markers`

Không dùng tên thương hiệu của người khác, không viết "best seller" hay lời hứa chữa bệnh.

**Categories:** bấm *Choose categories*, tìm theo mục **Crafts, Hobbies & Home → Coloring Books for Grown-Ups** (có nhánh *Mandalas*) và chọn tối đa 3 mục gần nhất.

**Content questions:**
- *Is this a low-content/no-content book?* Sách tô màu thường được xem là low-content; làm theo gợi ý hiện hành của KDP khi trả lời câu này.
- *Adult content:* **No**.
- *AI-generated content:* xem mục **4. Khai báo AI** bên dưới.

### Bước 4. Tab "Paperback Content"

| Mục | Chọn |
|---|---|
| ISBN | **Get a free KDP ISBN** (miễn phí; KDP làm nhà xuất bản) |
| Publication date | Để trống (xuất bản ngay) |
| Print options → Interior & paper type | **Black & white interior with white paper** |
| Trim size | **8.5 x 11 in (21.59 x 27.94 cm)** |
| Bleed settings | **No Bleed** |
| Paperback cover finish | **Matte** (hoặc Glossy tùy sở thích; Matte thường được ưa hơn cho sách tô màu) |

Tải lên:
- **Manuscript:** `output/interior_kdp.pdf`
- **Book cover:** chọn *Upload a cover you already have (print-ready PDF)*, rồi tải `output/cover_kdp_fullwrap.pdf`

Bấm **Launch Previewer** và xem hết các trang: kiểm tra không có cảnh báo lề (margin), hình không bị cắt, bìa khớp với gáy.

### Bước 5. Nếu KDP báo bìa sai kích thước

Gáy phụ thuộc số trang và loại giấy. File bìa hiện tính gáy 0.189 in cho 84 trang giấy trắng (0.002252 in/trang). Nếu KDP đo khác, vào **KDP Cover Calculator** trên trang trợ giúp của KDP, nhập số trang 84, khổ 8.5x11, giấy trắng, ruột đen trắng; rồi sửa giá trị `spine_inches_per_page` trong `config.json` và chạy lại `build_book.py`.

### Bước 6. Tab "Paperback Rights & Pricing"

- **Territories:** All territories.
- **Primary marketplace:** Amazon.com (thị trường Mỹ lớn nhất).
- **Price:** thử **$7.99** hoặc **$8.99** cho sách 84 trang khổ lớn.
- KDP hiển thị **tiền bản quyền ước tính** theo giá bạn đặt. Với giá list `P`, bạn nhận khoảng `60% x P` trừ phí in (phí in gồm một khoản cố định cộng thêm theo số trang). Hãy lấy con số từ máy tính của KDP trên màn hình; bạn không cần tự tính.
- Mục *Expanded Distribution*: có thể để mặc định, hoặc tắt nếu muốn đơn giản.

### Bước 7. Đặt mua bản in thử (rất nên làm)

Trước khi bấm Publish, **đặt mua một bản proof (author copy)** để xem chất lượng in thật: độ dày nét, độ thấm mực, bìa. Phí sách + vận chuyển về Việt Nam có thể khá cao so với giá bán, nhưng đây là cách chắc nhất để không bán sách lỗi. Nếu không muốn tốn tiền, ít nhất hãy xem kỹ Previewer.

### Bước 8. Xuất bản

Bấm **Publish Your Paperback Book**. Duyệt thường mất khoảng vài ngày (có khi tới 72 giờ). Khi sách "Live", bạn sẽ có trang bán trên Amazon.

## 3. Bán bản PDF tải về (Etsy hoặc Gumroad)

Đây là cách thêm nguồn thu **không cần in ấn**. Cùng 40 hình đó, bán bản PDF để khách tự in.

### Etsy

1. Mở shop Etsy bằng tài khoản cá nhân (có phí đăng bài nhỏ cho mỗi listing, cộng phí giao dịch và xử lý thanh toán; xem biểu phí hiện hành).
2. **Create listing → Digital**, tải `printable_digital.pdf` làm file tải về.
3. **Ảnh sản phẩm** (tối đa 10 ảnh): ảnh đầu là `preview_sheet.png` hoặc ảnh bìa; các ảnh sau là hình đơn lẻ, ảnh minh họa cảnh tô màu, ảnh hướng dẫn in. Bạn có thể ghép bằng Canva (miễn phí).
4. Tiêu đề gợi ý: `Mandala Coloring Pages for Adults, 40 Printable Stress Relief Designs, Instant Download PDF`
5. Giá thử: khoảng $3 đến $6.
6. Ghi rõ trong mô tả: định dạng PDF, khổ US Letter, 40 hình, dùng cá nhân, không có sản phẩm vật lý.

### Gumroad / Lemon Squeezy

Tạo sản phẩm, tải PDF lên, đặt giá. Ít người tự tìm đến hơn Etsy nên bạn cần tự dẫn khách (Pinterest, mạng xã hội).

## 4. Khai báo AI (đọc kỹ)

Amazon KDP yêu cầu khai báo nội dung tạo ra bằng AI khi đăng sách. Trong dự án này:
- **Hình** do chương trình toán học tạo ra (thuật toán, không phải công cụ AI tạo ảnh).
- **Mã chương trình, bìa, phần chữ mô tả** được viết với sự hỗ trợ của AI.

KDP phân biệt "AI-generated" (do AI tạo) và "AI-assisted" (bạn tự tạo, AI chỉ hỗ trợ chỉnh). Vì định nghĩa có thể thay đổi, **hãy đọc định nghĩa hiện hành của KDP** và chọn câu trả lời trung thực nhất. Khi không chắc, khai báo là có dùng AI thường an toàn hơn là bỏ sót.

## 5. Quảng bá để có người mua

Làm sách xong mới là một nửa việc. Khách không tự đến.
- **Pinterest:** đăng ảnh các trang mẫu (tô thử vài hình bằng màu để làm ảnh đẹp), dẫn về link Amazon/Etsy. Đây là kênh hợp với sách tô màu.
- **Facebook/Reddit/nhóm tô màu:** chia sẻ trang mẫu, tuân thủ nội quy nhóm (nhiều nhóm cấm quảng cáo).
- **TikTok/Instagram Reels:** quay clip tô màu một trang (không cần lộ mặt).
- Xin đánh giá thật từ người quen đã mua; **không mua đánh giá**, KDP và Etsy đều cấm.

## 6. Kỳ vọng thực tế

- Thị trường sách tô màu mandala **rất đông**. Cuốn đầu có thể bán rất ít hoặc không bán được cho đến khi bạn có đánh giá và có lượt xem.
- Đừng kỳ vọng thu nhập ngay. Hãy xem đây là thử nghiệm với chi phí gần như bằng 0 (chỉ tốn thời gian và có thể phí bản in thử).
- Muốn cải thiện: đọc đánh giá của các sách cùng ngách, làm bộ sưu tập theo **chủ đề hẹp** (ví dụ mandala theo mùa, mandala chữ số cho người mới), làm nhiều tập cùng phong cách, và đổi `seed_start` để tạo tập mới.

## 7. Danh sách kiểm tra trước khi bấm Publish

- [ ] Đã đổi tên tác giả trong `config.json` và chạy lại `build_book.py`
- [ ] Đã xem toàn bộ `interior_kdp.pdf` và `cover_kdp_fullwrap.pdf`
- [ ] Tên tác giả trong form KDP trùng với tên trên bìa
- [ ] Đã chọn Black & white, white paper, 8.5x11, No Bleed
- [ ] Previewer không báo lỗi
- [ ] Đã trả lời trung thực mục AI
- [ ] Đã thêm thông tin thuế và thanh toán
- [ ] (Khuyến nghị) Đã đặt mua bản in thử
