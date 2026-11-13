import { useEffect, useRef } from "react";

// Word Hunt's letter M drawn in code, in place of m.mp4 (Marta, 13 Nov: "щоб оці точки вони бігали по всьому
// периметру, по цих зіг загах ... плавно перетікали від одного краю до іншого, і навпаки ... на луп ... м'яка,
// органічна ... мікроорганізм ... живе і дихає"). Her solid M (traced from her picture of 13 Nov 21:53; her SVG
// replaces SHAPE when it comes) with a halftone halo of dots round its whole outline: the halo breathes, two swells
// run along the outline from one foot to the other and back, and it hangs heavier below, as in her video.
// Drawn in the video's 720 x 782 frame, where her M stood (85-635 across, from 122 down), and cut to its box the
// way the video was (object-cover), so nothing around it moves.
const FRAME_W = 720;
const FRAME_H = 782;
const M_X = 85;
const M_Y = 122;
const M_W = 550;
// her M as a share of its width, from the left foot up and round
const SHAPE = [
  [0, 0.922], [0, 0], [0.278, 0], [0.497, 0.622], [0.719, 0], [1, 0], [1, 0.922], [0.811, 0.922],
  [0.811, 0.319], [0.603, 0.922], [0.394, 0.922], [0.189, 0.319], [0.189, 0.922],
];
const PITCH = 10.6; // the dot grid, turned 45° like a print screen
const R_MAX = PITCH / 2;
const REACH = 160; // the farthest a dot can ever be lit
const TAU = Math.PI * 2;

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
  // every dot keeps its distance to each nearby side, the place on the outline it faces and how far below it is,
  // so a dot between two sides takes the stronger of the two and the halo never shows a seam
  const xs = [], ys = [], first = [], d = [], s = [], down = [], right = [];
  for (let j = 0; j * (PITCH / 2) <= FRAME_H + PITCH; j++) {
    const y = j * (PITCH / 2);
    for (let x = (j % 2) * (PITCH / 2); x <= FRAME_W + PITCH; x += PITCH) {
      if (inside(x, y)) continue;
      const at = d.length;
      for (const e of edges) {
        const t = Math.min(1, Math.max(0, ((x - e.ax) * e.dx + (y - e.ay) * e.dy) / (e.len * e.len)));
        const nx = e.ax + t * e.dx;
        const ny = e.ay + t * e.dy;
        const dist = Math.hypot(x - nx, y - ny);
        if (dist >= REACH) continue;
        d.push(dist);
        s.push(e.s0 + t * e.len);
        down.push(dist ? (y - ny) / dist : 0);
        right.push(dist ? (x - nx) / dist : 0);
      }
      if (d.length > at) {
        xs.push(x);
        ys.push(y);
        first.push(at);
      }
    }
  }
  first.push(d.length);
  GEO = {
    P, L,
    x: Float32Array.from(xs), y: Float32Array.from(ys), first: Uint32Array.from(first),
    d: Float32Array.from(d), s: Float32Array.from(s), down: Float32Array.from(down), right: Float32Array.from(right),
  };
  return GEO;
}

function draw(ctx, g, t, W, H) {
  const scale = Math.max(W / FRAME_W, H / FRAME_H);
  const ox = (W - FRAME_W * scale) / 2;
  const oy = (H - FRAME_H * scale) / 2;
  const { P, L, x, y, first, d, s, down, right } = g;
  const breath = 1 + 0.14 * Math.sin((TAU * t) / 4.2); // a slow breath
  const k = (1 - Math.cos((TAU * t) / 9)) / 2; // 0 → 1 → 0 every 9 s: one foot to the other and back
  const p1 = k * L;
  const p2 = (1 - k) * L; // the second swell runs the other way
  const sig = L * 0.09;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  for (let i = 0; i < x.length; i++) {
    let best = 0;
    for (let m = first[i]; m < first[i + 1]; m++) {
      const sv = s[m];
      const a = (sv - p1) / sig;
      const b = (sv - p2) / sig;
      const swell = Math.exp(-a * a) + 0.7 * Math.exp(-b * b);
      const wobble = 1 + 0.16 * Math.sin(sv * 0.0105 - t * 1.1) * Math.sin(sv * 0.0041 + t * 0.7);
      // heavier below, a little lighter on the left (the slider's edge cuts the box there on the computer)
      const spread = (20 * breath + 42 * swell) * wobble * (1 + 0.6 * down[m] + 0.3 * right[m]);
      const f = 1 - d[m] / spread;
      if (f > best) best = f;
    }
    if (best <= 0) continue;
    // never quite touching, so it reads as dots, not as a fatter letter
    const r = R_MAX * 0.9 * Math.pow(best, 1.2) * (1 + 0.08 * Math.sin(t * 1.9 + x[i] * 0.37 + y[i] * 0.53)) * scale;
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
