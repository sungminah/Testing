#!/usr/bin/env python3
"""Cảnh tô màu: hamster dễ thương trong làng quê (nét đen trắng, vẽ bằng code).

Chạy:  python3 hamster_scenes.py   ->  output/hamster/scene_1.png ... (2550x3300, 300 DPI, trang 8.5x11 in)
Nhân vật hamster và các cảnh đều là thiết kế gốc của dự án này.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent / "output" / "hamster"
WL = 1000.0                 # bề ngang logic
HL = 1000.0 * 11 / 8.5      # bề dọc logic
PXW, PXH = 2550, 3300
SS = 2                      # vẽ gấp đôi rồi thu nhỏ cho mịn
LW = 3.6                    # độ dày nét chính (đơn vị logic)
LW2 = 2.6                   # nét chi tiết


class Art:
    def __init__(self):
        self.k = PXW * SS / WL
        self.im = Image.new("L", (PXW * SS, PXH * SS), 255)
        self.d = ImageDraw.Draw(self.im)

    # ---- nền tảng
    def P(self, p):
        return (p[0] * self.k, p[1] * self.k)

    def poly(self, pts, fill=255, lw=LW, closed=True):
        pp = [self.P(p) for p in pts]
        w = max(1, int(lw * self.k))
        if closed and fill is not None:
            self.d.polygon(pp, fill=fill)
        line = pp + [pp[0]] if closed else pp
        self.d.line(line, fill=0, width=w, joint="curve")
        if not closed:  # đầu nét tròn
            r = w / 2
            for x, y in (pp[0], pp[-1]):
                self.d.ellipse((x - r, y - r, x + r, y + r), fill=0)

    def ellipse(self, cx, cy, rx, ry, fill=255, lw=LW):
        n = max(48, int(max(rx, ry) * 1.2))
        pts = [(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n))
               for i in range(n)]
        self.poly(pts, fill, lw)

    def union(self, shapes, lw=LW):
        """Viền ngoài của nhiều hình elip chồng nhau (đám mây, tán lá, má phúng phính)."""
        h = lw / 2
        for cx, cy, rx, ry in shapes:
            self._disc(cx, cy, rx + h, ry + h, 0)
        for cx, cy, rx, ry in shapes:
            self._disc(cx, cy, rx - h, ry - h, 255)

    def _disc(self, cx, cy, rx, ry, col):
        n = max(48, int(max(rx, ry) * 1.2))
        pts = [self.P((cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)))
               for i in range(n)]
        self.d.polygon(pts, fill=col)

    def arc(self, cx, cy, rx, ry, a0, a1, lw=LW2):
        n = 40
        pts = [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
                cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
        self.poly(pts, None, lw, closed=False)

    def quad(self, p0, p1, p2, lw=LW2, steps=24):
        pts = [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
               for t in (i / steps for i in range(steps + 1))]
        self.poly(pts, None, lw, closed=False)

    def line(self, a, b, lw=LW2):
        self.poly([a, b], None, lw, closed=False)

    def rect(self, x, y, w, h, fill=255, lw=LW):
        self.poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], fill, lw)

    def save(self, path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.im.resize((PXW, PXH), Image.LANCZOS).convert("1", dither=Image.NONE).save(path, dpi=(300, 300))


# ----------------------------------------------------------------- vật thể
def _rrect(x0, y0, x1, y1, r):
    pts = []
    for cx, cy, st in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for i in range(21):
            t = math.radians(st + 90 * i / 20)
            pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
    return pts


def frame(a):
    a.poly(_rrect(45, 45, WL - 45, HL - 45, 45), None, 3.2)
    a.poly(_rrect(62, 62, WL - 62, HL - 62, 32), None, 1.8)


def finalize(a):
    """Cắt mọi thứ nằm ngoài khung rồi vẽ khung lên trên cùng."""
    mask = Image.new("L", a.im.size, 0)
    pts = [a.P(p) for p in _rrect(45, 45, WL - 45, HL - 45, 45)]
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    white = Image.new("L", a.im.size, 255)
    a.im = Image.composite(a.im, white, mask)
    a.d = ImageDraw.Draw(a.im)
    frame(a)


def mountains(a, base, seed=1, h=150):
    rng = random.Random(seed)
    peaks = [(rng.uniform(80, 920), rng.uniform(0.6, 1.0) * h, rng.uniform(90, 160)) for _ in range(4)]
    top = []
    for x in range(0, int(WL) + 1, 8):
        y = base - max((ph * math.exp(-((x - px) / w) ** 2) for px, ph, w in peaks), default=0)
        top.append((x, y))
    a.poly([(0, base + 80)] + top + [(WL, base + 80)], 255, 0.01)
    a.poly(top, None, LW, closed=False)
    for px, ph, w in peaks[:3]:  # vài nét núi
        y = base - ph
        a.line((px - 20, y + 30), (px - 4, y + 55), LW2 - 0.6)
        a.line((px + 22, y + 34), (px + 8, y + 62), LW2 - 0.6)


def bird(a, x, y, s=1.0):
    a.quad((x - 20 * s, y), (x - 10 * s, y - 14 * s), (x, y), LW2)
    a.quad((x, y), (x + 10 * s, y - 14 * s), (x + 20 * s, y), LW2)


def butterfly(a, x, y, s=1.0):
    for sx in (-1, 1):
        a.ellipse(x + sx * 15 * s, y - 10 * s, 14 * s, 18 * s, 255, LW2)
        a.ellipse(x + sx * 11 * s, y + 12 * s, 10 * s, 12 * s, 255, LW2)
        a.ellipse(x + sx * 17 * s, y - 12 * s, 5 * s, 5 * s, None, 1.8)
    a.ellipse(x, y, 3.5 * s, 18 * s, 0, 1)
    a.quad((x, y - 16 * s), (x - 6 * s, y - 28 * s), (x - 12 * s, y - 30 * s), 1.8)
    a.quad((x, y - 16 * s), (x + 6 * s, y - 28 * s), (x + 12 * s, y - 30 * s), 1.8)


def bush(a, x, y, s=1.0):
    a.union([(x - 34 * s, y - 14 * s, 30 * s, 24 * s), (x + 4 * s, y - 24 * s, 38 * s, 32 * s),
             (x + 44 * s, y - 12 * s, 28 * s, 22 * s)], LW2 + 0.4)
    for dx, dy in ((-30, -14), (4, -28), (40, -14)):
        a.ellipse(x + dx * s, y + dy * s, 5 * s, 5 * s, None, 1.8)


def star(a, cx, cy, r):
    pts = []
    for i in range(8):
        rr = r if i % 2 == 0 else r * 0.38
        t = math.pi / 2 + i * math.pi / 4
        pts.append((cx + rr * math.cos(t), cy - rr * math.sin(t)))
    a.poly(pts, 255, LW2)


def cloud(a, cx, cy, s=1.0):
    sh = [(cx - 55 * s, cy + 6 * s, 38 * s, 30 * s), (cx - 15 * s, cy - 14 * s, 48 * s, 42 * s),
          (cx + 38 * s, cy - 2 * s, 44 * s, 36 * s), (cx + 75 * s, cy + 12 * s, 30 * s, 24 * s),
          (cx + 10 * s, cy + 14 * s, 70 * s, 26 * s)]
    a.union(sh, LW2 + 0.6)


def moon(a, cx, cy, r):
    a.ellipse(cx, cy, r, r, 255, LW)
    for dx, dy, rr in ((-0.3, -0.25, 0.2), (0.25, 0.1, 0.26), (-0.1, 0.4, 0.14)):
        a.ellipse(cx + dx * r, cy + dy * r, rr * r, rr * r, 255, LW2)


def sun(a, cx, cy, r):
    for i in range(14):
        t = 2 * math.pi * i / 14
        a.line((cx + (r + 14) * math.cos(t), cy + (r + 14) * math.sin(t)),
               (cx + (r + 52) * math.cos(t), cy + (r + 52) * math.sin(t)), LW)
    a.ellipse(cx, cy, r, r, 255, LW)
    a.arc(cx, cy + 6, r * 0.5, r * 0.4, 20, 160, LW2)
    a.ellipse(cx - r * 0.32, cy - r * 0.15, 6, 6, 0, 1)
    a.ellipse(cx + r * 0.32, cy - r * 0.15, 6, 6, 0, 1)


def lantern(a, cx, cy, w, h, hang=0):
    if hang:
        a.line((cx, cy - h / 2 - hang), (cx, cy - h / 2), LW2)
    a.ellipse(cx, cy, w / 2, h / 2, 255, LW)
    for k in (0.62, 0.27):
        a.ellipse(cx, cy, w / 2 * k, h / 2, None, LW2)
    cw, ch = w * 0.5, max(8, h * 0.11)
    a.rect(cx - cw / 2, cy - h / 2 - ch * 0.55, cw, ch, 255, LW2 + 0.4)
    a.rect(cx - cw / 2, cy + h / 2 - ch * 0.45, cw, ch, 255, LW2 + 0.4)
    ty = cy + h / 2 + ch * 0.55
    a.line((cx, ty), (cx, ty + h * 0.22), LW2)
    for dx in (-0.07, 0.07):
        a.line((cx, ty + h * 0.15), (cx + w * dx, ty + h * 0.3), LW2)


def tuft(a, x, y, s=1.0):
    for dx, bend in ((-9, -6), (0, 0), (9, 6)):
        a.quad((x + dx * s * 0.4, y), (x + dx * s * 0.6 + bend * 0.3 * s, y - 14 * s),
               (x + dx * s + bend * 0.5 * s, y - 30 * s), LW2)


def flower(a, x, y, s=1.0, stem=60):
    a.quad((x, y), (x + 8 * s, y - stem * 0.5 * s), (x, y - stem * s), LW2)
    a.ellipse(x + 14 * s, y - stem * 0.45 * s, 13 * s, 6 * s, 255, LW2)
    cy = y - stem * s
    petals = [(x + 14 * s * math.cos(2 * math.pi * i / 5), cy + 14 * s * math.sin(2 * math.pi * i / 5), 10 * s, 10 * s)
              for i in range(5)]
    a.union(petals + [(x, cy, 9 * s, 9 * s)], LW2)
    a.ellipse(x, cy, 5.5 * s, 5.5 * s, 255, LW2)


def stone_path(a, pts):
    for x, y, rx, ry in pts:
        a.ellipse(x, y, rx, ry, 255, LW2)


def hills(a, base, amp, ph, wave=140, bottom=None):
    bottom = bottom or HL
    top = [(x, base + amp * math.sin(x / wave + ph) + amp * 0.4 * math.sin(x / (wave * 0.37) + ph * 2))
           for x in range(0, int(WL) + 1, 10)]
    pts = [(0, bottom)] + top + [(WL, bottom)]
    a.poly(pts, 255, 0.01)
    a.poly(top, None, LW, closed=False)


def tree(a, x, y, s=1.0, fruit=True, seed=1):
    rng = random.Random(seed)
    tw = 34 * s
    a.poly([(x - tw, y), (x - tw * 0.55, y - 210 * s), (x + tw * 0.55, y - 210 * s), (x + tw, y)], 255, LW)
    for i in range(4):
        yy = y - 40 * s - i * 40 * s
        a.quad((x - tw * 0.3, yy), (x, yy - 8 * s), (x + tw * 0.2, yy - 4 * s), LW2)
    blobs = [(x, y - 330 * s, 120 * s, 100 * s), (x - 105 * s, y - 280 * s, 85 * s, 70 * s),
             (x + 105 * s, y - 285 * s, 85 * s, 72 * s), (x - 55 * s, y - 400 * s, 80 * s, 65 * s),
             (x + 65 * s, y - 395 * s, 78 * s, 64 * s), (x, y - 255 * s, 100 * s, 55 * s)]
    a.union(blobs, LW)
    if fruit:
        for _ in range(16):
            fx = x + rng.uniform(-150, 150) * s
            fy = y - rng.uniform(250, 420) * s
            if (fx - x) ** 2 / (150 * s) ** 2 + (fy - (y - 335 * s)) ** 2 / (110 * s) ** 2 < 0.85:
                a.ellipse(fx, fy, 12 * s, 12 * s, 255, LW2)
                a.arc(fx, fy, 6 * s, 6 * s, 200, 300, 1.8)


def hut(a, x0, y0, w, h, door=True):
    x1 = x0 + w
    mid = x0 + w / 2
    a.rect(x0, y0, w, h, 255, LW)
    for xx in range(int(x0 + 45), int(x1), 45):
        a.line((xx, y0 + 6), (xx, y0 + h - 4), LW2 - 0.8)
    roof = [(x0 - 40, y0 + 6), (mid, y0 - 170), (x1 + 40, y0 + 6)]
    a.rect(mid + w * 0.18, y0 - 175, 42, 90, 255, LW)      # ống khói
    a.poly(roof, 255, LW)
    for i in range(1, 5):
        t = i / 5
        ya = y0 + 6 - t * 176
        xl = (x0 - 40) + (mid - (x0 - 40)) * t
        xr = (x1 + 40) - ((x1 + 40) - mid) * t
        a.line((xl + 4, ya), (xr - 4, ya), LW2)
        n = int((xr - xl) / 36)
        for j in range(1, n):
            a.line((xl + j * (xr - xl) / n, ya), (xl + j * (xr - xl) / n, ya + (176 / 5) * 0.9), LW2 - 0.8)
    if door:
        dx, dw = mid - 42, 84
        pts = [(dx, y0 + h)] + [(dx + dw / 2 + dw / 2 * math.cos(math.radians(180 + 180 * i / 16)),
                                  y0 + h - 90 + dw / 2 * math.sin(math.radians(180 + 180 * i / 16)))
                                 for i in range(17)] + [(dx + dw, y0 + h)]
        a.poly(pts, 255, LW)
        a.ellipse(dx + dw - 16, y0 + h - 50, 5, 5, 0, 1)
    wx = x0 + w * 0.18
    a.ellipse(wx, y0 + h * 0.4, 30, 30, 255, LW)
    a.line((wx - 30, y0 + h * 0.4), (wx + 30, y0 + h * 0.4), LW2)
    a.line((wx, y0 + h * 0.4 - 30), (wx, y0 + h * 0.4 + 30), LW2)


def basket(a, x, y, s=1.0, fruit=True):
    pts = [(x - 70 * s, y - 60 * s), (x + 70 * s, y - 60 * s), (x + 55 * s, y), (x - 55 * s, y)]
    a.poly(pts, 255, LW)
    for i in range(1, 4):
        a.line((x - 70 * s + 15 * s * i * 0 - 55 * s + 28 * s * i, y - 60 * s), (x - 55 * s + 28 * s * i - 4 * s, y), LW2 - 0.6)
    a.line((x - 66 * s, y - 30 * s), (x + 66 * s, y - 30 * s), LW2 - 0.6)
    a.arc(x, y - 60 * s, 70 * s, 70 * s, 180, 360, LW)
    if fruit:
        for dx in (-40, -12, 20, 48):
            a.ellipse(x + dx * s, y - 70 * s, 18 * s, 17 * s, 255, LW2)


def acorn(a, x, y, s=1.0):
    a.ellipse(x, y, 20 * s, 25 * s, 255, LW2 + 0.4)
    a.ellipse(x, y - 16 * s, 24 * s, 13 * s, 255, LW2 + 0.4)
    a.line((x, y - 28 * s), (x + 3 * s, y - 38 * s), LW2)
    for dx in (-12, -4, 4, 12):
        a.line((x + dx * s, y - 22 * s), (x + dx * s * 0.8, y - 12 * s), 1.8)


# --------------------------------------------------------------- hamster
def hamster(a, x, y, s=1.0, hold=None, scarf=False, flower_ear=False, wink=False):
    """Hamster ngồi, nhìn thẳng. (x, y) là điểm chạm đất ở giữa, s là tỉ lệ."""
    def E(cx, cy, rx, ry, fill=255, lw=LW):
        a.ellipse(x + cx * s, y + cy * s, rx * s, ry * s, fill, lw)

    # tai (vẽ trước đầu)
    for sx in (-1, 1):
        E(sx * 62, -218, 25, 27)
        E(sx * 62, -216, 13, 15, 255, LW2)
    # thân
    E(0, -72, 78, 82)
    # chân
    for sx in (-1, 1):
        E(sx * 42, -8, 30, 15)
        for t in (-8, 0, 8):
            a.line((x + (sx * 42 + t) * s, y - 2 * s), (x + (sx * 42 + t) * s, y + 4 * s), 1.8)
    E(0, -64, 44, 52, 255, LW2)  # bụng
    # đầu + má phúng phính
    a.union([(x + 0 * s, y - 168 * s, 78 * s, 66 * s), (x - 52 * s, y - 148 * s, 38 * s, 32 * s),
             (x + 52 * s, y - 148 * s, 38 * s, 32 * s)], LW)
    # vằn trên đầu
    a.quad((x - 16 * s, y - 224 * s), (x - 6 * s, y - 212 * s), (x - 10 * s, y - 202 * s), LW2)
    a.quad((x + 16 * s, y - 224 * s), (x + 6 * s, y - 212 * s), (x + 10 * s, y - 202 * s), LW2)
    a.quad((x, y - 226 * s), (x + 3 * s, y - 214 * s), (x, y - 205 * s), LW2)
    # mắt, mũi, miệng
    for sx in (-1, 1):
        ex, ey = x + sx * 34 * s, y - 168 * s
        if wink and sx == 1:
            a.arc(ex, ey + 2 * s, 11 * s, 8 * s, 200, 340, LW)
        else:
            a.ellipse(ex / 1.0, ey, 9.5 * s, 11 * s, 0, 1)
            a.ellipse(ex - 3 * s, ey - 4 * s, 3.6 * s, 3.6 * s, 255, 1)
    a.ellipse(x, y - 150 * s, 8 * s, 6 * s, 0, 1)
    a.quad((x, y - 144 * s), (x - 4 * s, y - 134 * s), (x - 14 * s, y - 138 * s), LW2)
    a.quad((x, y - 144 * s), (x + 4 * s, y - 134 * s), (x + 14 * s, y - 138 * s), LW2)
    # má hồng (vòng tròn nhỏ + vạch)
    for sx in (-1, 1):
        cx, cy = x + sx * 62 * s, y - 146 * s
        a.ellipse(cx, cy, 15 * s, 10 * s, None, LW2 - 0.6)
        for t in (-5, 0, 5):
            a.line((cx + t * s - 3 * s, cy + 3 * s), (cx + t * s + 3 * s, cy - 3 * s), 1.6)
    # râu
    for sx in (-1, 1):
        for dy, ang in ((-4, -10), (4, 6)):
            a.line((x + sx * 88 * s, y + (-152 + dy) * s), (x + sx * 118 * s, y + (-152 + dy + ang) * s), 1.8)
    # khăn quàng
    if scarf:
        a.poly([(x - 66 * s, y - 112 * s), (x, y - 96 * s), (x + 66 * s, y - 112 * s),
                (x + 62 * s, y - 94 * s), (x, y - 78 * s), (x - 62 * s, y - 94 * s)], 255, LW)
        a.poly([(x + 20 * s, y - 88 * s), (x + 52 * s, y - 84 * s), (x + 58 * s, y - 40 * s),
                (x + 32 * s, y - 44 * s)], 255, LW)
        for k in range(3):
            a.line((x + (36 + k * 8) * s, y - 44 * s), (x + (36 + k * 8) * s, y - 36 * s), 1.8)
    # vật đang cầm + tay
    if hold == "acorn":
        acorn(a, x, y - 72 * s, 1.35 * s)
    elif hold == "lantern":
        a.line((x + 72 * s, y - 96 * s), (x + 128 * s, y - 250 * s), LW)
        lantern(a, x + 128 * s, y - 300 * s, 70 * s, 84 * s, hang=0)
    elif hold == "flower":
        flower(a, x + 4 * s, y - 62 * s, 1.0 * s, 70)
    for sx in (-1, 1):
        E(sx * 62, -86, 20, 25)
        a.line((x + sx * 62 * s, y - 72 * s), (x + sx * 62 * s, y - 66 * s), 1.8)
    if flower_ear:
        fx, fy = x - 70 * s, y - 238 * s
        pts = [(fx + 16 * s * math.cos(2 * math.pi * i / 5), fy + 16 * s * math.sin(2 * math.pi * i / 5), 12 * s, 12 * s)
               for i in range(5)]
        a.union(pts + [(fx, fy, 10 * s, 10 * s)], LW2)
        a.ellipse(fx, fy, 6 * s, 6 * s, 255, LW2)


# ------------------------------------------------------------------- cảnh
def scene_lantern_night():
    a = Art()
    moon(a, 760, 190, 92)
    cloud(a, 520, 130, 0.9)
    cloud(a, 215, 310, 0.8)
    for sx, sy, r in ((130, 160, 20), (360, 235, 14), (640, 330, 16), (880, 360, 12), (450, 70 + 28, 12)):
        star(a, sx, sy, r)
    for lx, ly, w, h in ((170, 190, 60, 74), (430, 170, 44, 54), (600, 270, 54, 66), (860, 480, 40, 50), (300, 380, 36, 44)):
        lantern(a, lx, ly, w, h, hang=0)
    mountains(a, 690, seed=5, h=170)
    hills(a, 720, 22, 0.6, 150)
    bush(a, 570, 760, 1.0)
    bush(a, 80, 790, 0.9)
    hut(a, 150, 500, 330, 250)
    lantern(a, 105, 565, 44, 54, hang=38)
    tree(a, 790, 780, 0.95)
    hills(a, 860, 26, 2.2, 130)
    stone_path(a, [(520, 905, 38, 14), (560, 960, 42, 15), (610, 1020, 46, 16), (670, 1085, 50, 17)])
    for tx, ty, ts in ((100, 960, 1.0), (910, 970, 1.0), (60, 1180, 1.1), (330, 1000, 0.9), (880, 1190, 1.0)):
        tuft(a, tx, ty, ts)
    flower(a, 120, 1090, 1.0, 70)
    flower(a, 880, 1090, 1.1, 80)
    flower(a, 420, 1200, 0.9, 60)
    hamster(a, 235, 1130, 0.95, hold="acorn", flower_ear=True)
    hamster(a, 520, 1160, 1.3, hold="lantern", wink=True)
    hamster(a, 780, 1150, 1.0, scarf=True)
    hamster(a, 655, 1215, 0.55)
    finalize(a)
    return a


def scene_harvest():
    a = Art()
    sun(a, 200, 190, 70)
    cloud(a, 660, 150, 1.0)
    cloud(a, 880, 290, 0.7)
    for sx, sy in ((430, 120), (560, 300)):
        pass
    mountains(a, 600, seed=8, h=190)
    hills(a, 650, 30, 1.2, 160)
    for bx, by in ((90, 700), (560, 705), (930, 690)):
        bush(a, bx, by, 0.9)
    for bx, by in ((420, 110), (480, 150), (540, 95)):
        bird(a, bx, by, 1.0)
    butterfly(a, 180, 520, 1.0)
    hut(a, 640, 520, 290, 220)
    tree(a, 300, 780, 1.15, seed=4)
    hills(a, 850, 24, 0.2, 140)
    basket(a, 520, 1010, 1.15)
    basket(a, 120, 1000, 0.85, fruit=True)
    for tx, ty in ((90, 880), (900, 890), (60, 1170), (880, 1215), (450, 920), (760, 1000)):
        tuft(a, tx, ty, 1.0)
    flower(a, 880, 1060, 1.1, 80)
    flower(a, 60, 1080, 1.0, 70)
    hamster(a, 340, 1160, 1.15, hold="acorn", scarf=True)
    hamster(a, 650, 1130, 1.0, flower_ear=True)
    hamster(a, 800, 1215, 0.8, wink=True)
    for ax, ay in ((200, 1215), (470, 1250)):
        acorn(a, ax, ay, 0.8)
    finalize(a)
    return a


def scene_picnic():
    a = Art()
    sun(a, 780, 180, 66)
    cloud(a, 280, 150, 1.0)
    cloud(a, 560, 290, 0.7)
    # diều
    a.poly([(180, 330), (230, 380), (180, 450), (130, 380)], 255, LW)
    a.line((180, 330), (180, 450), LW2)
    a.line((130, 380), (230, 380), LW2)
    a.quad((180, 450), (140, 520), (200, 560), LW2)
    for i, (dx, dy) in enumerate(((150, 505), (180, 540))):
        a.poly([(dx - 14, dy - 8), (dx, dy), (dx - 14, dy + 8)], 255, LW2)
    mountains(a, 560, seed=2, h=200)
    hills(a, 610, 28, 0.4, 150)
    for bx, by in ((380, 640), (700, 650)):
        bush(a, bx, by, 0.9)
    for bx, by in ((520, 130), (580, 175), (640, 110)):
        bird(a, bx, by, 1.1)
    butterfly(a, 420, 820, 1.0)
    butterfly(a, 600, 760, 0.8)
    tree(a, 130, 760, 0.8, seed=9)
    tree(a, 880, 740, 0.7, seed=3)
    hills(a, 790, 22, 1.8, 130)
    # tấm trải picnic (hình thang có ô caro)
    cloth = [(250, 930), (760, 930), (860, 1120), (150, 1120)]
    a.poly(cloth, 255, LW)
    for i in range(1, 6):
        t = i / 6
        a.line((250 + (760 - 250) * t, 930), (150 + (860 - 150) * t, 1120), LW2)
    for i in range(1, 3):
        t = i / 3
        yy = 930 + 190 * t
        xl, xr = 250 - 100 * t, 760 + 100 * t
        a.line((xl, yy), (xr, yy), LW2)
    basket(a, 500, 1000, 1.0)
    for tx, ty in ((70, 900), (930, 920), (60, 1190), (910, 1215), (500, 1230)):
        tuft(a, tx, ty, 1.0)
    flower(a, 90, 1080, 1.1, 80)
    flower(a, 920, 1100, 1.0, 70)
    hamster(a, 300, 1090, 1.0, hold="acorn", flower_ear=True)
    hamster(a, 690, 1080, 1.05, scarf=True, wink=True)
    hamster(a, 495, 1225, 0.6)
    finalize(a)
    return a


def main():
    for i, fn in enumerate((scene_lantern_night, scene_harvest, scene_picnic), 1):
        art = fn()
        art.save(OUT / f"scene_{i}.png")
        print("  output/hamster/scene_%d.png" % i)


if __name__ == "__main__":
    main()
