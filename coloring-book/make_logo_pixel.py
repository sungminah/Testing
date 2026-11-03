#!/usr/bin/env python3
"""Logo pixel art: đèn lồng bay trên bầu trời đêm có trăng và sao.

Chạy:  python3 make_logo_pixel.py   ->  output/logo_pixel_1000.png và logo_pixel_500.png
Vẽ trên lưới 100x100 điểm ảnh rồi phóng to (nearest) nên giữ nguyên nét pixel.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent / "output"
N = 100  # lưới 100x100 -> phóng 10x = 1000px

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]  # ma trận dither 4x4


def hx(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


SKY = [hx(c) for c in ("#0a0e2e", "#111a4a", "#1a2663", "#2a3680", "#42489a", "#6a60b0")]


def sky(img):
    px = img.load()
    for y in range(N):
        t = y / (N - 1) * (len(SKY) - 1)
        i = min(int(t), len(SKY) - 2)
        frac = t - i
        for x in range(N):
            use = i + 1 if frac * 16 > BAYER[y % 4][x % 4] else i
            px[x, y] = SKY[use]


def stars(img, rng):
    px = img.load()
    for _ in range(38):
        x, y = rng.randint(3, N - 4), rng.randint(3, N - 30)
        if math.hypot(x - 50, y - 50) > 47:
            continue
        px[x, y] = hx("#fff3d1")
        if rng.random() < 0.18:  # sao lấp lánh hình dấu cộng
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                px[x + dx, y + dy] = hx("#b9b6d8")


def moon(img, cx, cy, r):
    px = img.load()
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r and (x - cx - 3) ** 2 + (y - cy + 1) ** 2 > (r - 1) ** 2:
                px[x, y] = hx("#f7efc6")


def hills(img):
    px = img.load()
    for layer, (col, base, amp, ph) in enumerate((("#1b2260", 84, 4, 0.0), ("#0c1034", 90, 3, 1.7))):
        c = hx(col)
        for x in range(N):
            top = int(base + amp * math.sin(x / 11.0 + ph) + 1.5 * math.sin(x / 4.3 + ph))
            for y in range(top, N):
                px[x, y] = c


def halo(img, cx, cy, rx, ry):
    px = img.load()
    R = rx * 2.4
    warm = hx("#ff9a4a")
    for y in range(max(0, int(cy - R)), min(N, int(cy + R) + 1)):
        for x in range(max(0, int(cx - R)), min(N, int(cx + R) + 1)):
            d = math.hypot((x - cx) / 1.0, (y - cy) / (ry / rx))
            if d >= R:
                continue
            strength = 1 - d / R
            if strength * 16 * 0.9 > BAYER[y % 4][x % 4]:
                px[x, y] = mix(px[x, y], warm, 0.32)


def lantern(img, cx, cy, rx, ry, tone=0):
    px = img.load()
    edge, base, mid, core, hot = ("#a63d1c", "#f29a2e", "#ffc65c", "#ffe08a", "#fff5c4") if tone == 0 \
        else ("#a8341f", "#ee7f3a", "#ffa85a", "#ffcf85", "#fff0c0")
    edge, base, mid, core, hot = map(hx, (edge, base, mid, core, hot))
    rib = hx("#c4571f")
    cap = hx("#6e2418")
    def put(x, y, c):
        if 0 <= x < N and 0 <= y < N:
            px[x, y] = c
    for dy in range(-ry, ry + 1):
        hw = int(round(rx * math.sqrt(max(0.0, 1 - (dy / ry) ** 2))))
        for dx in range(-hw, hw + 1):
            e = (dx / rx) ** 2 + (dy / ry) ** 2
            c = hot if e < 0.10 else core if e < 0.30 else mid if e < 0.6 else base
            if abs(dx) == hw:
                c = edge
            elif abs(dx) in (round(rx * 0.62), round(rx * 0.3)) and rx >= 5:
                c = rib if e > 0.12 else c
            put(cx + dx, cy + dy, c)
    # nắp trên, nắp dưới
    cw = max(2, int(rx * 0.55))
    for dx in range(-cw, cw + 1):
        for k in (0, 1):
            put(cx + dx, cy - ry - 1 + k, cap)
            put(cx + dx, cy + ry + k, cap)
    # dây treo
    for k in range(max(3, int(ry * 0.8))):
        put(cx, cy - ry - 2 - k, cap)
    # tua rua
    t0 = cy + ry + 2
    tl = max(3, int(ry * 0.55))
    for k in range(tl):
        put(cx, t0 + k, hx("#ffd08a"))
    for dx in (-1, 0, 1):
        put(cx + dx, t0 + tl, hx("#ffd08a"))
        put(cx + dx, t0 + tl + 1, hx("#ffd08a"))


def main():
    OUT.mkdir(exist_ok=True)
    rng = random.Random(11)
    img = Image.new("RGB", (N, N))
    sky(img)
    stars(img, rng)
    moon(img, 22, 22, 6)
    hills(img)
    lanterns = [  # (cx, cy, rx, ry, tone)  - đèn xa nhỏ, đèn gần to
        (50, 55, 11, 14, 0),
        (74, 35, 7, 9, 1),
        (30, 38, 5, 7, 0),
        (64, 18, 3, 4, 1),
        (38, 70, 3, 4, 1),
        (82, 62, 2, 3, 0),
    ]
    for cx, cy, rx, ry, _ in lanterns:
        halo(img, cx, cy, rx, ry)
    for cx, cy, rx, ry, tone in lanterns:
        lantern(img, cx, cy, rx, ry, tone)
    for size in (1000, 500):
        img.resize((size, size), Image.NEAREST).save(OUT / f"logo_pixel_{size}.png", optimize=True)
    print("OK ->", OUT / "logo_pixel_1000.png", "và logo_pixel_500.png")


if __name__ == "__main__":
    main()
