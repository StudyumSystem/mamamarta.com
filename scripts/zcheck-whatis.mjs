// One-off: her 16 Nov What is layers (Figma exports at 2x, in public/assets) to webp, and a look at their alpha.
import sharp from "sharp";
const A = "public/assets/";
for (const name of ["what-is-cable-right", "what-is-cable-left", "what-is-m", "what-is-m-phone-2", "what-is-cable-top-phone-2", "what-is-cable-bottom-phone-2"]) {
  const src = A + name + ".png";
  const m = await sharp(src).metadata();
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (fx, fy) => { const x = Math.round(info.width * fx), y = Math.round(info.height * fy); const i = (y * info.width + x) * 4; return [...data.slice(i, i + 4)].join(","); };
  await sharp(src).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(A + name + ".webp");
  const o = await sharp(A + name + ".webp").metadata();
  console.log(name, m.width + "x" + m.height, "alpha", m.hasAlpha, "corner", px(0.002, 0.002), "at 15%,50%", px(0.15, 0.5), "at 50%,50%", px(0.5, 0.5), "webp bytes", o.size);
}
