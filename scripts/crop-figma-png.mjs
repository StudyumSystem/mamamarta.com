// Cut a picture out of a frame Marta exported from Figma (PNG at 2x) and save it as webp.
// node scripts/crop-figma-png.mjs <in.png> <out.webp> <left> <top> <width> <height> [cleanTop cleanBottom]
// cleanTop/cleanBottom (rows of the cut, optional): rows to rebuild from the rows just above and below,
// for menu text that sits on top of the picture in the frame.
import sharp from 'sharp';

const [input, output, left, top, width, height, cleanTop, cleanBottom] = process.argv.slice(2);
const { data, info } = await sharp(input)
  .extract({ left: +left, top: +top, width: +width, height: +height })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

if (cleanTop !== undefined) {
  const w = info.width, ch = info.channels;
  const a = +cleanTop - 1, b = +cleanBottom + 1;
  for (let y = a + 1; y < b; y++) {
    const t = (y - a) / (b - a);
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < ch; c++) {
        const top = data[(a * w + x) * ch + c], bottom = data[(b * w + x) * ch + c];
        data[(y * w + x) * ch + c] = Math.round(top + (bottom - top) * t);
      }
    }
  }
}

await sharp(data, { raw: info }).webp({ quality: 92 }).toFile(output);
console.log('saved', output, info.width + 'x' + info.height);
