#!/usr/bin/env python3
"""Ảnh quảng cáo cho cuốn "Hamster Adventures in Vietnam" (Etsy, Gumroad, Pinterest).

Chạy:  python3 make_hamster_promo.py
Cần có sẵn: images/hamster/*.webp và output/hamster_book/cover_kdp_fullwrap.pdf (chạy build_book_from_images.py trước).
Kết quả: output/hamster_promo/etsy/listing_1..5.png (3000x2400) và pinterest/pin_1..3.png (1000x1500).
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from make_listing_images import canvas, font, place, with_shadow  # noqa: F401  (dùng lại hàm dựng ảnh)

HERE = Path(__file__).resolve().parent
PAGES = HERE / "images" / "hamster"
OUT = HERE / "output" / "hamster_promo"
BG = (255, 241, 207)
GREEN = (30, 77, 43)
RUST = (181, 80, 43)
TEAL = (42, 127, 98)
MUTED = (96, 106, 90)
WARNINGS: list[str] = []


def fit(dr, xy, s, name, size, maxw, fill, anchor="mm"):
    """Vẽ chữ, tự thu nhỏ cho vừa chiều ngang tối đa."""
    f = font(name, size)
    while dr.textlength(s, font=f) > maxw and size > 20:
        size -= 2
        f = font(name, size)
    if size < 0.6 * (size + 0):  # không bao giờ xảy ra, giữ cho rõ ý
        pass
    dr.text(xy, s, font=f, fill=fill, anchor=anchor)
    return size


def book_page(name, w):
    """Một trang giấy 8.5x11 chứa ảnh trang sách (tìm theo phần tên file)."""
    matches = [q for q in sorted(PAGES.glob("*.webp")) if q.stem.split("_", 1)[1].startswith(name)]
    if len(matches) != 1:
        raise SystemExit(f"Tên '{name}' khớp {len(matches)} ảnh: {[m.name for m in matches]}")
    path = matches[0]
    im = Image.open(path).convert("L")
    h = int(w * 11 / 8.5)
    pg = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    box_w, box_h = int(w * 0.92), int(h * 0.92)
    sc = min(box_w / im.width, box_h / im.height)
    r = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS).convert("RGBA")
    pg.alpha_composite(r, ((w - r.width) // 2, (h - r.height) // 2))
    return pg


def front_cover(w):
    """Cắt bìa trước từ file bìa trọn bộ KDP."""
    pdf = HERE / "output" / "hamster_book" / "cover_kdp_fullwrap.pdf"
    tmp = OUT / "_cover_full"
    subprocess.run(["pdftoppm", "-png", "-r", "120", "-singlefile", str(pdf), str(tmp)], check=True)
    full = Image.open(str(tmp) + ".png").convert("RGB")
    s = 120 / 72
    spine = 0.135 * 72  # gáy (pt), khớp với build_book_from_images
    x0 = (9 + 612 + spine) * s
    img = full.crop((int(x0), int(9 * s), int(x0 + 612 * s), int(801 * s)))
    Path(str(tmp) + ".png").unlink()
    h = int(w * img.height / img.width)
    return img.resize((w, h), Image.LANCZOS).convert("RGBA")


def save(im, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(path, optimize=True)
    print("  ", path.relative_to(HERE))


# ------------------------------------------------------------ ảnh Etsy 3000x2400
def l1(cover):
    im = canvas(3000, 2400, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (800, 640), "HAMSTER", "serif", 250, 1300, GREEN)
    fit(dr, (800, 900), "ADVENTURES", "serif", 200, 1300, GREEN)
    fit(dr, (800, 1130), "IN VIETNAM", "serif", 200, 1300, RUST)
    fit(dr, (800, 1400), "28 Printable Coloring Scenes", "bold", 80, 1300, TEAL)
    fit(dr, (800, 1540), "Cozy detailed pages for adults", "sans", 64, 1300, MUTED)
    dr.rounded_rectangle((260, 1720, 1340, 1880), radius=80, fill=RUST)
    fit(dr, (800, 1800), "INSTANT DOWNLOAD  PDF", "bold", 64, 960, (255, 255, 255))
    place(im, book_page("ruong", 800), 1990, 1150, -9)
    place(im, book_page("cho-noi", 800), 2620, 1250, 8)
    place(im, cover, 2290, 1200, 0)
    return im


def l2(_):
    im = canvas(3000, 2400, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (1500, 230), "28 Detailed Scenes", "serif", 190, 2600, GREEN)
    fit(dr, (1500, 410), "Markets, festivals, villages and rivers across Vietnam", "sans", 74, 2600, MUTED)
    names = ["pho-co", "dam-sen", "tet", "ha-long", "cho-que", "da-lat", "ga-tau", "banh-trang"]
    for k, n in enumerate(names):
        place(im, book_page(n, 560), 560 + (k % 4) * 680, 1080 + (k // 4) * 780)
    return im


def l3(_):
    im = canvas(3000, 2400, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (1500, 260), "How It Works", "serif", 200, 2600, GREEN)
    xs = [560, 1500, 2440]
    caps = [("Buy & download", "Instant PDF download"), ("Print at home", "US Letter, actual size"),
            ("Color & relax", "Markers, pencils, gel pens")]
    for n, (x, (a, b)) in enumerate(zip(xs, caps), 1):
        dr.ellipse((x - 110, 520, x + 110, 740), fill=GREEN)
        dr.text((x, 630), str(n), font=font("serif", 130), fill=(255, 241, 207), anchor="mm")
        if n == 1:
            ic = Image.new("RGBA", (560, 720), (0, 0, 0, 0))
            d2 = ImageDraw.Draw(ic)
            d2.rounded_rectangle((20, 20, 540, 700), radius=40, fill=(255, 255, 255, 255), outline=GREEN, width=10)
            d2.rounded_rectangle((80, 260, 480, 460), radius=30, fill=RUST + (255,))
            d2.text((280, 360), "PDF", font=font("bold", 140), fill=(255, 255, 255), anchor="mm")
            place(im, ic, x, 1350)
        else:
            place(im, book_page("hoi-an" if n == 2 else "mua-mua", 560), x, 1350)
        fit(dr, (x, 1960), a, "bold", 88, 820, GREEN)
        fit(dr, (x, 2090), b, "sans", 56, 820, MUTED)
    return im


def l4(cover):
    im = canvas(3000, 2400, GREEN)
    dr = ImageDraw.Draw(im)
    fit(dr, (1020, 330), "What You Get", "serif", 210, 1700, BG)
    items = ["1 PDF file, 31 pages", "28 detailed coloring scenes", "US Letter size, 8.5 x 11 in",
             "Clean, crisp black lines", "Find the traveler hamster", "Unlimited copies, personal use"]
    for i, s in enumerate(items):
        y = 700 + i * 260
        dr.ellipse((190, y - 65, 320, y + 65), fill=(255, 209, 102))
        dr.text((255, y + 4), "✓", font=font("bold", 90), fill=GREEN, anchor="mm")
        fit(dr, (400, y), s, "bold", 84, 1400, BG, anchor="lm")
    place(im, cover, 2330, 1200, 4)
    return im


def l5(_):
    im = canvas(3000, 2400, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (1500, 250), "A Journey Across Vietnam", "serif", 190, 2600, GREEN)
    fit(dr, (1500, 430), "From the Northern Mountains to the Mekong Delta", "sans", 74, 2600, MUTED)
    stops = [("ruong", "North"), ("hoi-an", "Central Coast"), ("da-lat", "Highlands"), ("cho-noi", "Mekong Delta")]
    for k, (n, lab) in enumerate(stops):
        x = 570 + k * 620
        place(im, book_page(n, 560), x, 1250)
        fit(dr, (x, 1830), lab, "bold", 70, 560, RUST)
    fit(dr, (1500, 2140), "Look for the traveler hamster hiding in every scene", "bold", 80, 2600, TEAL)
    return im


# ------------------------------------------------------------ ảnh Pinterest 1000x1500
def p1(cover):
    im = canvas(1000, 1500, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (500, 150), "HAMSTER ADVENTURES", "serif", 84, 900, GREEN)
    fit(dr, (500, 235), "IN VIETNAM", "serif", 84, 900, RUST)
    place(im, book_page("cho-que", 480), 230, 820, -8)
    place(im, book_page("hoi-an", 480), 780, 840, 8)
    place(im, cover, 500, 800, 0)
    fit(dr, (500, 1330, ), "28 Printable Coloring Scenes", "bold", 52, 900, TEAL)
    fit(dr, (500, 1410), "Instant download PDF", "sans", 40, 900, MUTED)
    return im


def p2(_):
    im = canvas(1000, 1500, BG)
    dr = ImageDraw.Draw(im)
    fit(dr, (500, 150), "Find the traveler hamster!", "serif", 76, 900, GREEN)
    fit(dr, (500, 250), "in every cozy Vietnam scene", "sans", 44, 900, MUTED)
    for k, n in enumerate(["tet", "dam-sen", "cho-que", "banh-trang"]):
        place(im, book_page(n, 300), 295 + (k % 2) * 410, 600 + (k // 2) * 470)
    fit(dr, (500, 1425), "Printable PDF  Instant download", "bold", 40, 900, RUST)
    return im


def p3(_):
    im = canvas(1000, 1500, GREEN)
    dr = ImageDraw.Draw(im)
    fit(dr, (500, 140), "Vietnam coloring pages", "serif", 84, 900, BG)
    fit(dr, (500, 240), "for cozy evenings", "serif", 84, 900, (255, 209, 102))
    place(im, book_page("ruong", 600), 500, 820, 0)
    dr.rounded_rectangle((210, 1340, 790, 1430), radius=45, fill=(255, 209, 102))
    fit(dr, (500, 1385), "28 PRINTABLE SCENES", "bold", 40, 520, GREEN)
    return im


def main():
    if not any(PAGES.glob("*.webp")) or not (HERE / "output" / "hamster_book" / "cover_kdp_fullwrap.pdf").exists():
        print("Thiếu ảnh trang hoặc bìa: chạy build_book_from_images.py trước.")
        return 1
    if not shutil.which("pdftoppm"):
        print("Cần pdftoppm (poppler-utils).")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    cover_big = front_cover(1100)
    cover_pin = front_cover(520)
    for i, fn in enumerate((l1, l2, l3, l4, l5), 1):
        save(fn(cover_big), OUT / "etsy" / f"listing_{i}.png")
    for i, fn in enumerate((p1, p2, p3), 1):
        save(fn(cover_pin), OUT / "pinterest" / f"pin_{i}.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
