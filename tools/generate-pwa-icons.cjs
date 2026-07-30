const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const publicIcons = path.join(__dirname, "..", "public", "icons");
const publicRoot = path.join(__dirname, "..", "public");
const appDir = path.join(__dirname, "..", "src", "app");
fs.mkdirSync(publicIcons, { recursive: true });

function svgBuffer(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#003459"/>
  <path d="M128 96h48v320h-48V96zm208 0h48v320h-48V96zM416 128v48H96v-48h320zM96 384v-48h320v48H96z" fill="#ffffff"/>
</svg>`;
  return Buffer.from(svg);
}

/** Minimal multi-size ICO (PNG-compressed frames). */
function pngsToIco(pngBuffersWithSize) {
  const count = pngBuffersWithSize.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = pngBuffersWithSize.map(({ png, size }) => {
    const entry = { png, size, offset, bytes: png.length };
    offset += png.length;
    return entry;
  });
  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);
  let entryOffset = 6;
  for (const entry of entries) {
    buf.writeUInt8(entry.size >= 256 ? 0 : entry.size, entryOffset);
    buf.writeUInt8(entry.size >= 256 ? 0 : entry.size, entryOffset + 1);
    buf.writeUInt8(0, entryOffset + 2);
    buf.writeUInt8(0, entryOffset + 3);
    buf.writeUInt16LE(1, entryOffset + 4);
    buf.writeUInt16LE(32, entryOffset + 6);
    buf.writeUInt32LE(entry.bytes, entryOffset + 8);
    buf.writeUInt32LE(entry.offset, entryOffset + 12);
    entry.png.copy(buf, entry.offset);
    entryOffset += 16;
  }
  return buf;
}

async function main() {
  const sizes = [192, 256, 384, 512];
  for (const size of sizes) {
    await sharp(svgBuffer(size))
      .png()
      .toFile(path.join(publicIcons, `icon-${size}.png`));
    const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#003459"/>
  <g transform="translate(96 96) scale(0.625)">
    <path d="M128 96h48v320h-48V96zm208 0h48v320h-48V96zM416 128v48H96v-48h320zM96 384v-48h320v48H96z" fill="#ffffff"/>
  </g>
</svg>`;
    await sharp(Buffer.from(maskable))
      .png()
      .toFile(path.join(publicIcons, `maskable-${size}.png`));
  }

  const apple = await sharp(svgBuffer(180)).png().toBuffer();
  await fs.promises.writeFile(
    path.join(publicIcons, "apple-touch-icon.png"),
    apple,
  );
  await fs.promises.writeFile(path.join(appDir, "apple-icon.png"), apple);

  const favSizes = [16, 32, 48];
  const favEntries = [];
  for (const size of favSizes) {
    const png = await sharp(svgBuffer(size)).png().toBuffer();
    favEntries.push({ png, size });
    await fs.promises.writeFile(
      path.join(publicIcons, `favicon-${size}.png`),
      png,
    );
  }

  const ico = pngsToIco(favEntries);
  await fs.promises.writeFile(path.join(publicRoot, "favicon.ico"), ico);
  await fs.promises.writeFile(path.join(appDir, "favicon.ico"), ico);
  await fs.promises.writeFile(path.join(appDir, "icon.png"), favEntries[1].png);

  console.log(
    "PWA + favicon assets written to public/icons, public/, and src/app/",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
