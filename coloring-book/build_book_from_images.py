#!/usr/bin/env python3
"""Biến một thư mục ảnh nét đen trắng (do bạn tạo bằng AI hoặc tự vẽ) thành sách KDP.

Chạy:
  python3 build_book_from_images.py THU_MUC_ANH --config book_hamster.json --out output/hamster_book

Việc script làm:
  * chuyển từng ảnh về đen trắng thuần, khổ 8.5x11 in, 300 DPI (2550x3300 px), có lề an toàn
  * cảnh báo ảnh quá nhỏ, quá nhiều vùng xám/đen, hoặc gần như trống
  * ghép PDF ruột KDP (mặt sau để trắng), bản PDF tải về cho Etsy, bìa trọn bộ, ảnh tổng hợp
Ảnh được sắp xếp theo tên file (01_xxx.png, 02_xxx.png, ...).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from build_book import (CREAM, IN, NAVY, PAGE_H, PAGE_W, PALETTE, centered, page_copyright,
                        page_howto, page_thanks, register_fonts, wrapped)

HERE = Path(__file__).resolve().parent
PXW, PXH = 2550, 3300
MARGIN = 130  # px (~0.43 in) lề an toàn
EXTS = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"}


def prepare(path: Path, threshold: int):
    """Trả về (ảnh L 2550x3300 đen trắng thuần, danh sách cảnh báo)."""
    warns = []
    im = Image.open(path).convert("L")
    w, h = im.size
    if min(w, h) < 1800:
        warns.append(f"ảnh nhỏ ({w}x{h}px): khi in sẽ bị mờ, nên tạo/phóng to tới >= 2000px chiều ngắn")
    gray = sum(im.histogram()[60:200]) / (w * h)
    if gray > 0.25:
        warns.append(f"{gray:.0%} điểm ảnh là màu xám/đổ bóng: trang tô màu cần nét đen trên nền trắng")
    box_w, box_h = PXW - 2 * MARGIN, PXH - 2 * MARGIN
    sc = min(box_w / w, box_h / h)
    im = im.resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.LANCZOS)
    page = Image.new("L", (PXW, PXH), 255)
    page.paste(im, ((PXW - im.width) // 2, (PXH - im.height) // 2))
    page = page.point(lambda p: 255 if p > threshold else 0)
    ink = 1 - sum(page.histogram()[128:]) / (PXW * PXH)
    if ink > 0.40:
        warns.append(f"{ink:.0%} diện tích là mực đen: quá nhiều vùng đen đặc")
    if ink < 0.02:
        warns.append(f"chỉ {ink:.1%} là nét vẽ: trang gần như trống")
    return page, warns


def draw_full(c, img):
    c.drawImage(ImageReader(img), 0, 0, PAGE_W, PAGE_H)
    c.showPage()


def title_page(c, cfg, first):
    c.setFillColorRGB(0, 0, 0)
    centered(c, cfg["title"].upper(), PAGE_H - 2.0 * IN, "Serif-Bold", 38)
    centered(c, cfg["subtitle"], PAGE_H - 2.65 * IN, "Sans", 18)
    if first is not None:
        w = 5.2 * IN
        h = w * PXH / PXW
        small = first.resize((1300, int(1300 * PXH / PXW)), Image.LANCZOS)
        c.drawImage(ImageReader(small), (PAGE_W - w) / 2, 2.2 * IN, w, h)
    centered(c, cfg["tagline"], 1.7 * IN, "Sans-Bold", 14)
    centered(c, cfg["author"], 1.1 * IN, "Sans", 16)
    c.showPage()


def build_interior(cfg, pages, path, kdp=True):
    c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), initialFontName="Sans")
    c.setTitle(f"{cfg['title']} - {cfg['subtitle']}")
    c.setAuthor(cfg["author"])
    n = 0
    title_page(c, cfg, pages[0] if pages else None)
    n += 1
    (page_copyright if kdp else page_howto)(c, cfg)
    n += 1
    for im in pages:
        draw_full(c, im)
        n += 1
        if kdp:
            c.showPage()
            n += 1
    page_thanks(c, cfg)
    n += 1
    if kdp and n % 2:
        c.showPage()
        n += 1
    c.save()
    return n


def build_cover(cfg, total_pages, art_path, path, back_art=None):
    spine = total_pages * cfg["spine_inches_per_page"] * IN
    bleed = 0.125 * IN
    W = bleed + PAGE_W + spine + PAGE_W + bleed
    H = PAGE_H + 2 * bleed
    c = canvas.Canvas(str(path), pagesize=(W, H), initialFontName="Sans")
    c.setTitle(f"{cfg['title']} - cover")
    bg = HexColor(cfg.get("cover_bg", "#12203a"))
    txt = HexColor(cfg.get("cover_text", "#f4ecd8"))
    acc = HexColor(cfg.get("cover_accent", "#ffd166"))
    acc2 = HexColor(cfg.get("cover_accent2", "#4cc9f0"))
    c.setFillColor(bg)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    fcx = bleed + PAGE_W + spine + PAGE_W / 2
    c.setFillColor(txt)
    centered(c, cfg["title"].upper(), H - 1.7 * IN, "Serif-Bold", 42, fcx)
    c.setFillColor(acc)
    centered(c, cfg["subtitle"], H - 2.3 * IN, "Sans-Bold", 17, fcx)
    if art_path and Path(art_path).exists():
        art = Image.open(art_path).convert("RGB")
        sc = min(6.6 * IN / art.width, 6.5 * IN / art.height)
        aw, ah = art.width * sc, art.height * sc
        c.drawImage(ImageReader(art), fcx - aw / 2, H / 2 - ah / 2 - 0.35 * IN, aw, ah)
    c.setFillColor(txt)
    centered(c, cfg["tagline"], 1.45 * IN, "Sans-Bold", 15, fcx)
    c.setFillColor(acc2)
    centered(c, cfg["author"], 0.95 * IN, "Sans", 14, fcx)
    bx0 = bleed
    c.setFillColor(txt)
    centered(c, cfg["title"].upper(), H - 1.5 * IN, "Serif-Bold", 24, bx0 + PAGE_W / 2)
    wrapped(c, cfg["back_blurb"], bx0 + 1.0 * IN, H - 2.3 * IN, PAGE_W - 2.0 * IN, "Sans", 12.5, leading=18)
    if back_art and Path(back_art).exists():  # ảnh nhỏ ở bìa sau (chừa góc dưới phải cho mã vạch KDP)
        ba = Image.open(back_art).convert("RGB")
        sc = min(4.2 * IN / ba.width, 4.6 * IN / ba.height)
        bw, bh = ba.width * sc, ba.height * sc
        c.drawImage(ImageReader(ba), bx0 + PAGE_W / 2 - bw / 2, 2.4 * IN, bw, bh)
    if spine >= 0.15 * IN:
        c.saveState()
        c.translate(bleed + PAGE_W + spine / 2, H / 2)
        c.rotate(-90)
        c.setFillColor(txt)
        c.setFont("Sans-Bold", 11)
        c.drawCentredString(0, -4, f"{cfg['title'].upper()}   ·   {cfg['author']}")
        c.restoreState()
    c.showPage()
    c.save()
    return spine / IN


def preview_sheet(pages, path, cols=6, cell=300):
    rows = (len(pages) + cols - 1) // cols
    sheet = Image.new("L", (cols * cell, rows * int(cell * 1.294)), 255)
    for i, p in enumerate(pages):
        t = p.resize((cell - 16, int((cell - 16) * PXH / PXW)), Image.LANCZOS)
        sheet.paste(t, ((i % cols) * cell + 8, (i // cols) * int(cell * 1.294) + 8))
    sheet.save(path, optimize=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", help="thư mục chứa ảnh nét đen trắng")
    ap.add_argument("--config", default="book_hamster.json")
    ap.add_argument("--out", default="output/hamster_book")
    ap.add_argument("--threshold", type=int, default=170, help="0-255, cao hơn = nét đậm hơn (mặc định 170)")
    ap.add_argument("--cover-art", default=None, help="ảnh minh họa màu cho bìa trước (không bắt buộc)")
    ap.add_argument("--back-art", default=None, help="ảnh minh họa màu cho bìa sau (không bắt buộc)")
    args = ap.parse_args()

    cfg = json.load(open(HERE / args.config if not Path(args.config).is_absolute() else args.config, encoding="utf-8"))
    files = sorted(p for p in Path(args.images).iterdir() if p.suffix.lower() in EXTS)
    if not files:
        print("Không thấy ảnh nào trong", args.images)
        return 1
    register_fonts()
    out = Path(args.out) if Path(args.out).is_absolute() else HERE / args.out
    out.mkdir(parents=True, exist_ok=True)

    pages, problems = [], 0
    for p in files:
        im, warns = prepare(p, args.threshold)
        pages.append(im)
        for w in warns:
            problems += 1
            print(f"  [!] {p.name}: {w}")
    print(f"Đã xử lý {len(pages)} ảnh, {problems} cảnh báo.")
    if len(pages) < 10:
        print("  [!] Có ít hơn 10 trang: sách quá mỏng, nên có tối thiểu khoảng 25-40 hình.")

    n = build_interior(cfg, pages, out / "interior_kdp.pdf", kdp=True)
    m = build_interior(cfg, pages, out / "printable_digital.pdf", kdp=False)
    art = args.cover_art
    spine = build_cover(cfg, n, art, out / "cover_kdp_fullwrap.pdf", args.back_art)
    preview_sheet(pages, out / "preview_sheet.png")
    print(f"interior_kdp.pdf: {n} trang | printable_digital.pdf: {m} trang | gáy {spine:.3f} in")
    print("Ghi vào:", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
