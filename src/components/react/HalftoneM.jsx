import { useEffect, useRef } from "react";

// Word Hunt's letter M drawn in code, in place of m.mp4 (Marta, 13 Nov: "щоб оці точки вони бігали по всьому
// периметру, по цих зіг загах ... плавно перетікали від одного краю до іншого, і навпаки ... на луп ... м'яка,
// органічна ... мікроорганізм ... живе і дихає"). Her solid M (her M.svg) with its halftone shadow as in her video
// (see LAP below, 14 Nov).
// Drawn in the video's 720 x 782 frame, where her M stood (85-635 across, from 122 down), and cut to its box the
// way the video was (object-cover), so nothing around it moves.
const FRAME_W = 720;
const FRAME_H = 782;
const M_X = 85;
const M_Y = 122;
const M_W = 550;
// her M.svg (13 Nov, 246 x 227), from the left foot up and round, as a share of its width
const SVG_W = 245.178;
const SHAPE = [
  [0, 226.182], [0, 0], [68.9751, 0], [121.263, 151.966], [123.914, 151.966], [176.202, 0], [245.178, 0],
  [245.178, 226.182], [198.793, 226.182], [198.793, 78.9648], [196.915, 78.9648], [148.382, 225.077],
  [96.7958, 225.077], [48.2624, 78.4126], [46.3849, 78.4126], [46.3849, 226.182],
].map(([x, y]) => [x / SVG_W, y / SVG_W]);
const PITCH = 9; // the dot grid, turned 45° like a print screen
const R_MAX = PITCH / 2;
const REACH = 150; // the farthest a dot can ever be lit
const TAU = Math.PI * 2;
// 14 Nov (Marta: "Анімація для букви М має бути така, як була, але вона перетікає по всьому периметру букви, від
// одного краю до іншого. І так по колу... у мене повільні ритми анімації"): as in her m.mp4, the dots are the M's
// soft shadow cast down and a little right (nothing above the letter), dense against it and thinning out. A slow
// swell runs round the whole outline in one direction, one lap every LAP seconds, with a fainter one half a lap behind.
const OFF_X = 12;
const OFF_Y = 44;
const SHADE = 0.66; // the shadow at its darkest: dots, never solid black
const LAP = 16;
// in her video the shadow is light at the top of the letter and deepest at its feet; the swell still shows on the
// way round the top, fainter
const M_H = (226.182 / SVG_W) * M_W;
const ramp = (y) => {
  const u = Math.min(1, Math.max(0, (y - (M_Y + 0.2 * M_H)) / (0.65 * M_H)));
  return u * u * (3 - 2 * u);
};

let GEO = null;
function geometry() {
  if (GEO) return GEO;
  const P = SHAPE.map(([x, y]) => [M_X + x * M_W, M_Y + y * M_W]);
  const edges = [];
  let L = 0;
  for (let i = 0; i < P.length; i++) {
    const [ax, ay] = P[i];
    const [bx, by] = P[(i + 1) % P.length];
    const len = Math.hypot(bx - ax, by - ay);
    edges.push({ ax, ay, dx: bx - ax, dy: by - ay, len, s0: L });
    L += len;
  }
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i];
      const [xj, yj] = P[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  // each dot is measured against the shadow (the M moved down-right): its distance to each nearby side of it and the
  // place on the outline it faces; a dot inside the shadow is full
  const xs = [], ys = [], first = [], d = [], s = [], full = [];
  for (let j = 0; j * (PITCH / 2) <= FRAME_H + PITCH; j++) {
    const y = j * (PITCH / 2);
    for (let x = (j % 2) * (PITCH / 2); x <= FRAME_W + PITCH; x += PITCH) {
      if (inside(x, y)) continue;
      const qx = x - OFF_X;
      const qy = y - OFF_Y;
      const at = d.length;
      for (const e of edges) {
        const t = Math.min(1, Math.max(0, ((qx - e.ax) * e.dx + (qy - e.ay) * e.dy) / (e.len * e.len)));
        const dist = Math.hypot(qx - (e.ax + t * e.dx), qy - (e.ay + t * e.dy));
        if (dist >= REACH) continue;
        d.push(dist);
        s.push(e.s0 + t * e.len);
      }
      if (d.length > at) {
        xs.push(x);
        ys.push(y);
        first.push(at);
        full.push(inside(qx, qy) ? 1 : 0);
      }
    }
  }
  first.push(d.length);
  GEO = {
    P, L,
    x: Float32Array.from(xs), y: Float32Array.from(ys), first: Uint32Array.from(first), full: Uint8Array.from(full),
    d: Float32Array.from(d), s: Float32Array.from(s),
  };
  return GEO;
}

function draw(ctx, g, t, W, H) {
  const scale = Math.max(W / FRAME_W, H / FRAME_H);
  const ox = (W - FRAME_W * scale) / 2;
  const oy = (H - FRAME_H * scale) / 2;
  const { P, L, x, y, first, full, d, s } = g;
  const breath = 1 + 0.08 * Math.sin((TAU * t) / 7); // a slow breath
  const p1 = ((t / LAP) % 1) * L; // once round the outline every LAP s, always the same way
  const sig = L * 0.11;
  const near = (sv, p) => {
    const a = ((((sv - p) % L) + 1.5 * L) % L - L / 2) / sig; // the outline is closed: measured round it
    return Math.exp(-a * a);
  };
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  for (let i = 0; i < x.length; i++) {
    // how much of the soft shadow covers this dot: half at the shadow's outline, more inside it, fading outside
    const inShadow = full[i] === 1;
    let best = inShadow ? 1 : 0;
    let at = 0;
    for (let m = first[i]; m < first[i + 1]; m++) {
      const sv = s[m];
      const swell = near(sv, p1) + 0.45 * near(sv, p1 + L / 2);
      const soft = (44 * breath + 34 * swell) * (1 + 0.06 * Math.sin(sv * 0.009 - t * 0.5));
      const c = inShadow ? 0.5 + d[m] / (2 * soft) : 0.5 - d[m] / (2 * soft);
      if (inShadow ? c < best : c > best) {
        best = c;
        at = swell;
      }
    }
    best = SHADE * Math.min(1, best) * Math.max(ramp(y[i]), 0.7 * Math.min(1, at));
    if (best <= 0.02) continue;
    // a printed halftone: the dot's area follows the cover, so the dots are thick against the letter and thin out
    // into single small dots, as in her video
    const r = R_MAX * 1.2 * Math.sqrt(best) * scale;
    if (r < 0.35) continue;
    const cx = ox + x[i] * scale;
    const cy = oy + y[i] * scale;
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, TAU);
  }
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.beginPath();
  P.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, ox + px * scale, oy + py * scale));
  ctx.closePath();
  ctx.fill();
}

// Moves only while on screen; with reduced motion it stays one still frame.
export default function HalftoneM({ label = "Letter M", className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const g = geometry();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let W = 0, H = 0, raf = 0, on = false;
    const now = () => (performance.now() - t0) / 1000;
    const frame = () => {
      if (W && H) draw(ctx, g, now(), W, H);
      if (on) raf = requestAnimationFrame(frame);
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(cv.clientWidth * dpr);
      H = Math.round(cv.clientHeight * dpr);
      if (!W || !H) return;
      cv.width = W;
      cv.height = H;
      draw(ctx, g, now(), W, H);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on && !still) {
        on = true;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && on) {
        on = false;
        cancelAnimationFrame(raf);
      }
    }, { rootMargin: "100px" });
    io.observe(cv);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  return <canvas ref={ref} role="img" aria-label={label} className={`bg-white ${className}`} style={style} />;
}
