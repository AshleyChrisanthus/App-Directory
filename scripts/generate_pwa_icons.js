const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.resolve(__dirname, '../icons');
fs.mkdirSync(iconsDir, { recursive: true });

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;

  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const radius = isMaskable ? 0 : size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  // Safe zone for maskable icons is 80% (0.1 to 0.9)
  const scale = isMaskable ? 0.75 : 1.0;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      let inShape = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx + 0.5) - (cx - radius));
        const dy = Math.max(0, Math.abs(y - cy + 0.5) - (cy - radius));
        inShape = Math.sqrt(dx * dx + dy * dy) <= radius;
      }

      if (inShape) {
        // Modern dark glassmorphic gradient background
        const grad = (x + y) / (width + height);
        const curR = Math.round(18 + grad * 15);
        const curG = Math.round(20 + grad * 25);
        const curB = Math.round(30 + grad * 50);

        // Center coordinates normalized (-1 to 1)
        const nx = (x - cx) / (cx * scale);
        const ny = (y - cy) / (cy * scale);

        // Folder back tab
        const inBackTab = nx >= -0.65 && nx <= 0.05 && ny >= -0.55 && ny <= -0.25;
        // Main folder body
        const inBody = nx >= -0.65 && nx <= 0.65 && ny >= -0.30 && ny <= 0.52;
        // Accent bar / shine inside folder
        const inAccent = nx >= -0.45 && nx <= 0.45 && ny >= 0.05 && ny <= 0.18;

        if (inAccent) {
          // Vibrant cyan/blue accent
          rawData[offset++] = 10;
          rawData[offset++] = 132;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else if (inBackTab || inBody) {
          // Crisp clean white folder glyph with soft lighting
          const glyphG = Math.round(240 + (1 - ny) * 15);
          rawData[offset++] = 245;
          rawData[offset++] = Math.min(255, glyphG);
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else {
          rawData[offset++] = curR;
          rawData[offset++] = curG;
          rawData[offset++] = curB;
          rawData[offset++] = 255;
        }
      } else {
        // Transparent outside rounded corners
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = chunk.subarray(4, 8 + len);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate PWA Icon suite
const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
  { file: 'favicon-32.png', size: 32, maskable: false }
];

targets.forEach(t => {
  const buf = createPng(t.size, t.maskable);
  const dest = path.join(iconsDir, t.file);
  fs.writeFileSync(dest, buf);
  console.log(`Generated ${t.file} (${t.size}x${t.size}, ${buf.length} bytes)`);
});
