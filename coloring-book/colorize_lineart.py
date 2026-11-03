#!/usr/bin/env python3
"""Tô màu tự động một trang nét đen trắng (để làm ảnh bìa nhanh).

Chạy:  python3 colorize_lineart.py anh.webp output/cover_art.png --seed 3

Cách làm: tìm từng ô khép kín bị nét vẽ bao quanh, rồi tô mỗi ô một màu từ bảng màu hài hòa, sao cho các ô
kề nhau không trùng màu. Ô to dùng màu nhạt, ô nhỏ dùng màu đậm hơn. Màu được chọn ngẫu nhiên theo `--seed`,
không hiểu nội dung ảnh (ví dụ không biết đâu là lá cây). Muốn tô màu tự nhiên hơn, hãy nhờ công cụ AI tô.
"""
from __future__ import annotations

import argparse
import random
import sys

import numpy as np
from PIL import Image

PASTEL = ["#FFF3D6", "#FFE0B2", "#FFD9D9", "#E1F3E5", "#DCEEFF", "#F4E6FF"]
MID = ["#FFC857", "#F4A261", "#F28482", "#8FBF9F", "#7FC8F8", "#CDB4DB", "#FFAFCC", "#B5E48C"]
VIVID = ["#E63946", "#FFB703", "#2A9D8F", "#F72585", "#4361EE", "#06D6A0", "#FF7B00", "#9D4EDD"]
INK = (34, 28, 48)


def hx(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def label_regions(white: np.ndarray):
    """Gán nhãn cho các vùng trắng liên thông (4 hướng) bằng union-find trên các đoạn ngang."""
    H, W = white.shape
    starts_all, ends_all, rows = [], [], []
    row_slices = []
    for y in range(H):
        row = white[y]
        d = np.diff(np.concatenate(([0], row.view(np.int8), [0])))
        s = np.flatnonzero(d == 1)
        e = np.flatnonzero(d == -1)
        row_slices.append((len(starts_all), len(starts_all) + len(s)))
        starts_all.extend(s.tolist())
        ends_all.extend(e.tolist())
        rows.extend([y] * len(s))
    n = len(starts_all)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for y in range(H - 1):
        a0, a1 = row_slices[y]
        b0, b1 = row_slices[y + 1]
        i, j = a0, b0
        while i < a1 and j < b1:
            if starts_all[i] < ends_all[j] and starts_all[j] < ends_all[i]:
                ra, rb = find(i), find(j)
                if ra != rb:
                    parent[rb] = ra
            if ends_all[i] < ends_all[j]:
                i += 1
            else:
                j += 1
    roots = {}
    labels = np.zeros((H, W), dtype=np.int32)
    for k in range(n):
        r = find(k)
        lab = roots.setdefault(r, len(roots) + 1)
        labels[rows[k], starts_all[k]:ends_all[k]] = lab
    return labels, len(roots)


def grow(labels: np.ndarray, steps: int):
    """Mở rộng nhãn ra các điểm ảnh nét vẽ (nhãn 0) bằng nhãn của điểm kề."""
    lab = labels.copy()
    for _ in range(steps):
        zero = lab == 0
        if not zero.any():
            break
        up = np.zeros_like(lab); up[1:] = lab[:-1]
        dn = np.zeros_like(lab); dn[:-1] = lab[1:]
        lf = np.zeros_like(lab); lf[:, 1:] = lab[:, :-1]
        rt = np.zeros_like(lab); rt[:, :-1] = lab[:, 1:]
        cand = np.maximum(np.maximum(up, dn), np.maximum(lf, rt))
        lab = np.where(zero & (cand > 0), cand, lab)
    return lab


def adjacency(lab: np.ndarray, n: int):
    nb = [set() for _ in range(n + 1)]
    for a, b in ((lab[:, :-1], lab[:, 1:]), (lab[:-1], lab[1:])):
        m = (a != b) & (a > 0) & (b > 0)
        code = np.unique(a[m].astype(np.int64) * (n + 1) + b[m].astype(np.int64))
        for c in code:
            x, y = divmod(int(c), n + 1)
            nb[x].add(y)
            nb[y].add(x)
    return nb


def colorize(img: Image.Image, seed: int, scale: float, line_thr: int):
    g = img.convert("L")
    if scale != 1:
        g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
    gray = np.asarray(g, dtype=np.uint8)
    white = gray >= line_thr
    labels, n = label_regions(white)
    lab = grow(labels, 10)
    areas = np.bincount(lab.ravel(), minlength=n + 1)
    total = lab.size
    nb = adjacency(lab, n)

    rng = random.Random(seed)
    palettes = {"big": [hx(c) for c in PASTEL], "mid": [hx(c) for c in MID], "small": [hx(c) for c in VIVID]}
    color = {}
    order = sorted(range(1, n + 1), key=lambda k: -areas[k])
    for k in order:
        frac = areas[k] / total
        kind = "big" if frac > 0.004 else "mid" if frac > 0.0004 else "small"
        used = {color[j] for j in nb[k] if j in color}
        opts = [c for c in palettes[kind] if c not in used] or palettes[kind]
        color[k] = rng.choice(opts)

    lut = np.zeros((n + 1, 3), dtype=np.uint8)
    for k, c in color.items():
        lut[k] = c
    fill = lut[lab].astype(np.float32)
    t = np.clip((gray.astype(np.float32) - 60) / (200 - 60), 0, 1)[..., None]
    out = np.array(INK, dtype=np.float32) * (1 - t) + fill * t
    return Image.fromarray(out.clip(0, 255).astype(np.uint8)), n


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--scale", type=float, default=2.0, help="phóng to trước khi tô (mặc định 2)")
    ap.add_argument("--line", type=int, default=150, help="ngưỡng xám để coi là nét vẽ (0-255)")
    a = ap.parse_args()
    out, n = colorize(Image.open(a.input), a.seed, a.scale, a.line)
    out.save(a.output, optimize=True)
    print(f"Đã tô {n} ô -> {a.output} ({out.width}x{out.height})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
