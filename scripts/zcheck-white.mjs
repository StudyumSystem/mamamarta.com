// Edge check: is every poster / picture pure #FFFFFF along its outer 2 px?
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const files = [];
for (const d of ["public/assets", "public/assets/games"])
  for (const f of fs.readdirSync(d)) if (/-phone-poster\.webp$|\.png$/.test(f)) files.push(path.join(d, f));

for (const f of files) {
  const { data, info } = await sharp(f).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, c = info.channels;
  const px = (x, y) => { const i = (y * W + x) * c; return Math.min(data[i], data[i + 1], data[i + 2]); };
  let n = 0, tot = 0, min = 255;
  const look = (x, y) => { tot++; const v = px(x, y); if (v < 255) { n++; min = Math.min(min, v); } };
  for (let x = 0; x < W; x++) for (const y of [0, 1, H - 2, H - 1]) look(x, y);
  for (let y = 0; y < H; y++) for (const x of [0, 1, W - 2, W - 1]) look(x, y);
  console.log(f, `${W}x${H}`, "edge not white", `${((100 * n) / tot).toFixed(1)}%`, "darkest", min);
}
