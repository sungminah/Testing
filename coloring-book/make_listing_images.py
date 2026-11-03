#!/usr/bin/env python3
"""Tạo ảnh quảng cáo từ các hình trong sách.

Chạy:  python3 make_listing_images.py
  output/etsy/listing_1..5.png      ảnh cho listing Etsy (3000x2400, tỉ lệ 5:4)
  output/pinterest/pin_1..3.png     ảnh dọc cho Pinterest (1000x1500, tỉ lệ 2:3)
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from mandala import make_mandala

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
CFG = json.load(open(HERE / "config.json", encoding="utf-8"))
SEED0 = CFG["seed_start"]

NAVY = (18, 32, 58)
CREAM = (244, 236, 216)
GOLD = (255, 209, 102)
PALETTE = [(255, 107, 107), (255, 209, 102), (6, 214, 160), (76, 201, 240),
           (179, 136, 235), (255, 159, 28), (247, 37, 133), (144, 224, 239)]


def font(name, size):
    f = {"serif": "DejaVuSerif-Bold.ttf", "sans": "DejaVuSans.ttf", "bold": "DejaVuSans-Bold.ttf"}[name]
    return ImageFont.truetype(str(HERE / "fonts" / f), size)


# ----------------------------------------------------------------- mandala -> ảnh
def render(paths, d, colored=False, lw=None):
    """Trả về ảnh RGBA nền trong suốt, mandala vừa khít khung d x d."""
    S = 2
    im = Image.new("RGBA", (d * S, d * S), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    R, c = d * S * 0.49, d * S / 2
    lw = lw or max(2, d / 330)
    seen, items = {}, []
    for p in paths:
        i = seen.get(p.ring, 0)
        seen[p.ring] = i + 1
        pts = [(c + x * R, c - y * R) for x, y in p.pts]
        items.append((p, i, pts, pts + [pts[0]] if p.closed else pts))
    if colored:  # tô từ vòng ngoài vào trong để hình bên trong không bị che
        for p, i, pts, closed in sorted((t for t in items if t[0].fill), key=lambda t: -t[0].ring):
            dr.polygon(pts, fill=PALETTE[(p.ring + (i % 2)) % len(PALETTE)] + (255,))
    for p, i, pts, closed in items:
        if colored and p.fill:
            dr.line(closed, fill=NAVY + (255,), width=max(1, int(lw * S * 0.8)), joint="curve")
        else:
            col = (60, 66, 100, 255) if colored else (0, 0, 0, 255)
            dr.line(closed, fill=col, width=max(1, int(lw * S)), joint="curve")
    return im.resize((d, d), Image.LANCZOS)


def page(paths, w, colored=False):
    """Một trang giấy 8.5x11 có mandala ở giữa, có đổ bóng nhẹ."""
    h = int(w * 11 / 8.5)
    pg = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = int(w * 0.88)
    m = render(paths, d, colored)
    pg.alpha_composite(m, ((w - d) // 2, (h - d) // 2))
    return pg


def with_shadow(img, blur=22, off=(0, 14), alpha=110):
    pad = blur * 3
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, alpha))
    sh.putalpha(img.getchannel("A").point(lambda a: alpha if a else 0))
    out.paste(sh, (pad + off[0], pad + off[1]), sh)
    out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(img, (pad, pad))
    return out


def place(base, img, cx, cy, angle=0, shadow=True):
    if shadow:
        img = with_shadow(img)
    if angle:
        img = img.rotate(angle, resample=Image.BICUBIC, expand=True)
    base.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


def text(dr, xy, s, f, fill, anchor="mm"):
    dr.text(xy, s, font=f, fill=fill, anchor=anchor)


def canvas(w, h, color):
    return Image.new("RGBA", (w, h), color + (255,))


def design(i):
    return make_mandala(SEED0 + i)


# --------------------------------------------------------------- ảnh Etsy 3000x2400
def listing_1():
    W, H = 3000, 2400
    im = canvas(W, H, NAVY)
    dr = ImageDraw.Draw(im)
    text(dr, (900, 700), "MANDALA", font("serif", 230), CREAM)
    text(dr, (900, 930), "COLORING PAGES", font("serif", 118), CREAM)
    text(dr, (900, 1170), "40 Printable Designs for Adults", font("bold", 64), GOLD)
    text(dr, (900, 1370), "Instant Download  ·  PDF  ·  US Letter", font("sans", 54), (200, 210, 235))
    dr.rounded_rectangle((520, 1600, 1280, 1740), radius=70, fill=GOLD)
    text(dr, (900, 1670), "STRESS RELIEF", font("bold", 56), NAVY)
    place(im, page(design(3), 760), 2240, 1180, -10)
    place(im, page(design(5), 760), 2000, 1120, 0)
    place(im, page(design(8), 760, True), 2540, 1260, 9)
    return im


def listing_2():
    W, H = 3000, 2400
    im = canvas(W, H, CREAM)
    dr = ImageDraw.Draw(im)
    text(dr, (W / 2, 230), "40 Unique Mandalas", font("serif", 190), NAVY)
    text(dr, (W / 2, 420), "from simple florals to detailed ornaments", font("sans", 78), (80, 90, 120))
    k = 0
    for r in range(2):
        for c in range(4):
            place(im, page(design(10 + k), 560), 480 + c * 680 + 80, 1060 + r * 760 - 40)
            k += 1
    return im


def listing_3():
    W, H = 3000, 2400
    im = canvas(W, H, CREAM)
    dr = ImageDraw.Draw(im)
    text(dr, (W / 2, 260), "How It Works", font("serif", 200), NAVY)
    xs = [560, 1500, 2440]
    caps = [("Buy & download", "Instant PDF download"),
            ("Print at home", "US Letter, actual size"),
            ("Color & relax", "Markers, pencils, gel pens")]
    for n, (x, (a, b)) in enumerate(zip(xs, caps), 1):
        dr.ellipse((x - 110, 520, x + 110, 740), fill=NAVY)
        text(dr, (x, 630), str(n), font("serif", 130), GOLD)
        if n == 1:  # biểu tượng tệp PDF
            ic = Image.new("RGBA", (560, 720), (0, 0, 0, 0))
            d2 = ImageDraw.Draw(ic)
            d2.rounded_rectangle((20, 20, 540, 700), radius=40, fill=(255, 255, 255, 255), outline=NAVY, width=10)
            d2.rounded_rectangle((80, 260, 480, 460), radius=30, fill=(247, 37, 133, 255))
            d2.text((280, 360), "PDF", font=font("bold", 140), fill=(255, 255, 255), anchor="mm")
            place(im, ic, x, 1350)
        else:
            place(im, page(design(20 + n), 560, n == 3), x, 1350)
        text(dr, (x, 1960), a, font("bold", 88), NAVY)
        text(dr, (x, 2090), b, font("sans", 56), (80, 90, 120))
    return im


def listing_4():
    W, H = 3000, 2400
    im = canvas(W, H, NAVY)
    dr = ImageDraw.Draw(im)
    text(dr, (1000, 330), "What You Get", font("serif", 210), CREAM)
    items = ["1 PDF file, 43 pages", "40 unique mandala designs", "US Letter size, 8.5 x 11 in",
             "Clean, crisp black lines", "Unlimited copies, personal use"]
    for i, s in enumerate(items):
        y = 720 + i * 300
        dr.ellipse((190, y - 70, 330, y + 70), fill=GOLD)
        text(dr, (260, y + 4), "✓", font("bold", 100), NAVY)
        text(dr, (400, y), s, font("bold", 84), CREAM, anchor="lm")
    place(im, page(design(30), 600), 2560, 1150, 7)
    place(im, page(design(31), 600, True), 2400, 1290, -6)
    return im


def listing_5():
    W, H = 3000, 2400
    im = canvas(W, H, CREAM)
    dr = ImageDraw.Draw(im)
    text(dr, (W / 2, 260), "Color Them Your Way", font("serif", 200), NAVY)
    for i, x in enumerate((620, 1500, 2380)):
        place(im, page(design(40 + i), 760, True), x, 1330, (-4, 0, 4)[i])
    text(dr, (W / 2, 2230), "Markers  ·  Colored pencils  ·  Gel pens  ·  Watercolor",
         font("sans", 80), (80, 90, 120))
    return im


# ----------------------------------------------------------- ảnh Pinterest 1000x1500
def pin_1():
    im = canvas(1000, 1500, NAVY)
    dr = ImageDraw.Draw(im)
    text(dr, (500, 190), "MANDALA", font("serif", 150), CREAM)
    text(dr, (500, 330), "COLORING PAGES", font("serif", 84), CREAM)
    im.alpha_composite(render(design(7), 820, True, 3.0), (90, 430))
    text(dr, (500, 1350), "40 Printable Designs · Instant Download", font("bold", 40), GOLD)
    text(dr, (500, 1420), "lanternsinthesky on Etsy", font("sans", 34), (200, 210, 235))
    return im


def pin_2():
    im = canvas(1000, 1500, CREAM)
    dr = ImageDraw.Draw(im)
    text(dr, (500, 170), "Relax & Color", font("serif", 120), NAVY)
    text(dr, (500, 285), "Printable mandalas for calm evenings", font("sans", 44), (80, 90, 120))
    k = 0
    for r in range(2):
        for c in range(2):
            place(im, page(design(50 + k), 300, k % 2 == 1), 290 + c * 420, 690 + r * 470)
            k += 1
    text(dr, (500, 1450), "Instant download · lanternsinthesky", font("bold", 36), NAVY)
    return im


def pin_3():
    im = canvas(1000, 1500, NAVY)
    dr = ImageDraw.Draw(im)
    text(dr, (500, 190), "Screen-free", font("serif", 100), CREAM)
    text(dr, (500, 310), "coloring time", font("serif", 100), CREAM)
    place(im, page(design(60), 520, True), 600, 880, 6)
    place(im, page(design(61), 520), 400, 940, -6)
    dr.rounded_rectangle((220, 1330, 780, 1420), radius=45, fill=GOLD)
    text(dr, (500, 1375), "40 PRINTABLE PAGES", font("bold", 40), NAVY)
    return im


def save(im, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(path, optimize=True)
    print("  ", path.relative_to(HERE))


def main():
    for i, fn in enumerate((listing_1, listing_2, listing_3, listing_4, listing_5), 1):
        save(fn(), OUT / "etsy" / f"listing_{i}.png")
    for i, fn in enumerate((pin_1, pin_2, pin_3), 1):
        save(fn(), OUT / "pinterest" / f"pin_{i}.png")


if __name__ == "__main__":
    main()
