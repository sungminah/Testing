#!/usr/bin/env python3
"""Logo shop và bộ sticker từ chú hamster lữ khách.

Chạy (sau extract_mascot.py):  python3 make_brand_assets.py
Kết quả (output/brand/):
  logo_hamster_1000.png, logo_hamster_500.png   logo vuông cho Etsy (cắt tròn vẫn đẹp)
  sticker_sheet_color.png / .pdf                tờ sticker màu, khổ Letter, 300 DPI
  sticker_sheet_colorme.png / .pdf              tờ sticker "tự tô màu"
  stickers/*.png                                từng sticker riêng, nền trong suốt, viền trắng cắt rời
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
OUT = HERE / "output" / "brand"
GREEN = (30, 77, 43)
RUST = (181, 80, 43)
TEAL = (42, 127, 98)
CREAM = (255, 241, 207)
MUSTARD = (240, 190, 70)
SKY = (160, 214, 236)
PEACH = (252, 205, 180)
MINT = (190, 232, 205)
LEMON = (255, 236, 150)
INK = (34, 28, 48)
W, H = 2550, 3300  # Letter 300 DPI


def fnt(bold, size):
    n = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(str(HERE / "fonts" / n), size)


def load(name):
    return Image.open(OUT / name).convert("RGBA")


def scaled(img, height):
    return img.resize((int(img.width * height / img.height), height), Image.LANCZOS)


def diecut(img, border=26, cut=True):
    """Thêm viền trắng quanh hình (sticker cắt rời). Trả về RGBA nền trong suốt."""
    pad = border + 6
    base = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    base.alpha_composite(img, (pad, pad))
    a = base.getchannel("A").point(lambda v: 255 if v > 40 else 0)
    k = 2 * border + 1
    grown = a.filter(ImageFilter.MaxFilter(k if k % 2 else k + 1)).filter(ImageFilter.GaussianBlur(3))
    grown = grown.point(lambda v: 255 if v > 128 else 0)
    out = Image.new("RGBA", base.size, (0, 0, 0, 0))
    white = Image.new("RGBA", base.size, (255, 255, 255, 255))
    out.paste(white, (0, 0), grown)
    if cut:  # đường cắt mảnh màu xám nhạt
        edge = ImageChops.subtract(grown.filter(ImageFilter.MaxFilter(5)), grown)
        gray = Image.new("RGBA", base.size, (160, 160, 170, 255))
        out.paste(gray, (0, 0), edge)
    out.alpha_composite(base)
    return out


def rotate(img, ang):
    return img.rotate(ang, resample=Image.BICUBIC, expand=True)


def circle_badge(mascot, d, bg, ring=GREEN, flip=False, line=False):
    badge = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    dr = ImageDraw.Draw(badge)
    dr.ellipse((0, 0, d - 1, d - 1), fill=ring + (255,))
    inset = int(d * 0.035)
    dr.ellipse((inset, inset, d - 1 - inset, d - 1 - inset), fill=bg + (255,))
    m = ImageOps.mirror(mascot) if flip else mascot
    m = scaled(m, int(d * 0.74))
    badge.alpha_composite(m, ((d - m.width) // 2, int(d * 0.14)))
    return badge


def pill(text, w, h, bg, fg=(255, 255, 255), outline=False):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    if outline:
        dr.rounded_rectangle((3, 3, w - 4, h - 4), radius=h // 2, fill=(255, 255, 255, 255), outline=INK + (255,), width=6)
        fg = INK
    else:
        dr.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=bg + (255,))
    size = int(h * 0.40)
    f = fnt(True, size)
    while dr.textlength(text, font=f) > w - h * 1.25 and size > 18:
        size -= 2
        f = fnt(True, size)
    dr.text((w * 0.60, h / 2 + 2), text, font=f, fill=fg + (255,), anchor="mm")
    return img


def text_sticker(text, mascot, bg, outline=False, flip=False, pw=640, ph=170, mh=250):
    p = pill(text, pw, ph, bg, fg=GREEN if bg == MUSTARD else (255, 255, 255), outline=outline)
    m = ImageOps.mirror(mascot) if flip else mascot
    m = scaled(m, mh)
    base = Image.new("RGBA", (pw + m.width // 2, mh), (0, 0, 0, 0))
    base.alpha_composite(p, (m.width // 2, (mh - ph) // 2 + 20))
    base.alpha_composite(m, (0, 0))
    return diecut(base, 20)


def paste_center(sheet, img, cx, cy):
    sheet.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


def solid(line, color):
    """Bản nét vẽ có nền trắng bên trong (để làm sticker tự tô màu)."""
    sil = Image.new("RGBA", color.size, (255, 255, 255, 0))
    white = Image.new("RGBA", color.size, (255, 255, 255, 255))
    sil.paste(white, (0, 0), color.getchannel("A").point(lambda v: 255 if v > 40 else 0))
    sil.alpha_composite(line)
    return sil


def logo(color):
    s = 1000
    im = Image.new("RGBA", (s, s), GREEN + (255,))
    dr = ImageDraw.Draw(im)
    dr.ellipse((50, 50, s - 50, s - 50), fill=CREAM + (255,))
    dr.ellipse((50, 50, s - 50, s - 50), outline=(255, 209, 102, 255), width=14)
    m = scaled(color, 700)
    sh = Image.new("RGBA", (440, 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse((0, 0, 439, 59), fill=(60, 80, 50, 70))
    im.alpha_composite(sh, (280, 790))
    im.alpha_composite(m, ((s - m.width) // 2, 130))
    full = im.convert("RGB")
    for size in (1000, 500):
        full.resize((size, size), Image.LANCZOS).save(OUT / f"logo_hamster_{size}.png", optimize=True)


def sheet(mascot, colored):
    sh = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(sh)
    title = "Hamster Traveler Stickers" if colored else "Color-It-Yourself Stickers"
    d.text((W / 2, 130), title, font=fnt(True, 96), fill=GREEN + (255,), anchor="mm")
    d.text((W / 2, 235), "Print on sticker paper and cut along the gray line", font=fnt(False, 46),
           fill=(110, 110, 100, 255), anchor="mm")
    paste_center(sh, diecut(scaled(mascot, 1120), 34), 700, 930)
    bgs = [MINT, PEACH, SKY, LEMON] if colored else [(255, 255, 255)] * 4
    named = []
    for i, bg in enumerate(bgs):
        b = diecut(circle_badge(mascot, 500, bg, ring=GREEN if colored else INK, flip=bool(i % 2)), 18)
        paste_center(sh, b, 1640 + (i % 2) * 560, 640 + (i // 2) * 600)
        named.append(b)
    smalls = [(False, -6), (True, 5), (False, 4), (True, -4), (False, -3), (True, 6)]
    for i, (fl, ang) in enumerate(smalls):
        m = ImageOps.mirror(mascot) if fl else mascot
        s_img = diecut(rotate(scaled(m, 390), ang), 22)
        paste_center(sh, s_img, 450 + (i % 3) * 825, 1800 + (i // 3) * 450)
        named.append(s_img)
    texts = [("LET'S GO!", RUST), ("PACK YOUR BAG", TEAL), ("ADVENTURE AWAITS", GREEN),
             ("COZY TRAVELS", MUSTARD), ("WANDER MORE", RUST), ("SEE YOU THERE", TEAL)]
    for i, (t, bg) in enumerate(texts):
        s_img = text_sticker(t, mascot, bg, outline=not colored, flip=bool(i % 2))
        paste_center(sh, s_img, 430 + (i % 3) * 845, 2690 + (i // 3) * 350)
        named.append(s_img)
    return sh, named


def save_sheet(im, stem):
    im.convert("RGB").save(OUT / f"{stem}.png", optimize=True)
    c = canvas.Canvas(str(OUT / f"{stem}.pdf"), pagesize=(612, 792))
    c.drawImage(ImageReader(im.convert("RGB")), 0, 0, 612, 792)
    c.showPage()
    c.save()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "stickers").mkdir(exist_ok=True)
    color, line = load("mascot_color.png"), load("mascot_line.png")
    logo(color)
    print("   logo_hamster_1000.png, logo_hamster_500.png")
    s1, items1 = sheet(color, True)
    save_sheet(s1, "sticker_sheet_color")
    s2, _ = sheet(solid(line, color), False)
    save_sheet(s2, "sticker_sheet_colorme")
    for k, it in enumerate(items1, 1):
        it.save(OUT / "stickers" / f"sticker_{k:02d}.png", optimize=True)
    print("   sticker_sheet_color / sticker_sheet_colorme (.png .pdf) và", len(items1), "sticker riêng")
    return 0


if __name__ == "__main__":
    sys.exit(main())
