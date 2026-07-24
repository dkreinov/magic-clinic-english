import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "assets", "delight");
const OUT = path.resolve(__dirname, "..", "public", "assets");

const WIDTHS = {
  "hero-clinic": 960,
  "chapter-clinic": 960,
  "chapter-forest": 960,
  "chapter-night": 960,
  "celebration": 960,
  "heroine": 640,
  "placement-friend": 640,
  "words-treasure": 640,
};
const QUALITY = 72;

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const name of Object.keys(WIDTHS).sort()) {
    const src = path.join(SRC, name + ".png");
    const out = path.join(OUT, name + ".webp");
    await sharp(src)
      .resize({ width: WIDTHS[name], withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(out);
    console.log("wrote", out);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
