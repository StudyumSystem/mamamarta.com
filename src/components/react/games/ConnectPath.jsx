import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen } from "./GameModal.jsx";
import { pad2, takeQuote, recordStars, ROUND_STARS } from "./shared.js";
import { play } from "./sound.js";

// MM-GAME-05 Connect the Path (Marta's spec): 15 dots on an invisible grid, one pink start.
// Each round is a random self-avoiding path of 15 cells (so it always has a solution); only the dots are shown.
// Drag or tap from dot to neighbouring dot, across or down; choosing the previous dot steps back.
const DOTS = 15;
const BOARD = 6; // the path is drawn inside a 6x6 field, then cropped to its own size
const UNIT = 100; // SVG units between two neighbouring dots
const R = 19.5; // dot radius (Figma: 45px dots, 115px apart at 1920)
const PINK = "#F600A9";
// 11 Nov (her MM-G05-02 / -04): a counter "03 / 15" while playing, Stars only for the finished shape, and the
// score screen says "New personal best" — read here as the fastest finish on this device (question for Marta).
const BEST_KEY = "mm-connect-the-path-best";
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; } };
const writeBest = (ms) => { try { localStorage.setItem(BEST_KEY, String(ms)); } catch { /* this visit only */ } };
const DARK = "#1a0010";
const mix = (a, b, t) => {
  const ch = (h, i) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t)).join(",")})`;
};
const INSTRUCTIONS = "Connect all the dots in one continuous path. Don't skip a dot. Complete the shape to finish the game.";

const STEPS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

function walk() {
  const start = [Math.floor(Math.random() * BOARD), Math.floor(Math.random() * BOARD)];
  const path = [start];
  const seen = new Set([start.join(",")]);
  const grow = () => {
    if (path.length === DOTS) return true;
    const [r, c] = path[path.length - 1];
    const options = STEPS.map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < BOARD && nc < BOARD && !seen.has(`${nr},${nc}`))
      .sort(() => Math.random() - 0.5);
    for (const cell of options) {
      path.push(cell); seen.add(cell.join(","));
      if (grow()) return true;
      path.pop(); seen.delete(cell.join(","));
    }
    return false;
  };
  return grow() ? path : null;
}

const turns = (p) => p.slice(2).filter((cell, i) => (cell[0] - p[i][0] !== 0) && (cell[1] - p[i][1] !== 0)).length;

let lastLayout = "";
function newLayout() {
  for (let attempt = 0; attempt < 500; attempt++) {
    const p = walk();
    if (!p) continue;
    const rows = p.map((x) => x[0]), cols = p.map((x) => x[1]);
    const r0 = Math.min(...rows), c0 = Math.min(...cols);
    const h = Math.max(...rows) - r0 + 1, w = Math.max(...cols) - c0 + 1;
    // A real shape, not a snake along one edge: at least 4x4 and several turns.
    if (h < 4 || w < 4 || turns(p) < 5) continue;
    const dots = p.map(([r, c]) => ({ r: r - r0, c: c - c0 }));
    const key = dots.map((d) => `${d.r},${d.c}`).sort().join(";") + `|${dots[0].r},${dots[0].c}`;
    if (key === lastLayout) continue;
    lastLayout = key;
    // Shown in a shuffled order so the dot list doesn't give the answer away to screen readers.
    const order = dots.map((d, i) => ({ ...d, i })).sort(() => Math.random() - 0.5);
    return { rows: h, cols: w, dots: order, start: order.findIndex((d) => d.i === 0) };
  }
  throw new Error("Connect the Path: could not build a layout");
}

const adjacent = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

export default function ConnectPath({ open, onClose }) {
  const [layout, setLayout] = useState(null);
  const [path, setPath] = useState([]); // dot indices in order, path[0] = pink start
  const [quote, setQuote] = useState(null);
  const [phase, setPhase] = useState("play"); // play | score | done
  const [best, setBest] = useState(false);
  const startedAt = useRef(0);
  const pathRef = useRef([]);
  const dragging = useRef(false);
  const lastPoint = useRef(null);
  const svgRef = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const commit = (p) => { pathRef.current = p; setPath(p); };

  const reset = useCallback(() => {
    clearTimers();
    dragging.current = false;
    const l = newLayout();
    setLayout(l);
    pathRef.current = [l.start];
    setPath([l.start]);
    setQuote(null);
    setPhase("play");
    setBest(false);
    startedAt.current = 0;
  }, []);

  // Back or close discards the path; reopening starts a fresh layout.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const done = path.length === DOTS;

  // The dot under a point, with a touch target larger than the dot itself.
  const dotAt = (x, y) => {
    const c = Math.round(x / UNIT - 0.5), r = Math.round(y / UNIT - 0.5);
    const cx = (c + 0.5) * UNIT, cy = (r + 0.5) * UNIT;
    if (Math.hypot(x - cx, y - cy) > UNIT * 0.42) return -1;
    return layout.dots.findIndex((d) => d.r === r && d.c === c);
  };

  // Valid moves only: the next neighbour extends the path, the previous dot steps back; everything else is ignored.
  const visit = (i) => {
    const p = pathRef.current;
    if (i < 0 || p.length === DOTS) return false;
    const end = p[p.length - 1];
    if (i === end) return true;
    if (p.length > 1 && i === p[p.length - 2]) { commit(p.slice(0, -1)); play("back"); return true; }
    if (!p.includes(i) && adjacent(layout.dots[end], layout.dots[i])) {
      const next = [...p, i];
      if (!startedAt.current) startedAt.current = performance.now();
      commit(next);
      if (next.length === DOTS) {
        dragging.current = false;
        const ms = performance.now() - startedAt.current;
        const prev = readBest();
        const isBest = !prev || ms < prev;
        if (isBest) writeBest(Math.round(ms));
        setBest(isBest);
        recordStars("connect-the-path", ROUND_STARS);
        play("win");
        later(() => setPhase("score"), 900);
      } else play("flip");
      return true;
    }
    return false;
  };

  const toSvg = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * layout.cols * UNIT,
      y: ((e.clientY - rect.top) / rect.height) * layout.rows * UNIT,
    };
  };

  const onDown = (e) => {
    if (done || !layout) return;
    e.preventDefault();
    const pt = toSvg(e);
    if (visit(dotAt(pt.x, pt.y))) {
      dragging.current = true;
      lastPoint.current = pt;
      svgRef.current.setPointerCapture?.(e.pointerId);
    }
  };

  const onMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pt = toSvg(e);
    const from = lastPoint.current;
    // Walk along the movement in small steps, so a fast drag still passes every dot in order.
    const n = Math.max(1, Math.ceil(Math.hypot(pt.x - from.x, pt.y - from.y) / (UNIT / 5)));
    for (let k = 1; k <= n; k++) {
      const x = from.x + ((pt.x - from.x) * k) / n, y = from.y + ((pt.y - from.y) * k) / n;
      const i = dotAt(x, y);
      if (i >= 0) visit(i);
    }
    lastPoint.current = pt;
  };

  const onUp = () => { dragging.current = false; };

  const pos = (i) => [(layout.dots[i].c + 0.5) * UNIT, (layout.dots[i].r + 0.5) * UNIT];
  // MM-G05-02: the path fades from the pink start to near-black at the dot you're on; complete = all pink.
  const shade = (k) => (done || path.length < 2 ? PINK : mix(PINK, DARK, k / (path.length - 1)));
  const at = new Map(path.map((d, k) => [d, k]));

  const toQuote = useCallback(() => { setQuote(takeQuote("connect-the-path")); setPhase("done"); }, []);
  const ended = phase !== "play";

  return (
    <GameModal
      open={open}
      onClose={onClose}
      label="Connect the Path"
      game
      instructions={ended ? null : INSTRUCTIONS}
      counter={ended ? null : `${pad2(path.length)} / ${DOTS}`}
      stars={ended ? null : done ? ROUND_STARS : 0}
      hud={!ended}
      confirm={ended ? "completed" : path.length > 1 ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" ? (
        <ScoreScreen badge={best ? "New personal best" : "Well played"} label="All dots connected" value={`${DOTS} / ${DOTS}`} stars={ROUND_STARS} onDone={toQuote} />
      ) : (
        <div className="flex flex-1 items-center justify-center px-[15px] py-8 lg:pb-[3.5vw] lg:pt-[2vw]">
          {layout && (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${layout.cols * UNIT} ${layout.rows * UNIT}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="img"
              aria-label={`Connect the Path, ${path.length} of ${DOTS} dots connected`}
              className="block select-none [touch-action:none] [--s:min(14vw,70px)] lg:[--s:min(6vw,calc((100vh_-_260px)/6))]"
              style={{ width: `calc(${layout.cols} * var(--s))`, height: `calc(${layout.rows} * var(--s))` }}
            >
              <defs>
                {path.slice(1).map((d, j) => {
                  const [x1, y1] = pos(d), [x2, y2] = pos(path[j]);
                  return (
                    <linearGradient key={d} id={`cp-g${d}`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                      <stop offset="0" stopColor={shade(j + 1)} />
                      <stop offset="1" stopColor={shade(j)} />
                    </linearGradient>
                  );
                })}
              </defs>
              {path.slice(1).map((d, j) => {
                const [x1, y1] = pos(path[j]), [x2, y2] = pos(d);
                return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#cp-g${d})`} strokeWidth="2.6" strokeLinecap="round" />;
              })}
              {layout.dots.map((d, i) => {
                const k = at.get(i);
                return (
                  <circle
                    key={`${d.r}-${d.c}`}
                    cx={(d.c + 0.5) * UNIT}
                    cy={(d.r + 0.5) * UNIT}
                    r={R}
                    fill={k == null ? "#000" : k === 0 ? shade(0) : `url(#cp-g${i})`}
                  />
                );
              })}
            </svg>
          )}
        </div>
      )}
    </GameModal>
  );
}
