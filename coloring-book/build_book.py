#!/usr/bin/env python3
"""Tạo toàn bộ file để bán sách tô màu mandala.

Chạy:  python3 build_book.py            (đọc config.json, ghi vào thư mục output/)

Đầu ra:
  output/interior_kdp.pdf          ruột sách cho Amazon KDP (8.5x11in, mặt sau để trắng)
  output/cover_kdp_fullwrap.pdf    bìa trọn bộ (bìa sau + gáy + bìa trước) cho KDP
  output/cover_front.png           ảnh bìa trước (dùng làm ảnh đại diện sản phẩm)
  output/printable_digital.pdf     bản PDF tải về (bán Etsy/Gumroad), không có trang trắng
  output/preview_sheet.png         ảnh tổng hợp tất cả trang (làm ảnh quảng cáo)
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path as FsPath

from PIL import Image, ImageDraw
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from mandala import make_mandala

HERE = FsPath(__file__).resolve().parent
OUT = HERE / "output"
IN = 72  # 1 inch = 72 points
PAGE_W, PAGE_H = 8.5 * IN, 11 * IN
ART_R = 3.7 * IN  # bán kính mandala: đường kính 7.4in, lề >= 0.55in mỗi bên

PALETTE = ["#ff6b6b", "#ffd166", "#06d6a0", "#4cc9f0", "#b388eb", "#ff9f1c", "#f72585", "#90e0ef"]
NAVY = "#12203a"
CREAM = "#f4ecd8"


# ------------------------------------------------------------------ tiện ích
def register_fonts():
    fonts = {"Sans": "DejaVuSans.ttf", "Sans-Bold": "DejaVuSans-Bold.ttf",
             "Serif-Bold": "DejaVuSerif-Bold.ttf"}
    for name, fn in fonts.items():
        pdfmetrics.registerFont(TTFont(name, str(HERE / "fonts" / fn)))


def draw_paths(c, paths, cx, cy, R, lw):
    """Vẽ mandala đen trắng (chỉ nét viền) vào canvas PDF."""
    c.setStrokeColorRGB(0, 0, 0)
    c.setLineWidth(lw)
    c.setLineJoin(1)
    c.setLineCap(1)
    for p in paths:
        pts = p.pts
        pa = c.beginPath()
        pa.moveTo(cx + pts[0][0] * R, cy + pts[0][1] * R)
        for x, y in pts[1:]:
            pa.lineTo(cx + x * R, cy + y * R)
        if p.closed:
            pa.close()
        c.drawPath(pa, stroke=1, fill=0)


def draw_paths_color(c, paths, cx, cy, R):
    """Vẽ mandala có tô màu (dùng cho bìa)."""
    c.setLineJoin(1)
    c.setLineCap(1)
    seen = {}
    for p in paths:
        i = seen.get(p.ring, 0)
        seen[p.ring] = i + 1
        pa = c.beginPath()
        pa.moveTo(cx + p.pts[0][0] * R, cy + p.pts[0][1] * R)
        for x, y in p.pts[1:]:
            pa.lineTo(cx + x * R, cy + y * R)
        if p.closed:
            pa.close()
        if p.fill:
            c.setFillColor(PALETTE[(p.ring + (i % 2)) % len(PALETTE)])
            c.setStrokeColor(NAVY)
            c.setLineWidth(1.1)
            c.drawPath(pa, stroke=1, fill=1)
        else:
            c.setStrokeColor(CREAM)
            c.setLineWidth(0.9)
            c.drawPath(pa, stroke=1, fill=0)


def centered(c, text, y, font, size, x=PAGE_W / 2):
    c.setFont(font, size)
    c.drawCentredString(x, y, text)


def wrapped(c, text, x, y, width, font, size, leading=None, align="left"):
    leading = leading or size * 1.35
    c.setFont(font, size)
    for para in text.split("\n"):
        if not para.strip():
            y -= leading * 0.6
            continue
        for line in simpleSplit(para, font, size, width):
            if align == "center":
                c.drawCentredString(x + width / 2, y, line)
            else:
                c.drawString(x, y, line)
            y -= leading
    return y


# ------------------------------------------------------------------ trang chữ
def page_title(c, cfg):
    c.setFillColorRGB(0, 0, 0)
    centered(c, cfg["title"].upper(), PAGE_H - 2.2 * IN, "Serif-Bold", 40)
    centered(c, cfg["subtitle"], PAGE_H - 2.9 * IN, "Sans", 20)
    draw_paths(c, make_mandala(cfg["seed_start"] - 1), PAGE_W / 2, PAGE_H / 2 - 0.2 * IN,
               2.6 * IN, cfg["line_width_pt"])
    centered(c, cfg["tagline"], 2.0 * IN, "Sans-Bold", 14)
    centered(c, cfg["author"], 1.3 * IN, "Sans", 16)
    c.showPage()


def page_copyright(c, cfg):
    c.setFillColorRGB(0, 0, 0)
    x, w = 1.0 * IN, PAGE_W - 2.0 * IN
    y = PAGE_H - 1.6 * IN
    y = wrapped(c, f"Copyright © {cfg['year']} {cfg['author']}. All rights reserved.", x, y, w,
                "Sans-Bold", 11)
    y -= 10
    y = wrapped(c, "No part of this book may be reproduced, stored in a retrieval system, or "
                   "transmitted in any form or by any means without the written permission of "
                   "the author, except for brief quotations in reviews.", x, y, w, "Sans", 10)
    y -= 10
    y = wrapped(c, "All designs in this book are original. Personal use only: you may color the "
                   "pages for yourself and for gifts, but you may not resell or share the "
                   "artwork.", x, y, w, "Sans", 10)
    y -= 10
    wrapped(c, f"First edition, {cfg['year']}.", x, y, w, "Sans", 10)
    centered(c, "This book belongs to:", 4.6 * IN, "Sans-Bold", 14)
    c.setLineWidth(1)
    c.line(2.0 * IN, 3.9 * IN, PAGE_W - 2.0 * IN, 3.9 * IN)
    c.showPage()


def page_thanks(c, cfg):
    c.setFillColorRGB(0, 0, 0)
    centered(c, "Thank you for coloring with us!", PAGE_H / 2 + 0.9 * IN, "Serif-Bold", 24)
    wrapped(c, "If you enjoyed this book, a short review helps other colorists find it and "
               "means a great deal to a small independent creator.\n"
               "Tag your finished pages and share the calm.", 1.4 * IN, PAGE_H / 2 + 0.1 * IN,
            PAGE_W - 2.8 * IN, "Sans", 13, align="center")
    c.showPage()


def page_howto(c, cfg):  # chỉ dùng cho bản PDF tải về
    c.setFillColorRGB(0, 0, 0)
    centered(c, "How to print", PAGE_H - 2.0 * IN, "Serif-Bold", 28)
    wrapped(c, "• Print on US Letter (8.5 x 11 in) at 100% / \"Actual size\".\n"
               "• For markers or gel pens, use heavier paper (24 lb or more) and put a spare "
               "sheet behind the page you color.\n"
               "• Each design sits inside a safe margin, so it prints without clipping on most "
               "home printers (on A4, choose \"Fit to page\").\n"
               "• Print as many copies as you like for your own use.\n\n"
               f"Copyright © {cfg['year']} {cfg['author']}. Personal use only. Please do not "
               "resell, redistribute or share the files.",
            1.2 * IN, PAGE_H - 3.0 * IN, PAGE_W - 2.4 * IN, "Sans", 13)
    c.showPage()


# ------------------------------------------------------------------- ghép sách
def build_interior(cfg, designs, path, kdp=True):
    c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), initialFontName="Sans")
    c.setTitle(f"{cfg['title']} - {cfg['subtitle']}")
    c.setAuthor(cfg["author"])
    n_pages = 0
    page_title(c, cfg)
    n_pages += 1
    if kdp:
        page_copyright(c, cfg)
        n_pages += 1
    else:
        page_howto(c, cfg)
        n_pages += 1
    for paths in designs:
        draw_paths(c, paths, PAGE_W / 2, PAGE_H / 2, ART_R, cfg["line_width_pt"])
        c.showPage()
        n_pages += 1
        if kdp:  # mặt sau để trắng để mực không thấm sang hình
            c.showPage()
            n_pages += 1
    page_thanks(c, cfg)
    n_pages += 1
    if kdp and n_pages % 2:  # sách in cần số trang chẵn
        c.showPage()
        n_pages += 1
    c.save()
    return n_pages


def build_cover(cfg, total_pages, path):
    spine = total_pages * cfg["spine_inches_per_page"] * IN
    bleed = 0.125 * IN
    W = bleed + PAGE_W + spine + PAGE_W + bleed
    H = PAGE_H + 2 * bleed
    c = canvas.Canvas(str(path), pagesize=(W, H), initialFontName="Sans")
    c.setTitle(f"{cfg['title']} - cover")
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    fx0 = bleed + PAGE_W + spine           # lề trái của bìa trước
    fcx = fx0 + PAGE_W / 2
    # --- bìa trước
    c.setFillColor(CREAM)
    centered(c, cfg["title"].upper(), H - 1.75 * IN, "Serif-Bold", 46, fcx)
    c.setFillColor(PALETTE[1])
    centered(c, cfg["subtitle"], H - 2.35 * IN, "Sans-Bold", 20, fcx)
    draw_paths_color(c, make_mandala(cfg["seed_start"] + 7), fcx, H / 2 - 0.55 * IN, 3.2 * IN)
    c.setFillColor(CREAM)
    centered(c, cfg["tagline"], 1.45 * IN, "Sans-Bold", 15, fcx)
    c.setFillColor(PALETTE[3])
    centered(c, cfg["author"], 0.95 * IN, "Sans", 14, fcx)
    # --- bìa sau
    bx0 = bleed
    bcx = bx0 + PAGE_W / 2
    c.setFillColor(CREAM)
    centered(c, cfg["title"].upper(), H - 1.5 * IN, "Serif-Bold", 24, bcx)
    c.setFillColor(CREAM)
    wrapped(c, cfg["back_blurb"], bx0 + 1.0 * IN, H - 2.3 * IN, PAGE_W - 2.0 * IN, "Sans", 12.5,
            leading=18)
    draw_paths_color(c, make_mandala(cfg["seed_start"] + 15), bcx, 3.0 * IN, 1.5 * IN)
    # (góc dưới bên phải bìa sau để trống: KDP tự chèn mã vạch ở đó)
    # --- gáy (chỉ khi đủ dày)
    if spine >= 0.15 * IN:
        c.saveState()
        c.translate(bleed + PAGE_W + spine / 2, H / 2)
        c.rotate(-90)
        c.setFillColor(CREAM)
        c.setFont("Sans-Bold", 11)
        c.drawCentredString(0, -4, f"{cfg['title'].upper()}   ·   {cfg['author']}")
        c.restoreState()
    c.showPage()
    c.save()
    return spine / IN, W / IN, H / IN


# ------------------------------------------------------------ ảnh xem trước
def png_render(paths, size, lw=2.0):
    S = 2
    im = Image.new("L", (size * S, size * S), 255)
    d = ImageDraw.Draw(im)
    R, c = size * S * 0.48, size * S / 2
    for p in paths:
        pts = [(c + x * R, c - y * R) for x, y in p.pts]
        if p.closed:
            pts.append(pts[0])
        d.line(pts, fill=0, width=max(1, int(lw * S)), joint="curve")
    return im.resize((size, size), Image.LANCZOS)


def preview_sheet(designs, path, cols=8, cell=300):
    rows = (len(designs) + cols - 1) // cols
    sheet = Image.new("L", (cols * cell, rows * cell), 255)
    for i, paths in enumerate(designs):
        sheet.paste(png_render(paths, cell, 1.2), ((i % cols) * cell, (i // cols) * cell))
    sheet.save(path, optimize=True)


def pdf_to_png(pdf, png, dpi=110):
    exe = shutil.which("pdftoppm")
    if not exe:
        print("  (bỏ qua ảnh bìa: không có pdftoppm)")
        return
    base = str(png)[:-4]
    subprocess.run([exe, "-png", "-r", str(dpi), "-singlefile", str(pdf), base], check=True)


# ------------------------------------------------------------------------ main
def main():
    cfg = json.load(open(HERE / "config.json", encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    register_fonts()
    designs = [make_mandala(cfg["seed_start"] + i) for i in range(cfg["pages"])]

    n = build_interior(cfg, designs, OUT / "interior_kdp.pdf", kdp=True)
    print(f"interior_kdp.pdf          : {n} trang")
    m = build_interior(cfg, designs, OUT / "printable_digital.pdf", kdp=False)
    print(f"printable_digital.pdf     : {m} trang")
    spine, w, h = build_cover(cfg, n, OUT / "cover_kdp_fullwrap.pdf")
    print(f"cover_kdp_fullwrap.pdf    : {w:.3f} x {h:.3f} in, gáy {spine:.3f} in")
    pdf_to_png(OUT / "cover_kdp_fullwrap.pdf", OUT / "cover_fullwrap_preview.png", 80)
    preview_sheet(designs, OUT / "preview_sheet.png")
    print("preview_sheet.png         : OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
