#!/usr/bin/env python3
"""Tạo logo shop: những chiếc đèn lồng bay trên bầu trời đêm.

Chạy:  python3 make_logo.py   ->  output/logo_lanterns_1000.png và logo_lanterns_500.png
Etsy hiển thị logo dạng vuông/tròn, nên mọi chi tiết chính đều nằm trong vòng tròn giữa ảnh.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent / "output"
S = 2000  # vẽ ở độ phân giải gấp đôi rồi thu nhỏ cho mịn


def sky():
    top, bot = (11, 18, 42), (38, 48, 98)
    im = Image.new("RGB", (S, S))
    d = ImageDraw.Draw(im)
    for y in range(S):
        t = y / (S - 1)
        d.line([(0, y), (S, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return im


def stars(im, seed=7):
    rng = random.Random(seed)
    d = ImageDraw.Draw(im)
    for _ in range(70):
        x, y = rng.randint(80, S - 80), rng.randint(80, S - 80)
        if math.hypot(x - S / 2, y - S / 2) > S * 0.47:
            continue  # chừa góc (sẽ bị cắt khi hiển thị tròn)
        r = rng.choice([3, 4, 5, 7])
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 244, 214))
    return im


def glow(im, cx, cy, r, color, strength=170):
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((cx - r, cy - r, cx + r, cy + r), fill=color + (strength,))
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.55))
    im.paste(layer, (0, 0), layer)


def lantern(im, cx, cy, w, h, body=(255, 170, 60), rib=(190, 70, 30), cap=(120, 40, 30)):
    glow(im, cx, cy, int(w * 1.15), (255, 176, 70))
    d = ImageDraw.Draw(im)
    lw = max(3, int(w * 0.035))
    # dây treo
    d.line([(cx, cy - h * 0.5 - h * 0.28), (cx, cy - h * 0.5)], fill=cap, width=lw)
    # thân
    d.ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=body)
    # ánh sáng bên trong (sáng hơn ở giữa)
    d.ellipse((cx - w * 0.3, cy - h * 0.34, cx + w * 0.3, cy + h * 0.34), fill=(255, 214, 120))
    d.ellipse((cx - w * 0.17, cy - h * 0.2, cx + w * 0.17, cy + h * 0.2), fill=(255, 238, 180))
    # các nan dọc
    for k in (0.78, 0.5, 0.22):
        d.ellipse((cx - w / 2 * k, cy - h / 2, cx + w / 2 * k, cy + h / 2), outline=rib, width=lw)
    d.ellipse((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), outline=rib, width=lw)
    # nắp trên và dưới
    cw, ch = w * 0.46, h * 0.085
    d.rounded_rectangle((cx - cw / 2, cy - h / 2 - ch * 0.55, cx + cw / 2, cy - h / 2 + ch * 0.9),
                        radius=ch * 0.4, fill=cap)
    d.rounded_rectangle((cx - cw / 2, cy + h / 2 - ch * 0.9, cx + cw / 2, cy + h / 2 + ch * 0.55),
                        radius=ch * 0.4, fill=cap)
    # tua rua
    ty = cy + h / 2 + ch * 0.55
    d.line([(cx, ty), (cx, ty + h * 0.2)], fill=(255, 205, 120), width=lw)
    for dx in (-0.06, 0, 0.06):
        d.line([(cx, ty + h * 0.16), (cx + w * dx, ty + h * 0.3)], fill=(255, 205, 120), width=lw)


def main():
    OUT.mkdir(exist_ok=True)
    im = stars(sky())
    # ba chiếc đèn lồng, to nhỏ khác nhau, đặt gọn trong vòng tròn giữa
    lantern(im, 1010, 1080, 520, 640)                                   # to, ở giữa
    lantern(im, 1370, 640, 300, 370, body=(255, 150, 90))               # vừa, phía trên bên phải
    lantern(im, 660, 560, 210, 260, body=(255, 190, 80))                # nhỏ, phía trên bên trái
    glow(im, 1010, 1080, 480, (255, 150, 60), 60)
    for size in (1000, 500):
        im.resize((size, size), Image.LANCZOS).save(OUT / f"logo_lanterns_{size}.png", optimize=True)
    print("OK ->", OUT / "logo_lanterns_1000.png", "và logo_lanterns_500.png")


if __name__ == "__main__":
    main()
