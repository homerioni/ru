import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('../../public/game/kvas/', import.meta.url).pathname;
const MANIFEST_TS = new URL(
  '../../src/components/client/KvasGame/manifest.ts',
  import.meta.url
).pathname;

const SHIRT = '#2f6b3a';
const SHIRT_DK = '#1d4a28';
const SHORTS = '#f4f1e8';
const SKIN = '#e2b48c';
const SKIN_DK = '#c48a62';
const SHOE = '#241c16';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, crc]);
}

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 4);
  }

  set(x, y, color, alpha = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = parseInt(color.slice(1), 16);
    const i = (y * this.w + x) * 4;
    this.px[i] = (n >> 16) & 255;
    this.px[i + 1] = (n >> 8) & 255;
    this.px[i + 2] = n & 255;
    this.px[i + 3] = alpha;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.px[(y * this.w + x) * 4 + 3];
  }

  fillRect(x, y, w, h, color, alpha = 255) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, color, alpha);
    }
  }

  ellipse(cx, cy, rx, ry, color, alpha = 255) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = rx === 0 ? 0 : (x + 0.5 - cx) / rx;
        const dy = ry === 0 ? 0 : (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, color, alpha);
      }
    }
  }

  blit(other, dx, dy) {
    for (let y = 0; y < other.h; y++) {
      for (let x = 0; x < other.w; x++) {
        const i = (y * other.w + x) * 4;
        if (other.px[i + 3] === 0) continue;
        const tx = dx + x;
        const ty = dy + y;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const j = (ty * this.w + tx) * 4;
        this.px[j] = other.px[i];
        this.px[j + 1] = other.px[i + 1];
        this.px[j + 2] = other.px[i + 2];
        this.px[j + 3] = other.px[i + 3];
      }
    }
  }

  png() {
    const stride = this.w * 4 + 1;
    const raw = Buffer.alloc(stride * this.h);
    for (let y = 0; y < this.h; y++) {
      raw[y * stride] = 0;
      Buffer.from(this.px.buffer, this.px.byteOffset + y * this.w * 4, this.w * 4).copy(
        raw,
        y * stride + 1
      );
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    return Buffer.concat([
      sig,
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

function save(rel, canvas) {
  const path = join(ROOT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, canvas.png());
}

function sheet(frames) {
  const out = new Canvas(frames[0].w * frames.length, frames[0].h);
  frames.forEach((frame, i) => out.blit(frame, i * frame.w, 0));
  return out;
}

function drawRoom() {
  const c = new Canvas(320, 180);
  c.fillRect(0, 0, 320, 122, '#3a4436');
  for (let y = 2; y < 118; y += 16) {
    for (let x = 0; x < 320; x += 16) {
      c.fillRect(x + 1, y, 14, 14, (x / 16 + y / 16) % 2 === 0 ? '#44503f' : '#3c4938');
    }
  }
  c.fillRect(0, 118, 320, 62, '#6b5c49');
  for (let y = 122; y < 178; y += 10) {
    for (let x = y % 20 === 2 ? 0 : 10; x < 320; x += 20) {
      c.fillRect(x, y, 10, 6, '#5a4c3b');
    }
  }
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 18;
    c.fillRect(x, 30, 16, 86, '#6d573e');
    c.fillRect(x + 1, 32, 14, 82, '#574530');
    c.fillRect(x + 6, 70, 2, 7, '#d7c39a');
    c.set(x + 3, 44, '#8d4332');
    c.set(x + 11, 96, '#8d4332');
    c.set(x + 4, 45, '#8d4332');
  }
  c.fillRect(272, 34, 38, 92, '#241c14');
  c.fillRect(276, 38, 30, 84, '#4a3828');
  c.fillRect(296, 78, 4, 4, '#e2c98a');
  c.fillRect(276, 122, 30, 2, '#efe0a8');
  c.fillRect(102, 112, 156, 8, '#7b552c');
  c.fillRect(102, 112, 156, 2, '#a07240');
  for (const x of [108, 172, 244]) c.fillRect(x, 120, 5, 24, '#5a3c20');
  c.fillRect(0, 118, 320, 2, '#2a241c');
  return c;
}

function vignette() {
  const c = new Canvas(320, 180);
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 320; x++) {
      const dx = Math.abs(x - 160) / 160;
      const dy = Math.abs(y - 90) / 90;
      const v = Math.min(1, Math.max(dx, dy * 0.85));
      const a = Math.min(200, 80 + Math.round(v * 3) * 40);
      c.set(x, y, '#000000', a);
    }
  }
  return c;
}

function drawUpgrade(level, frame) {
  const c = new Canvas(320, 180);
  if (level === 1) {
    const swing = frame === 0 ? 0 : 6;
    c.fillRect(158, 0, 2, 10 + swing, '#6a6a6a');
    c.fillRect(150 + swing, 10 + swing, 16, 10, '#efe6c0');
    c.fillRect(152 + swing, 12 + swing, 12, 6, '#fff6c8');
    c.ellipse(158 + swing, 28 + swing, 28, 10, '#fff2b0', 40);
  }
  if (level === 2) {
    c.fillRect(8, 8, 250, 2, '#2a2a2a');
    for (let i = 0; i < 16; i++) {
      const on = (i + frame) % 2 === 0;
      c.fillRect(12 + i * 15, 10, 5, 7, on ? '#e23b3b' : '#3a8a3a');
    }
  }
  if (level === 3) {
    c.fillRect(150, 28, 36, 48, '#f3efe0');
    c.fillRect(151, 29, 34, 46, '#d64545');
    c.fillRect(160, 36, 8, 16, '#d6e25a');
    c.fillRect(158, 34, 12, 4, '#f4f4f4');
    c.fillRect(156, 58, 24, 8, '#f4f1e8');
  }
  if (level === 4) {
    c.fillRect(18, 78, 22, 14, '#c45a3a');
    c.fillRect(20, 80, 10, 8, '#222');
    c.fillRect(32, 82, 6, 6, '#888');
    const notes = frame === 0 ? 0 : 2;
    c.fillRect(42, 70 - notes, 3, 5, '#f4f1e8');
    c.fillRect(48, 66 - notes, 3, 5, '#f4f1e8');
  }
  if (level === 5) {
    const hop = frame === 0 ? 0 : -3;
    c.fillRect(14, 70 + hop, 28, 22, '#2a2a2a');
    c.fillRect(18, 74 + hop, 20, 14, '#3a3a3a');
    c.ellipse(28, 81 + hop, 6, 6, '#111');
    c.fillRect(40, 86 + hop, 4, 6, '#2a2a2a');
  }
  if (level === 6) {
    c.fillRect(6, 36, 70, 78, '#d9dde2');
    c.fillRect(8, 40, 66, 58, '#9fd0ea');
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        c.fillRect(12 + col * 12, 46 + row * 12, 6, 8, '#d6e25a');
      }
    }
    c.fillRect(64, 48, 3, 16, '#8a9098');
  }
  if (level === 7) {
    c.fillRect(146, 22, 64, 40, '#8d2a2a');
    c.fillRect(148, 24, 60, 36, '#a33');
    c.fillRect(160, 36, 10, 8, '#e8d8b0');
    c.fillRect(168, 32, 6, 6, '#e8d8b0');
    c.fillRect(186, 40, 10, 8, '#e8d8b0');
    c.fillRect(150, 24, 56, 2, '#e8d8b0');
    c.fillRect(150, 56, 56, 2, '#e8d8b0');
  }
  if (level === 8) {
    c.fillRect(36, 86, 40, 28, '#6a4a2a');
    c.fillRect(40, 78, 32, 22, '#d8c8a4');
    c.fillRect(44, 82, 24, 14, '#1c3a1c');
    const ballX = 48 + frame * 6;
    c.fillRect(ballX, 86, 4, 4, '#f4f1e8');
    c.fillRect(46, 92, 20, 1, '#f4f1e8');
    c.fillRect(48, 100, 16, 4, '#5a3c20');
  }
  if (level === 9) {
    c.fillRect(100, 108, 164, 22, '#6a3a2a');
    c.fillRect(104, 104, 156, 12, '#8a4a32');
    c.fillRect(108, 112, 36, 8, '#5a3024');
    c.fillRect(210, 112, 40, 8, '#5a3024');
    c.fillRect(102, 126, 8, 16, '#3a2418');
    c.fillRect(250, 126, 8, 16, '#3a2418');
  }
  return c;
}

function drawBody(stage, frame) {
  const c = new Canvas(96, 96);
  const extra = [0, 3, 6, 10, 14, 20][stage];
  const lean = frame === 3 ? -4 : 0;
  const cx = 48 + lean;
  const hip = 62;
  const torsoW = 20 + extra;
  const torsoH = 24 + Math.floor(extra / 3);
  const top = hip - torsoH;
  const left = cx - Math.floor(torsoW / 2);

  c.fillRect(left + 2, hip, 7, 16, SKIN);
  c.fillRect(left + torsoW - 9, hip, 7, 16, SKIN);
  c.fillRect(left + 2, hip + 16, 7, 5, SHIRT);
  c.fillRect(left + torsoW - 9, hip + 16, 7, 5, SHIRT);
  c.fillRect(left, hip + 21, 11, 4, SHOE);
  c.fillRect(left + torsoW - 11, hip + 21, 11, 4, SHOE);
  c.fillRect(left, hip - 4, torsoW, 8, SHORTS);
  c.fillRect(left, top, torsoW, torsoH, SHIRT);
  c.fillRect(left, top, torsoW, 3, SHIRT_DK);

  if (stage >= 1) {
    c.ellipse(cx, hip - 2, 8 + extra / 2, 6 + extra / 4, stage >= 3 ? SKIN : SHIRT);
  }
  if (stage >= 3) {
    c.fillRect(cx - 1, hip - 4, 3, 3, SKIN_DK);
  }
  if (stage >= 4) {
    c.fillRect(left - 1, top + 8, 3, 6, SKIN);
    c.fillRect(left + torsoW - 2, top + 12, 3, 5, SKIN);
    c.set(left + 4, top + 6, SHORTS);
    c.set(left + torsoW - 5, top + 10, SHORTS);
  }

  const arm = (x, y, w, h) => c.fillRect(x, y, w, h, SHIRT_DK);
  let hand = [cx + 10, hip - 6];
  if (frame === 0) {
    arm(left - 4, top + 6, 5, 14);
    arm(left + torsoW - 1, top + 6, 5, 14);
    hand = [left + torsoW + 2, top + 18];
  } else if (frame === 1) {
    arm(left - 4, top + 6, 5, 14);
    arm(left + torsoW - 1, top + 2, 5, 8);
    c.fillRect(left + torsoW + 2, top - 4, 5, 8, SKIN);
    hand = [left + torsoW + 4, top - 2];
  } else if (frame === 2) {
    arm(left - 4, top + 4, 5, 10);
    c.fillRect(cx - 2, top - 2, 5, 8, SKIN);
    hand = [cx, top];
  } else if (frame === 3) {
    arm(left - 6, top + 8, 6, 8);
    arm(left + torsoW - 2, top + 10, 6, 8);
    hand = [left - 4, top + 12];
  } else {
    arm(left + 2, hip - 10, 8, 5);
    arm(left + torsoW - 10, hip - 10, 8, 5);
    hand = [cx, hip - 8];
  }

  c.fillRect(cx - 4, top - 6, 8, 7, SKIN);
  const neck = [cx, top - 6];
  return { canvas: c, neck, hand };
}

function drawHead(frame) {
  const c = new Canvas(64, 64);
  c.ellipse(32, 46, 16, 16, SHIRT_DK);
  c.ellipse(32, 48, 13, 13, SHIRT);
  c.fillRect(22, 34, 20, 8, SHIRT_DK);
  c.fillRect(24, 30, 16, 6, '#244e30');
  c.fillRect(26, 44, 5, 4, '#1a120e');
  c.fillRect(34, 44, 5, 4, '#1a120e');
  if (frame === 0) {
    c.fillRect(27, 45, 3, 2, '#f4f1e8');
    c.fillRect(35, 45, 3, 2, '#f4f1e8');
    c.fillRect(29, 56, 6, 2, '#1a120e');
  } else if (frame === 1) {
    c.fillRect(26, 45, 5, 2, SKIN);
    c.fillRect(34, 45, 5, 2, SKIN);
    c.ellipse(32, 56, 4, 3, SKIN_DK);
  } else if (frame === 2) {
    c.fillRect(26, 43, 5, 6, '#f4f1e8');
    c.fillRect(34, 43, 5, 6, '#f4f1e8');
    c.fillRect(27, 44, 2, 2, '#1a120e');
    c.fillRect(36, 44, 2, 2, '#1a120e');
    c.ellipse(32, 58, 5, 4, '#1a120e');
    c.fillRect(30, 57, 4, 2, '#d26a6a');
  } else {
    c.fillRect(27, 45, 3, 2, '#f4f1e8');
    c.fillRect(35, 45, 3, 2, '#f4f1e8');
    c.fillRect(28, 56, 8, 2, '#1a120e');
    c.fillRect(24, 52, 3, 2, '#d26a6a');
    c.fillRect(38, 52, 3, 2, '#d26a6a');
  }
  return c;
}

function drawCan() {
  const frames = [];
  for (let f = 0; f < 6; f++) {
    const c = new Canvas(12, 20);
    const crushed = f === 5;
    const h = crushed ? 8 : 16;
    const y = crushed ? 10 : 2;
    c.fillRect(2, y, 8, h, '#c6d64a');
    c.fillRect(2, y, 8, 3, '#eef6a4');
    c.fillRect(2, y + h - 3, 8, 3, '#8ea428');
    if (f !== 4) c.fillRect(4, y + 5, 4, 4, '#f4f1e8');
    if (f === 1) {
      c.fillRect(4, 0, 2, 3, '#ffffff');
      c.set(7, 0, '#ffffff');
    }
    if (f === 0) c.fillRect(3, y, 6, 2, '#9aa84a');
    if (f === 4) {
      c.fillRect(1, 8, 10, 6, '#c6d64a');
      c.fillRect(1, 8, 10, 2, '#eef6a4');
    }
    frames.push(c);
  }
  return sheet(frames);
}

function drawPile() {
  const frames = [];
  const tops = [96, 70, 36, 6];
  for (const top of tops) {
    const c = new Canvas(96, 120);
    for (let y = top; y < 116; y += 8) {
      for (let x = 8 + ((y / 8) % 2) * 6; x < 88; x += 14) {
        c.fillRect(x, y, 8, 12, '#c6d64a');
        c.fillRect(x, y, 8, 2, '#eef6a4');
      }
    }
    if (top === 6) {
      c.fillRect(70, 2, 2, 10, SHIRT);
      c.fillRect(66, 2, 10, 6, SHIRT);
    }
    frames.push(c);
  }
  return { canvas: sheet(frames), tops };
}

function drawCoach() {
  return sheet(
    [0, 1, 2].map((frame) => {
      const c = new Canvas(48, 96);
      if (frame === 0) {
        c.fillRect(28, 20, 16, 70, '#2a2118');
        c.fillRect(18, 36, 14, 10, SKIN);
        c.fillRect(16, 40, 12, 3, '#3a3a3a');
        c.fillRect(22, 34, 6, 3, '#f4f1e8');
      } else {
        c.fillRect(18, 8, 16, 14, SKIN);
        c.fillRect(16, 4, 20, 6, '#c8c8c8');
        c.fillRect(14, 22, 22, 40, '#2a4a7a');
        c.fillRect(16, 62, 8, 24, '#222');
        c.fillRect(26, 62, 8, 24, '#222');
        c.fillRect(12, 18, 14, 4, '#1a1a1a');
        c.fillRect(20, 28, 8, 4, '#f4f1e8');
        if (frame === 2) {
          c.fillRect(22, 36, 8, 6, '#1a120e');
          c.fillRect(34, 30, 8, 3, '#dddddd');
        }
      }
      return c;
    })
  );
}

function drawCleaner() {
  return sheet(
    [0, 1, 2].map((frame) => {
      const c = new Canvas(64, 96);
      const mop = frame === 1 ? -6 : 0;
      c.fillRect(24, 10, 16, 12, SKIN);
      c.fillRect(22, 6, 20, 6, '#d8d0c4');
      c.fillRect(18, 22, 28, 36, '#3a5a8a');
      c.fillRect(20, 58, 10, 26, '#2a2a2a');
      c.fillRect(34, 58, 10, 26, '#2a2a2a');
      c.fillRect(46, 30 + mop, 3, 40, '#8a6a3a');
      c.fillRect(40, 66 + mop, 16, 8, '#c8c8c8');
      if (frame === 2) c.fillRect(28, 18, 8, 3, '#1a120e');
      return c;
    })
  );
}

function drawPigeon() {
  return sheet(
    [0, 1].map((frame) => {
      const c = new Canvas(16, 16);
      c.ellipse(8, 9, 5, 4, '#8a8e94');
      c.fillRect(3, 8, 4, 3, '#6a6e74');
      const hx = frame === 0 ? 11 : 13;
      c.fillRect(hx, 6, 3, 3, '#5a5e64');
      c.set(hx + 1, 7, '#e23b3b');
      c.fillRect(6, 12, 2, 3, '#c8a05a');
      c.fillRect(9, 12, 2, 3, '#c8a05a');
      return c;
    })
  );
}

function drawBubble() {
  const c = new Canvas(24, 24);
  c.fillRect(2, 1, 20, 16, '#f7f1dc');
  c.fillRect(1, 3, 22, 12, '#f7f1dc');
  c.fillRect(2, 1, 20, 1, '#2a241c');
  c.fillRect(2, 16, 20, 1, '#2a241c');
  c.fillRect(1, 3, 1, 12, '#2a241c');
  c.fillRect(22, 3, 1, 12, '#2a241c');
  c.fillRect(10, 17, 4, 2, '#f7f1dc');
  c.fillRect(11, 19, 2, 3, '#f7f1dc');
  c.fillRect(10, 17, 1, 2, '#2a241c');
  c.fillRect(13, 17, 1, 2, '#2a241c');
  return c;
}

function drawLogo() {
  const c = new Canvas(160, 48);
  c.fillRect(0, 0, 160, 48, '#1d4a28');
  c.fillRect(2, 2, 156, 44, '#2f6b3a');
  c.fillRect(8, 8, 16, 32, '#c6d64a');
  c.fillRect(8, 8, 16, 6, '#eef6a4');
  c.fillRect(12, 20, 8, 8, '#f4f1e8');
  const glyph = {
    Я: ['01110', '10001', '10001', '01111', '00101', '01001', '10001'],
    С: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    Е: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    Н: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    К: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    В: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    А: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  };
  const paint = (text, x, y) => {
    let cx = x;
    for (const ch of text) {
      glyph[ch].forEach((row, ry) => {
        [...row].forEach((bit, rx) => {
          if (bit === '1') c.fillRect(cx + rx * 2, y + ry * 2, 2, 2, '#f4f1e8');
        });
      });
      cx += 12;
    }
  };
  paint('ЯСЕН', 32, 8);
  paint('КВАСЕН', 32, 26);
  return c;
}

function drawSkills() {
  const icons = [];
  const draw = (fn) => {
    const c = new Canvas(16, 16);
    fn(c);
    icons.push(c);
  };
  draw((c) => {
    c.ellipse(8, 8, 6, 5, '#e23b3b');
    c.fillRect(5, 6, 6, 2, '#f4f1e8');
  });
  draw((c) => {
    c.ellipse(8, 9, 5, 6, '#e2b48c');
    c.fillRect(6, 4, 4, 3, '#c48a62');
  });
  draw((c) => {
    c.fillRect(2, 8, 12, 6, '#f7f1dc');
    c.fillRect(4, 10, 8, 2, '#2a241c');
  });
  draw((c) => {
    c.fillRect(3, 3, 4, 10, '#c6d64a');
    c.fillRect(7, 7, 7, 2, '#d7c39a');
  });
  draw((c) => {
    c.fillRect(4, 2, 8, 6, SKIN);
    c.fillRect(3, 8, 10, 6, '#2a4a7a');
  });
  draw((c) => {
    c.fillRect(2, 6, 12, 4, '#f4f1e8');
    c.fillRect(6, 3, 4, 10, '#e23b3b');
  });
  return sheet(icons);
}

function build() {
  save('room/base.png', drawRoom());
  save('room/dark.png', vignette());
  for (let level = 1; level <= 9; level++) {
    const frames = level === 3 || level === 6 || level === 7 || level === 9 ? 1 : level === 8 ? 3 : 2;
    const list = [];
    for (let f = 0; f < frames; f++) list.push(drawUpgrade(level, f));
    save(`room/upgrade-${level}.png`, frames === 1 ? list[0] : sheet(list));
  }

  const anchors = {};
  for (let stage = 0; stage < 6; stage++) {
    const frames = [];
    anchors[stage] = [];
    for (let frame = 0; frame < 5; frame++) {
      const drawn = drawBody(stage, frame);
      frames.push(drawn.canvas);
      anchors[stage].push({ neck: drawn.neck, hand: drawn.hand });
    }
    save(`body/belly-${stage}.png`, sheet(frames));
  }
  save('players/_default/head.png', sheet([0, 1, 2, 3].map(drawHead)));
  save('props/can.png', drawCan());
  const pile = drawPile();
  save('props/pile.png', pile.canvas);
  save('props/coach.png', drawCoach());
  save('props/cleaner.png', drawCleaner());
  save('props/pigeon.png', drawPigeon());
  save('props/bubble.png', drawBubble());
  save('props/logo.png', drawLogo());
  save('props/skills.png', drawSkills());

  const pilePosition = [4, 56];
  const pigeonOnPile = pile.tops.map((top) => [pilePosition[0] + 40, pilePosition[1] + top - 8]);
  pigeonOnPile.unshift([pilePosition[0] + 40, pilePosition[1] + 100]);

  const manifest = {
    kitColors: { shirt: SHIRT, shorts: SHORTS, socks: SHIRT },
    players: [],
    body: { cell: [96, 96], frames: 5, anchors },
    head: { cell: [64, 64], frames: 4, neck: [32, 62] },
    playerPosition: [118, 54],
    slots: {
      floor: [
        [6, 146], [24, 154], [42, 158], [60, 146], [78, 156], [96, 158],
        [214, 146], [230, 154], [246, 158], [8, 158], [28, 148], [48, 156],
        [70, 158], [200, 158], [220, 148], [238, 156], [256, 158], [90, 150],
        [108, 158], [188, 152], [176, 158], [258, 150], [16, 156], [262, 146],
      ],
      bench: [
        [104, 96], [120, 94], [210, 94], [226, 96], [240, 94], [112, 100],
      ],
      shelf: [
        [8, 8], [26, 10], [44, 8], [62, 10], [12, 46],
        [30, 58], [48, 46], [20, 70], [40, 78], [58, 66],
      ],
    },
    pilePosition,
    pigeonOnPile,
    coachPosition: [270, 40],
    cleanerPosition: [150, 64],
    can: { cell: [12, 20], frames: 6 },
    pile: { cell: [96, 120], frames: 4 },
    upgradeFrames: { 1: 2, 2: 2, 3: 1, 4: 2, 5: 2, 6: 1, 7: 1, 8: 3, 9: 1 },
  };

  writeFileSync(join(ROOT, 'manifest.json'), JSON.stringify(manifest));
  mkdirSync(dirname(MANIFEST_TS), { recursive: true });
  writeFileSync(
    MANIFEST_TS,
    `import type { TManifest } from './types';\n\nexport const kvasManifest: TManifest = ${JSON.stringify(manifest)};\n`
  );
  console.log('sprites written');
}

build();
