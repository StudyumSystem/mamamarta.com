import { useEffect, useRef } from "react";

// Word Hunt's letter M drawn in code, in place of m.mp4 (Marta, 13 Nov: "щоб оці точки вони бігали по всьому
// периметру, по цих зіг загах ... плавно перетікали від одного краю до іншого, і навпаки ... на луп ... м'яка,
// органічна ... мікроорганізм ... живе і дихає"). Her M (her M.svg) dissolving into halftone as in her video
// (see SOFT_MAX below, 14 Nov).
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
const RB = 4.9; // a dot's radius at full cover (from 4.5 the dots close into solid black)
const DOT_T = PITCH / Math.SQRT2 / 2; // neighbouring dots touch
const DOT_A = Math.sqrt((PITCH * PITCH) / 2 / Math.PI); // a dot covering its whole cell's area
const REACH = 115; // the farthest a dot can ever be lit
const TAU = Math.PI * 2;
// 14 Nov (Marta: "Анімація для букви М має бути така, як була, але вона перетікає по всьому периметру букви, від
// одного краю до іншого. І так по колу... у мене повільні ритми анімації"; her phone frame MM-HOME-002 and the
// first frame of her m.mp4): the letter is crisp at the top and DISSOLVES into halftone towards its feet: inside it
// white holes open, outside it dots spread, as if the M were blurred more and more downwards and printed. A slow
// swell of that dissolve runs round the whole outline in one direction, one lap every LAP seconds, with a fainter
// one half a lap behind; it also passes the top edge, lighter, then the edge is crisp again.
const SOFT_MAX = 65; // how far the feet dissolve (her video: the cloud about 40 px past the letter)
const SWELL = 40;
const LAP = 16;
const M_H = (226.182 / SVG_W) * M_W;
// crisp down to 30% of the letter, fully dissolved at its feet
const Y_CRISP = M_Y + 0.3 * M_H;
const ramp = (y) => {
  const u = Math.min(1, Math.max(0, (y - Y_CRISP) / (0.7 * M_H)));
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
  // one grid of dots inside and outside the letter, so the dissolving part is one even print with no outline left
  // in it. Each dot is measured against every nearby side of the letter: its distance and the place on the outline
  // it faces. Inside, only below the crisp part (above it the letter is drawn solid).
  const points = (inner) => {
    const xs = [], ys = [], first = [], d = [], s = [];
    for (let j = 0; j * (PITCH / 2) <= FRAME_H + PITCH; j++) {
      const y = j * (PITCH / 2);
      if (inner && y < Y_CRISP) continue;
      for (let x = (j % 2) * (PITCH / 2); x <= FRAME_W + PITCH; x += PITCH) {
        if (inside(x, y) !== inner) continue;
        const at = d.length;
        for (const e of edges) {
          const t = Math.min(1, Math.max(0, ((x - e.ax) * e.dx + (y - e.ay) * e.dy) / (e.len * e.len)));
          const dist = Math.hypot(x - (e.ax + t * e.dx), y - (e.ay + t * e.dy));
          if (dist >= REACH) continue;
          d.push(dist);
          s.push(e.s0 + t * e.len);
        }
        if (d.length > at) {
          xs.push(x);
          ys.push(y);
          first.push(at);
        }
      }
    }
    first.push(d.length);
    return {
      x: Float32Array.from(xs), y: Float32Array.from(ys), first: Uint32Array.from(first),
      d: Float32Array.from(d), s: Float32Array.from(s),
    };
  };
  GEO = { P, L, out: points(false), inn: points(true) };
  return GEO;
}

function draw(ctx, g, t, W, H) {
  const scale = Math.max(W / FRAME_W, H / FRAME_H);
  const ox = (W - FRAME_W * scale) / 2;
  const oy = (H - FRAME_H * scale) / 2;
  const { P, L, out, inn } = g;
  const breath = 1 + 0.1 * Math.sin((TAU * t) / 7); // a slow breath
  const p1 = ((t / LAP) % 1) * L; // once round the outline every LAP s, always the same way
  const sig = L * 0.11;
  const near = (sv, p) => {
    const a = ((((sv - p) % L) + 1.5 * L) % L - L / 2) / sig; // the outline is closed: measured round it
    return Math.exp(-a * a);
  };
  // how much of the dissolving letter covers a point: half on its outline, more inside, fading outside; crisp
  // (all or nothing) where it doesn't dissolve
  const cover = (set, i, inner) => {
    const r = ramp(set.y[i]);
    let best = inner ? 1 : 0;
    for (let m = set.first[i]; m < set.first[i + 1]; m++) {
      const sv = set.s[m];
      const swell = near(sv, p1) + 0.45 * near(sv, p1 + L / 2);
      const soft = (SOFT_MAX * r * breath + SWELL * swell * (0.35 + 0.65 * r)) * (1 + 0.06 * Math.sin(sv * 0.009 - t * 0.5));
      if (soft < 1) continue;
      const c = inner ? 0.5 + set.d[m] / (2 * soft) : 0.5 - set.d[m] / (2 * soft);
      if (inner ? c < best : c > best) best = c;
    }
    return best;
  };
  // a printed halftone: a dot's area follows the cover; full dots overlap into solid black, and as the cover drops
  // white opens between them
  const dots = (set, inner) => {
    for (let i = 0; i < set.x.length; i++) {
      const c = cover(set, i, inner);
      if (c <= 0.03) continue;
      // the share of the cell the dot covers is the cover: apart up to 0.785 (dots touching), then they close up
      const r = (c <= 0.785 ? DOT_A * Math.sqrt(c) : DOT_T + ((Math.min(1, c) - 0.785) / 0.215) * (RB - DOT_T)) * scale;
      if (r < 0.35) continue;
      const cx = ox + set.x[i] * scale;
      const cy = oy + set.y[i] * scale;
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
    }
  };
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  // the crisp top of the letter, solid
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, oy + Y_CRISP * scale);
  ctx.clip();
  ctx.beginPath();
  P.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, ox + px * scale, oy + py * scale));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  dots(inn, true);
  dots(out, false);
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
