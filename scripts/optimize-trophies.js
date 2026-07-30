import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "assets", "delight", "trophies");
const OUT = path.resolve(__dirname, "..", "public", "assets", "trophies");

// The 8 signed trophy ids (lib/profile.js TROPHY_CATALOG) plus the shelf header.
// Square masters in, square 640 derivatives out (design T6). NOT precached.
const NAMES = [
  "chapters",
  "days",
  "streak",
  "known",
  "quizRight",
  "quizzer",
  "curious",
  "proven",
  "shelf-header",
];
const WIDTH = 640;
const QUALITY = 72;

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const name of NAMES) {
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
