#!/usr/bin/env python3
"""Làm trang nét đen trắng "tự nhiên" hơn: đục rỗng các khối đen đặc (mắt, chấm) và làm nét mượt.

Chạy:  python3 simplify_lineart.py anh.webp ket_qua.png

  --hollow N   chỉ xét khối đen có bán kính từ N điểm ảnh trở lên (mặc định 5)
  --maxdim M   khối chỉ bị đục rỗng nếu gọn và nhỏ hơn M điểm ảnh (mắt, chấm); nét dài thì giữ nguyên (mặc định 34)
  --ring W     độ dày vòng viền còn lại (mặc định 3.5)
  --scale S    phóng to trước khi xử lý rồi cắt về đen trắng thuần, làm nét mượt hơn (mặc định 2)
Không đụng tới nét thường. Chỉ xử lý được cái đã có trong ảnh: không đổi bố cục hay khuôn mặt.
"""
from __future__ import annotations

import argparse
import sys

import numpy as np
from PIL import Image

from colorize_lineart import label_regions


def erode(m):
    o = m.copy()
    o[1:] &= m[:-1]
    o[:-1] &= m[1:]
    o[:, 1:] &= m[:, :-1]
    o[:, :-1] &= m[:, 1:]
    return o


def dilate(m):
    o = m.copy()
    o[1:] |= m[:-1]
    o[:-1] |= m[1:]
    o[:, 1:] |= m[:, :-1]
    o[:, :-1] |= m[:, 1:]
    return o


def depth_map(dark, maxd):
    depth = np.zeros(dark.shape, dtype=np.uint8)
    cur = dark.copy()
    for k in range(1, maxd + 1):
        cur = erode(cur)
        if not cur.any():
            break
        depth[cur] = k
    return depth


def process(img, hollow, ring, maxdim, scale):
    g = img.convert("L")
    if scale != 1:
        g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
    dark = np.asarray(g) < 128
    hmin = max(2, int(round(hollow * scale)))
    r = max(1, int(round(ring * scale)))
    dep = depth_map(dark, 40)
    core = dep >= hmin
    lab, n = label_regions(core)
    chosen = np.zeros(core.shape, dtype=bool)
    count = 0
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        w, h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        big, small = max(w, h), min(w, h)
        if big <= maxdim * scale and big <= 1.7 * small and len(xs) >= 0.45 * w * h:
            chosen[ys, xs] = True
            count += 1
    blob = chosen.copy()
    for _ in range(hmin + 3):        # khôi phục cả khối từ lõi (không vượt ra ngoài vùng đen)
        blob = dilate(blob) & dark
    interior = blob & (dep > r)      # phần ruột của khối, chừa vòng viền dày r
    out = dark & ~interior
    return Image.fromarray(np.where(out, 0, 255).astype(np.uint8)), count


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--hollow", type=float, default=5)
    ap.add_argument("--maxdim", type=float, default=34)
    ap.add_argument("--ring", type=float, default=3.5)
    ap.add_argument("--scale", type=float, default=2.0)
    a = ap.parse_args()
    out, count = process(Image.open(a.input), a.hollow, a.ring, a.maxdim, a.scale)
    out.save(a.output, optimize=True, dpi=(300, 300))
    print(f"Đã lưu {a.output} ({out.width}x{out.height}); đục rỗng {count} khối đặc")
    return 0


if __name__ == "__main__":
    sys.exit(main())
