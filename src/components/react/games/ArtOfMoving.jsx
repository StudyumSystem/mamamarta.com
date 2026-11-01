import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion } from "./GameModal.jsx";
import { takeQuote } from "./shared.js";

// MM-GAME-04 The Art of Moving (Marta's spec + frames MM-G04-01…05): endless runner.
// Default → Start → countdown 3, 2, 1, GO → automatic run, one input = one fixed jump → one fall ends the run
// → Result (~2.5 s, personal best in localStorage) → Completion with the quote rotation.
// Her walking figure is the site's walk video, laid over the white frame with multiply so its white background disappears.
// Jump = the current frame held on the arc; fall = a short drop and fade (Marta's OK, 28 Oct 12:42).

const INSTRUCTIONS = "Keep moving. Jump between platforms and collect pink coins. One fall ends the run.";
const PINK = "#e3009c";
const BEST_KEY = "mm-art-of-moving-best";

// World in Figma units: the desktop frame is 660 x 755 (MM-G04-03 at 2000 px wide).
const H0 = 755;
const MIN_VIEW_W = 560; // on tall phone frames the world is scaled to show at least this much ahead
const FH = 400; // figure (video) height; the video is 2:3
const FW = (FH * 2) / 3;
const FOOT_Y = 0.95; // feet sit at 95% of the video height
const FOOT_TOL = 34; // half width of the feet on a platform
const BODY_W = 90;
const BODY_H = 0.88 * FH;
const PLAT_H = 37;
const PLAT_R = 12;
const COIN_R = 24;
const APEX = 150; // jump height
const AIR = 0.78; // time in the air on level ground
const V0 = (4 * APEX) / AIR;
const G = (2 * V0) / AIR;
const Y_MIN = 560;
const Y_MAX = 700;
const Y_START = 600;
const SPEED0 = 280;
const SPEED_MAX = 470;
const ACCEL = 5; // speed gained per second of running

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Time from take-off until landing on a platform `rise` units higher (negative = lower).
const airTime = (rise) => (V0 + Math.sqrt(Math.max(0, V0 * V0 - 2 * G * rise))) / G;
const speedAt = (t) => (t < 0.8 ? SPEED0 * (0.35 + 0.65 * (t / 0.8)) : Math.min(SPEED_MAX, SPEED0 + ACCEL * (t - 0.8)));

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; }
}
function writeBest(n) {
  try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* private mode: best lasts this visit only */ }
}

// A new random route. Every gap is shorter than the jump at the speed the player will have there,
// and every platform is long enough to take off from, so no run has an impossible gap.
function addPlatform(g) {
  const last = g.plats[g.plats.length - 1];
  const hard = Math.min(1, g.genT / 40);
  const speed = speedAt(g.genT + 1);
  const y = clamp(last.y + rand(-80, 100), Y_MIN, Y_MAX);
  const rise = last.y - y;
  const reach = speed * airTime(rise);
  const gap = rand(0.18, 0.4 + 0.22 * hard) * reach;
  const w = Math.max(rand(0.55, 0.95 - 0.25 * hard) * reach, reach - last.w - gap + 60, 120);
  const p = { x: last.x + last.w + gap, y, w };
  g.plats.push(p);
  g.genT += (gap + w) / speed;
  // Coins: in the gap at jump height (taken on the way over), or high above a long platform (needs a jump).
  const roll = Math.random();
  if (roll < 0.35) g.coins.push({ x: last.x + last.w + gap / 2, y: Math.min(last.y, y) - 200, taken: 0 });
  else if (roll < 0.6 && w > 220) g.coins.push({ x: p.x + w * rand(0.35, 0.65), y: y - (BODY_H + COIN_R + 20), taken: 0 });
}

function newWorld() {
  const first = { x: -115, y: Y_START, w: 520 };
  const g = {
    plats: [first],
    coins: [],
    genT: 1.6,
    p: { x: 0, y: Y_START, vy: 0, ground: first, offAt: -1, jumped: false },
    mode: "countdown", // countdown | play | fall | over
    t: 0, // running time
    clock: 0,
    goAt: 0,
    anchor: 0.5, // player position across the frame: centred for the countdown, then 30% from the left
    fade: 1,
    fallT: 0,
    buffer: -1,
    coinsTaken: 0,
  };
  for (let i = 0; i < 6; i++) addPlatform(g);
  return g;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4" /><path d="M16 6h3a3 3 0 0 1-3 4" />
    <path d="M12 13v4" /><path d="M8.5 20h7" /><path d="M10 17h4v3h-4z" />
  </svg>
);

const coinLabel = (n) => `${n} ${n > 1 ? "coins" : "coin"}`; // Figma: "0 coin", "3 coins"

export default function ArtOfMoving({ open, onClose }) {
  const [phase, setPhase] = useState("default"); // default | countdown | play | result | done
  const [runId, setRunId] = useState(0);
  const [count, setCount] = useState(null);
  const [coins, setCoins] = useState(0);
  const [result, setResult] = useState(null);
  const [quote, setQuote] = useState(null);
  const [touch, setTouch] = useState(false);
  const [layout, setLayout] = useState({ s: 1, offY: 0 });
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const jumpRef = useRef(() => {});
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setPhase("default");
    setRunId(0);
    setCount(null);
    setCoins(0);
    setResult(null);
    setQuote(null);
  }, []);

  // Closing or reopening always comes back to the Default screen; the best score stays.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);
  useEffect(() => { setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false); }, []);

  const start = useCallback(() => {
    clearTimers();
    setCoins(0);
    setResult(null);
    setPhase("countdown");
    setRunId((n) => n + 1);
  }, []);

  const endRun = useCallback((n) => {
    const best = readBest();
    const isBest = n > best;
    if (isBest) writeBest(n);
    setResult({ coins: n, isBest });
    setPhase("result");
    later(() => { setQuote(takeQuote("art-of-moving")); setPhase("done"); }, 2500);
  }, []);

  // The run itself: one requestAnimationFrame loop per Start.
  useEffect(() => {
    if (!open || !runId) return;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!canvas || !frame || !video) return;
    const ctx = canvas.getContext("2d");
    const g = newWorld();
    let s = 1, offY = 0, viewW = 660, dpr = 1;

    const resize = () => {
      const r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      s = Math.min(r.width / MIN_VIEW_W, r.height / H0);
      viewW = r.width / s;
      offY = (r.height - H0 * s) / 2;
      video.style.width = `${FW * s}px`;
      video.style.height = `${FH * s}px`;
      setLayout({ s, offY });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);

    // Idle pose = the first frame of the walk.
    video.muted = true;
    video.pause();
    try { video.currentTime = 0; } catch { /* not loaded yet */ }

    const land = (plat) => {
      const p = g.p;
      p.y = plat.y; p.vy = 0; p.ground = plat; p.jumped = false;
      video.play().catch(() => {});
      if (g.clock - g.buffer < 0.12) jump(); // pressed just before landing: still counts
    };
    const jump = () => {
      const p = g.p;
      if (g.mode !== "play") return;
      const coyote = !p.ground && !p.jumped && g.clock - p.offAt < 0.09;
      if (!p.ground && !coyote) { g.buffer = g.clock; return; }
      p.vy = -V0; p.ground = null; p.jumped = true; g.buffer = -1;
      video.pause(); // held frame on the arc
    };
    jumpRef.current = jump;

    const fall = () => {
      g.mode = "fall";
      g.fallT = 0;
      video.pause();
    };

    const step = (h) => {
      g.clock += h;
      const p = g.p;
      if (g.mode === "play") {
        g.t += h;
        const speed = speedAt(g.t);
        video.playbackRate = clamp(speed / SPEED0, 0.6, 1.8);
        g.anchor = 0.5 - 0.2 * (1 - Math.pow(1 - Math.min(1, g.t / 0.7), 3));
        p.x += speed * h;
        if (p.ground && p.x - FOOT_TOL > p.ground.x + p.ground.w) { p.ground = null; p.offAt = g.clock; }
        if (!p.ground) {
          const prevY = p.y;
          p.vy += G * h;
          p.y += p.vy * h;
          if (p.vy > 0) {
            for (const plat of g.plats) {
              if (prevY <= plat.y && p.y >= plat.y && p.x + FOOT_TOL >= plat.x && p.x - FOOT_TOL <= plat.x + plat.w) { land(plat); break; }
            }
          }
          if (p.y > Y_MAX + 60) fall();
        }
        for (const c of g.coins) {
          if (c.taken) continue;
          if (Math.abs(c.x - p.x) < BODY_W / 2 + COIN_R && c.y + COIN_R > p.y - BODY_H && c.y - COIN_R < p.y) {
            c.taken = g.clock;
            g.coinsTaken += 1;
            setCoins(g.coinsTaken);
          }
        }
        const camX = p.x - g.anchor * viewW;
        while (g.plats[g.plats.length - 1].x < camX + viewW + 600) addPlatform(g);
        while (g.plats.length > 2 && g.plats[0].x + g.plats[0].w < camX - 300) g.plats.shift();
        while (g.coins.length && g.coins[0].x < camX - 300) g.coins.shift();
      } else if (g.mode === "fall") {
        g.fallT += h;
        p.vy += G * h;
        p.y += p.vy * h;
        g.fade = Math.max(0, 1 - g.fallT / 0.55);
        if (g.fallT >= 0.6) { g.mode = "over"; endRun(g.coinsTaken); }
      }
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, dpr * offY);
      const camX = g.p.x - g.anchor * viewW;
      ctx.fillStyle = "#000";
      for (const plat of g.plats) {
        const x = plat.x - camX;
        if (x > viewW || x + plat.w < 0) continue;
        roundRect(ctx, x, plat.y, plat.w, PLAT_H, PLAT_R);
        ctx.fill();
      }
      ctx.fillStyle = PINK;
      for (const c of g.coins) {
        let r = COIN_R, a = 1;
        if (c.taken) {
          const k = (g.clock - c.taken) / 0.25; // quick scale and fade
          if (k >= 1) continue;
          r *= 1 + 0.6 * k; a = 1 - k;
        }
        const x = c.x - camX;
        if (x < -COIN_R * 2 || x > viewW + COIN_R * 2) continue;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const fx = (g.p.x - camX - FW / 2) * s;
      const fy = offY + (g.p.y - FOOT_Y * FH) * s;
      video.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
      video.style.opacity = String(g.fade);
    };

    // Countdown 3, 2, 1, GO (~1 s each); no input until GO.
    setCount("3");
    later(() => setCount("2"), 1000);
    later(() => setCount("1"), 2000);
    later(() => {
      setCount("GO");
      setPhase("play");
      g.mode = "play";
      video.play().catch(() => {});
    }, 3000);
    later(() => setCount(null), 3700);

    let last = performance.now();
    let raf;
    const tick = (now) => {
      let dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      while (dt > 0) { const h = Math.min(dt, 1 / 120); step(h); dt -= h; }
      draw();
      if (g.mode !== "over") raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearTimers();
      jumpRef.current = () => {};
      video.pause();
    };
  }, [open, runId, endRun]);

  // Space jumps (and starts from the Default screen). Buttons keep their own Space.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (e.target instanceof Element && e.target.closest("button, a, input, textarea")) return;
      e.preventDefault();
      if (e.repeat) return;
      if (phase === "default") start();
      else jumpRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, start]);

  const onAreaDown = (e) => {
    if (phase !== "play") return;
    if (e.target instanceof Element && e.target.closest("button, a")) return;
    e.preventDefault();
    jumpRef.current();
  };

  const running = phase === "countdown" || phase === "play";
  const counter = running ? coinLabel(coins) : null;

  return (
    <GameModal open={open} onClose={onClose} label="The Art of Moving" instructions={quote ? null : INSTRUCTIONS} counter={counter}>
      {quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : (
        <div
          onPointerDown={onAreaDown}
          className="flex flex-1 select-none items-start justify-center px-[19px] pt-[52px] lg:items-start lg:px-0 lg:pb-[2.4vw] lg:pt-[4.95vw] [touch-action:manipulation]"
          style={running ? { touchAction: "none" } : undefined}
        >
          <div
            ref={frameRef}
            className="relative isolate w-full aspect-[311/584] overflow-hidden rounded-[30px] border border-black bg-white lg:min-h-0 lg:w-auto lg:rounded-[2vw] lg:h-[min(37.75vw,calc(100vh_-_260px))] lg:aspect-[660/755]"
          >
            <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${running || phase === "result" ? "" : "invisible"}`} aria-hidden="true" />
            <video
              ref={videoRef}
              src="/assets/human-walking.mp4"
              poster="/assets/human-walking-poster.webp"
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 mix-blend-multiply [filter:brightness(1.07)_contrast(1.12)] ${running ? "" : "invisible"}`}
            />

            {count && (
              <span
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 font-normal leading-none"
                style={{ top: layout.offY + (Y_START - 0.5 * FH) * layout.s, fontSize: 110 * layout.s, color: PINK }}
                aria-live="assertive"
              >
                <span key={count} className="mm-count block">{count}</span>
              </span>
            )}

            {phase === "default" && (
              <div className="mm-fade-in absolute inset-0 flex flex-col items-center justify-center px-6 pt-[18%] text-center">
                <p className="text-[17px] leading-[1.45] lg:leading-[1.5] lg:text-[clamp(15px,1.07vw,21px)] font-normal text-black/70">
                  Find your rhythm.
                  <br />
                  {touch ? "Tap anywhere to jump." : "Press Space to jump."}
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="mm-gradient mt-10 inline-flex h-[60px] w-full max-w-[312px] items-center justify-center gap-2 text-[18px] font-semibold text-white lg:mt-[clamp(28px,4.4vw,84px)] lg:h-[clamp(54px,3.7vw,71px)] lg:w-[clamp(240px,16.9vw,325px)] lg:text-[clamp(16px,1.146vw,22px)]"
                >
                  Start <span aria-hidden="true">→</span>
                </button>
              </div>
            )}

            {phase === "result" && result && (
              <div className="mm-fade-in absolute inset-0 flex flex-col items-center justify-center bg-white text-center" role="status">
                <p className="text-[18px] lg:text-[clamp(16px,1.15vw,22px)] font-light uppercase text-black/80">Your run</p>
                <p className="mt-3 text-[72px] leading-none lg:mt-[clamp(14px,1.6vw,30px)] lg:text-[clamp(60px,4.7vw,90px)] font-normal text-black">{result.coins}</p>
                <p className="mt-3 text-[14px] lg:mt-[clamp(10px,1vw,18px)] lg:text-[clamp(13px,0.85vw,16px)] font-light uppercase text-black/80">Coins</p>
                {result.isBest && (
                  <p className="mt-6 inline-flex items-center gap-2 text-[15px] lg:mt-[clamp(18px,1.6vw,30px)] lg:text-[clamp(14px,0.95vw,18px)] font-light text-black/70">
                    <TrophyIcon /> New personal best
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </GameModal>
  );
}
