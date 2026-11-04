#!/usr/bin/env python3
"""Tách chú hamster lữ khách (nón lá, khăn ca-rô, ba lô) ra khỏi một trang trong sách.

Chạy:  python3 extract_mascot.py
Kết quả (output/brand/):
  mascot_color.png     chú hamster đã tô màu, nền trong suốt (4x độ phân giải trang gốc)
  mascot_line.png      bản nét đen, nền trong suốt (dùng để làm sticker tô màu)
Chú hamster dính liền nét nền nên đường viền được vẽ tay (toạ độ ở khổ crop 320x360).
Nếu đổi trang nguồn, cần vẽ lại POLY và các vùng tô màu bên dưới.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from colorize_lineart import label_regions

HERE = Path(__file__).resolve().parent
SRC = HERE / "images" / "hamster" / "025_lang-gom.webp"
CROP = (280, 940, 600, 1300)   # vùng chứa chú lữ khách trong trang gốc
K = 4                          # phóng to 4 lần

# đường viền quanh chú hamster (toạ độ 1x trong vùng crop), chừa lề vài điểm ảnh
POLY = [(90, 15), (160, 44), (228, 55), (246, 66), (243, 94), (226, 106), (224, 125), (252, 130), (261, 150),
        (252, 176), (264, 196), (261, 214), (245, 224), (246, 238), (250, 254), (238, 274), (252, 292),
        (249, 308), (212, 326), (168, 324), (130, 311), (103, 327), (60, 336), (43, 314), (47, 290),
        (55, 270), (33, 250), (22, 226), (26, 190), (34, 170), (50, 156), (14, 154), (17, 124), (36, 94),
        (56, 58), (78, 26)]

# nới đường viền ra ngoài ~5% quanh tâm để không cắt vào nét của chú hamster
_cx, _cy = 150.0, 180.0
POLY = [(_cx + (x - _cx) * 1.06, _cy + (y - _cy) * 1.06) for x, y in POLY]

HAT = [(16, 154), (90, 16), (246, 66), (242, 98), (130, 112), (60, 152)]

HONEY = (248, 214, 160)
STRAW = (240, 205, 120)
RED = (205, 70, 60)
CREAM = (255, 246, 222)
TEAL = (52, 140, 140)
OLIVE = (106, 140, 86)
TAN = (214, 170, 100)
SHOE = (196, 128, 84)


def inside_poly(p, poly):
    x, y = p
    c = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def classify(cx, cy, area, face_id, rid):
    """Chọn màu cho một ô theo vị trí (toạ độ 1x) và diện tích."""
    if rid == face_id:
        return HONEY
    p = (cx, cy)
    if 205 <= cx <= 258 and 132 <= cy <= 176:
        return CREAM                                    # sổ tay
    if 30 <= cx <= 95 and 150 <= cy <= 200 and inside_poly(p, [(30, 150), (95, 150), (95, 200), (30, 200)]):
        return TAN                                      # cuộn chiếu
    if 95 <= cx <= 200 and 150 <= cy <= 178:
        return RED if (int(cx // 11) + int(cy // 11)) % 2 == 0 else CREAM   # khăn ở cổ
    if 140 <= cx <= 245 and 205 <= cy <= 262 and cy > 205 + (cx - 140) * 0.0:
        if not (cx > 215 and cy < 220):
            return RED if (int(cx // 11) + int(cy // 11)) % 2 == 0 else CREAM   # khăn buông xuống
    if inside_poly(p, [(18, 152), (90, 18), (244, 66), (240, 96), (200, 104), (100, 124), (55, 150)]):
        return STRAW                                    # nón lá
    if 28 <= cx <= 95 and 195 <= cy <= 252:
        return TEAL                                     # ba lô
    if 60 <= cy - 0 and 262 <= cy <= 305 and 55 <= cx <= 215:
        return OLIVE                                    # quần
    if cy > 296:
        return SHOE                                     # giày
    return HONEY


def main():
    src = Image.open(SRC).convert("L").crop(CROP)
    big = src.resize((src.width * K, src.height * K), Image.LANCZOS)
    a = np.asarray(big, dtype=np.uint8)
    H, W = a.shape

    poly_img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(poly_img).polygon([(x * K, y * K) for x, y in POLY], fill=255)
    poly = np.asarray(poly_img) > 0

    white = a >= 215   # ngưỡng cao để giữ cả các nét mảnh (lưới nón, vằn mặt)
    lab, n = label_regions(white)
    outside_ids = set(np.unique(lab[(~poly) & white]).tolist())
    outside_ids.discard(0)

    sizes = np.bincount(lab.ravel(), minlength=n + 1)
    ys, xs = np.mgrid[0:H, 0:W]
    # chọn ô mặt: ô lớn nhất có tâm ở vùng đầu
    face_id, best = -1, 0
    for rid in range(1, n + 1):
        if rid in outside_ids or sizes[rid] < 2000:
            continue
        m = lab == rid
        cx, cy = xs[m].mean() / K, ys[m].mean() / K
        if 80 <= cx <= 220 and 55 <= cy <= 155 and sizes[rid] > best:
            face_id, best = rid, sizes[rid]

    color = np.zeros((H, W, 3), dtype=np.uint8)
    part = np.zeros((H, W), dtype=np.uint8)   # 1 = mặt, 2 = nón (chỉ trong vùng bị dính)
    for rid in range(1, n + 1):
        if rid in outside_ids or sizes[rid] == 0:
            continue
        m = lab == rid
        cx, cy = xs[m].mean() / K, ys[m].mean() / K
        if not inside_poly((cx, cy), POLY):
            continue
        if rid == face_id:
            # vùng mặt dính với nón (nét viền bị hở): tách bằng hình elip quanh đầu
            fx, fy = xs[m] / K, ys[m] / K
            in_face = ((fx - 148) / 72.0) ** 2 + ((fy - 108) / 50.0) ** 2 <= 1.0
            in_hat = np.array([inside_poly((x, y), HAT) for x, y in zip(fx[~in_face][::1], fy[~in_face][::1])])
            cols = np.empty((m.sum(), 3), dtype=np.uint8)
            cols[in_face] = HONEY
            sub = np.where(in_hat, 1, 0)
            cols[~in_face] = np.where(sub[:, None] == 1, np.array(STRAW), np.array(HONEY))
            color[m] = cols
            part[m] = np.where(in_face, 1, np.where(sub == 1, 2, 1))[np.arange(m.sum()) * 0 + np.arange(m.sum())] if False else 0
            idx = np.flatnonzero(m.ravel())
            flat = part.ravel()
            fl_face = in_face
            vals = np.empty(m.sum(), dtype=np.uint8)
            vals[in_face] = 1
            vals[~in_face] = np.where(in_hat, 2, 1)
            flat[idx] = vals
            continue
        color[m] = classify(cx, cy, sizes[rid], face_id, rid)

    filled = np.zeros((H, W), dtype=bool)
    for rid in range(1, n + 1):
        if rid not in outside_ids and sizes[rid] > 0:
            filled |= (lab == rid) & poly
    # vùng nét vẽ: điểm nằm trong đường viền và sát các ô của chú hamster (loại nét nền ở lề)
    near = filled.copy()
    for _ in range(10):
        up = np.zeros_like(near); up[1:] = near[:-1]
        dn = np.zeros_like(near); dn[:-1] = near[1:]
        lf = np.zeros_like(near); lf[:, 1:] = near[:, :-1]
        rt = np.zeros_like(near); rt[:, :-1] = near[:, 1:]
        near = near | up | dn | lf | rt
    near &= poly
    edge = np.zeros((H, W), dtype=bool)
    edge[:, :-1] |= (part[:, :-1] != part[:, 1:]) & (part[:, :-1] > 0) & (part[:, 1:] > 0)
    edge[:-1] |= (part[:-1] != part[1:]) & (part[:-1] > 0) & (part[1:] > 0)
    for _ in range(4):
        e2 = edge.copy()
        e2[1:] |= edge[:-1]; e2[:-1] |= edge[1:]; e2[:, 1:] |= edge[:, :-1]; e2[:, :-1] |= edge[:, 1:]
        edge = e2
    edge &= filled
    dark = (255 - a.astype(np.float32)) / 255.0
    ink_a = np.where(near, np.clip((dark - 0.08) / 0.5, 0, 1), 0.0)
    ink_a = np.maximum(ink_a, edge.astype(np.float32))
    ink = np.array((34, 28, 48), dtype=np.float32)

    alpha = np.maximum(filled.astype(np.float32), ink_a)
    base = np.where(filled[..., None], color.astype(np.float32), ink)
    rgb = base * (1 - ink_a[..., None]) + ink * ink_a[..., None]
    rgba = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)

    ys2, xs2 = np.nonzero(alpha > 0.05)
    pad = 24
    box = (max(0, xs2.min() - pad), max(0, ys2.min() - pad), min(W, xs2.max() + pad), min(H, ys2.max() + pad))
    out = HERE / "output" / "brand"
    out.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).crop(box).save(out / "mascot_color.png", optimize=True)
    line = np.zeros((H, W, 4), dtype=np.uint8)
    line[..., :3] = (20, 20, 30)
    line[..., 3] = (ink_a * 255).astype(np.uint8)
    Image.fromarray(line).crop(box).save(out / "mascot_line.png", optimize=True)
    print("mặt:", face_id, "| ô:", n, "| kích thước:", box[2] - box[0], "x", box[3] - box[1])
    return 0


if __name__ == "__main__":
    sys.exit(main())
