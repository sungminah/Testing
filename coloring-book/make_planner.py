#!/usr/bin/env python3
"""Planner in được (không ghi ngày) với chú hamster lữ khách làm linh vật.

Chạy (sau extract_mascot.py):  python3 make_planner.py
Kết quả: output/planner/traveler_planner.pdf (Letter 8.5x11, 18 trang)
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from build_book import register_fonts

HERE = Path(__file__).resolve().parent
OUT = HERE / "output" / "planner"
PW, PH = 612, 792
M = 40                      # lề
GREEN, RUST, TEAL = HexColor("#1E4D2B"), HexColor("#B5502B"), HexColor("#2A7F62")
LINE, SOFT, CREAM = HexColor("#B9C4B0"), HexColor("#EEF2E8"), HexColor("#FFF1CF")
MUTED = HexColor("#6B7566")
MASCOT = None


def load_mascot():
    img = Image.open(HERE / "output" / "brand" / "mascot_color.png").convert("RGBA")
    img = img.resize((int(img.width * 420 / img.height), 420), Image.LANCZOS)
    return ImageReader(img), img.width / img.height


def mascot(c, x, y, h, flip=False):
    img, ratio = MASCOT
    w = h * ratio
    if flip:
        c.saveState()
        c.translate(x + w, y)
        c.scale(-1, 1)
        c.drawImage(img, 0, 0, w, h, mask="auto")
        c.restoreState()
    else:
        c.drawImage(img, x, y, w, h, mask="auto")
    return w


def header(c, title, sub=None):
    c.setFillColor(GREEN)
    c.setFont("Serif-Bold", 26)
    c.drawString(M, PH - 62, title)
    if sub:
        c.setFillColor(MUTED)
        c.setFont("Sans", 10)
        c.drawString(M, PH - 80, sub)
    c.setStrokeColor(RUST)
    c.setLineWidth(2)
    c.line(M, PH - 90, PW - M, PH - 90)
    mascot(c, PW - M - 48, PH - 88, 62, flip=True)


def footer(c, n):
    c.setFillColor(MUTED)
    c.setFont("Sans", 8)
    c.drawCentredString(PW / 2, 22, f"Hamster Traveler Planner  ·  {n}")


def box(c, x, y, w, h, fill=None, stroke=LINE, lw=0.8, r=0):
    c.setStrokeColor(stroke)
    c.setLineWidth(lw)
    if fill is not None:
        c.setFillColor(fill)
    if r:
        c.roundRect(x, y, w, h, r, stroke=1, fill=1 if fill is not None else 0)
    else:
        c.rect(x, y, w, h, stroke=1, fill=1 if fill is not None else 0)


def label(c, x, y, text, size=10, color=GREEN, bold=True):
    c.setFillColor(color)
    c.setFont("Sans-Bold" if bold else "Sans", size)
    c.drawString(x, y, text)


def lines(c, x, y_top, w, n, gap=22, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(0.6)
    for i in range(n):
        yy = y_top - gap * (i + 1)
        c.line(x, yy, x + w, yy)


def checks(c, x, y_top, w, n, gap=22):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    for i in range(n):
        yy = y_top - gap * (i + 1)
        c.line(x + 16, yy, x + w, yy)
        c.setStrokeColor(GREEN)
        c.rect(x, yy + 1, 10, 10, stroke=1, fill=0)
        c.setStrokeColor(LINE)


def titled_box(c, x, y, w, h, title, fill=None):
    box(c, x, y, w, h, fill=fill, r=6)
    c.setFillColor(GREEN)
    c.roundRect(x, y + h - 20, w, 20, 6, stroke=0, fill=1)
    c.rect(x, y + h - 20, w, 10, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Sans-Bold", 9.5)
    c.drawString(x + 8, y + h - 14, title)


# ---------------------------------------------------------------- các trang
def page_cover(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.rect(0, 0, PW, 120, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.setFont("Serif-Bold", 40)
    c.drawCentredString(PW / 2, PH - 120, "TRAVELER'S")
    c.setFillColor(RUST)
    c.drawCentredString(PW / 2, PH - 168, "PLANNER")
    c.setFillColor(MUTED)
    c.setFont("Sans", 14)
    c.drawCentredString(PW / 2, PH - 200, "Plan your adventures, one day at a time")
    img, ratio = MASCOT
    h = 420
    c.drawImage(img, (PW - h * ratio) / 2, 170, h * ratio, h, mask="auto")
    c.setFillColor(CREAM)
    c.setFont("Sans-Bold", 13)
    c.drawCentredString(PW / 2, 62, "Undated  ·  Printable  ·  US Letter")
    c.setFont("Sans", 11)
    c.drawCentredString(PW / 2, 42, "Monthly, weekly, daily, habits, trips and journal pages")
    c.showPage()


def page_month(c, n):
    header(c, "Monthly Overview", "Month: ____________________     Year: ________")
    days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    gw = (PW - 2 * M) / 7
    top, gh = PH - 112, 98
    for i, d in enumerate(days):
        c.setFillColor(GREEN if i < 5 else RUST)
        c.rect(M + i * gw, top - 18, gw, 18, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Sans-Bold", 9)
        c.drawCentredString(M + i * gw + gw / 2, top - 13, d)
    for r in range(5):
        for i in range(7):
            box(c, M + i * gw, top - 18 - (r + 1) * gh, gw, gh, fill=SOFT if i >= 5 else None)
    titled_box(c, M, 52, PW - 2 * M, top - 18 - 5 * gh - 62, "Goals & notes")
    footer(c, n)
    c.showPage()


def page_week(c, n):
    header(c, "Weekly Plan", "Week of: ______________________")
    titled_box(c, M, PH - 190, PW - 2 * M, 84, "This week's top priorities")
    lines(c, M + 10, PH - 118, PW - 2 * M - 20, 3, 21)
    names = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY", "NOTES"]
    bw = (PW - 2 * M - 12) / 2
    bh = (PH - 190 - 52 - 3 * 10) / 4
    for i, nm in enumerate(names):
        col, row = i // 4, i % 4
        x = M + col * (bw + 12)
        y = PH - 200 - (row + 1) * bh - row * 10
        titled_box(c, x, y, bw, bh, nm)
        if nm != "NOTES":
            lines(c, x + 8, y + bh - 22, bw - 16, int((bh - 26) / 21), 21)
        else:
            lines(c, x + 8, y + bh - 22, bw - 16, int((bh - 26) / 21), 21)
    footer(c, n)
    c.showPage()


def page_day(c, n):
    header(c, "Daily Plan", "Date: ____ / ____ / ________      Day:  M  T  W  T  F  S  S")
    sw = 270
    titled_box(c, M, 52, sw, PH - 52 - 108, "Schedule")
    hours = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    step = (PH - 52 - 108 - 30) / len(hours)
    for i, hr in enumerate(hours):
        yy = PH - 108 - 24 - (i + 1) * step
        c.setStrokeColor(LINE)
        c.line(M + 34, yy, M + sw - 8, yy)
        c.setFillColor(MUTED)
        c.setFont("Sans-Bold", 9)
        c.drawString(M + 10, yy + 3, hr)
    rx = M + sw + 14
    rw = PW - M - rx
    titled_box(c, rx, PH - 196, rw, 88, "Top 3 priorities")
    checks(c, rx + 8, PH - 126, rw - 16, 3, 21)
    titled_box(c, rx, PH - 396, rw, 190, "To-do")
    checks(c, rx + 8, PH - 226, rw - 16, 7, 23)
    titled_box(c, rx, PH - 500, rw, 94, "Water")
    for i in range(8):
        c.setStrokeColor(TEAL)
        c.setLineWidth(1)
        c.circle(rx + 20 + i * 27, PH - 456, 9, stroke=1, fill=0)
    titled_box(c, rx, PH - 604, rw, 94, "Mood")
    for i, t in enumerate(["bad", "meh", "ok", "good", "great"]):
        cx = rx + 24 + i * 36
        c.setStrokeColor(RUST)
        c.circle(cx, PH - 556, 11, stroke=1, fill=0)
        c.setFillColor(RUST)
        c.circle(cx - 4, PH - 553, 1.3, stroke=0, fill=1)
        c.circle(cx + 4, PH - 553, 1.3, stroke=0, fill=1)
        c.setLineWidth(0.9)
        if i >= 3:
            c.arc(cx - 5, PH - 564, cx + 5, PH - 556, 200, 140)
        elif i == 2:
            c.line(cx - 4, PH - 560, cx + 4, PH - 560)
        else:
            c.arc(cx - 5, PH - 563, cx + 5, PH - 555, 20, 140)
    titled_box(c, rx, 52, rw, PH - 604 - 52 - 10, "Notes")
    footer(c, n)
    c.showPage()


def page_habits(c, n):
    header(c, "Habit Tracker", "Month: ____________________     Color a box each day you do it")
    nw = 120
    cw = (PW - 2 * M - nw) / 31
    top = PH - 116
    c.setFillColor(GREEN)
    c.rect(M, top - 18, PW - 2 * M, 18, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Sans-Bold", 8.5)
    c.drawString(M + 6, top - 13, "HABIT")
    c.setFont("Sans-Bold", 5.5)
    for d in range(31):
        c.drawCentredString(M + nw + d * cw + cw / 2, top - 12.5, str(d + 1))
    rows = 18
    rh = (top - 18 - 60) / rows
    for r in range(rows):
        y = top - 18 - (r + 1) * rh
        box(c, M, y, nw, rh, fill=SOFT if r % 2 else None)
        for d in range(31):
            box(c, M + nw + d * cw, y, cw, rh, fill=SOFT if r % 2 else None, lw=0.5)
    footer(c, n)
    c.showPage()


def page_trip(c, n):
    header(c, "Trip Planner", "Where will your next adventure take you?")
    fw = PW - 2 * M
    for i, t in enumerate(["Destination", "Dates", "Travel with", "Budget"]):
        y = PH - 120 - i * 24
        label(c, M, y, t + ":", 10)
        c.setStrokeColor(LINE)
        c.line(M + 80, y - 2, PW - M, y - 2)
    top = PH - 206                      # đỉnh vùng nội dung
    half = fw / 2 - 6
    titled_box(c, M, 300, half, top - 300, "Itinerary")
    for i in range(5):
        ly = top - 38 - i * 50
        label(c, M + 8, ly, f"Day {i + 1}", 9, RUST)
        lines(c, M + 8, ly + 8, half - 16, 2, 20)
    xr = M + half + 12
    titled_box(c, xr, top - 120, half, 120, "Must-try food")
    checks(c, xr + 8, top - 20, half - 16, 4, 22)
    titled_box(c, xr, 300, half, top - 120 - 10 - 300, "Places to visit")
    checks(c, xr + 8, top - 120 - 10 - 20, half - 16, 6, 22)
    titled_box(c, M, 52, fw, 238, "Notes & memories")
    lines(c, M + 10, 52 + 238 - 22, fw - 20, 9, 22)
    footer(c, n)
    c.showPage()


def page_packing(c, n):
    header(c, "Packing List", "Check each item off before you go")
    cols = [("Clothes", 14), ("Essentials", 14), ("Gear & extras", 14)]
    cw = (PW - 2 * M - 24) / 3
    for i, (t, k) in enumerate(cols):
        x = M + i * (cw + 12)
        titled_box(c, x, 150, cw, PH - 108 - 150, t)
        checks(c, x + 8, 150 + (PH - 108 - 150) - 22, cw - 16, 21, 24)
    titled_box(c, M, 52, PW - 2 * M, 88, "Don't forget!")
    lines(c, M + 10, 52 + 88 - 22, PW - 2 * M - 20, 3, 21)
    footer(c, n)
    c.showPage()


def page_todo(c, n):
    header(c, "To-Do List", "Priorities first, everything else after")
    cw = (PW - 2 * M - 24) / 3
    for i, t in enumerate(["Important", "This week", "Someday"]):
        x = M + i * (cw + 12)
        titled_box(c, x, 52, cw, PH - 108 - 52, t)
        checks(c, x + 8, 52 + (PH - 108 - 52) - 22, cw - 16, 25, 24)
    footer(c, n)
    c.showPage()


def page_journal(c, n):
    header(c, "Adventure Journal", "Date: ____ / ____ / ________")
    fw = PW - 2 * M
    label(c, M, PH - 118, "Weather:", 10)
    for i, nm in enumerate(["sun", "cloud", "rain", "wind"]):
        cx = M + 90 + i * 60
        c.setStrokeColor(TEAL)
        c.setLineWidth(1)
        if nm == "sun":
            c.circle(cx, PH - 115, 7, stroke=1, fill=0)
            for k in range(8):
                import math
                a = k * math.pi / 4
                c.line(cx + 10 * math.cos(a), PH - 115 + 10 * math.sin(a), cx + 14 * math.cos(a), PH - 115 + 14 * math.sin(a))
        elif nm == "cloud":
            c.ellipse(cx - 13, PH - 121, cx + 13, PH - 108, stroke=1, fill=0)
        elif nm == "rain":
            c.ellipse(cx - 13, PH - 112, cx + 13, PH - 100, stroke=1, fill=0)
            for k in range(3):
                c.line(cx - 8 + k * 8, PH - 114, cx - 11 + k * 8, PH - 124)
        else:
            c.line(cx - 12, PH - 110, cx + 10, PH - 110)
            c.line(cx - 12, PH - 117, cx + 4, PH - 117)
            c.line(cx - 12, PH - 124, cx + 12, PH - 124)
    label(c, M + 340, PH - 118, "Place:", 10)
    c.setStrokeColor(LINE)
    c.line(M + 380, PH - 120, PW - M, PH - 120)
    titled_box(c, M, PH - 360, fw, 226, "Draw or paste a photo")
    titled_box(c, M, 190, fw, PH - 360 - 190 - 10, "Today's adventure")
    lines(c, M + 10, 190 + (PH - 360 - 190 - 10) - 22, fw - 20, 12, 21)
    for i, t in enumerate(["Best moment", "Something new I tried", "I'm grateful for"]):
        y = 150 - i * 36
        label(c, M, y, t + ":", 9.5)
        c.setStrokeColor(LINE)
        c.line(M + 150, y - 2, PW - M, y - 2)
    footer(c, n)
    c.showPage()


def page_dots(c, n):
    header(c, "Notes", "Dot grid: write, sketch, plan")
    c.setFillColor(LINE)
    x = M
    while x <= PW - M + 0.1:
        y = 50
        while y <= PH - 104:
            c.circle(x, y, 0.9, stroke=0, fill=1)
            y += 18
        x += 18
    footer(c, n)
    c.showPage()


def main():
    global MASCOT
    OUT.mkdir(parents=True, exist_ok=True)
    register_fonts()
    MASCOT = load_mascot()
    c = canvas.Canvas(str(OUT / "traveler_planner.pdf"), pagesize=(PW, PH), initialFontName="Sans")
    c.setTitle("Traveler's Planner")
    c.setAuthor("Lanternsinthesky")
    page_cover(c)
    seq = [page_month, page_month, page_week, page_week, page_week, page_week, page_day, page_day, page_day,
           page_habits, page_habits, page_trip, page_packing, page_todo, page_journal, page_journal, page_dots]
    for i, fn in enumerate(seq, 2):
        fn(c, i)
    c.save()
    print("   traveler_planner.pdf:", len(seq) + 1, "trang")
    return 0


if __name__ == "__main__":
    sys.exit(main())
