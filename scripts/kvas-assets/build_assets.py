import json
import math
import os
import random
from collections import deque
from PIL import Image, ImageDraw, ImageEnhance

ASSETS_DIR = "/Users/homerion/.cursor/projects/Users-homerion-Desktop-projects-ru/assets"
DOCS_ASSETS = "docs/assets"
OUT_DIR = "public/game/kvas"
MANIFEST_JSON = os.path.join(OUT_DIR, "manifest.json")
MANIFEST_TS = "src/components/client/KvasGame/manifest.ts"

SCENE_W, SCENE_H = 270, 480
PLAYER_W, PLAYER_H = 168, 240
HEAD_W, HEAD_H = 72, 72
CAN_W, CAN_H = 44, 84
CAN_DRINK_W, CAN_DRINK_H = 96, 56
PILE_W, PILE_H = 96, 120
COACH_W, COACH_H = 96, 144
TEAMMATE_W, TEAMMATE_H = 112, 174
VELO_W, VELO_H = 116, 148
CLEANER_W, CLEANER_H = 112, 160
PIGEON_W, PIGEON_H = 36, 36
ICON_SIZE = 32

def ensure_dirs():
    for sub in ["room", "body", "players/_default", "props", "sfx"]:
        os.makedirs(os.path.join(OUT_DIR, sub), exist_ok=True)

def is_magenta(r, g, b, tol=42):
    return r > 110 and b > 65 and g < min(r, b) * 0.62 and (min(r, b) - g) > tol

def extract_magenta(im, tol=42, defringe=True):
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    rgba = Image.new("RGBA", (w, h))
    out = rgba.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            r, g, b = px[x, y]
            if is_magenta(r, g, b, tol):
                bg[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not bg[y][x]:
                r, g, b = px[x, y]
                if is_magenta(r, g, b, tol):
                    bg[y][x] = True
                    q.append((x, y))
    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx]:
                r, g, b = px[nx, ny]
                if is_magenta(r, g, b, tol - 8):
                    bg[ny][nx] = True
                    q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if bg[y][x] or is_magenta(r, g, b, tol + 18):
                out[x, y] = (0, 0, 0, 0)
            else:
                out[x, y] = (r, g, b, 255)
    if defringe:
        snap = rgba.copy()
        spx = snap.load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = spx[x, y]
                if a == 0:
                    continue
                adj_trans = any(
                    0 <= x+dx < w and 0 <= y+dy < h and spx[x+dx, y+dy][3] == 0
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))
                )
                if adj_trans and r > g + 22 and b > g + 15:
                    if r + b < 280:
                        out[x, y] = (18, 12, 10, 255)
                    else:
                        out[x, y] = (0, 0, 0, 0)
    return rgba

def extract_black(im, thresh=22):
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    rgba = Image.new("RGBA", (w, h))
    out = rgba.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            r, g, b = px[x, y]
            if r <= thresh and g <= thresh and b <= thresh:
                bg[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not bg[y][x]:
                r, g, b = px[x, y]
                if r <= thresh and g <= thresh and b <= thresh:
                    bg[y][x] = True
                    q.append((x, y))
    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx]:
                r, g, b = px[nx, ny]
                if r <= thresh and g <= thresh and b <= thresh:
                    bg[ny][nx] = True
                    q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            out[x, y] = (0, 0, 0, 0) if bg[y][x] else (r, g, b, 255)
    return rgba

def fit_rgba(im, w, h, pad=0, align="center"):
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (w, h), (0, 0, 0, 0))
    crop = im.crop(bbox)
    cw, ch = crop.size
    tw, th = w - 2 * pad, h - 2 * pad
    scale = min(tw / cw, th / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = crop.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - nw) // 2
    if align == "bottom":
        oy = h - pad - nh
    elif align == "top":
        oy = pad
    else:
        oy = (h - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas

def add_outline(im, color=(18, 12, 10, 255)):
    w, h = im.size
    px = im.load()
    out = im.copy()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 0:
                continue
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 128:
                    opx[x, y] = color
                    break
    return out

def build_can_and_pile():
    src = Image.open(os.path.join(DOCS_ASSETS, "Yasen_Kvasen.png")).convert("RGBA")
    src = src.crop(src.getbbox())
    core = src.resize((CAN_W - 4, CAN_H - 6), Image.Resampling.BILINEAR)
    up = Image.new("RGBA", (CAN_W, CAN_H), (0, 0, 0, 0))
    up.paste(core, (2, 3), core)
    upx = up.load()
    for y in range(CAN_H):
        for x in range(CAN_W):
            r, g, b, a = upx[x, y]
            upx[x, y] = (r, g, b, 255) if a > 100 else (0, 0, 0, 0)
    up = add_outline(up, (18, 10, 6, 255))

    def crumple_can(base, level):
        if level == 0:
            return base.copy()
        out = Image.new("RGBA", (CAN_W, CAN_H), (0, 0, 0, 0))
        bpx = base.load()
        opx = out.load()
        for y in range(CAN_H):
            t = y / (CAN_H - 1)
            mid = max(0.0, math.sin(max(0.0, (t - 0.14) / 0.76) * math.pi))
            if level == 1:
                squeeze = 1.0 + 0.16 * (mid ** 1.4)
                x_shift = int(round(1.5 * math.sin(t * math.pi * 2.5))) if 0.25 < t < 0.75 else 0
                y_off = 1
            elif level == 2:
                squeeze = 1.0 + 0.34 * (mid ** 1.2)
                x_shift = int(round(2.5 * math.sin(t * math.pi * 4.0)))
                y_off = 3
            else:
                squeeze = 1.0 + 0.56 * mid + 0.14 * abs(math.sin(t * math.pi * 5.0))
                x_shift = int(round(3.5 * math.sin(t * math.pi * 6.0)))
                y_off = 5
            ty = int(round(y_off + y * (1.0 - level * 0.035)))
            if not (0 <= ty < CAN_H):
                continue
            for x in range(CAN_W):
                sx = int(round(CAN_W / 2 + (x - CAN_W / 2 - x_shift) * squeeze))
                if 0 <= sx < CAN_W and bpx[sx, y][3] > 0:
                    r, g, b, _ = bpx[sx, y]
                    if level >= 1 and 0.2 < t < 0.82:
                        rib = math.sin(t * math.pi * (4 + level * 2) + (x - CAN_W / 2) * 0.18)
                        shade = 1.0 + 0.14 * level * rib * mid
                        r = max(0, min(255, int(r * shade)))
                        g = max(0, min(255, int(g * shade)))
                        b = max(0, min(255, int(b * shade)))
                    opx[x, ty] = (r, g, b, 255)
        return add_outline(out, (18, 10, 6, 255))

    # 9 frames x 44x84:
    # 0=closed, 1=pop fizz, 2=open intact, 3=dent1, 4=dent2, 5=dent3, 6=crumpled stand, 7=crumpled lie, 8=flattened crushed
    sheet = Image.new("RGBA", (CAN_W * 9, CAN_H), (0, 0, 0, 0))
    sheet.paste(up, (0, 0), up)

    # Frame 1: opening pop & spray!
    f1 = up.copy()
    d1 = ImageDraw.Draw(f1)
    d1.rectangle([16, 1, 26, 4], fill=(225, 230, 235, 255))
    for px_x, px_y, col in [
        (12, 0, (255, 248, 220, 255)), (21, 0, (255, 240, 190, 255)), (31, 1, (255, 248, 220, 255)),
        (8, 3, (245, 210, 130, 255)), (35, 3, (245, 210, 130, 255)),
        (14, 4, (255, 252, 240, 255)), (26, 4, (255, 252, 240, 255)),
        (10, 7, (255, 245, 210, 255)), (33, 7, (255, 245, 210, 255)),
    ]:
        d1.rectangle([px_x, px_y, px_x + 1, px_y + 1], fill=col)
    sheet.paste(f1, (CAN_W * 1, 0), f1)

    # Frame 2..5: open & progressive dents!
    open_can = up.copy()
    ImageDraw.Draw(open_can).rectangle([16, 3, 27, 5], fill=(18, 12, 10, 255))
    open_can.putpixel((25, 2), (220, 225, 230, 255))
    crush_frames = [crumple_can(open_can, lv) for lv in range(4)]
    for lv, cf in enumerate(crush_frames):
        sheet.paste(cf, (CAN_W * (2 + lv), 0), cf)

    # Frame 6: empty crumpled upright-ish (dented & matte, NEVER pristine!)
    f6 = ImageEnhance.Brightness(crush_frames[3]).enhance(0.86)
    sheet.paste(f6, (CAN_W * 6, 0), f6)

    # Frame 7: empty crumpled lying horizontally at bottom
    lying_src = crush_frames[3].rotate(88, expand=True).resize((42, 22), Image.Resampling.NEAREST)
    f7 = Image.new("RGBA", (CAN_W, CAN_H), (0, 0, 0, 0))
    ImageDraw.Draw(f7).ellipse([2, CAN_H - 11, CAN_W - 2, CAN_H - 2], fill=(10, 6, 4, 150))
    f7.paste(lying_src, (1, CAN_H - 25), lying_src)
    sheet.paste(f7, (CAN_W * 7, 0), f7)

    # Frame 8: empty pancake-crushed
    f8 = crush_frames[3].resize((CAN_W, int(CAN_H * 0.56)), Image.Resampling.NEAREST)
    f8_pad = Image.new("RGBA", (CAN_W, CAN_H), (0, 0, 0, 0))
    ImageDraw.Draw(f8_pad).ellipse([3, CAN_H - 10, CAN_W - 3, CAN_H - 2], fill=(10, 6, 4, 140))
    f8_pad.paste(f8, (0, CAN_H - f8.height - 2), f8)
    sheet.paste(f8_pad, (CAN_W * 8, 0), f8_pad)

    sheet.save(os.path.join(OUT_DIR, "props/can.png"))

    # Build compact 28x28 x 6 variants sheet of crumpled empty cans for physics mounds (can-crushed.png)
    CR_SIZE = 28
    crushed_variants = []
    v0 = fit_rgba(ImageEnhance.Brightness(crush_frames[2]).enhance(0.90), CR_SIZE, CR_SIZE, pad=2, align="center")
    v1 = fit_rgba(ImageEnhance.Brightness(crush_frames[3]).enhance(0.88).rotate(84, expand=True), CR_SIZE, CR_SIZE, pad=2, align="center")
    v2 = fit_rgba(ImageEnhance.Brightness(crush_frames[3]).enhance(0.86).rotate(-80, expand=True), CR_SIZE, CR_SIZE, pad=2, align="center")
    v3 = fit_rgba(ImageEnhance.Brightness(crush_frames[3]).enhance(0.85).rotate(36, expand=True), CR_SIZE, CR_SIZE, pad=2, align="center")
    v4 = fit_rgba(ImageEnhance.Brightness(crush_frames[2]).enhance(0.88).rotate(-38, expand=True), CR_SIZE, CR_SIZE, pad=2, align="center")
    v5 = fit_rgba(ImageEnhance.Brightness(crush_frames[3].resize((CAN_W, int(CAN_H * 0.54)), Image.Resampling.NEAREST)).enhance(0.84).rotate(12, expand=True), CR_SIZE, CR_SIZE, pad=2, align="center")
    crushed_variants = [v0, v1, v2, v3, v4, v5]
    cr_sheet = Image.new("RGBA", (CR_SIZE * len(crushed_variants), CR_SIZE), (0, 0, 0, 0))
    for i, cv in enumerate(crushed_variants):
        cr_sheet.paste(cv, (i * CR_SIZE, 0), cv)
    cr_sheet.save(os.path.join(OUT_DIR, "props/can-crushed.png"))

    # Build rotated drinking can sheet (can-drink.png: 96x56 x 4 crush levels, tilted -68 deg!)
    drink_sheet = Image.new("RGBA", (CAN_DRINK_W * 4, CAN_DRINK_H), (0, 0, 0, 0))
    for lv, cf in enumerate(crush_frames):
        rot = cf.rotate(-68, resample=Image.Resampling.BILINEAR, expand=True)
        fit_r = fit_rgba(rot, CAN_DRINK_W, CAN_DRINK_H, pad=2, align="center")
        rpx = fit_r.load()
        for yy in range(CAN_DRINK_H):
            for xx in range(CAN_DRINK_W):
                r, g, b, a = rpx[xx, yy]
                rpx[xx, yy] = (r, g, b, 255) if a > 100 else (0, 0, 0, 0)
        fit_r = add_outline(fit_r, (18, 10, 6, 255))
        drink_sheet.paste(fit_r, (lv * CAN_DRINK_W, 0), fit_r)
    drink_sheet.save(os.path.join(OUT_DIR, "props/can-drink.png"))

    # Build pile.png (4 stages x 96x120) strictly from crumpled «Ясен Квасен» cans stacked in mounds
    pile = Image.new("RGBA", (PILE_W * 4, PILE_H), (0, 0, 0, 0))
    rng = random.Random(42)
    counts = [16, 30, 48, 72]
    small_choices = [cv.resize((17, 17), Image.Resampling.NEAREST) for cv in crushed_variants]
    for st, cnt in enumerate(counts):
        layer = Image.new("RGBA", (PILE_W, PILE_H), (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse([6, PILE_H - 13, PILE_W - 6, PILE_H - 2], fill=(10, 6, 4, 155))
        max_h = 26 + st * 22
        pts = []
        for i in range(cnt):
            frac = i / max(1, cnt - 1)
            y = PILE_H - 18 - int(frac * max_h * (0.35 + 0.65 * rng.random()))
            spread = int((1.0 - (PILE_H - 18 - y) / max(1, max_h + 10)) * 34) + 5
            x = PILE_W // 2 + rng.randint(-spread, spread) - 8
            pts.append((y, x, rng.choice(small_choices)))
        pts.sort(key=lambda t: t[0])
        for y, x, sprite in pts:
            shade = 0.72 + 0.28 * ((y - (PILE_H - max_h - 20)) / max(1, max_h + 20))
            shaded = ImageEnhance.Brightness(sprite).enhance(max(0.65, min(1.0, shade)))
            x = max(0, min(PILE_W - shaded.width, x))
            y = max(0, min(PILE_H - shaded.height, y))
            layer.paste(shaded, (x, y), shaded)
        pile.paste(layer, (st * PILE_W, 0), layer)
    pile.save(os.path.join(OUT_DIR, "props/pile.png"))

def is_finger_skin(r, g, b, a):
    return a > 0 and r > 155 and g >= 92 and b >= 38 and (r - g) >= 28 and (g - b) >= 22

def flood_grip(rgba, seeds, bounds):
    px = rgba.load()
    x0, y0, x1, y1 = bounds
    seen = set()
    q = deque()
    for sx, sy in seeds:
        if is_finger_skin(*px[sx, sy]) and (sx, sy) not in seen:
            seen.add((sx, sy))
            q.append((sx, sy))
    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
            if x0 <= nx < x1 and y0 <= ny < y1 and (nx, ny) not in seen:
                if is_finger_skin(*px[nx, ny]):
                    seen.add((nx, ny))
                    q.append((nx, ny))
    out_set = set(seen)
    for _ in range(2):
        nxt = set(out_set)
        for (x, y) in out_set:
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x + dx, y + dy
                if x0 <= nx < x1 and y0 <= ny < y1 and (nx, ny) not in nxt:
                    r, g, b, a = px[nx, ny]
                    if a > 0 and r < 95 and g < 75 and b < 75:
                        nxt.add((nx, ny))
        out_set = nxt
    res = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    rpx = res.load()
    for (x, y) in out_set:
        rpx[x, y] = px[x, y]
    return res, out_set

def pixelize_head(im, colors=26):
    rgb = im.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    apx = im.load()
    qpx = q.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = apx[x, y]
            if a == 0:
                qpx[x, y] = (0, 0, 0, 0)
            else:
                qr, qg, qb, _ = qpx[x, y]
                qpx[x, y] = (qr, qg, qb, 255)
    out = add_outline(q, (22, 12, 8, 255))
    opx = out.load()
    for y in range(max(0, h - 7), h):
        for x in range(w):
            if qpx[x, y][3] == 0:
                opx[x, y] = (0, 0, 0, 0)
    return out

def extract_tattoo_tiers(tat_src, clean_ref):
    """
    Compare tattooed sprite with clean-skin sprite to extract crisp dark tattoo ink
    split into 3 unlockable tiers:
      1: forearms
      2: forearms + hands/knuckles
      3: forearms + hands + legs/knees
    """
    tpx = tat_src.load()
    cpx = clean_ref.load()
    w, h = tat_src.size
    t1 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    t2 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    t3 = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    p1, p2, p3 = t1.load(), t2.load(), t3.load()

    def is_clean_skin(rgb):
        r, g, b, a = rgb
        return a > 0 and r > 125 and g > 62 and b < 115 and (r - g) > 22

    for y in range(290, 955):
        for x in range(100, 790):
            tr, tg, tb, ta = tpx[x, y]
            if ta == 0:
                continue
            if tr < 92 and tg < 82 and tb < 78 and is_clean_skin(cpx[x, y]):
                ink = (tr, tg, tb, 255)
                # Classify zone:
                is_hand = (450 <= x <= 575 and 660 <= y <= 820) or (175 <= x <= 295 and 580 <= y <= 695)
                is_leg = (y >= 645 and (x < 355 or x > 575))
                if not is_hand and not is_leg:
                    p1[x, y] = ink
                    p2[x, y] = ink
                    p3[x, y] = ink
                elif is_hand:
                    p2[x, y] = ink
                    p3[x, y] = ink
                else:
                    p3[x, y] = ink
    return t1, t2, t3

def build_player():
    raw_cb = Image.open(os.path.join(ASSETS_DIR, "kvas-player-ru-clean-base.jpg"))
    cb = extract_magenta(raw_cb, tol=42, defringe=True)
    cb_px = cb.load()

    # Extract idle finger grip (left fingers + right thumb) and erase baked can
    seeds_b = (
        [(x, y) for y in range(520, 625, 2) for x in range(152, 194, 2)]
        + [(x, y) for y in range(582, 608) for x in range(283, 293)]
    )
    grip_base_full, gset_b = flood_grip(cb, seeds_b, (145, 505, 298, 640))

    # Smoothly fill thigh/shorts behind erased can in cb using horizontal interpolation from real neighboring knee pixels!
    for y in range(445, 698):
        # Find left & right clean thigh colors for y >= 626
        left_col = cb_px[186, y] if y >= 626 and is_finger_skin(*cb_px[186, y]) else (206, 126, 52, 255)
        right_col = cb_px[266, y] if y >= 645 and is_finger_skin(*cb_px[266, y]) else (196, 118, 46, 255)
        for x in range(189, 288):
            if (x, y) in gset_b:
                continue
            if x < 204 and y < 525 and is_finger_skin(*cb_px[x, y]):
                continue
            if y >= 668 and is_finger_skin(*cb_px[x, y]):
                continue
            # Curved thigh top border rising gently from y=624 at left to y=644 near shorts
            knee_top = 622 + int(round(((x - 189) / 80.0) ** 1.6 * 22))
            if x < 268 and y >= knee_top:
                if y == knee_top:
                    cb_px[x, y] = (34, 18, 10, 255)
                else:
                    t = (x - 189) / 79.0
                    r = int(left_col[0] * (1 - t) + right_col[0] * t)
                    g = int(left_col[1] * (1 - t) + right_col[1] * t)
                    b = int(left_col[2] * (1 - t) + right_col[2] * t)
                    cb_px[x, y] = (r, g, b, 255)
            elif y >= 612 and x >= 268:
                cb_px[x, y] = (20, 20, 22, 255)
            elif y >= 565 and x >= 278:
                sr, sg, sb, sa = cb_px[294, y]
                cb_px[x, y] = (sr, sg, sb, sa)
            else:
                cb_px[x, y] = (0, 0, 0, 0)

    for (x, y) in gset_b:
        if x >= 190:
            knee_top = 622 + int(round(((x - 189) / 80.0) ** 1.6 * 22))
            if x < 268 and y >= knee_top:
                cb_px[x, y] = (206, 126, 52, 255)
            else:
                cb_px[x, y] = (0, 0, 0, 0)

    # Extract head from clean base (x=385..580, y=15..245)
    head_crop = Image.new("RGBA", (220, 260), (0, 0, 0, 0))
    hpx = head_crop.load()
    for y in range(15, 245):
        for x in range(385, 580):
            r, g, b, a = cb_px[x, y]
            if a == 0:
                continue
            if y > 205:
                if x < 452 or x > 518:
                    continue
                if r > 185 and g > 185 and b > 180:
                    continue
            hpx[x - 385 + 12, y - 15 + 8] = (r, g, b, a)

    for y in range(215, 275):
        for x in range(446, 526):
            r, g, b, a = cb_px[x, y]
            if a == 0:
                cb_px[x, y] = (176, 124, 82, 255)

    for y in range(15, 244):
        for x in range(380, 585):
            r, g, b, a = cb_px[x, y]
            if a == 0:
                continue
            is_collar_or_shirt = y > 212 and ((r > 185 and g > 185 and b > 180) or (x < 438 or x > 532))
            if not is_collar_or_shirt:
                cb_px[x, y] = (0, 0, 0, 0)

    body_bounds = (92, 195, 795, 1118)
    body_src = cb.crop(body_bounds)
    scale = min(158 / body_src.width, 204 / body_src.height)
    bw = int(round(body_src.width * scale))
    bh = int(round(body_src.height * scale))
    bx = (PLAYER_W - bw) // 2
    by = PLAYER_H - 4 - bh

    base_body = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
    res_body = body_src.resize((bw, bh), Image.Resampling.NEAREST)
    base_body.paste(res_body, (bx, by), res_body)

    def mpt(fx, fy):
        return (int(round(bx + (fx - body_bounds[0]) * scale)),
                int(round(by + (fy - body_bounds[1]) * scale)))

    neck_anchor = mpt(485, 244)
    # Center of upright can in his right hand (x=191..285 -> 238, y=458..692 -> 575)
    hand_idle = mpt(238, 575)
    # Center of tilted drinking can meeting his open lips cleanly
    hand_drink = mpt(351, 155)

    # Save grip-idle.png aligned to PLAYER_W x PLAYER_H!
    grip_idle_crop = grip_base_full.crop(body_bounds).resize((bw, bh), Image.Resampling.NEAREST)
    grip_idle_out = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
    grip_idle_out.paste(grip_idle_crop, (bx, by), grip_idle_crop)
    grip_idle_out.save(os.path.join(OUT_DIR, "props/grip-idle.png"))

    # Head frames
    hw_s = max(1, int(round(head_crop.width * scale)))
    hh_s = max(1, int(round(head_crop.height * scale)))
    head_scaled = pixelize_head(head_crop.resize((hw_s, hh_s), Image.Resampling.BILINEAR), colors=24)
    head_neck_x = int(round((485 - 385 + 12) * scale))
    head_neck_y = int(round((244 - 15 + 8) * scale))

    h0 = Image.new("RGBA", (HEAD_W, HEAD_H), (0, 0, 0, 0))
    hx0 = HEAD_W // 2 - head_neck_x
    hy0 = HEAD_H - 6 - head_neck_y
    h0.paste(head_scaled, (hx0, hy0), head_scaled)
    h_neck_final = [HEAD_W // 2, HEAD_H - 6]

    mx = HEAD_W // 2
    my = hy0 + int(round((192 - 15 + 8) * scale))

    head_sheet = Image.new("RGBA", (HEAD_W * 6, HEAD_H), (0, 0, 0, 0))
    head_sheet.paste(h0, (0, 0), h0)
    h1 = h0.rotate(6, resample=Image.Resampling.NEAREST, center=(HEAD_W//2, HEAD_H-6))
    head_sheet.paste(h1, (HEAD_W * 1, 0), h1)
    h2 = h0.copy()
    ImageDraw.Draw(h2).ellipse([mx - 3, my - 2, mx + 3, my + 2], fill=(42, 12, 10, 255), outline=(140, 78, 44, 255))
    head_sheet.paste(h2, (HEAD_W * 2, 0), h2)
    h3 = ImageEnhance.Color(h0.copy()).enhance(1.35)
    ImageDraw.Draw(h3).ellipse([mx - 4, my - 2, mx + 4, my + 3], fill=(35, 8, 8, 255), outline=(150, 65, 36, 255))
    head_sheet.paste(h3, (HEAD_W * 3, 0), h3)
    # Frame 4: natural blink (closed eyelids below eyebrows)
    h4 = h0.copy()
    d4 = ImageDraw.Draw(h4)
    d4.rectangle([26, 40, 31, 41], fill=(214, 152, 102, 255))
    d4.rectangle([40, 40, 45, 41], fill=(214, 152, 102, 255))
    d4.line([(26, 42), (31, 42)], fill=(54, 28, 16, 255))
    d4.line([(40, 42), (45, 42)], fill=(54, 28, 16, 255))
    head_sheet.paste(h4, (HEAD_W * 4, 0), h4)
    # Frame 5: upbeat nod tilt (-4 deg)
    h5 = h0.rotate(-4, resample=Image.Resampling.NEAREST, center=(HEAD_W//2, HEAD_H-6))
    head_sheet.paste(h5, (HEAD_W * 5, 0), h5)
    head_sheet.save(os.path.join(OUT_DIR, "players/_default/head.png"))

    # Drinking sprite from clean-drink: extract grip-drink & erase ONLY the tilted baked can capsule
    raw_cd = Image.open(os.path.join(ASSETS_DIR, "kvas-player-ru-clean-drink.jpg"))
    cd = extract_magenta(raw_cd, tol=42, defringe=True)
    cd_px = cd.load()

    seeds_d = (
        [(x, y) for y in range(100, 146, 2) for x in range(285, 385, 2)]
        + [(x, y) for y in range(182, 224, 2) for x in range(250, 385, 2)]
    )
    grip_drink_full, gset_d = flood_grip(cd, seeds_d, (242, 94, 405, 232))

    # Distance from tilted segment A=(288, 178) -> B=(424, 130), radius=43:
    # clears the entire baked can including its right rim while preserving nose/lips/teeth/beard/wrist
    ax, ay = 288.0, 178.0
    bx_s, by_s = 424.0, 130.0
    abx, aby = bx_s - ax, by_s - ay
    ab2 = abx * abx + aby * aby
    for y in range(96, 220):
        for x in range(252, 436):
            if (x, y) in gset_d:
                continue
            if x < 285 and y > 168 and is_finger_skin(*cd_px[x, y]):
                continue
            rim_x = 426 + (135 - y) * 0.18
            if x >= rim_x:
                continue
            r, g, b, a = cd_px[x, y]
            # Preserve skin/lips/teeth/beard on the right edge (>=405) unless it's clearly orange/brown/rim can pixels
            is_can_right = (r > 95 and g < 85 and b < 32 and (r - b) > 55) or (r > 190 and g > 185 and b > 180 and x < 432 and y < 170)
            if x >= 404 and not is_can_right:
                continue
            t = max(0.0, min(1.0, ((x - ax) * abx + (y - ay) * aby) / ab2))
            px_c = ax + t * abx
            py_c = ay + t * aby
            dist = math.hypot(x - px_c, y - py_c)
            if dist <= 43.0:
                cd_px[x, y] = (0, 0, 0, 0)

    drink_bounds = (92, 20, 795, 1118)
    drink_crop = cd.crop(drink_bounds)
    dw = int(round(drink_crop.width * scale))
    dh = int(round(drink_crop.height * scale))
    dx = (PLAYER_W - dw) // 2
    dy = PLAYER_H - 4 - dh
    drink_body = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
    res_drink = drink_crop.resize((dw, dh), Image.Resampling.NEAREST)
    drink_body.paste(res_drink, (dx, dy), res_drink)

    grip_drink_crop = grip_drink_full.crop(drink_bounds).resize((dw, dh), Image.Resampling.NEAREST)
    grip_drink_out = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
    grip_drink_out.paste(grip_drink_crop, (dx, dy), grip_drink_crop)
    grip_drink_out.save(os.path.join(OUT_DIR, "props/grip-drink.png"))

    # Build 3 tattoo tier sheets (5 frames each matching belly-0..5!)
    raw_bt = extract_magenta(Image.open(os.path.join(ASSETS_DIR, "kvas-player-ru-base.jpg")))
    raw_dt = extract_magenta(Image.open(os.path.join(ASSETS_DIR, "kvas-player-ru-drink.jpg")))
    bt1, bt2, bt3 = extract_tattoo_tiers(raw_bt, extract_magenta(raw_cb))
    dt1, dt2, dt3 = extract_tattoo_tiers(raw_dt, extract_magenta(raw_cd))

    for tier, (bt, dt) in enumerate([(bt1, dt1), (bt2, dt2), (bt3, dt3)], start=1):
        tsheet = Image.new("RGBA", (PLAYER_W * 5, PLAYER_H), (0, 0, 0, 0))
        b_sp = bt.crop(body_bounds).resize((bw, bh), Image.Resampling.NEAREST)
        d_sp = dt.crop(drink_bounds).resize((dw, dh), Image.Resampling.NEAREST)
        b_can = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
        b_can.paste(b_sp, (bx, by), b_sp)
        d_can = Image.new("RGBA", (PLAYER_W, PLAYER_H), (0, 0, 0, 0))
        d_can.paste(d_sp, (dx, dy), d_sp)
        # Frames: 0=idle, 1=drink+2, 2=drink, 3=burp(-1,-2), 4=nod(0,+2)
        tsheet.paste(b_can, (0, 0), b_can)
        tsheet.paste(d_can, (PLAYER_W * 1, 2), d_can)
        tsheet.paste(d_can, (PLAYER_W * 2, 0), d_can)
        tsheet.paste(b_can, (PLAYER_W * 3 - 1, -2), b_can)
        tsheet.paste(b_can, (PLAYER_W * 4, 2), b_can)
        tsheet.save(os.path.join(OUT_DIR, f"props/tattoo-{tier}.png"))

    # Belly warping: clear, progressive 3D beer belly from stage 1 to 5
    waist_cx, waist_cy = mpt(472, 540)
    shirt_top_y = mpt(0, 390)[1]
    shirt_bot_y = mpt(0, 646)[1]
    torso_x0 = mpt(308, 0)[0]
    torso_x1 = mpt(642, 0)[0]

    def is_fg_arm(rgba_px):
        r, g, b, a = rgba_px
        return a > 0 and r > 140 and g > 70 and b < 118 and (r - g) > 22

    def apply_belly(img, stage, dy_shift=0):
        if stage == 0:
            return img
        out = img.copy()
        spx = img.load()
        opx = out.load()
        cx = waist_cx - 2
        cy = waist_cy + 7 + dy_shift
        rx = 23 + stage * 3.8
        ry = 14 + stage * 3.5
        expand_w = 0.48 * (stage / 5.0)
        hem_drop = stage * 3.4

        y_end = min(PLAYER_H - 10, shirt_bot_y + int(round(stage * 4.0)) + 4)
        for y in range(shirt_top_y, y_end):
            for x in range(max(torso_x0 - 8, cx - int(rx) - 4), min(torso_x1 + 8, cx + int(rx) + 4)):
                if not (0 <= x < PLAYER_W and 0 <= y < PLAYER_H):
                    continue
                if is_fg_arm(spx[x, y]) and (x < cx - 18 or x > cx + 16 or y > shirt_bot_y + 2):
                    continue
                nx = (x - cx) / rx
                ny = (y - cy) / ry
                d2 = nx * nx + ny * ny
                if d2 < 1.0:
                    falloff = (1.0 - d2) ** 0.8
                    src_x = int(round(cx + (x - cx) / (1.0 + expand_w * falloff)))
                    src_y = int(round(y - hem_drop * falloff))
                    src_x = max(torso_x0, min(torso_x1, src_x))
                    src_y = max(shirt_top_y, min(shirt_bot_y, src_y))
                    r, g, b, a = spx[src_x, src_y]
                    # If stretching past bottom hem, paint stretched white jersey fabric!
                    if (a == 0 or (r < 45 and g < 45 and b < 50)) and y > shirt_bot_y - 6 and abs(nx) < 0.85:
                        r, g, b, a = 228, 226, 224, 255
                    if a > 0 and not is_fg_arm((r, g, b, a)):
                        shade = 1.0 + 0.08 * falloff * (1.0 - max(0.0, ny)) - 0.25 * max(0.0, ny) * falloff
                        if ny > 0.72 and d2 > 0.78:
                            shade *= 0.72
                        opx[x, y] = (
                            max(0, min(255, int(r * shade))),
                            max(0, min(255, int(g * shade))),
                            max(0, min(255, int(b * shade))),
                            255,
                        )

        # Exposed round beer belly skin peeking under stretched jersey hem from stage 2..5
        if stage >= 2:
            brx = 13 + (stage - 2) * 3.8
            hem_y = shirt_bot_y + dy_shift + int(round((stage - 2) * 1.4))
            max_arc = 3.2 + (stage - 2) * 2.5
            for x in range(int(cx - brx), int(cx + brx) + 1):
                if not (0 <= x < PLAYER_W):
                    continue
                if x > cx + 13 and is_fg_arm(spx[x, min(PLAYER_H - 1, hem_y + 2)]):
                    continue
                u = (x - cx) / brx
                arc = int(round(max(0.0, 1.0 - u * u) * max_arc))
                if arc <= 0:
                    continue
                for yy in range(hem_y, hem_y + arc + 1):
                    if 0 <= yy < PLAYER_H:
                        if is_fg_arm(spx[x, yy]) and x > cx + 11:
                            continue
                        if yy == hem_y:
                            opx[x, yy] = (158, 155, 152, 255)
                        elif yy == hem_y + arc:
                            opx[x, yy] = (22, 12, 8, 255)
                        else:
                            v = (yy - hem_y) / max(1, arc)
                            shade = 1.04 - 0.16 * abs(u) - 0.20 * v
                            opx[x, yy] = (
                                max(0, min(255, int(218 * shade))),
                                max(0, min(255, int(146 * shade))),
                                max(0, min(255, int(86 * shade))),
                                255,
                            )
            if stage >= 3:
                ny_dot = hem_y + max(1, int(max_arc * 0.52))
                if 0 <= ny_dot < PLAYER_H:
                    opx[cx, ny_dot] = (112, 58, 28, 255)
                    if stage >= 4 and ny_dot + 1 < PLAYER_H:
                        opx[cx, ny_dot + 1] = (138, 76, 38, 255)
        return out

    anchors_manifest = {}
    for stage in range(6):
        sheet = Image.new("RGBA", (PLAYER_W * 5, PLAYER_H), (0, 0, 0, 0))
        stage_anchors = []

        f0 = apply_belly(base_body, stage, 0)
        sheet.paste(f0, (0, 0), f0)
        stage_anchors.append({"neck": list(neck_anchor), "hand": list(hand_idle)})

        f1 = apply_belly(drink_body, stage, 2)
        sheet.paste(f1, (PLAYER_W * 1, 2), f1)
        stage_anchors.append({"neck": [neck_anchor[0], neck_anchor[1] + 2], "hand": [hand_drink[0], hand_drink[1] + 2]})

        f2 = apply_belly(drink_body, stage, 0)
        sheet.paste(f2, (PLAYER_W * 2, 0), f2)
        stage_anchors.append({"neck": list(neck_anchor), "hand": list(hand_drink)})

        f3 = apply_belly(base_body, stage, -2)
        sheet.paste(f3, (PLAYER_W * 3 - 1, -2), f3)
        stage_anchors.append({"neck": [neck_anchor[0] - 1, neck_anchor[1] - 2], "hand": [hand_idle[0] - 1, hand_idle[1] - 2]})

        f4 = apply_belly(base_body, stage, 1)
        sheet.paste(f4, (PLAYER_W * 4, 2), f4)
        stage_anchors.append({"neck": [neck_anchor[0], neck_anchor[1] + 2], "hand": [hand_idle[0], hand_idle[1] + 2]})

        sheet.save(os.path.join(OUT_DIR, f"body/belly-{stage}.png"))
        anchors_manifest[str(stage)] = stage_anchors

    return anchors_manifest, h_neck_final

def build_npcs():
    raw_c = Image.open(os.path.join(ASSETS_DIR, "kvas-coach.jpg"))
    c_rgba = extract_magenta(raw_c, tol=42, defringe=True)
    cpx = c_rgba.load()
    for y in range(415, 550):
        for x in range(475, 600):
            r, g, b, a = cpx[x, y]
            if a > 0 and r > 130 and g > 130 and b > 130:
                cpx[x, y] = (24, 40, 74, 255)
    c_fit = fit_rgba(c_rgba, COACH_W, COACH_H, pad=2, align="bottom")
    coach_sheet = Image.new("RGBA", (COACH_W * 3, COACH_H), (0, 0, 0, 0))
    f0 = Image.new("RGBA", (COACH_W, COACH_H), (0, 0, 0, 0))
    f0.paste(c_fit, (COACH_W // 3, 4), c_fit)
    coach_sheet.paste(f0, (0, 0), f0)
    coach_sheet.paste(c_fit, (COACH_W * 1, 0), c_fit)
    c_mad = c_fit.copy()
    mpx = c_mad.load()
    for y in range(COACH_H):
        for x in range(COACH_W):
            r, g, b, a = mpx[x, y]
            if a > 0:
                mpx[x, y] = (min(255, int(r * 1.25) + 25), int(g * 0.78), int(b * 0.78), a)
    f2 = Image.new("RGBA", (COACH_W, COACH_H), (0, 0, 0, 0))
    f2.paste(c_mad, (2, 0), c_mad)
    coach_sheet.paste(f2, (COACH_W * 2, 0), f2)
    coach_sheet.save(os.path.join(OUT_DIR, "props/coach.png"))

    raw_cl = Image.open(os.path.join(ASSETS_DIR, "kvas-cleaner.jpg"))
    cl_rgba = extract_magenta(raw_cl, tol=42, defringe=True)
    cl_fit = fit_rgba(cl_rgba, CLEANER_W, CLEANER_H, pad=2, align="bottom")
    cl_sheet = Image.new("RGBA", (CLEANER_W * 3, CLEANER_H), (0, 0, 0, 0))
    cl_sheet.paste(cl_fit, (0, 0), cl_fit)
    cl1 = Image.new("RGBA", (CLEANER_W, CLEANER_H), (0, 0, 0, 0))
    r1 = cl_fit.rotate(3, resample=Image.Resampling.NEAREST)
    cl1.paste(r1, (2, 0), r1)
    cl_sheet.paste(cl1, (CLEANER_W * 1, 0), cl1)
    cl2 = Image.new("RGBA", (CLEANER_W, CLEANER_H), (0, 0, 0, 0))
    r2 = cl_fit.rotate(-3, resample=Image.Resampling.NEAREST)
    cl2.paste(r2, (0, 0), r2)
    cl_sheet.paste(cl2, (CLEANER_W * 2, 0), cl2)
    cl_sheet.save(os.path.join(OUT_DIR, "props/cleaner.png"))

    raw_p = Image.open(os.path.join(ASSETS_DIR, "kvas-pigeon.jpg"))
    p_rgba = extract_magenta(raw_p, tol=42, defringe=True)
    p_fit = fit_rgba(p_rgba, PIGEON_W, PIGEON_H, pad=2, align="bottom")
    p_sheet = Image.new("RGBA", (PIGEON_W * 2, PIGEON_H), (0, 0, 0, 0))
    p_sheet.paste(p_fit, (0, 0), p_fit)
    p2 = p_fit.rotate(10, resample=Image.Resampling.NEAREST, center=(PIGEON_W // 2, PIGEON_H - 4))
    p_sheet.paste(p2, (PIGEON_W, 1), p2)
    p_sheet.save(os.path.join(OUT_DIR, "props/pigeon.png"))

    # Teammate visitors (3 frames each x 112x174: step-in peek, chatter A, chatter B)
    for idx, fname, crop_bottom_ratio in [
        (1, "kvas-teammate-1.jpg", 1.0),
        (2, "kvas-teammate-2.jpg", 0.80),
    ]:
        raw_t = Image.open(os.path.join(ASSETS_DIR, fname))
        t_rgba = extract_magenta(raw_t, tol=42, defringe=True)
        bbox = t_rgba.getbbox()
        if bbox and crop_bottom_ratio < 1.0:
            x0, y0, x1, y1 = bbox
            t_rgba = t_rgba.crop((x0, y0, x1, y0 + int((y1 - y0) * crop_bottom_ratio)))
        t_fit = fit_rgba(t_rgba, TEAMMATE_W, TEAMMATE_H, pad=2, align="bottom")
        t_sheet = Image.new("RGBA", (TEAMMATE_W * 3, TEAMMATE_H), (0, 0, 0, 0))
        # Frame 0: stepping in from doorway right
        t0 = Image.new("RGBA", (TEAMMATE_W, TEAMMATE_H), (0, 0, 0, 0))
        t0.paste(t_fit, (18, 3), t_fit)
        t_sheet.paste(t0, (0, 0), t0)
        # Frame 1: standing & talking
        t_sheet.paste(t_fit, (TEAMMATE_W * 1, 0), t_fit)
        # Frame 2: animated chatter bob & slight lean
        t2 = Image.new("RGBA", (TEAMMATE_W, TEAMMATE_H), (0, 0, 0, 0))
        t2.paste(t_fit, (-2, 2), t_fit)
        t_sheet.paste(t2, (TEAMMATE_W * 2, 0), t2)
        # Clip bottom along wooden bench back-edge (scene_y = 338 + (scene_x - 168) * 0.42) so legs vanish cleanly behind bench
        spx = t_sheet.load()
        for fr in range(3):
            ox = fr * TEAMMATE_W
            for lx in range(TEAMMATE_W):
                scene_x = 168 + lx
                bench_y = int(round(338 + (scene_x - 168) * 0.42)) - 174
                for ly in range(max(0, bench_y), TEAMMATE_H):
                    spx[ox + lx, ly] = (0, 0, 0, 0)
        t_sheet.save(os.path.join(OUT_DIR, f"props/teammate-{idx}.png"))

    # Velo rider ("Дэн конь") flying from doorway to left lockers (3 frames x 116x148)
    raw_v = Image.open(os.path.join(ASSETS_DIR, "kvas-velo-rider.jpg"))
    v_rgba = extract_magenta(raw_v, tol=42, defringe=True)
    v_fit = fit_rgba(v_rgba, VELO_W, VELO_H, pad=2, align="bottom")
    v_sheet = Image.new("RGBA", (VELO_W * 3, VELO_H), (0, 0, 0, 0))
    # Frame 0: riding stride A
    v_sheet.paste(v_fit, (0, 0), v_fit)
    # Frame 1: riding stride B (pedaling bounce + slight forward lean)
    v1 = Image.new("RGBA", (VELO_W, VELO_H), (0, 0, 0, 0))
    v1_rot = v_fit.rotate(3, resample=Image.Resampling.NEAREST, center=(VELO_W // 2, VELO_H - 12))
    v1.paste(v1_rot, (-2, -2), v1_rot)
    v_sheet.paste(v1, (VELO_W * 1, 0), v1)
    # Frame 2: crashing tilt into lockers
    v2 = v_fit.rotate(14, resample=Image.Resampling.NEAREST, center=(VELO_W // 2, VELO_H - 12))
    v_sheet.paste(v2, (VELO_W * 2, 2), v2)
    v_sheet.save(os.path.join(OUT_DIR, "props/velo.png"))

def draw_badge(bg, rim, outline=(22, 12, 8, 255)):
    ic = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(ic)
    d.rounded_rectangle([2, 2, 29, 29], radius=5, fill=rim, outline=outline, width=2)
    d.rounded_rectangle([4, 4, 27, 27], radius=3, fill=bg)
    return ic, d

def draw_tattoo_icon():
    ic, d = draw_badge((230, 158, 84, 255), (214, 138, 66, 255))
    ink = (26, 22, 24, 255)
    d.ellipse([13, 7, 18, 12], outline=ink, width=2)
    d.rectangle([15, 11, 16, 23], fill=ink)
    d.rectangle([11, 13, 20, 14], fill=ink)
    d.arc([8, 13, 23, 24], 10, 170, fill=ink, width=2)
    d.polygon([(7, 19), (11, 17), (10, 21)], fill=ink)
    d.polygon([(24, 19), (20, 17), (21, 21)], fill=ink)
    return ic

def draw_crit_icon():
    ic, d = draw_badge((86, 32, 22, 255), (176, 72, 26, 255))
    # Golden lightning bolt for crit x3 sips
    d.polygon([(18, 5), (9, 16), (15, 16), (12, 26), (22, 14), (16, 14)], fill=(255, 214, 64, 255), outline=(28, 12, 6, 255))
    return ic

def draw_recycle_icon():
    ic, d = draw_badge((34, 68, 42, 255), (78, 156, 72, 255))
    # Crushed aluminum can + gold coin
    d.rectangle([7, 9, 17, 24], fill=(168, 78, 24, 255), outline=(20, 12, 8, 255))
    d.rectangle([8, 13, 16, 17], fill=(224, 132, 38, 255))
    d.ellipse([15, 14, 25, 24], fill=(248, 196, 56, 255), outline=(28, 16, 6, 255))
    d.rectangle([19, 17, 21, 21], fill=(180, 110, 18, 255))
    return ic

def draw_stealth_icon():
    ic, d = draw_badge((32, 40, 62, 255), (84, 112, 162, 255))
    # Pixel sunglasses / stealth cap
    d.rectangle([6, 12, 14, 18], fill=(18, 18, 24, 255), outline=(228, 232, 240, 255))
    d.rectangle([17, 12, 25, 18], fill=(18, 18, 24, 255), outline=(228, 232, 240, 255))
    d.rectangle([14, 13, 17, 15], fill=(228, 232, 240, 255))
    d.line([(8, 14), (11, 14)], fill=(120, 190, 255, 255))
    d.line([(19, 14), (22, 14)], fill=(120, 190, 255, 255))
    return ic

def draw_hype_icon():
    ic, d = draw_badge((64, 38, 76, 255), (168, 86, 186, 255))
    # Megaphone for teammate hype
    d.polygon([(7, 14), (21, 8), (21, 22), (7, 17)], fill=(244, 176, 62, 255), outline=(22, 12, 8, 255))
    d.rectangle([9, 17, 12, 23], fill=(120, 74, 38, 255), outline=(22, 12, 8, 255))
    d.line([(23, 11), (26, 9)], fill=(255, 232, 140, 255), width=2)
    d.line([(23, 15), (26, 15)], fill=(255, 232, 140, 255), width=2)
    d.line([(23, 19), (26, 21)], fill=(255, 232, 140, 255), width=2)
    return ic

def draw_marathon_icon():
    ic, d = draw_badge((54, 42, 24, 255), (218, 146, 48, 255))
    # Rising flame / second wind
    d.polygon([(16, 5), (23, 14), (21, 24), (11, 24), (9, 15)], fill=(245, 112, 32, 255), outline=(24, 10, 6, 255))
    d.polygon([(16, 11), (19, 17), (18, 23), (14, 23), (13, 17)], fill=(255, 218, 82, 255))
    return ic

def build_logo_and_icons():
    raw_l = Image.open(os.path.join(ASSETS_DIR, "kvas-logo.jpg"))
    l_rgba = extract_black(raw_l, thresh=18)
    l_fit = fit_rgba(l_rgba, 320, 180, pad=4, align="center")
    l_fit.save(os.path.join(OUT_DIR, "props/logo.png"))

    raw_ic = Image.open(os.path.join(ASSETS_DIR, "kvas-icons.jpg"))
    ic_rgba = extract_magenta(raw_ic, tol=42, defringe=True)
    bands = [(146, 354), (396, 600), (646, 850)]
    cols = [
        [(50, 282), (325, 486), (532, 748), (788, 970)],
        [(40, 282), (316, 488), (536, 746), (790, 978)],
        [(60, 248), (300, 476), (542, 730), (782, 974)],
    ]
    extracted = []
    for r, (y0, y1) in enumerate(bands):
        for c, (x0, x1) in enumerate(cols[r]):
            cell = ic_rgba.crop((x0, y0, x1, y1))
            extracted.append(fit_rgba(cell, ICON_SIZE, ICON_SIZE, pad=1, align="center"))
    extracted.append(draw_tattoo_icon())  # index 12

    icons_sheet = Image.new("RGBA", (ICON_SIZE * 13, ICON_SIZE), (0, 0, 0, 0))
    for i, ic in enumerate(extracted):
        icons_sheet.paste(ic, (i * ICON_SIZE, 0), ic)
    icons_sheet.save(os.path.join(OUT_DIR, "props/icons.png"))

    # 12 SKILLS order:
    # throat(7), stomach(6), burp(5), opener(8), coach(9), armband(10), tattoo(12), crit, recycle, stealth, hype, marathon
    skill_icons = [
        extracted[7], extracted[6], extracted[5], extracted[8],
        extracted[9], extracted[10], extracted[12],
        draw_crit_icon(), draw_recycle_icon(), draw_stealth_icon(), draw_hype_icon(), draw_marathon_icon(),
    ]
    skills_sheet = Image.new("RGBA", (ICON_SIZE * len(skill_icons), ICON_SIZE), (0, 0, 0, 0))
    for i, ic in enumerate(skill_icons):
        skills_sheet.paste(ic, (i * ICON_SIZE, 0), ic)
    skills_sheet.save(os.path.join(OUT_DIR, "props/skills.png"))
    return extracted

def build_room(trophy_icon):
    bg = Image.open(os.path.join(ASSETS_DIR, "kvas-room-bg.jpg")).convert("RGBA")
    bg_270 = bg.resize((SCENE_W, SCENE_H), Image.Resampling.NEAREST)
    bg_270.save(os.path.join(OUT_DIR, "room/base.png"))

    dark = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    dpx = dark.load()
    cx, cy = SCENE_W * 0.5, SCENE_H * 0.55
    for y in range(SCENE_H):
        for x in range(SCENE_W):
            dist = math.hypot((x - cx) / 150, (y - cy) / 260)
            a = int(min(220, 85 + dist * 115))
            dpx[x, y] = (8, 8, 14, a)
    dark.save(os.path.join(OUT_DIR, "room/dark.png"))

    p1 = extract_magenta(Image.open(os.path.join(ASSETS_DIR, "kvas-props.jpg")), tol=42, defringe=True)
    p2 = extract_magenta(Image.open(os.path.join(ASSETS_DIR, "kvas-props-2.jpg")), tol=42, defringe=True)

    sofa = p1.crop((0, 0, 512, 512))
    fridge = p1.crop((512, 0, 1024, 512))
    tv = p1.crop((0, 512, 512, 1024))
    boombox = p1.crop((512, 512, 1024, 1024))

    bulb = p2.crop((0, 0, 512, 512))
    scarf = p2.crop((512, 0, 1024, 512))
    garland = p2.crop((0, 512, 512, 1024))
    poster = p2.crop((512, 512, 1024, 1024))

    def save_layer(name, frames_list):
        sheet = Image.new("RGBA", (SCENE_W * len(frames_list), SCENE_H), (0, 0, 0, 0))
        for idx, fr in enumerate(frames_list):
            sheet.paste(fr, (idx * SCENE_W, 0), fr)
        sheet.save(os.path.join(OUT_DIR, f"room/{name}.png"))

    u1_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    b_sp = fit_rgba(bulb, 62, 82, pad=0, align="top")
    u1_a.paste(b_sp, (132, 0), b_sp)
    u1_b = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    b_sp2 = ImageEnhance.Brightness(b_sp).enhance(1.18)
    u1_b.paste(b_sp2, (133, 0), b_sp2)
    u1_c = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    b_sp3 = ImageEnhance.Brightness(b_sp).enhance(0.92)
    u1_c.paste(b_sp3, (131, 0), b_sp3)
    save_layer("upgrade-1", [u1_a, u1_b, u1_c])

    u2_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    ga_sp = fit_rgba(garland, 240, 68, pad=0, align="top")
    u2_a.paste(ga_sp, (15, 18), ga_sp)
    u2_b = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    ga_sp2 = ImageEnhance.Brightness(ga_sp).enhance(1.24)
    u2_b.paste(ga_sp2, (15, 18), ga_sp2)
    u2_c = u2_a.copy()
    d2c = ImageDraw.Draw(u2_c)
    for bx_p, by_p, col in [(36, 46, (255, 230, 90, 255)), (84, 52, (90, 230, 255, 255)), (142, 48, (255, 110, 90, 255)), (204, 50, (120, 255, 130, 255))]:
        d2c.rectangle([bx_p, by_p, bx_p + 2, by_p + 2], fill=col)
    save_layer("upgrade-2", [u2_a, u2_b, u2_c])

    u3 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    p_sp = fit_rgba(poster, 58, 72, pad=0, align="center")
    u3.paste(p_sp, (134, 174), p_sp)
    save_layer("upgrade-3", [u3])

    u4_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    td_sp = fit_rgba(boombox, 46, 34, pad=0, align="bottom")
    td_sp = ImageEnhance.Color(td_sp).enhance(0.65)
    u4_a.paste(td_sp, (124, 108), td_sp)
    u4_b = u4_a.copy()
    d4b = ImageDraw.Draw(u4_b)
    d4b.point((144, 127), fill=(255, 190, 70, 255))
    d4b.point((151, 127), fill=(255, 190, 70, 255))
    save_layer("upgrade-4", [u4_a, u4_b])

    u5_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    bb_sp = fit_rgba(boombox, 68, 48, pad=0, align="bottom")
    u5_a.paste(bb_sp, (118, 94), bb_sp)
    u5_b = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    u5_b.paste(bb_sp, (118, 92), bb_sp)
    save_layer("upgrade-5", [u5_a, u5_b])

    u6_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    fr_sp = fit_rgba(fridge, 76, 98, pad=0, align="bottom")
    u6_a.paste(fr_sp, (6, 272), fr_sp)
    u6_b = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    u6_b.paste(fr_sp, (6, 271), fr_sp)
    ImageDraw.Draw(u6_b).rectangle([58, 294, 60, 296], fill=(120, 245, 255, 255))
    save_layer("upgrade-6", [u6_a, u6_b])

    u7 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d7 = ImageDraw.Draw(u7)
    rug = [(56, 398), (222, 398), (242, 466), (36, 466)]
    d7.polygon(rug, fill=(104, 28, 22, 255), outline=(22, 10, 8, 255))
    inner = [(66, 405), (212, 405), (228, 458), (50, 458)]
    d7.polygon(inner, fill=(138, 42, 28, 255), outline=(218, 168, 72, 255))
    for rx_i in range(74, 212, 24):
        d7.polygon([(rx_i, 430), (rx_i + 8, 418), (rx_i + 16, 430), (rx_i + 8, 442)], fill=(212, 162, 70, 255), outline=(58, 16, 12, 255))
    s_sp = fit_rgba(scarf, 44, 64, pad=0, align="top")
    u7.paste(s_sp, (74, 146), s_sp)
    save_layer("upgrade-7", [u7])

    u8_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    tv_sp = fit_rgba(tv, 56, 48, pad=0, align="bottom")
    u8_a.paste(tv_sp, (172, 95), tv_sp)
    u8_b = u8_a.copy()
    ImageDraw.Draw(u8_b).rectangle([188, 121, 190, 123], fill=(255, 240, 120, 255))
    u8_c = u8_a.copy()
    ImageDraw.Draw(u8_c).rectangle([196, 123, 198, 125], fill=(255, 110, 90, 255))
    u8_d = u8_a.copy()
    ImageDraw.Draw(u8_d).rectangle([192, 119, 195, 122], fill=(255, 255, 255, 255))
    save_layer("upgrade-8", [u8_a, u8_b, u8_c, u8_d])

    u9 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    sf_sp = fit_rgba(sofa, 188, 126, pad=0, align="bottom")
    u9.paste(sf_sp, (54, 282), sf_sp)
    cup = trophy_icon.resize((26, 26), Image.Resampling.NEAREST)
    u9.paste(cup, (38, 88), cup)
    save_layer("upgrade-9", [u9])

    # Upgrade 10: Glowing neon "КВАС" sign above poster (2 frames)
    u10_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d10a = ImageDraw.Draw(u10_a)
    d10a.rounded_rectangle([120, 146, 204, 168], radius=4, fill=(32, 16, 10, 235), outline=(255, 178, 52, 255), width=2)
    d10a.rectangle([126, 152, 198, 162], fill=(92, 34, 14, 255))
    # Pixel neon letters "КВАС"
    for lx, ly in [
        (132,153),(132,155),(132,157),(132,159),(132,161),(135,155),(137,153),(136,158),(138,160),
        (146,153),(146,155),(146,157),(146,159),(146,161),(149,153),(151,155),(149,157),(151,159),(149,161),
        (160,155),(160,157),(160,159),(160,161),(162,153),(164,155),(164,157),(164,159),(164,161),(162,157),
        (174,155),(174,157),(174,159),(176,153),(178,153),(176,161),(178,161),
    ]:
        d10a.rectangle([lx, ly, lx + 1, ly + 1], fill=(255, 224, 110, 255))
    u10_b = u10_a.copy()
    d10b = ImageDraw.Draw(u10_b)
    d10b.rounded_rectangle([120, 146, 204, 168], radius=4, outline=(255, 238, 140, 255), width=2)
    save_layer("upgrade-10", [u10_a, u10_b])

    # Upgrade 11: Golden Kvas Barrel / Cooler beside lockers (2 frames)
    u11_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d11a = ImageDraw.Draw(u11_a)
    d11a.rounded_rectangle([84, 212, 116, 254], radius=6, fill=(214, 152, 38, 255), outline=(28, 16, 8, 255), width=2)
    d11a.rectangle([86, 222, 114, 226], fill=(120, 68, 18, 255))
    d11a.rectangle([86, 238, 114, 242], fill=(120, 68, 18, 255))
    d11a.rectangle([97, 229, 103, 235], fill=(255, 224, 110, 255))
    d11a.rectangle([103, 232, 108, 234], fill=(180, 186, 194, 255))
    u11_b = u11_a.copy()
    d11b = ImageDraw.Draw(u11_b)
    d11b.rectangle([106, 235, 107, 238], fill=(240, 184, 64, 255))
    d11b.point((92, 216), fill=(255, 248, 200, 255))
    save_layer("upgrade-11", [u11_a, u11_b])

    # Upgrade 12: Championship Pennant & Golden Sparkles (3 frames)
    u12_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d12a = ImageDraw.Draw(u12_a)
    d12a.polygon([(24, 118), (64, 118), (64, 174), (44, 192), (24, 174)], fill=(26, 26, 30, 255), outline=(244, 192, 64, 255))
    d12a.polygon([(28, 122), (60, 122), (60, 170), (44, 186), (28, 170)], fill=(238, 234, 226, 255), outline=(204, 146, 36, 255))
    d12a.ellipse([38, 134, 50, 148], fill=(244, 186, 48, 255), outline=(26, 16, 8, 255))
    d12a.rectangle([34, 154, 54, 160], fill=(24, 24, 28, 255))
    u12_b = u12_a.copy()
    for sx, sy in [(44, 128), (112, 134), (210, 124), (72, 198)]:
        ImageDraw.Draw(u12_b).rectangle([sx, sy, sx + 2, sy + 2], fill=(255, 236, 120, 255))
    u12_c = u12_a.copy()
    for sx, sy in [(32, 180), (156, 120), (228, 162), (96, 204)]:
        ImageDraw.Draw(u12_c).rectangle([sx, sy, sx + 2, sy + 2], fill=(255, 210, 90, 255))
    save_layer("upgrade-12", [u12_a, u12_b, u12_c])

def build_manifest(anchors_manifest, head_neck):
    manifest = {
        "scene": [SCENE_W, SCENE_H],
        "focus": [135, 270],
        "kitColors": {"shirt": "#f4f1e8", "shorts": "#1c1c1e", "socks": "#f4f1e8"},
        "players": [],
        "body": {
            "cell": [PLAYER_W, PLAYER_H],
            "frames": 5,
            "anchors": anchors_manifest,
        },
        "head": {"cell": [HEAD_W, HEAD_H], "frames": 6, "neck": head_neck},
        "playerPosition": [51, 182],
        "slots": {
            "floor": [
                [8, 412], [28, 426], [52, 434], [74, 422], [18, 444], [44, 448],
                [68, 446], [96, 444], [122, 448], [148, 446], [174, 448], [200, 442],
                [226, 446], [244, 432], [238, 412], [214, 426], [190, 430], [108, 430],
                [154, 428], [22, 398], [46, 392], [228, 394], [84, 404], [184, 406],
            ],
            "bench": [
                [66, 306], [84, 312], [182, 344], [198, 352], [214, 360], [230, 368],
            ],
            "shelf": [
                [120, 108], [138, 108], [156, 108], [174, 108], [192, 108],
                [12, 84], [30, 86], [48, 88], [66, 90], [82, 92],
            ],
        },
        "pilePosition": [18, 306],
        "pigeonOnPile": [[56, 388], [56, 372], [56, 352], [56, 332], [56, 312]],
        "coachPosition": [180, 196],
        "teammatePosition": [168, 174],
        "cleanerPosition": [4, 248],
        "can": {"cell": [22, 46], "sheetCell": [CAN_W, CAN_H], "frames": 9},
        "canDrink": {"cell": [44, 26], "sheetCell": [CAN_DRINK_W, CAN_DRINK_H], "frames": 4},
        "canCrushed": {"cell": [19, 19], "sheetCell": [28, 28], "frames": 6},
        "pile": {"cell": [PILE_W, PILE_H], "frames": 4},
        "coach": {"cell": [COACH_W, COACH_H], "frames": 3},
        "teammate": {"cell": [TEAMMATE_W, TEAMMATE_H], "frames": 3},
        "velo": {"cell": [VELO_W, VELO_H], "frames": 3},
        "cleaner": {"cell": [CLEANER_W, CLEANER_H], "frames": 3},
        "pigeon": {"cell": [PIGEON_W, PIGEON_H], "frames": 2},
        "upgradeFrames": {
            "1": 3, "2": 3, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 4, "9": 1,
            "10": 2, "11": 2, "12": 3
        },
    }
    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    with open(MANIFEST_TS, "w", encoding="utf-8") as f:
        f.write("import type { TManifest } from './types';\n\n")
        f.write(f"export const kvasManifest: TManifest = {json.dumps(manifest, ensure_ascii=False)};\n")

if __name__ == "__main__":
    ensure_dirs()
    build_can_and_pile()
    anchors, head_neck = build_player()
    build_npcs()
    icons = build_logo_and_icons()
    build_room(icons[11])
    build_manifest(anchors, head_neck)
    print("Built crisp cans, clean-skin body, finger grips, and tattoo layers!")
