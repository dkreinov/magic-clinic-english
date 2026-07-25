import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "assets", "delight", "app-icon.png");
const OUT = path.resolve(__dirname, "..", "public", "icons");

const MASKABLE_BACKGROUND = "#2e1806";

async function main() {
  await mkdir(OUT, { recursive: true });

  const icon192 = path.join(OUT, "icon-192.png");
  await sharp(SRC)
    .resize(192, 192, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(icon192);
  console.log("wrote", icon192);

  const icon512 = path.join(OUT, "icon-512.png");
  await sharp(SRC)
    .resize(512, 512, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(icon512);
  console.log("wrote", icon512);

  const iconMaskable512 = path.join(OUT, "icon-maskable-512.png");
  await sharp(SRC)
    .resize(410, 410, { fit: "cover" })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: MASKABLE_BACKGROUND,
    })
    .png({ compressionLevel: 9 })
    .toFile(iconMaskable512);
  console.log("wrote", iconMaskable512);
}

main().catch((err) => { console.error(err); process.exit(1); });
