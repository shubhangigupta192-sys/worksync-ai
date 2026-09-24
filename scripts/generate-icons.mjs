// Generates PWA icons (indigo→purple gradient with a white "W" mark) as real
// PNGs using only Node's zlib — no image dependencies. Run: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makeIcon(size, { maskable = false } = {}) {
  const S = size;
  const pad = maskable ? Math.round(S * 0.18) : 0; // safe zone for maskable
  const hasAlpha = true;
  const bpp = 4;

  // Physical pixels
  const w = S, h = S;
  const raw = Buffer.alloc(h * (1 + w * bpp));

  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  // indigo #6366f1 -> purple #9333ea diagonal gradient
  const c1 = [99, 102, 241], c2 = [147, 51, 234];

  // Letter W bounding box (fractions of the icon content box)
  const bx0 = 0.22, bx1 = 0.78, by0 = 0.34, by1 = 0.70;
  // Strokes: four diagonal bars forming a W (thickness ~0.085 of box)
  const th = 0.09;

  // Precompute row starts for speed
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0; // filter type 0
    const fy = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const fx = x / (w - 1);
      const t = Math.min(1, Math.max(0, (fx + fy) / 2));

      // Content box (accounts for maskable padding)
      const cx0 = pad / S, cx1 = (S - pad) / S;
      const u = (fx - cx0) / (cx1 - cx0); // 0..1 in content box
      const v = (fy - cx0) / (cx1 - cx0);

      let inside = false;
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
        // W strokes as a set of |diagonal equations|
        // Left arm down: from (0.05,0) to (0.35,1) ; Right arm up: mirrored; middle peak
        const inStroke = (u, v, x0, y0, x1, y1) => {
          // distance from point to segment line within thickness
          const dx = x1 - x0, dy = y1 - y0;
          const L2 = dx * dx + dy * dy;
          let tproj = ((u - x0) * dx + (v - y0) * dy) / L2;
          tproj = Math.min(1, Math.max(0, tproj));
          const px = x0 + tproj * dx, py = y0 + tproj * dy;
          const dist = Math.hypot(u - px, v - py);
          return dist <= th;
        };
        inside =
          inStroke(u, v, 0.10, 0.05, 0.32, 0.95) ||
          inStroke(u, v, 0.32, 0.95, 0.50, 0.40) ||
          inStroke(u, v, 0.50, 0.40, 0.68, 0.95) ||
          inStroke(u, v, 0.68, 0.95, 0.90, 0.05);
      }

      if (inside) {
        raw[o++] = 255; raw[o++] = 255; raw[o++] = 255; raw[o++] = 255;
      } else {
        raw[o++] = lerp(c1[0], c2[0], t);
        raw[o++] = lerp(c1[1], c2[1], t);
        raw[o++] = lerp(c1[2], c2[2], t);
        raw[o++] = 255;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), makeIcon(size));
}
writeFileSync(join(outDir, 'icon-maskable-512.png'), makeIcon(512, { maskable: true }));
console.log('Icons written to public/icons/');
