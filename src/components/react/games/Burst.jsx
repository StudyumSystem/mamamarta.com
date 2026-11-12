import React, { useMemo } from "react";

// Round confetti thrown out from one point (Memory Match's firework, 11 Nov; 12 Nov, Marta: more of it, in
// Mamamarta pink and black, and a short finish for every game). The parent must be position: relative.
// rings: [{ n, reach, size, delay }] in px / ms; each piece flies out up to `reach` and drops a little (fall).
export const PINK_BLACK = ["#F600A9", "#000000"];

export default function Burst({ x = "50%", y = "50%", rings, colors = PINK_BLACK, fall, dur }) {
  const sparks = useMemo(() => {
    const out = [];
    rings.forEach(({ n, reach, size, delay = 0 }) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const r = reach * (0.55 + Math.random() * 0.45);
        out.push({
          dx: `${Math.cos(a) * r}px`,
          dy: `${Math.sin(a) * r}px`,
          s: `${size * (0.7 + Math.random() * 0.6)}px`,
          c: colors[Math.floor(Math.random() * colors.length)],
          delay: `${delay + Math.random() * 90}ms`,
        });
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span
      className="pointer-events-none absolute z-10 block h-0 w-0"
      style={{ left: x, top: y, "--fall": fall, "--dur": dur }}
      aria-hidden="true"
    >
      {sparks.map((p, i) => (
        <span key={i} className="mm-spark" style={{ "--dx": p.dx, "--dy": p.dy, "--s": p.s, "--c": p.c, "--delay": p.delay }} />
      ))}
    </span>
  );
}
