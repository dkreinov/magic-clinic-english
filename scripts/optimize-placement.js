import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "assets", "placement");
const OUT = path.resolve(__dirname, "..", "public", "assets", "placement");

const LEMMAS = [
  "pet",
  "mom",
  "camp",
  "fan",
  "dad",
  "desk",
  "singer",
  "horse",
  "zoo",
  "movie",
  "monkey",
  "steak",
];
const WIDTH = 256;
const QUALITY = 72;

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const name of LEMMAS) {
    const src = path.join(SRC, name + ".png");
    const out = path.join(OUT, name + ".webp");
    await sharp(src)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(out);
    console.log("wrote", out);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
