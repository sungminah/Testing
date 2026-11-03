"""Bộ tạo mandala bằng code (thuần Python, không cần thư viện ngoài).

Mỗi mandala là một danh sách `Path` trong hệ toạ độ đơn vị (bán kính ngoài ~ 1).
Cùng một `seed` luôn cho ra cùng một hình, nên có thể tạo lại bất cứ lúc nào.
Chỉ có NÉT VIỀN (không có mảng đen đặc, không có xám) -> hợp để in sách tô màu.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass

TAU = math.tau


@dataclass
class Path:
    pts: list
    closed: bool = True
    fill: bool = False  # True = hình khép kín có thể tô màu (dùng cho bìa màu)
    ring: int = 0       # vòng thứ mấy (dùng để chọn màu bìa)


# ---------------------------------------------------------------- hình cơ bản
def _polar(r, a):
    return (r * math.cos(a), r * math.sin(a))


def circle(r, fill=False, ring=0, cx=0.0, cy=0.0):
    steps = max(36, int(r * 720))
    pts = [(cx + r * math.cos(TAU * i / steps), cy + r * math.sin(TAU * i / steps))
           for i in range(steps)]
    return Path(pts, True, fill, ring)


def _shape_w(kind, t):
    """Độ rộng tương đối (0..1) của cánh hoa tại vị trí t (0 = gốc, 1 = ngọn)."""
    if kind == "lens":      # thoi, nhọn hai đầu
        return math.sin(math.pi * t)
    if kind == "drop":      # giọt nước: gốc tròn, ngọn nhọn
        return math.sin(math.pi * (t ** 0.55))
    if kind == "arch":      # vòm: gốc phẳng, ngọn tròn
        if t < 0.5:
            return 1.0
        return math.sqrt(max(0.0, 1 - ((t - 0.5) / 0.5) ** 2))
    if kind == "diamond":   # kim cương
        return 1 - abs(2 * t - 1)
    raise ValueError(kind)


def petal(angle, r0, r1, wmax, kind, ring=0, steps=48, fill=True):
    ca, sa = math.cos(angle), math.sin(angle)
    left, right = [], []
    for i in range(steps + 1):
        t = i / steps
        s = r0 + (r1 - r0) * t
        u = wmax * _shape_w(kind, t)
        left.append((s * ca - u * sa, s * sa + u * ca))
        right.append((s * ca + u * sa, s * sa - u * ca))
    pts = left + right[::-1][1:-1]
    return Path(pts, True, fill, ring)


def _fit_wmax(kind, r0, r1, n, spread=0.97, samples=40):
    """Độ rộng lớn nhất để các cánh kề nhau chỉ vừa chạm, không chồng lên nhau."""
    best = 1e9
    for i in range(1, samples):
        t = i / samples
        w = _shape_w(kind, t)
        if w > 1e-6:
            s = r0 + (r1 - r0) * t
            best = min(best, s * math.sin(math.pi / n) * spread / w)
    return best


# ------------------------------------------------------------------ các vòng
def ring_petals(r0, r1, n, rng, ring, rot=0.0):
    kind = rng.choice(["lens", "drop", "lens", "drop"])
    alt = rng.random() < 0.3 and n % 2 == 0
    inner = rng.random() < 0.65
    out = []
    wmax = _fit_wmax(kind, r0, r1, n)
    for k in range(n):
        a = rot + TAU * k / n
        rr1 = r1
        if alt and k % 2 == 1:
            rr1 = r0 + (r1 - r0) * 0.62
        w = min(wmax, _fit_wmax(kind, r0, rr1, n))
        out.append(petal(a, r0, rr1, w, kind, ring))
        span = rr1 - r0
        if inner and w * 0.5 >= 0.022 and span > 0.06:
            out.append(petal(a, r0 + span * 0.2, rr1 - span * 0.16, w * 0.46,
                             kind, ring, fill=False))
    return out


def ring_diamonds(r0, r1, n, rng, ring, rot=0.0):
    wmax = _fit_wmax("diamond", r0, r1, n, spread=0.95)
    return [petal(rot + TAU * k / n, r0, r1, wmax, "diamond", ring, steps=2) for k in range(n)]


def ring_teeth(r0, r1, n, rng, ring, rot=0.0):
    """Tam giác răng cưa; đáy bám theo cung tròn r0 (không cắt ngang các vòng khác)."""
    out = []
    for k in range(n):
        a0 = rot + TAU * k / n
        a1 = rot + TAU * (k + 1) / n
        base = [_polar(r0, a1 + (a0 - a1) * i / 8) for i in range(1, 8)]
        out.append(Path([_polar(r0, a0), _polar(r1, (a0 + a1) / 2), _polar(r0, a1)] + base,
                        True, True, ring))
    return out


def ring_star(r0, r1, n, rng, ring, rot=0.0):
    pts = []
    for k in range(n):
        a = rot + TAU * k / n
        pts.append(_polar(r1, a))
        pts.append(_polar(r0 + (r1 - r0) * 0.12, a + TAU / (2 * n)))
    return [Path(pts, True, True, ring)]


def ring_dots(r0, r1, n, rng, ring, rot=0.0):
    rm = (r0 + r1) / 2
    dr = min((r1 - r0) * 0.32, rm * math.sin(math.pi / n) * 0.62)
    dr = max(dr, 0.012)
    return [circle(dr, True, ring, *_polar(rm, rot + TAU * (k + 0.5) / n)) for k in range(n)]


def ring_scallop(r0, r1, n, rng, ring, rot=0.0):
    """Các vòng cung lồi ra ngoài, đáy nằm trên đường tròn bán kính r0."""
    out = []
    for k in range(n):
        a0 = rot + TAU * k / n
        a1 = rot + TAU * (k + 1) / n
        p0, p1 = _polar(r0, a0), _polar(r0, a1)
        cx, cy = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        rad = math.dist(p0, p1) / 2
        am = (a0 + a1) / 2
        base = math.atan2(p0[1] - cy, p0[0] - cx)
        # chọn chiều quay để cung đi qua phía ngoài (hướng am)
        best, sgn = -2.0, 1
        for s in (1, -1):
            d = math.cos(base + s * math.pi / 2) * math.cos(am) + \
                math.sin(base + s * math.pi / 2) * math.sin(am)
            if d > best:
                best, sgn = d, s
        arc = [(cx + rad * math.cos(base + sgn * math.pi * i / 24),
                cy + rad * math.sin(base + sgn * math.pi * i / 24)) for i in range(25)]
        back = [_polar(r0, a1 + (a0 - a1) * i / 8) for i in range(1, 8)]
        out.append(Path(arc + back, True, True, ring))
    return out


def ring_beads(r0, r1, n, rng, ring, rot=0.0):
    """Hai vòng tròn mảnh song song (dải viền)."""
    gap = (r1 - r0) * 0.28
    return [circle(r0 + gap, False, ring), circle(r1 - gap, False, ring)]


# ----------------------------------------------------------- bộ tạo chính
# khoảng cách tối thiểu giữa hai họa tiết cạnh nhau (đơn vị bán kính) để còn tô được
MIN_GAP = {"petals": 0.115, "diamonds": 0.11, "teeth": 0.10, "star": 0.14,
           "dots": 0.085, "scallop": 0.10}

RING_FUNCS = {"petals": ring_petals, "diamonds": ring_diamonds, "teeth": ring_teeth,
              "star": ring_star, "dots": ring_dots, "scallop": ring_scallop,
              "beads": ring_beads}

WEIGHTS = {"petals": 4.0, "diamonds": 1.2, "teeth": 2.0, "star": 1.0,
           "dots": 1.6, "scallop": 2.0, "beads": 0.5}


def _pick_n(kind, r0, r1, N, rng):
    rm = (r0 + r1) / 2
    ref = r0 if kind == "scallop" else rm
    cands = []
    for n, w in ((N * 3, 1.0), (N * 2, 1.5), (N, 3.0), (N // 2, 1.5)):
        if n < 8:  # ít hơn 8 họa tiết/vòng thì bị méo, lòi ra ngoài
            continue
        if TAU * ref / n < MIN_GAP[kind]:
            continue
        band = r1 - r0
        chord = 2 * ref * math.sin(math.pi / n)  # bề ngang một họa tiết
        if kind == "scallop" and r0 * math.sin(math.pi / n) > band * 0.95:
            continue
        if kind in ("teeth", "star", "diamonds") and (n < 12 or band < 0.55 * chord):
            continue  # tránh tam giác/kim cương quá bẹt và to
        if kind == "petals" and band < 0.7 * chord:
            continue
        if kind == "star" and n > 24:
            continue
        cands.append((n, w))
    if not cands:
        return None
    x = rng.random() * sum(w for _, w in cands)
    for n, w in cands:
        x -= w
        if x <= 0:
            return n
    return cands[-1][0]


def _center(rc, N, rng):
    out = [circle(rc, False, 0)]
    n = N
    while n >= 4 and TAU * (rc * 0.55) / n < 0.05:
        n //= 2
    if n >= 4 and rc > 0.07:
        kind = rng.choice(["lens", "drop"])
        w = _fit_wmax(kind, rc * 0.18, rc * 0.92, n)
        for k in range(n):
            out.append(petal(TAU * k / n, rc * 0.18, rc * 0.92, w, kind, 0))
    out.append(circle(max(rc * 0.1, 0.008), True, 0))
    return out


def make_mandala(seed, N=None):
    """Tạo một mandala từ `seed`. Trả về list[Path] (bán kính ngoài <= 1)."""
    rng = random.Random(seed)
    N = N or rng.choice([8, 12, 12, 16, 16])
    rc = rng.uniform(0.11, 0.16)
    r_out = 0.965

    # chia các dải đồng tâm với bề dày ngẫu nhiên
    thick, total = [], 0.0
    while total < r_out - rc - 0.07:
        t = rng.uniform(0.075, 0.15)
        thick.append(t)
        total += t
    scale = (r_out - rc) / sum(thick)
    thick = [t * scale for t in thick]

    paths = _center(rc, N, rng)
    r = rc
    last_kind = None
    count = len(thick)
    for i, th in enumerate(thick):
        r0, r1 = r, r + th
        is_last = i == count - 1
        order = [k for k in WEIGHTS if k != last_kind]
        if is_last:  # viền ngoài cùng: họa tiết mở ra ngoài
            order = [k for k in order if k in ("petals", "scallop", "teeth", "star")]
        rot = rng.choice([0.0, 0.5]) * TAU / N

        kind, n = None, None
        pool = [(k, WEIGHTS[k]) for k in order]
        while pool:
            x, chosen = rng.random() * sum(w for _, w in pool), pool[-1][0]
            for k, w in pool:
                x -= w
                if x <= 0:
                    chosen = k
                    break
            n_try = 0 if chosen == "beads" else _pick_n(chosen, r0, r1, N, rng)
            if chosen == "beads" or n_try:
                kind, n = chosen, n_try
                break
            pool = [(k, w) for k, w in pool if k != chosen]
        if kind is None:
            kind, n = "beads", 0

        paths += RING_FUNCS[kind](r0, r1, n or N, rng, i + 1, rot)
        last_kind = kind
        # đường tròn ngăn cách ở mép ngoài dải (trừ dải cuối có họa tiết mở)
        if not (is_last and kind in ("petals", "teeth", "star", "scallop")):
            paths.append(circle(r1, False, i + 1))
        r = r1
    return paths


if __name__ == "__main__":  # kiểm tra nhanh
    for s in range(3):
        p = make_mandala(s)
        print(s, len(p), "paths", sum(len(x.pts) for x in p), "points")
