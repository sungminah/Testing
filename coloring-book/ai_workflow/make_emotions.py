#!/usr/bin/env python3
"""Tạo EMOTIONS.md: thư viện 30 biểu cảm hamster và bảng xoay vòng để mỗi trang mỗi con một cảm xúc mới.

Chạy:  python3 ai_workflow/make_emotions.py
"""
from __future__ import annotations

from pathlib import Path

HERE = Path(__file__).resolve().parent

# (tên, công thức vẽ khuôn mặt: lông mày, mắt, miệng, dấu phụ) — toàn nét đơn, mắt luôn là vòng rỗng
EMOTIONS = [
    ("Vui sướng", "eyebrows raised and rounded; eyes as two small empty circles; mouth wide open smile; two small sparkle marks"),
    ("Ngạc nhiên", "eyebrows raised high; eyes as two wide open empty circles; mouth a small open oval; three short burst lines by the head"),
    ("Lo lắng", "eyebrows tilted upward in the middle; eyes as small empty circles looking sideways; mouth a short wavy line; one sweat drop"),
    ("Cáu kỉnh", "eyebrows slanted down toward the center; eyes as small empty circles under the brows; mouth a short downward line; small anger mark (four short lines in a cross)"),
    ("Buồn ngủ", "no eyebrows; eyes as closed downward arcs (the only emotion allowed closed eyes); small relaxed mouth; one small 'z' mark drawn as a simple zigzag"),
    ("Tập trung", "eyebrows slightly lowered; eyes as small empty circles looking at the task; tongue sticking out of a small mouth"),
    ("Tự tin", "one eyebrow raised; eyes as small empty circles with a flat lid line across the top; a smirk drawn as a one-sided curved line; small shine mark"),
    ("Buồn", "eyebrows tilted upward in the middle and low at the sides; eyes as small empty circles looking down; mouth a small downward curve; one tear drop"),
    ("Khóc", "eyebrows tilted upward; eyes as small empty circles; mouth wide open in a wobbly shape; two tear streams running down"),
    ("Xấu hổ", "eyebrows tilted; eyes as small empty circles looking away; mouth a tiny wavy line; three short lines on the cheek drawn as plain strokes (no shading)"),
    ("Sợ hãi", "eyebrows raised and tilted; eyes as wide empty circles; mouth a trembling zigzag line; shiver lines on both sides of the head"),
    ("Tò mò", "one eyebrow raised; eyes as big empty circles looking up; mouth a tiny 'o'; a small question mark drawn as a plain curved line with a dot"),
    ("Bối rối", "eyebrows uneven; eyes as two empty circles of different sizes; mouth a crooked line; a few small swirl marks beside the head"),
    ("Nghi ngờ", "one eyebrow raised, one lowered; eyes as small empty circles with a flat lid line across the top; mouth a flat line shifted to one side"),
    ("Đắc ý", "eyebrows lifted; eyes as small empty circles looking sideways; wide grin with a visible tooth line; small shine marks"),
    ("Thèm ăn", "eyebrows raised; eyes as big empty circles looking at the food; mouth open with a small tongue licking one corner; two small short lines beside the mouth"),
    ("Mệt mỏi", "eyebrows drooping; eyes as small empty circles with a heavy flat lid line across the top; mouth a long flat wobbly line; puff marks beside the head"),
    ("Hào hứng", "eyebrows high; eyes as big empty circles; mouth wide open in a shout; small motion lines around the head"),
    ("Mơ màng", "eyebrows soft; eyes as small empty circles looking upward; small smile; two small heart outlines floating nearby"),
    ("Tức giận", "eyebrows slanted sharply down; eyes as small empty circles under the brows; mouth a wavy clenched line showing a tooth line; two anger marks"),
    ("Hoảng hốt", "eyebrows high and tilted; eyes as tiny empty circles; mouth wide open in a wobbly oval; four sweat drops flying outward"),
    ("Thanh thản", "soft eyebrows; eyes as small empty ovals with a flat lid line across the top; small calm smile; a small leaf outline floating nearby"),
    ("Tinh nghịch", "one eyebrow raised; eyes as one small empty circle and one smaller empty circle; tongue sticking out; small shine mark"),
    ("Cảm động", "eyebrows tilted upward; eyes as small empty circles; mouth a small wobbly smile; two tear drops and two sparkle marks"),
    ("Ngượng ngùng", "eyebrows tilted; eyes as small empty circles looking down; mouth a tiny crooked smile; one sweat drop; a hand scratching the back of the head"),
    ("Kiêu hãnh", "chin lifted; eyebrows calm; eyes as small empty circles looking up; closed smile; arms crossed; small shine marks"),
    ("Cô đơn", "eyebrows low; eyes as small empty circles looking to the side; mouth a small flat line; plain empty space around it"),
    ("Hồi hộp", "eyebrows tilted upward; eyes as wide empty circles; mouth a tight small line; two sweat drops and a few shiver lines"),
    ("Nhẹ nhõm", "eyebrows lifted then relaxed; eyes as small empty circles; mouth a smile with a small exhale puff drawn as a cloud outline"),
    ("Quyết tâm", "eyebrows slanted down firmly; eyes as steady empty circles; mouth a firm straight line; a fist raised; small flame-like motion lines"),
    ("Buồn chán", "flat eyebrows; eyes as small empty circles looking upward with a flat lid line across the top; mouth a flat line with one corner turned down; a small sigh cloud outline"),
    ("Cười khúc khích", "eyebrows raised; eyes as small empty circles; a wide smile with one hand covering part of the mouth; three short lines above the head"),
    ("Ghen tị", "one eyebrow lowered; eyes as small empty circles looking sideways at something; a small pout; two short tension lines beside the cheek"),
    ("Nhút nhát", "eyebrows tilted upward; eyes as small empty circles looking down; a tiny smile; both hands held together in front; a few short lines beside the cheek"),
    ("Chết lặng", "eyebrows high and flat; eyes as wide empty circles; mouth a small round open shape; one short vertical line above the head"),
    ("Đau đớn", "eyebrows tilted sharply; eyes as small empty circles; mouth a wavy grimace; a small burst outline (star-shaped) beside the head"),
    ("Lạnh", "eyebrows tilted; eyes as small empty circles; mouth a wobbly line; shiver lines on both sides and a small breath cloud outline"),
    ("Nóng", "eyebrows lowered; eyes as small empty circles; mouth open; two sweat drops and three wavy heat lines above the head"),
]

# Các cảm xúc đã dùng trong trang ninja/học đường/samurai (để tránh lặp trong các trang sau)
USED = {"Ngạc nhiên", "Lo lắng", "Cáu kỉnh", "Buồn ngủ", "Tập trung", "Vui sướng", "Tự tin", "Buồn", "Khóc", "Xấu hổ", "Sợ hãi", "Tò mò", "Bối rối", "Nghi ngờ", "Đắc ý", "Thèm ăn", "Mệt mỏi", "Hào hứng", "Mơ màng", "Tức giận", "Hoảng hốt", "Thanh thản", "Tinh nghịch", "Cảm động", "Ngượng ngùng", "Kiêu hãnh", "Cô đơn", "Hồi hộp", "Nhẹ nhõm", "Quyết tâm"}

SCENES = [
        (8, "Trinh thám: phố đêm, tìm manh mối"),
    (9, "Âm nhạc: sân khấu lễ hội mùa hè"),
    (10, "Cắm trại: hồ núi, lều, bếp củi"),
]


def main():
    unused = [e for e in EMOTIONS if e[0] not in USED]
    used = [e for e in EMOTIONS if e[0] in USED]
    pool = [e for e in unused + used if e[0] != "Buồn ngủ"]                      # dùng hết cảm xúc chưa dùng trước, rồi mới lặp lại
    out = []
    out.append("# Thư viện 38 biểu cảm hamster\n")
    out.append("Mỗi con mỗi trang một cảm xúc **khác trang trước**. Công thức đều là **nét đơn, mắt rỗng** để người tô thoải mái. "
               "Chú lữ khách mỗi trang một cảm xúc riêng (ô cuối của mỗi bảng).\n")
    out.append("## 38 biểu cảm\n")
    out.append("| # | Cảm xúc | Công thức vẽ (tiếng Anh, dán vào prompt) |\n|---|---|---|")
    for i, (n, r) in enumerate(EMOTIONS, 1):
        mark = " *(đã dùng)*" if n in USED else ""
        out.append(f"| {i} | {n}{mark} | {r} |")
    out.append("\n## Phân công cho cảnh 8 đến 10\n")
    out.append(f"Có {len(unused)} cảm xúc chưa dùng. Mỗi trang cần 6 cảm xúc (5 hamster và chú lữ khách), nên từ trang thứ 4 trở đi bắt đầu lặp lại một ít, "
               "nhưng luôn ở con khác và trang khác.\n")
    idx = 0
    for sn, title in SCENES:
        picks = []
        for _ in range(6):
            picks.append(pool[idx % len(pool)])
            idx += 1
        out.append(f"### Cảnh {sn}: {title}\n")
        out.append("| Con | Cảm xúc | Công thức |\n|---|---|---|")
        for k, (n, r) in enumerate(picks):
            who = "Chú lữ khách" if k == 5 else f"Hamster {k + 1}"
            out.append(f"| {who} | {n} | {r} |")
        out.append("\nKhối dán vào prompt (dán sau phần Characters, thay cho mọi mô tả cảm xúc khác):\n")
        out.append("```")
        out.append("EMOTIONS: every hamster has a DIFFERENT emotion, one per hamster, and each emotion must clearly differ from the others on this page. "
                   "Assign them to the hamsters in the way that fits what each one is doing. Keep every face simple: eyes are empty outlines only (never filled black, no pupils, no highlight dots), no blush, no gray.")
        for k, (n, r) in enumerate(picks):
            who = "The traveler hamster in front" if k == 5 else f"Hamster {k + 1}"
            out.append(f"- {who}: {n.upper()}. {r}.")
        out.append("```\n")
    (HERE / "EMOTIONS.md").write_text("\n".join(out), encoding="utf-8")
    print("OK ->", HERE / "EMOTIONS.md", "|", len(unused), "cảm xúc chưa dùng")


if __name__ == "__main__":
    main()
