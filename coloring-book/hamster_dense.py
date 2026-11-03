#!/usr/bin/env python3
"""Cảnh DÀY ĐẶC: nhiều hamster, mỗi con một việc, cùng một chủ đề (nét đen trắng).

Chạy:  python3 hamster_dense.py   ->  output/hamster/dense_1.png (2550x3300, 300 DPI)
"""
from __future__ import annotations

import math
import random

from hamster_scenes import (HL, LW, LW2, OUT, WL, Art, acorn, basket, bird, bush, butterfly, cloud,
                            finalize, flower, hills, lantern, moon, mountains, star, stone_path,
                            tree, tuft)


# ----------------------------------------------------------------- hamster
def cup(a, x, y, s=1.0, steam=True):
    a.poly([(x - 14 * s, y - 18 * s), (x + 14 * s, y - 18 * s), (x + 10 * s, y), (x - 10 * s, y)], 255, LW2)
    a.arc(x + 15 * s, y - 10 * s, 7 * s, 7 * s, -90, 90, LW2)
    if steam:
        a.quad((x - 4 * s, y - 24 * s), (x - 11 * s, y - 34 * s), (x - 4 * s, y - 44 * s), 1.8)
        a.quad((x + 5 * s, y - 24 * s), (x - 2 * s, y - 34 * s), (x + 5 * s, y - 44 * s), 1.8)


def plate(a, x, y, s=1.0, n=3):
    a.ellipse(x, y, 54 * s, 11 * s, 255, LW2)
    for i in range(n):
        mx = x + (i - (n - 1) / 2) * 28 * s
        a.ellipse(mx, y - 12 * s, 14 * s, 12 * s, 255, LW2)
        a.ellipse(mx, y - 17 * s, 3 * s, 2.5 * s, 0, 1)


def hamster2(a, x, y, s=1.0, hold=None, m=1, scarf=False, flower_ear=False, wink=False,
             head_only=False, shy=False):
    """Hamster ngồi nhìn thẳng. hold: acorn|lantern|flower|cup|tray|fruit|mallet. m=±1: bên cầm đồ."""
    lw = max(2.4, LW * s ** 0.5)
    lw2 = max(1.8, LW2 * s ** 0.5)

    def E(cx, cy, rx, ry, fill=255, w=None):
        a.ellipse(x + cx * s, y + cy * s, rx * s, ry * s, fill, w or lw)

    for sx in (-1, 1):
        E(sx * 62, -218, 25, 27)
        E(sx * 62, -216, 13, 15, 255, lw2)
    if not head_only:
        E(0, -72, 78, 82)
        for sx in (-1, 1):
            E(sx * 42, -8, 30, 15)
            for t in (-8, 0, 8):
                a.line((x + (sx * 42 + t) * s, y - 2 * s), (x + (sx * 42 + t) * s, y + 4 * s), 1.6)
        E(0, -64, 44, 52, 255, lw2)
    a.union([(x, y - 168 * s, 78 * s, 66 * s), (x - 52 * s, y - 148 * s, 38 * s, 32 * s),
             (x + 52 * s, y - 148 * s, 38 * s, 32 * s)], lw)
    for dx, bx in ((-16, -6), (16, 6)):
        a.quad((x + dx * s, y - 224 * s), (x + bx * s, y - 212 * s), (x + dx * 0.6 * s, y - 202 * s), lw2)
    a.quad((x, y - 226 * s), (x + 3 * s, y - 214 * s), (x, y - 205 * s), lw2)
    for sx in (-1, 1):
        ex, ey = x + sx * 34 * s, y - 168 * s
        if wink and sx == 1:
            a.arc(ex, ey + 2 * s, 11 * s, 8 * s, 200, 340, lw)
        elif shy:
            a.arc(ex, ey, 11 * s, 9 * s, 20, 160, lw)
        else:
            a.ellipse(ex, ey, 9.5 * s, 11 * s, 0, 1)
            a.ellipse(ex - 3 * s, ey - 4 * s, 3.6 * s, 3.6 * s, 255, 1)
    a.ellipse(x, y - 150 * s, 8 * s, 6 * s, 0, 1)
    a.quad((x, y - 144 * s), (x - 4 * s, y - 134 * s), (x - 14 * s, y - 138 * s), lw2)
    a.quad((x, y - 144 * s), (x + 4 * s, y - 134 * s), (x + 14 * s, y - 138 * s), lw2)
    for sx in (-1, 1):
        cx, cy = x + sx * 62 * s, y - 146 * s
        a.ellipse(cx, cy, 15 * s, 10 * s, None, max(1.6, lw2 - 0.6))
        for t in (-5, 0, 5):
            a.line((cx + t * s - 3 * s, cy + 3 * s), (cx + t * s + 3 * s, cy - 3 * s), 1.5)
        for dy, ang in ((-4, -10), (4, 6)):
            a.line((x + sx * 88 * s, y + (-152 + dy) * s), (x + sx * 118 * s, y + (-152 + dy + ang) * s), 1.6)
    if head_only:
        for sx in (-1, 1):
            E(sx * 52, -100, 21, 16)
        return
    if scarf:
        a.poly([(x - 66 * s, y - 112 * s), (x, y - 96 * s), (x + 66 * s, y - 112 * s),
                (x + 62 * s, y - 94 * s), (x, y - 78 * s), (x - 62 * s, y - 94 * s)], 255, lw)
        a.poly([(x + 20 * s, y - 88 * s), (x + 52 * s, y - 84 * s), (x + 58 * s, y - 40 * s),
                (x + 32 * s, y - 44 * s)], 255, lw)
    if hold == "acorn":
        acorn(a, x, y - 72 * s, 1.35 * s)
    elif hold == "lantern":
        a.line((x + m * 72 * s, y - 96 * s), (x + m * 128 * s, y - 250 * s), lw)
        lantern(a, x + m * 128 * s, y - 300 * s, 70 * s, 84 * s)
    elif hold == "flower":
        flower(a, x + 4 * s, y - 62 * s, 1.0 * s, 70)
    elif hold == "cup":
        cup(a, x + m * 30 * s, y - 66 * s, 1.5 * s)
    elif hold == "tray":
        plate(a, x, y - 66 * s, 1.15 * s)
    elif hold == "fruit":
        a.ellipse(x, y - 78 * s, 22 * s, 21 * s, 255, lw2 + 0.4)
        a.quad((x, y - 98 * s), (x + 4 * s, y - 108 * s), (x + 14 * s, y - 106 * s), lw2)
        a.ellipse(x + 14 * s, y - 104 * s, 9 * s, 5 * s, 255, lw2)
    elif hold == "mallet":
        hx = x + m * 76 * s
        a.line((hx, y - 70 * s), (hx, y - 296 * s), lw + 0.8)
        a.rect(hx - 34 * s, y - 326 * s, 68 * s, 44 * s, 255, lw2 + 0.5)
        a.line((hx - 34 * s, y - 312 * s), (hx + 34 * s, y - 312 * s), lw2 - 0.4)
        a.line((hx - 34 * s, y - 296 * s), (hx + 34 * s, y - 296 * s), lw2 - 0.4)
    for sx in (-1, 1):
        if hold == "mallet" and sx == m:
            E(sx * 76, -106, 19, 24)
        else:
            E(sx * 62, -86, 20, 25)
    if flower_ear:
        fx, fy = x - 70 * s, y - 238 * s
        pts = [(fx + 16 * s * math.cos(2 * math.pi * i / 5), fy + 16 * s * math.sin(2 * math.pi * i / 5), 12 * s, 12 * s)
               for i in range(5)]
        a.union(pts + [(fx, fy, 10 * s, 10 * s)], lw2)
        a.ellipse(fx, fy, 6 * s, 6 * s, 255, lw2)


def sleeper(a, x, y, s=1.0):
    lw2 = max(1.8, LW2 * s ** 0.5)

    def E(cx, cy, rx, ry, fill=255, w=None):
        a.ellipse(x + cx * s, y + cy * s, rx * s, ry * s, fill, w or max(2.4, LW * s ** 0.5))

    E(36, -46, 104, 58)
    E(140, -48, 14, 14)
    for ex in (-100, -48):
        E(ex, -104, 20, 21)
        E(ex, -103, 10, 11, 255, lw2)
    a.union([(x - 72 * s, y - 52 * s, 64 * s, 54 * s), (x - 112 * s, y - 40 * s, 30 * s, 26 * s),
             (x - 32 * s, y - 40 * s, 30 * s, 26 * s)], max(2.4, LW * s ** 0.5))
    for ex in (-92, -52):
        a.arc(x + ex * s, y - 58 * s, 12 * s, 9 * s, 20, 160, lw2 + 0.4)
    a.ellipse(x - 72 * s, y - 40 * s, 7 * s, 5 * s, 0, 1)
    E(-8, -22, 26, 14)
    for i, (zx, zy, zs) in enumerate(((-60, -140, 11), (-35, -168, 15), (-5, -202, 20))):
        px, py, q = x + zx * s, y + zy * s, zs * s
        a.poly([(px, py), (px + q, py), (px, py + q), (px + q, py + q)], None, 2.2, closed=False)


# ----------------------------------------------------------------- vật thể
def table(a, x, y, w):
    for sx in (-1, 1):
        a.line((x + sx * w * 0.7, y + w * 0.1), (x + sx * w * 0.8, y + w * 0.62), LW)
    a.ellipse(x, y, w, w * 0.2, 255, LW)


def teapot(a, x, y, s=1.0):
    a.ellipse(x, y - 16 * s, 24 * s, 18 * s, 255, LW2)
    a.ellipse(x, y - 36 * s, 11 * s, 5 * s, 255, LW2)
    a.quad((x + 22 * s, y - 20 * s), (x + 40 * s, y - 28 * s), (x + 36 * s, y - 44 * s), LW2)
    a.arc(x - 26 * s, y - 18 * s, 10 * s, 12 * s, 90, 270, LW2)


def garland(a, p0, p1, sag, ns, size=1.0, seed=1):
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + sag * 2
    a.quad(p0, (mx, my), p1, LW2, steps=40)
    rng = random.Random(seed)
    for i in range(1, ns + 1):
        t = i / (ns + 1)
        px = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * mx + t * t * p1[0]
        py = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * my + t * t * p1[1]
        w = rng.uniform(30, 40) * size
        lantern(a, px, py + 16 + w * 0.6, w, w * 1.22, hang=16)


def pavilion(a, cx, by, w=300, ph=205):
    x0, x1 = cx - w / 2, cx + w / 2
    a.rect(x0 - 18, by - 26, w + 36, 26, 255, LW)
    a.line((x0 - 18, by - 13), (x1 + 18, by - 13), LW2 - 0.6)
    ry = by - 26 - ph
    for px in (x0 + 10, x1 - 10):
        a.rect(px - 9, ry, 18, ph, 255, LW)
    xl, xr = x0 - 85, x1 + 85
    ridge = ry - 125
    top, low = [], []
    n = 40
    for i in range(n + 1):
        t = i / n
        x = xl + (cx - xl) * t
        top.append((x, ridge + (ry + 22 - ridge) * (1 - t) ** 2.1))
    for i in range(n + 1):
        t = i / n
        x = cx + (xr - cx) * t
        top.append((x, ridge + (ry + 22 - ridge) * t ** 2.1))
    for i in range(n + 1):
        t = i / n
        x = xr - (xr - xl) * t
        low.append((x, ry + 30 + 14 * math.sin(math.pi * t)))
    a.poly(top + low, 255, LW)
    for k in (1, 2, 3):
        pts = []
        for tx, ty in top:
            t = (xr - tx) / (xr - xl)
            under = ry + 30 + 14 * math.sin(math.pi * t)
            pts.append((tx, ty + (under - ty) * k / 4))
        a.poly(pts, None, LW2 - 0.8, closed=False)
    a.ellipse(cx, ridge - 6, 8, 12, 255, LW2)
    for lx in (xl + 26, xr - 26):
        lantern(a, lx, ry + 105, 40, 50, hang=62)


def stall(a, x0, y0, w, h):
    base = y0 + h
    for px in (x0 + 12, x0 + w - 12):
        a.rect(px - 6, y0 + 40, 12, h - 40, 255, LW2 + 0.6)
    a.rect(x0, base - 70, w, 70, 255, LW)
    for i in range(1, 4):
        a.line((x0 + w * i / 4, base - 70), (x0 + w * i / 4, base), LW2 - 0.8)
    a.line((x0, base - 52), (x0 + w, base - 52), LW2)
    n = 6
    aw = w + 30
    r = aw / n / 2
    pts = [(x0 + 22, y0), (x0 + w - 22, y0), (x0 + w + 15, y0 + 56)]
    for i in range(n - 1, -1, -1):
        cx = x0 - 15 + (i + 0.5) * aw / n
        for j in range(0, 13):
            ang = math.radians(0 + 180 * j / 12)
            pts.append((cx + r * math.cos(ang) * (-1) ** 0 * (1 if False else 1), y0 + 56 + r * 0.7 * math.sin(ang)))
    pts = [(x0 + 22, y0), (x0 + w - 22, y0), (x0 + w + 15, y0 + 56)]
    for i in range(n - 1, -1, -1):
        cx = x0 - 15 + (i + 0.5) * aw / n
        for j in range(13):
            ang = math.radians(180 * j / 12)
            pts.append((cx + r * math.cos(ang), y0 + 56 + r * 0.7 * math.sin(ang)))
    pts.append((x0 - 15, y0 + 56))
    a.poly(pts, 255, LW)
    for i in range(1, n):
        a.line((x0 + 22 + (w - 44) * i / n, y0 + 2), (x0 - 15 + aw * i / n, y0 + 54), LW2 - 0.6)
    for i, lx in enumerate((x0 + w * 0.22, x0 + w * 0.5, x0 + w * 0.78)):
        lantern(a, lx, y0 + 120 + (i % 2) * 10, 34, 42, hang=46)


def pond(a, cx, cy, rx, ry):
    pts = []
    for i in range(90):
        t = 2 * math.pi * i / 90
        k = 1 + 0.07 * math.sin(3 * t + 1) + 0.04 * math.sin(5 * t)
        pts.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    a.poly(pts, 255, LW)
    for dx, dy, w in ((-0.45, 0.35, 40), (0.3, -0.45, 46), (0.5, 0.45, 36), (-0.6, -0.2, 34)):
        a.arc(cx + dx * rx, cy + dy * ry, w, w * 0.22, 190, 350, LW2 - 0.8)


def lilypad(a, x, y, s=1.0):
    a.ellipse(x, y, 30 * s, 12 * s, 255, LW2)
    a.line((x, y), (x + 30 * s, y - 2 * s), LW2 - 0.6)


def lotus(a, x, y, s=1.0):
    for dx, ang in ((-24, 1), (24, -1), (-12, 1), (12, -1), (0, 0)):
        a.ellipse(x + dx * s, y - 14 * s + abs(dx) * 0.2 * s, 10 * s, 22 * s, 255, LW2)
    lilypad(a, x, y + 6 * s, s * 0.9)


def boat(a, x, y, s=1.0):
    n = 30
    top = [((x + 112 * s) - 224 * s * i / n, y - 14 * s + 10 * s * math.sin(math.pi * i / n)) for i in range(n + 1)]
    hull = [(x - 112 * s, y - 14 * s), (x - 82 * s, y + 20 * s), (x + 82 * s, y + 20 * s)] + top[:-1]
    a.poly(hull, 255, LW)
    a.line((x - 94 * s, y + 4 * s), (x + 94 * s, y + 4 * s), LW2 - 0.6)
    a.line((x + 70 * s, y - 2 * s), (x + 150 * s, y + 50 * s), LW2)
    a.ellipse(x + 154 * s, y + 54 * s, 16 * s, 8 * s, 255, LW2)


def duck(a, x, y, s=1.0, flip=1):
    def P(px, py):
        return (x + flip * px * s, y + py * s)
    a.arc(x, y + 22 * s, 48 * s, 8 * s, 190, 350, 1.8)
    a.ellipse(x, y, 34 * s, 21 * s, 255, LW2)
    a.poly([P(-30, -6), P(-52, -22), P(-36, 6)], 255, LW2)
    a.ellipse(x + flip * 30 * s, y - 22 * s, 14 * s, 14 * s, 255, LW2)
    a.poly([P(41, -26), P(58, -21), P(42, -15)], 255, LW2)
    a.ellipse(x + flip * 34 * s, y - 26 * s, 2.6 * s, 2.6 * s, 0, 1)
    a.arc(x - flip * 4 * s, y - 2 * s, 18 * s, 11 * s, 10, 170, LW2 - 0.6)


def tub(a, x, y, w=100, h=80):
    a.poly([(x - w, y), (x - w * 0.85, y + h), (x + w * 0.85, y + h), (x + w, y)], 255, LW)
    a.ellipse(x, y, w, w * 0.28, 255, LW)
    a.ellipse(x, y + 3, w * 0.8, w * 0.19, 255, LW2)
    a.ellipse(x, y + 4, w * 0.5, w * 0.1, 255, LW2)
    for f in (0.36, 0.72):
        yy = y + h * f
        a.quad((x - w * (1 - 0.15 * f) , yy), (x, yy + 14), (x + w * (1 - 0.15 * f), yy), LW2)


def fence(a, x0, x1, y):
    for xx in range(int(x0), int(x1), 34):
        a.poly([(xx - 8, y), (xx - 8, y - 46), (xx, y - 56), (xx + 8, y - 46), (xx + 8, y)], 255, LW2)
    a.line((x0 - 8, y - 34), (x1, y - 34), LW2)
    a.line((x0 - 8, y - 14), (x1, y - 14), LW2)


def grass_row(a, y0, y1, n, seed=1, x0=70, x1=930):
    rng = random.Random(seed)
    for _ in range(n):
        tuft(a, rng.uniform(x0, x1), rng.uniform(y0, y1), rng.uniform(0.7, 1.1))


# ---------------------------------------------------------------- cảnh dày
def scene_dense_1():
    a = Art()
    # --- bầu trời
    moon(a, 500, 285, 96)
    cloud(a, 150, 210, 0.8)
    cloud(a, 860, 200, 0.75)
    cloud(a, 830, 360, 0.6)
    for sx, sy, r in ((110, 340, 16), (300, 250, 12), (700, 250, 14), (905, 300, 12), (260, 160, 10), (740, 160, 11)):
        star(a, sx, sy, r)
    garland(a, (70, 92), (930, 92), 62, 8, 1.0, seed=3)
    for lx, ly, w, h in ((315, 250, 24, 30), (690, 330, 22, 28), (195, 400, 20, 25), (790, 270, 22, 27)):
        lantern(a, lx, ly, w, h)
    # --- núi và đồi xa
    mountains(a, 520, seed=5, h=150)
    hills(a, 585, 18, 0.6, 130)
    for hx, hy, hw in ((330, 585, 54), (640, 575, 48), (120, 590, 40)):
        a.rect(hx - hw / 2, hy - 34, hw, 34, 255, LW2)
        a.poly([(hx - hw / 2 - 8, hy - 34), (hx, hy - 62), (hx + hw / 2 + 8, hy - 34)], 255, LW2)
    hills(a, 650, 18, 2.0, 150)
    # --- cây trái
    tree(a, 120, 800, 0.95, seed=2)
    hamster2(a, 118, 560, 0.5, hold="fruit", flower_ear=True)
    hamster2(a, 205, 500, 0.42, head_only=True, shy=True)
    # --- đình nghỉ chân với tiệc trà
    pavilion(a, 470, 800, 300, 205)
    hamster2(a, 470, 760, 0.55, head_only=True)
    table(a, 470, 758, 78)
    teapot(a, 470, 752, 1.0)
    cup(a, 430, 752, 0.9)
    cup(a, 512, 752, 0.9)
    hamster2(a, 385, 800, 0.6, hold="cup", m=1)
    hamster2(a, 552, 800, 0.6, hold="tray", wink=True)
    # --- quầy bán đèn lồng
    stall(a, 690, 590, 250, 210)
    hamster2(a, 815, 808, 0.62, scarf=True)
    a.rect(690, 740, 250, 70, 255, LW)
    for i in range(1, 4):
        a.line((690 + 250 * i / 4, 740), (690 + 250 * i / 4, 810), LW2 - 0.8)
    a.line((690, 758), (940, 758), LW2)
    # --- đồi tiền cảnh
    hills(a, 862, 22, 1.0, 130)
    # --- chi tiết nền
    grass_row(a, 890, 1250, 22, seed=4)
    bush(a, 70, 880, 0.8)
    flower(a, 310, 1225, 0.9, 60)
    flower(a, 700, 1190, 0.9, 60)
    flower(a, 925, 1230, 1.0, 70)
    butterfly(a, 590, 930, 0.9)
    butterfly(a, 330, 960, 0.7)
    hamster2(a, 175, 920, 0.42, head_only=True)
    hamster2(a, 255, 920, 0.4, head_only=True, wink=True)
    fence(a, 70, 300, 930)
    # --- hồ sen bên phải
    pond(a, 770, 1065, 195, 95)
    for lx, ly, ls in ((665, 1085, 0.9), (885, 1030, 0.8), (735, 1118, 0.8), (850, 1112, 0.8)):
        lilypad(a, lx, ly, ls)
    lotus(a, 905, 1085, 0.9)
    lotus(a, 668, 1040, 0.8)
    hamster2(a, 770, 1078, 0.5, hold="flower", m=-1)
    boat(a, 770, 1078, 0.9)
    duck(a, 685, 1128, 0.7, 1)
    duck(a, 900, 1062, 0.6, -1)
    # --- giã bánh dày bên trái
    hamster2(a, 190, 1010, 0.5, head_only=True)
    tub(a, 190, 1030, 100, 78)
    hamster2(a, 135, 1170, 0.58, hold="mallet", m=-1)
    hamster2(a, 255, 1170, 0.58, hold="mallet", m=1, wink=True)
    for tx, ty in ((75, 1200), (320, 1210)):
        pass
    # --- lối đi giữa
    stone_path(a, [(470, 905, 26, 10), (462, 940, 28, 10), (478, 975, 30, 11), (455, 1010, 32, 11)])
    hamster2(a, 400, 1050, 0.55, hold="lantern", m=-1)
    hamster2(a, 500, 1150, 0.6, hold="acorn", scarf=True)
    hamster2(a, 395, 1212, 0.5, flower_ear=True, hold="flower")
    sleeper(a, 585, 1212, 0.4)
    for bx, by in ((420, 130), (490, 160)):
        bird(a, bx, by + 70, 0.9)
    finalize(a)
    return a


def main():
    art = scene_dense_1()
    art.save(OUT / "dense_1.png")
    print("  output/hamster/dense_1.png")


if __name__ == "__main__":
    main()
