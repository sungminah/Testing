# Mandala Calm: bộ tạo sách tô màu

Chương trình Python tự vẽ 40 mandala (nét vector đen trắng), ghép thành PDF ruột sách chuẩn Amazon KDP, bìa trọn bộ và bản PDF tải về.

- **Hướng dẫn đăng bán:** xem [`HUONG_DAN_DANG_BAN.md`](HUONG_DAN_DANG_BAN.md)
- **File thành phẩm:** thư mục [`output/`](output/)

## Chạy

```bash
pip install -r requirements.txt
python3 build_book.py
```

Chỉnh tên sách, tác giả, số trang, `seed_start` trong `config.json` rồi chạy lại.

## Cấu trúc

| File | Vai trò |
|---|---|
| `mandala.py` | Tạo hình mandala từ một `seed` (cùng seed cho cùng hình) |
| `build_book.py` | Ghép PDF ruột, bìa, bản tải về, ảnh xem trước |
| `config.json` | Tên sách, tác giả, số hình, màu nét... |
| `fonts/` | Phông DejaVu (giấy phép tự do, kèm file license) |
