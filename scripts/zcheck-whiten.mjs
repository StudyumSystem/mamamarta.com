// Temporary (not committed): the near-white background of a picture (250-254, connected to its outer edge) made
// pure #FFFFFF; everything else (the object, its inner highlights) untouched. Run: node scripts/zcheck-whiten.mjs a.png ...
import sharp from "sharp";
import fs from "node:fs";

for (const f of process.argv.slice(2)) {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // the value a visitor sees on the white page
  const seen = (p) => { const i = p * 4, a = data[i + 3] / 255; return Math.min(data[i], data[i + 1], data[i + 2]) * a + 255 * (1 - a); };
  const mark = new Uint8Array(W * H);
  const stack = [];
  const push = (p) => { if (!mark[p] && seen(p) >= 250) { mark[p] = 1; stack.push(p); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    if (x > 0) push(p - 1); if (x < W - 1) push(p + 1); if (y > 0) push(p - W); if (y < H - 1) push(p + W);
  }
  let changed = 0;
  for (let p = 0; p < W * H; p++) if (mark[p]) {
    const i = p * 4;
    if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 255) changed++;
    data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 255;
  }
  const before = fs.statSync(f).size;
  const buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(f, buf);
  console.log(f, `${W}x${H}`, "pixels made white", changed, "size", before, "->", buf.length);
}
