import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPNG(width, height, r, g, b, isMaskable = false) {
  // Creates a crisp valid PNG image with Audible dark background and amber headphone logo
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const headRadius = width * 0.28;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0f172a (dark navy slate)
      let pr = 15, pg = 23, pb = 42, pa = 255;

      // Squircle background corner mask if not maskable
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
        if (qx * qx + qy * qy > cornerR * cornerR) {
          pr = 0; pg = 0; pb = 0; pa = 0;
        }
      }

      if (pa > 0) {
        // Headphone arch: ring around center
        const archDist = Math.abs(dist - headRadius);
        if (archDist < width * 0.045 && dy < width * 0.05) {
          // Warm amber #f59e0b
          pr = 245; pg = 158; pb = 11; pa = 255;
        }
        // Ear cushions (left and right rects)
        if (Math.abs(dx) > width * 0.24 && Math.abs(dx) < width * 0.32 && dy >= -width * 0.02 && dy <= width * 0.18) {
          pr = 245; pg = 158; pb = 11; pa = 255;
          // Inner detail
          if (Math.abs(dx) > width * 0.26 && Math.abs(dx) < width * 0.30 && dy >= width * 0.02 && dy <= width * 0.14) {
            pr = 15; pg = 23; pb = 42; pa = 255;
          }
        }
        // Book shape in center
        if (Math.abs(dx) < width * 0.16 && dy > width * 0.04 && dy < width * 0.22) {
          pr = 255; pg = 255; pb = 255; pa = 240;
          if (Math.abs(dx) < width * 0.015) {
            pr = 15; pg = 23; pb = 42; pa = 255;
          }
        }
        // Soundwave ripples
        if (dy < -width * 0.02 && dy > -width * 0.18 && Math.abs(dx) < width * 0.18) {
          const waveDist = Math.abs(Math.sqrt(dx * dx + (dy + width * 0.04) * (dy + width * 0.04)) - width * 0.1);
          if (waveDist < width * 0.02) {
            pr = 234; pg = 88; pb = 12; pa = 230; // Orange wave
          }
        }
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: deflate
  ihdr[11] = 0; // Filter: standard
  ihdr[12] = 0; // Interlace: none

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC calculation
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      const byte = buf[i];
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, 15, 23, 42, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, 15, 23, 42, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 15, 23, 42, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, 15, 23, 42, false));

console.log('Icons generated successfully!');
