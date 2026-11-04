#!/usr/bin/env python3
"""Bốc ngẫu nhiên họa tiết cho từng món đồ lặp lại trong mỗi cảnh, in ra khối prompt để dán.

Chạy:
  python3 ai_workflow/make_variation.py              # ghi PATTERN_VARIATION.md cho mọi cảnh
  python3 ai_workflow/make_variation.py beach 7      # in khối của một cảnh với seed 7 (đổi seed để bốc lại)

Mỗi nhóm đồ giống nhau: số lượng ngẫu nhiên (theo khoảng), mỗi món một họa tiết từ bộ họa tiết hợp chủ đề
hoặc để trống (plain). Luôn có ít nhất một món trơn và ít nhất hai họa tiết khác nhau.
"""
from __future__ import annotations

import random
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# họa tiết mô tả bằng nét viền đơn, to, ít chi tiết
MOTIFS = {
    "star": "one big five-pointed star outline",
    "starfish": "one small starfish outline",
    "shell": "one scallop shell outline",
    "wave": "two wide wave lines",
    "stripes": "three wide stripes",
    "dots": "three large round dots",
    "heart": "one big heart outline",
    "flower": "one simple five-petal flower outline",
    "leaf": "one big leaf outline",
    "fish": "one simple fish outline",
    "moon": "one crescent moon outline",
    "sun": "one round sun outline with a few short rays",
    "cloud": "one small cloud outline",
    "bolt": "one big zigzag bolt outline",
    "gear": "one simple gear outline",
    "note": "one big music note outline",
    "bamboo": "one bamboo stalk outline",
    "checks": "four large squares in a checker pattern",
    "rings": "two big concentric rings",
    "coconut": "one coconut palm tree outline",
    "fan": "one small folding fan outline",
    "key": "one big key outline",
    "paw": "one paw print outline (one round pad and four round toes)",
}

# nhóm đồ: (tên, số lượng tối thiểu, tối đa, danh sách họa tiết ứng viên)
SCENES = {
    "beach": ("Cảnh 4: Bóng chuyền bãi biển", [
        ("beach umbrellas", 2, 4, ["star", "starfish", "shell", "stripes", "wave"]),
        ("deck chairs", 2, 4, ["checks", "wave", "stripes", "dots"]),
        ("pairs of sandals", 2, 4, ["star", "stripes", "dots", "shell"]),
        ("round buoys", 3, 5, ["stripes", "dots", "star", "wave"]),
        ("coconuts in a basket", 3, 5, ["leaf", "star", "dots", "wave"]),
        ("sail boats (the sails)", 2, 4, ["star", "stripes", "wave", "heart"]),
        ("seashells on the sand", 3, 5, ["wave", "dots", "stripes"]),
        ("shaved ice cups", 2, 4, ["star", "heart", "dots", "fish"]),
    ]),
    "magic": ("Cảnh 5: Quảng trường phép thuật", [
        ("potted plants", 3, 5, ["flower", "leaf", "star", "dots"]),
        ("street lamps", 2, 4, ["star", "moon", "stripes"]),
        ("shop awnings", 2, 4, ["wave", "stripes", "dots", "star"]),
        ("paint pots", 3, 5, ["dots", "star", "stripes", "heart"]),
        ("baskets of scrolls", 2, 4, ["star", "stripes", "checks"]),
        ("drawn floating objects (kites)", 2, 4, ["star", "heart", "stripes", "moon"]),
        ("paving stones near the fountain", 3, 5, ["star", "rings", "dots", "leaf"]),
        ("bushes", 3, 5, ["flower", "dots", "heart"]),
    ]),
    "cooking": ("Cảnh 6: Thi nấu ăn", [
        ("ramen bowls", 3, 5, ["fish", "star", "stripes", "dots", "wave"]),
        ("noodle pots", 2, 4, ["star", "checks", "stripes", "heart"]),
        ("hanging lanterns (paper)", 3, 5, ["star", "stripes", "fan", "dots"]),
        ("cutting boards", 2, 4, ["fish", "leaf", "stripes"]),
        ("cooking stools", 3, 5, ["star", "dots", "wave"]),
        ("aprons on hooks", 2, 4, ["checks", "stripes", "heart", "dots"]),
        ("sacks of rice", 2, 4, ["star", "stripes", "dots"]),
        ("fish on the drying rack", 3, 5, ["dots", "stripes", "wave"]),
    ]),
    "robot": ("Cảnh 7: Xưởng robot", [
        ("small robots on the shelf", 3, 5, ["gear", "star", "bolt", "heart", "dots"]),
        ("gears on the wall", 3, 5, ["star", "dots", "rings"]),
        ("tool boxes", 2, 4, ["bolt", "stripes", "checks"]),
        ("hanging lamps", 3, 5, ["star", "stripes", "dots"]),
        ("storage drawers", 3, 5, ["gear", "dots", "stripes", "key"]),
        ("crates", 2, 4, ["stripes", "checks", "star"]),
        ("potted plants", 2, 4, ["leaf", "flower", "dots"]),
        ("floor tiles near the door", 3, 5, ["star", "rings", "dots"]),
    ]),
    "detective": ("Cảnh 8: Phố đêm trinh thám", [
        ("street lamps", 3, 5, ["moon", "star", "stripes", "dots"]),
        ("lantern signs (blank)", 3, 5, ["star", "fan", "stripes", "dots"]),
        ("bicycles parked in a row", 2, 4, ["stripes", "dots", "star"]),
        ("windows on the shops", 3, 5, ["moon", "cloud", "checks", "stripes"]),
        ("garbage cans", 2, 4, ["stripes", "dots", "star"]),
        ("paving stones", 3, 5, ["star", "rings", "dots"]),
        ("curtains", 2, 4, ["wave", "stripes", "dots", "star"]),
        ("potted plants", 3, 5, ["leaf", "flower", "dots"]),
    ]),
    "music": ("Cảnh 9: Sân khấu lễ hội mùa hè", [
        ("drums on the stage", 2, 4, ["note", "star", "stripes", "dots"]),
        ("paper lanterns", 3, 5, ["star", "stripes", "fan", "dots"]),
        ("speakers", 2, 4, ["rings", "note", "dots"]),
        ("floor cushions for the audience", 3, 5, ["star", "stripes", "dots", "flower"]),
        ("festival stalls (awnings)", 2, 4, ["wave", "stripes", "star", "fish"]),
        ("music stands", 2, 4, ["note", "star", "stripes"]),
        ("fans on a rack", 3, 5, ["flower", "stripes", "star", "dots"]),
        ("potted plants", 2, 4, ["leaf", "flower", "dots"]),
    ]),
    "camp": ("Cảnh 10: Cắm trại bên hồ núi", [
        ("tents", 2, 4, ["star", "moon", "stripes", "dots", "leaf"]),
        ("camp chairs", 2, 4, ["checks", "stripes", "dots", "star"]),
        ("sleeping bags", 2, 4, ["stripes", "star", "dots", "heart"]),
        ("lanterns", 3, 5, ["star", "moon", "stripes", "dots"]),
        ("logs around the fire", 3, 5, ["rings", "dots", "stripes"]),
        ("pine trees", 3, 5, ["star", "dots", "stripes"]),
        ("backpacks", 2, 4, ["paw", "star", "stripes", "dots"]),
        ("stones around the fire", 3, 5, ["dots", "star", "rings"]),
    ]),
}


def assign(rng, count, pool):
    """Bốc họa tiết cho `count` món; ít nhất một món trơn và ít nhất hai họa tiết khác nhau."""
    need = 2 if count >= 3 else 1          # nhóm 2 món: một trơn + một có họa tiết
    for _ in range(1000):
        items = [rng.choice(pool + ["plain", "plain"]) for _ in range(count)]
        distinct = {x for x in items if x != "plain"}
        if "plain" in items and len(distinct) >= need:
            return items
    items = ["plain"] + rng.sample(pool, min(count - 1, len(pool)))   # dự phòng, không bao giờ treo
    return items + ["plain"] * (count - len(items))


def block(key, seed):
    title, groups = SCENES[key]
    rng = random.Random(f"{key}-{seed}")
    lines = [
        "REPEATED OBJECTS WITH RANDOM SMALL PATTERN VARIATIONS: for each group below, draw exactly the stated number of objects, "
        "all with the SAME shape and SAME size within the group, but each with the decoration listed (PLAIN means no decoration at all). "
        "Draw each decoration as a simple single-line closed outline with open space inside, never dense texture, no gray, no solid black. "
        "Do not decorate any hamster's face. Do not add other patterns."
    ]
    for name, lo, hi, pool in groups:
        n = rng.randint(lo, hi)
        items = assign(rng, n, pool)
        parts = []
        for i, m in enumerate(items, 1):
            parts.append(f"{i}) " + ("PLAIN" if m == "plain" else MOTIFS[m]))
        lines.append(f"- {name} ({n}): " + "; ".join(parts) + ".")
    return title, "\n".join(lines)


def main():
    if len(sys.argv) >= 2 and sys.argv[1] in SCENES:
        seed = sys.argv[2] if len(sys.argv) > 2 else "1"
        title, b = block(sys.argv[1], seed)
        print(title)
        print(b)
        return 0
    out = ["# Khối họa tiết ngẫu nhiên cho đồ lặp lại (mỗi cảnh một khối)\n",
           "Mỗi khối do chương trình bốc ngẫu nhiên: số lượng mỗi nhóm khác nhau, mỗi món một họa tiết hợp chủ đề hoặc trơn. "
           "Muốn bốc lại: `python3 ai_workflow/make_variation.py <cảnh> <seed>` (cảnh: beach, magic, cooking, robot, detective, music, camp).\n",
           "Dán khối vào cuối phần Background của prompt cảnh tương ứng.\n"]
    for key in SCENES:
        title, b = block(key, "1")
        out.append(f"## {title}\n\n```\n{b}\n```\n")
    (HERE / "PATTERN_VARIATION.md").write_text("\n".join(out), encoding="utf-8")
    print("OK ->", HERE / "PATTERN_VARIATION.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
