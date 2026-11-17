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
EGOR_W, EGOR_H = 72, 214
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

    # Belly warping: 10 highly expressive stages (0..9), max belly ~3x larger than before
    waist_cx, waist_cy = mpt(472, 540)
    shirt_top_y = mpt(0, 390)[1]
    shirt_bot_y = mpt(0, 646)[1]
    torso_x0 = mpt(308, 0)[0]
    torso_x1 = mpt(642, 0)[0]

    def is_fg_arm(rgba_px):
        r, g, b, a = rgba_px
        return a > 0 and r > 140 and g > 70 and b < 118 and (r - g) > 22

    def build_arm_mask(img):
        """Flood-fill the foreground left forearm+hand (right half of sprite) + 1px outline so belly stays BEHIND it."""
        spx = img.load()
        seen = set()
        q = deque()
        # Seed on left forearm/wrist region in PLAYER_W x PLAYER_H
        for sy in range(125, 165, 2):
            for sx in range(96, 136, 2):
                r, g, b, a = spx[sx, sy]
                if a > 0 and r > 145 and g > 72 and b < 118 and (r - g) > 24:
                    seen.add((sx, sy))
                    q.append((sx, sy))
        while q:
            cx_q, cy_q = q.popleft()
            for dx_q, dy_q in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = cx_q + dx_q, cy_q + dy_q
                if 80 <= nx < PLAYER_W - 10 and 110 <= ny < 188 and (nx, ny) not in seen:
                    r, g, b, a = spx[nx, ny]
                    if a > 0 and r > 135 and g > 65 and b < 118 and (r - g) > 20:
                        seen.add((nx, ny))
                        q.append((nx, ny))
        # Expand by 2px into dark outline/shadow belonging to the arm
        full = set(seen)
        for _ in range(2):
            nxt = set(full)
            for (x_a, y_a) in full:
                for dx_q, dy_q in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x_a + dx_q, y_a + dy_q
                    if 80 <= nx < PLAYER_W - 10 and 110 <= ny < 188 and (nx, ny) not in nxt:
                        r, g, b, a = spx[nx, ny]
                        if a > 0 and r < 115 and g < 85 and b < 85:
                            nxt.add((nx, ny))
            full = nxt
        return full

    def apply_belly(img, stage, dy_shift=0, arm_mask=None):
        if stage == 0:
            return img
        if arm_mask is None:
            arm_mask = build_arm_mask(img)
        out = img.copy()
        spx = img.load()
        opx = out.load()
        t9 = stage / 9.0
        cx = waist_cx - 2
        cy = waist_cy + 5 + dy_shift + int(round(stage * 1.1))
        rx = 20 + stage * 2.5
        ry = 13 + stage * 2.6
        expand_w = 0.62 * (t9 ** 0.9)

        # Shirt bulge & stretch (smooth dome without protruding white wings)
        y_end = min(PLAYER_H - 12, shirt_bot_y + int(round(stage * 1.4)) + 1)
        for y in range(shirt_top_y + 6, y_end):
            for x in range(max(44, cx - int(rx) - 2), min(PLAYER_W - 38, cx + int(rx) + 2)):
                if not (0 <= x < PLAYER_W and 0 <= y < PLAYER_H):
                    continue
                if (x, y) in arm_mask:
                    continue
                if is_fg_arm(spx[x, y]) and (x < cx - 22 or x > cx + 20 or y > shirt_bot_y + 2):
                    continue
                nx = (x - cx) / rx
                ny = (y - cy) / ry
                d2 = nx * nx + ny * ny
                if d2 < 1.0:
                    falloff = (1.0 - d2) ** 0.78
                    radial_mag = 1.0 + 0.52 * t9 * falloff
                    src_x = int(round(cx + (x - cx) / (1.0 + expand_w * falloff)))
                    src_y = int(round(cy + (y - cy) / radial_mag - stage * 0.55 * falloff))
                    src_x = max(torso_x0, min(torso_x1, src_x))
                    src_y = max(shirt_top_y + 8, min(shirt_bot_y - 1, src_y))
                    r, g, b, a = spx[src_x, src_y]
                    if a > 0 and not is_fg_arm((r, g, b, a)) and (src_x, src_y) not in arm_mask:
                        dome_hi = max(0.0, 1.0 - ((nx + 0.15) ** 2 + (ny + 0.22) ** 2))
                        shade = 1.0 + 0.10 * dome_hi * t9 - 0.26 * max(0.0, ny) * falloff
                        if ny > 0.70 and d2 > 0.74:
                            shade *= 0.72
                        opx[x, y] = (
                            max(0, min(255, int(r * shade))),
                            max(0, min(255, int(g * shade))),
                            max(0, min(255, int(b * shade))),
                            255,
                        )

        # Exposed round beer belly tucked naturally under jersey, between thighs, and BEHIND foreground left arm
        if stage >= 2:
            s_gut = stage - 1  # 1..8
            brx = min(31.0, 14.0 + s_gut * 2.2)     # 16.2 .. 31.0 px half-width (never spills past thighs/can!)
            base_hem = shirt_bot_y + dy_shift - 2
            max_arc = 5.0 + (s_gut ** 1.18) * 2.25   # ~7px at stage 2 -> ~31px drop at stage 9
            arch_lift = min(6.5, s_gut * 0.8)
            for x in range(int(cx - brx - 1), int(cx + brx + 2)):
                if not (54 <= x <= 116):
                    continue
                u = (x - cx) / brx
                if abs(u) > 1.0:
                    continue
                curve = max(0.0, 1.0 - u * u)
                hem_y = int(round(base_hem - curve * arch_lift))
                arc = int(round((curve ** 0.72) * max_arc + curve * arch_lift))
                if arc <= 1:
                    continue
                # Draw subtle pulled-up white jersey lip right above hem_y so belly attaches seamlessly to shirt
                for ly_lip in range(max(shirt_top_y + 16, hem_y - 2), hem_y):
                    if (x, ly_lip) in arm_mask:
                        continue
                    if is_fg_arm(spx[x, ly_lip]) and (x < cx - 22 or x > cx + 18):
                        continue
                    opx[x, ly_lip] = (212, 208, 204, 255) if ly_lip == hem_y - 2 else (172, 168, 164, 255)

                for yy in range(hem_y, hem_y + arc + 1):
                    if not (0 <= yy < PLAYER_H):
                        continue
                    # Preserve foreground left forearm/fingers (and their dark outline) + right hand/can completely!
                    if (x, yy) in arm_mask:
                        continue
                    if is_fg_arm(spx[x, yy]) and (x < cx - 20 or x > cx + 14):
                        continue
                    # Right-thigh / can zone guard on left side
                    if x < 58 and yy > base_hem + 3:
                        continue

                    if yy == hem_y:
                        opx[x, yy] = (128, 72, 34, 255)  # crisp dark crease right under shirt hem
                    elif yy >= hem_y + arc - 1:
                        opx[x, yy] = (24, 12, 8, 255)    # lower belly outline
                    elif abs(u) > 0.94:
                        opx[x, yy] = (28, 14, 10, 255)   # side outline
                    else:
                        v = (yy - hem_y) / max(1, arc)
                        hi = max(0.0, 1.0 - ((u + 0.16) ** 2 + (v - 0.38) ** 2) * 2.2)
                        # Under-shirt shadow on top 2px + contact shadow next to foreground arm
                        top_shadow = 0.74 if yy == hem_y + 1 else (0.88 if yy == hem_y + 2 else 1.0)
                        near_arm = any((x + dx_a, yy + dy_a) in arm_mask for dx_a in (1, 2) for dy_a in (-1, 0, 1))
                        arm_shadow = 0.78 if near_arm else 1.0
                        shade = (1.0 + 0.12 * hi - 0.16 * abs(u) - 0.28 * (v ** 1.35)) * top_shadow * arm_shadow
                        # Exact warm peach-tan skin matching player's arms & legs (~222, 128, 56)
                        opx[x, yy] = (
                            max(0, min(255, int(222 * shade))),
                            max(0, min(255, int(128 * shade))),
                            max(0, min(255, int(56 * shade))),
                            255,
                        )
            # Navel / belly-button
            if stage >= 3:
                ny_dot = int(round(base_hem - arch_lift * 0.45 + max_arc * 0.50))
                navel_w = 1 if stage < 6 else 2
                for dx_n in range(-navel_w + 1, navel_w):
                    nx_dot = cx + dx_n
                    if 0 <= nx_dot < PLAYER_W and 0 <= ny_dot < PLAYER_H and (nx_dot, ny_dot) not in arm_mask:
                        opx[nx_dot, ny_dot] = (88, 40, 16, 255)
                        if stage >= 5 and ny_dot + 1 < PLAYER_H and (nx_dot, ny_dot + 1) not in arm_mask:
                            opx[nx_dot, ny_dot + 1] = (120, 58, 26, 255)
        return out

    base_arm_mask = build_arm_mask(base_body)
    drink_arm_mask = build_arm_mask(drink_body)

    anchors_manifest = {}
    for stage in range(10):
        sheet = Image.new("RGBA", (PLAYER_W * 5, PLAYER_H), (0, 0, 0, 0))
        stage_anchors = []

        f0 = apply_belly(base_body, stage, 0, base_arm_mask)
        sheet.paste(f0, (0, 0), f0)
        stage_anchors.append({"neck": list(neck_anchor), "hand": list(hand_idle)})

        f1 = apply_belly(drink_body, stage, 2, drink_arm_mask)
        sheet.paste(f1, (PLAYER_W * 1, 2), f1)
        stage_anchors.append({"neck": [neck_anchor[0], neck_anchor[1] + 2], "hand": [hand_drink[0], hand_drink[1] + 2]})

        f2 = apply_belly(drink_body, stage, 0, drink_arm_mask)
        sheet.paste(f2, (PLAYER_W * 2, 0), f2)
        stage_anchors.append({"neck": list(neck_anchor), "hand": list(hand_drink)})

        f3 = apply_belly(base_body, stage, -2, base_arm_mask)
        sheet.paste(f3, (PLAYER_W * 3 - 1, -2), f3)
        stage_anchors.append({"neck": [neck_anchor[0] - 1, neck_anchor[1] - 2], "hand": [hand_idle[0] - 1, hand_idle[1] - 2]})

        f4 = apply_belly(base_body, stage, 1, base_arm_mask)
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

    # Teammate visitors (1 = Belford, 2 = Ден, 3 = Igor; 3 frames each x 112x174: step-in peek, chatter A, chatter B)
    for idx, fname, crop_bottom_ratio in [
        (1, "kvas-teammate-1.jpg", 1.0),
        (2, "kvas-teammate-2.jpg", 0.80),
        (3, "kvas-teammate-3.jpg", 1.0),
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

    # Velo rider ("Буряк") flying from doorway to left lockers (3 frames x 116x148)
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

    # Egor peeking out of the rear locker (x=50, y=122 in scene -> locker cavity x=5..38, y=6..204)
    room_bg = Image.open(os.path.join(ASSETS_DIR, "kvas-room-bg.jpg")).convert("RGBA").resize((SCENE_W, SCENE_H), Image.Resampling.NEAREST)
    locker_door = room_bg.crop((55, 128, 88, 326))  # 33x198 real rusty locker door
    raw_eg = Image.open(os.path.join(ASSETS_DIR, "kvas-egor.jpg"))
    eg_rgba = extract_magenta(raw_eg, tol=42, defringe=True)
    eb = eg_rgba.getbbox()
    if eb:
        # Keep head, sunglasses, and torso down behind the sitting player's shoulder
        eg_rgba = eg_rgba.crop((eb[0], eb[1], eb[2], eb[1] + int((eb[3] - eb[1]) * 0.90)))
    eg_fit = fit_rgba(eg_rgba, 44, 78, pad=0, align="bottom")
    # Blend bottom 22px smoothly into dark locker shadow (10, 8, 8)
    ef_px = eg_fit.load()
    for yy in range(eg_fit.height - 22, eg_fit.height):
        t_fade = (yy - (eg_fit.height - 22)) / 22.0
        for xx in range(eg_fit.width):
            r, g, b, a = ef_px[xx, yy]
            if a > 0:
                ef_px[xx, yy] = (
                    int(r * (1.0 - t_fade) + 10 * t_fade),
                    int(g * (1.0 - t_fade) + 8 * t_fade),
                    int(b * (1.0 - t_fade) + 8 * t_fade),
                    a,
                )

    eg_sheet = Image.new("RGBA", (EGOR_W * 3, EGOR_H), (0, 0, 0, 0))
    for fr in range(3):
        cell = Image.new("RGBA", (EGOR_W, EGOR_H), (0, 0, 0, 0))
        d = ImageDraw.Draw(cell)
        # Dark locker interior cavity
        d.rectangle([5, 6, 37, 204], fill=(10, 8, 8, 255), outline=(28, 18, 12, 255))
        d.rectangle([7, 8, 12, 202], fill=(18, 13, 10, 255))

        # Swung-open locker door on the right hinge (local x=38, scene x=88)
        door_w = 22 if fr == 0 else 15
        skew_y = 5 if fr == 0 else 10
        door_resized = locker_door.resize((door_w, locker_door.height), Image.Resampling.NEAREST)
        door_skew = Image.new("RGBA", (door_w, locker_door.height + skew_y), (0, 0, 0, 0))
        dsrc = door_resized.load()
        ddst = door_skew.load()
        for xx in range(door_w):
            t = xx / max(1, door_w - 1)
            dy = int(round(t * skew_y))
            for yy in range(locker_door.height):
                ddst[xx, yy + dy] = dsrc[xx, yy]
        ImageDraw.Draw(door_skew).line([(door_w - 1, skew_y), (door_w - 1, skew_y + locker_door.height - 1)], fill=(18, 12, 10, 255))

        if fr == 0:
            # Cracking open: Egor peeking subtly behind half-opened door
            cell.paste(eg_fit, (2, 46), eg_fit)
            cell.paste(door_skew, (22, 6), door_skew)
        else:
            # Door swung open; Egor's head & upper shoulders lean out of the locker
            cell.paste(door_skew, (38, 6), door_skew)
            cell.paste(eg_fit, (6 if fr == 1 else 8, 42 if fr == 1 else 44), eg_fit)

        cpx = cell.load()
        for yy in range(EGOR_H):
            for xx in range(0, 5):
                cpx[xx, yy] = (0, 0, 0, 0)

        eg_sheet.paste(cell, (fr * EGOR_W, 0), cell)
    eg_sheet.save(os.path.join(OUT_DIR, "props/egor.png"))

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

def extract_light_bg(im, thresh=228, sat_max=32):
    """Flood-fill remove light/white studio background from outer borders."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    rgba = Image.new("RGBA", (w, h))
    out = rgba.load()
    bg = [[False] * w for _ in range(h)]

    def is_bg(r, g, b):
        return min(r, g, b) >= thresh and (max(r, g, b) - min(r, g, b)) <= sat_max

    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(*px[x, y]):
                bg[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not bg[y][x] and is_bg(*px[x, y]):
                bg[y][x] = True
                q.append((x, y))
    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx]:
                if is_bg(*px[nx, ny]):
                    bg[ny][nx] = True
                    q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            out[x, y] = (0, 0, 0, 0) if bg[y][x] else (r, g, b, 255)
    return rgba

def pixelize_sprite(im, w, h, colors=36, outline=(18, 10, 6, 255)):
    fitted = fit_rgba(im, w - 2, h - 2, pad=0, align="center")
    rgb = fitted.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    apx = fitted.load()
    qpx = q.load()
    for yy in range(fitted.height):
        for xx in range(fitted.width):
            if apx[xx, yy][3] < 128:
                qpx[xx, yy] = (0, 0, 0, 0)
            else:
                qr, qg, qb, _ = qpx[xx, yy]
                qpx[xx, yy] = (qr, qg, qb, 255)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    canvas.paste(q, (1, 1), q)
    return add_outline(canvas, outline)

def make_hanging_scarf(src_rgba, w=36, h=56, colors=28):
    """Turn a flat photo of a football scarf into a hanging pixel-art scarf on a wall peg."""
    bbox = src_rgba.getbbox()
    if not bbox:
        return Image.new("RGBA", (w, h), (0, 0, 0, 0))
    crop = src_rgba.crop(bbox)
    # Use right half (or center strip) folded vertically for crisp readable crest/colors when hung
    cw, ch = crop.size
    # Sample two vertical tails hanging side-by-side from a folded loop at the top
    half_strip = crop.resize((max(12, w - 4), max(24, h - 8)), Image.Resampling.BILINEAR)
    # Pixelize the scarf cleanly
    sc = pixelize_sprite(half_strip, w - 2, h - 6, colors=colors, outline=(20, 12, 8, 255))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # Subtle drop shadow on wall + dark hook/peg at top center
    d = ImageDraw.Draw(out)
    px_s = sc.load()
    opx = out.load()
    for yy in range(sc.height):
        for xx in range(sc.width):
            if px_s[xx, yy][3] > 0:
                sx, sy = xx + 2, yy + 5
                if 0 <= sx < w and 0 <= sy < h:
                    opx[sx, sy] = (10, 6, 4, 110)
    out.paste(sc, (1, 4), sc)
    # Wall peg / nail at top
    d.rectangle([w // 2 - 3, 1, w // 2 + 2, 4], fill=(92, 96, 102, 255), outline=(18, 12, 8, 255))
    d.rectangle([w // 2 - 1, 2, w // 2, 3], fill=(176, 182, 192, 255))
    return out

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

    # Upgrade 6: Real "Ясен Квасен" fridge from room/yasen.jpeg (2 frames with glowing display LED)
    raw_yasen = Image.open(os.path.join(OUT_DIR, "room/yasen.jpeg"))
    yasen_rgba = extract_light_bg(raw_yasen, thresh=232, sat_max=30)
    fr_sp = pixelize_sprite(yasen_rgba, 74, 92, colors=42, outline=(18, 10, 6, 255))
    u6_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    ImageDraw.Draw(u6_a).ellipse([8, 360, 78, 372], fill=(8, 6, 4, 150))
    u6_a.paste(fr_sp, (6, 276), fr_sp)
    u6_b = u6_a.copy()
    ImageDraw.Draw(u6_b).rectangle([36, 286, 39, 288], fill=(120, 245, 255, 255))
    save_layer("upgrade-6", [u6_a, u6_b])

    # Upgrade 7: Carpet only (scarf removed!)
    u7 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d7 = ImageDraw.Draw(u7)
    rug = [(56, 398), (222, 398), (242, 466), (36, 466)]
    d7.polygon(rug, fill=(104, 28, 22, 255), outline=(22, 10, 8, 255))
    inner = [(66, 405), (212, 405), (228, 458), (50, 458)]
    d7.polygon(inner, fill=(138, 42, 28, 255), outline=(218, 168, 72, 255))
    for rx_i in range(74, 212, 24):
        d7.polygon([(rx_i, 430), (rx_i + 8, 418), (rx_i + 16, 430), (rx_i + 8, 442)], fill=(212, 162, 70, 255), outline=(58, 16, 12, 255))
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

    # Upgrade 10: Glowing "ХОПЧЫК / ЯСЕН КВАСЕН" lightbox sign above poster (2 frames)
    raw_sign = Image.open(os.path.join(OUT_DIR, "room/sign-kvas.jpg")).convert("RGB")
    raw_sign = raw_sign.crop((0, 0, raw_sign.width, int(raw_sign.height * 0.87)))
    sign_w, sign_h = 80, 30
    sign_small = raw_sign.resize((sign_w, sign_h), Image.Resampling.BILINEAR)
    sign_pix = sign_small.quantize(colors=28, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGBA")
    sx0, sy0 = 122, 141

    def make_sign_frame(glow_col, border_col, inner_bright):
        fr = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
        d = ImageDraw.Draw(fr)
        # Soft warm neon aura around lightbox
        d.rounded_rectangle([sx0 - 5, sy0 - 5, sx0 + sign_w + 4, sy0 + sign_h + 4], radius=6, fill=(glow_col[0], glow_col[1], glow_col[2], 55))
        d.rounded_rectangle([sx0 - 3, sy0 - 3, sx0 + sign_w + 2, sy0 + sign_h + 2], radius=5, fill=(glow_col[0], glow_col[1], glow_col[2], 115))
        # Dark casing + glowing neon frame
        d.rounded_rectangle([sx0 - 2, sy0 - 2, sx0 + sign_w + 1, sy0 + sign_h + 1], radius=3, fill=(24, 12, 6, 255), outline=border_col, width=2)
        inner_img = ImageEnhance.Brightness(sign_pix).enhance(inner_bright)
        fr.paste(inner_img, (sx0, sy0), inner_img)
        return fr

    u10_a = make_sign_frame((255, 168, 42), (255, 178, 52, 255), 1.04)
    u10_b = make_sign_frame((255, 224, 110), (255, 242, 150, 255), 1.18)
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

    # Upgrade 12: Championship Pennant with real "РЕЧИЧАНЕ UNITED" club crest & Golden Sparkles (3 frames)
    u12_a = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    d12a = ImageDraw.Draw(u12_a)
    # Pennant cord & wooden rod
    d12a.line([(44, 110), (26, 117)], fill=(204, 146, 36, 255), width=1)
    d12a.line([(44, 110), (62, 117)], fill=(204, 146, 36, 255), width=1)
    d12a.rectangle([43, 108, 45, 110], fill=(244, 192, 64, 255))
    d12a.rectangle([21, 116, 67, 118], fill=(126, 78, 32, 255), outline=(22, 12, 8, 255))
    # Pennant body
    d12a.polygon([(22, 118), (66, 118), (66, 174), (44, 193), (22, 174)], fill=(26, 26, 30, 255), outline=(244, 192, 64, 255))
    d12a.polygon([(26, 122), (62, 122), (62, 171), (44, 187), (26, 171)], fill=(246, 243, 236, 255), outline=(204, 146, 36, 255))
    # Real club crest centered inside pennant
    raw_crest = Image.open(os.path.join(OUT_DIR, "room/club-crest.jpg"))
    crest_rgba = extract_light_bg(raw_crest, thresh=215, sat_max=18)
    crest_fit = fit_rgba(crest_rgba, 34, 42, pad=0, align="center")
    crest_pix = ImageEnhance.Contrast(crest_fit).enhance(1.25)
    u12_a.paste(crest_pix, (27, 127), crest_pix)

    u12_b = u12_a.copy()
    for sx, sy in [(44, 124), (112, 134), (210, 124), (72, 198)]:
        ImageDraw.Draw(u12_b).rectangle([sx, sy, sx + 2, sy + 2], fill=(255, 236, 120, 255))
    u12_c = u12_a.copy()
    for sx, sy in [(32, 180), (156, 120), (228, 162), (96, 204)]:
        ImageDraw.Draw(u12_c).rectangle([sx, sy, sx + 2, sy + 2], fill=(255, 210, 90, 255))
    save_layer("upgrade-12", [u12_a, u12_b, u12_c])

    # Upgrade 13: FC BATE scarf hanging on the right locker hook
    raw_bate = Image.open(os.path.join(OUT_DIR, "room/bate.jpg"))
    bate_top = raw_bate.crop((0, 0, raw_bate.width, int(raw_bate.height * 0.49)))
    bate_rgba = extract_light_bg(bate_top, thresh=232, sat_max=30)
    bate_sp = make_hanging_scarf(bate_rgba, w=42, h=64, colors=26)
    u13 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    u13.paste(bate_sp, (66, 130), bate_sp)
    save_layer("upgrade-13", [u13])

    # Upgrade 14: FC Gomel scarf hanging on wall peg beside poster & door
    raw_gomel = Image.open(os.path.join(OUT_DIR, "room/gomel.jpg"))
    raw_gomel = raw_gomel.crop((0, 0, raw_gomel.width, int(raw_gomel.height * 0.89)))
    gomel_rgba = extract_light_bg(raw_gomel, thresh=145, sat_max=20)
    gomel_sp = make_hanging_scarf(gomel_rgba, w=38, h=60, colors=26)
    u14 = Image.new("RGBA", (SCENE_W, SCENE_H), (0, 0, 0, 0))
    u14.paste(gomel_sp, (197, 162), gomel_sp)
    save_layer("upgrade-14", [u14])

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
        "egorPosition": [50, 122],
        "cleanerPosition": [4, 248],
        "can": {"cell": [22, 46], "sheetCell": [CAN_W, CAN_H], "frames": 9},
        "canDrink": {"cell": [44, 26], "sheetCell": [CAN_DRINK_W, CAN_DRINK_H], "frames": 4},
        "canCrushed": {"cell": [19, 19], "sheetCell": [28, 28], "frames": 6},
        "pile": {"cell": [PILE_W, PILE_H], "frames": 4},
        "coach": {"cell": [COACH_W, COACH_H], "frames": 3},
        "teammate": {"cell": [TEAMMATE_W, TEAMMATE_H], "frames": 3},
        "egor": {"cell": [EGOR_W, EGOR_H], "frames": 3},
        "velo": {"cell": [VELO_W, VELO_H], "frames": 3},
        "cleaner": {"cell": [CLEANER_W, CLEANER_H], "frames": 3},
        "pigeon": {"cell": [PIGEON_W, PIGEON_H], "frames": 2},
        "upgradeFrames": {
            "1": 3, "2": 3, "3": 1, "4": 2, "5": 2, "6": 2, "7": 1, "8": 4, "9": 1,
            "10": 2, "11": 2, "12": 3, "13": 1, "14": 1
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
