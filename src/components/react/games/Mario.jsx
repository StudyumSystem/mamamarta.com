import React, { useEffect, useRef, useState } from "react";
import GameShell from "./GameShell.jsx";

// A walking figure that runs, jumps and collects pink coins on the way to the flag.
// Keyboard: arrows or A / D to walk, Up, W or Space to jump. Phones: the three buttons.
const W = 960;
const H = 540;
const GROUND = 470;
const LEVEL_W = 4200;
const FLAG_X = 4040;
const GRAVITY = 2200;
const SPEED = 330;
const JUMP = 860;
const STEP = 1 / 120;
const PW = 34;
const PH = 50;
const TIME = 90;
const LIVES = 3;
const PINK = "#ec4899";

const ground = (x, w) => ({ x, y: GROUND, w, h: H - GROUND });
const ledge = (x, y, w) => ({ x, y, w, h: 24 });
const SOLIDS = [
  ground(0, 900), ground(1020, 700), ground(1860, 800), ground(2800, 600), ground(3520, 680),
  ledge(420, 350, 160), ledge(700, 270, 140), ledge(1200, 340, 200), ledge(1500, 250, 160),
  ledge(2050, 360, 180), ledge(2300, 280, 160), ledge(2950, 340, 200), ledge(3250, 260, 140),
  ledge(3700, 350, 160),
];

const row = (x, y, count, gap) => Array.from({ length: count }, (_, i) => ({ x: x + i * gap, y }));
const arc = (x) => [{ x, y: 380 }, { x: x + 40, y: 340 }, { x: x + 80, y: 380 }];
const COINS = [
  ...row(220, 420, 4, 50), ...row(450, 310, 3, 50), ...row(735, 230, 2, 60), ...arc(920),
  ...row(1240, 300, 3, 60), ...row(1545, 210, 2, 70), ...row(1580, 420, 2, 50), ...arc(1750),
  ...row(2090, 320, 3, 50), ...row(2340, 240, 2, 70), ...arc(2690), ...row(2990, 300, 3, 60),
  ...row(3290, 220, 2, 60), ...arc(3420), ...row(3600, 420, 2, 50), ...row(3740, 310, 2, 70),
];

const overlaps = (p, s) => p.x < s.x + s.w && p.x + PW > s.x && p.y < s.y + s.h && p.y + PH > s.y;

function touchesCoin(p, c) {
  const nx = Math.max(p.x, Math.min(c.x, p.x + PW));
  const ny = Math.max(p.y, Math.min(c.y, p.y + PH));
  return (nx - c.x) ** 2 + (ny - c.y) ** 2 < 14 ** 2;
}

function TouchButton({ label, onPress, onRelease, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex h-16 touch-none select-none items-center justify-center rounded-full bg-black text-2xl font-semibold text-white active:bg-pink-500 ${className}`}
    >
      {label === "Jump" ? "Jump" : label === "Left" ? "←" : "→"}
    </button>
  );
}

export default function Mario() {
  const [screen, setScreen] = useState("default");
  const [hud, setHud] = useState({ coins: 0, lives: LIVES, time: TIME });
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(null);
  const canvasRef = useRef(null);
  const input = useRef({ left: false, right: false, jump: false, buffer: 0 });

  useEffect(() => {
    if (screen !== "active") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const p = { x: 80, y: GROUND - PH, vx: 0, vy: 0, onGround: false, face: 1, walk: 0, coyote: 0 };
    let safe = { x: p.x, y: p.y };
    const coins = COINS.map((c) => ({ ...c, taken: false }));
    let got = 0;
    let lives = LIVES;
    let timeLeft = TIME;
    let blink = 0;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    let ended = false;
    let shown = "";
    input.current = { left: false, right: false, jump: false, buffer: 0 };

    const finish = (headline) => {
      ended = true;
      setResult({ headline, detail: `${got} of ${COINS.length} pink coins` });
      setBest((b) => (b === null || got > b ? got : b));
      setScreen("over");
    };

    const step = (dt) => {
      const k = input.current;
      const dir = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      if (dir) p.face = dir;
      p.vx = dir * SPEED;

      p.coyote = p.onGround ? 0.1 : Math.max(0, p.coyote - dt);
      k.buffer = Math.max(0, k.buffer - dt);
      if (k.buffer > 0 && p.coyote > 0) {
        p.vy = -JUMP;
        p.coyote = 0;
        k.buffer = 0;
      }
      if (!k.jump && p.vy < -320) p.vy = -320; // a short tap gives a short hop
      p.vy = Math.min(p.vy + GRAVITY * dt, 1400);

      p.x = Math.max(0, Math.min(LEVEL_W - PW, p.x + p.vx * dt));
      for (const s of SOLIDS) if (overlaps(p, s)) p.x = p.vx > 0 ? s.x - PW : s.x + s.w;

      p.y += p.vy * dt;
      p.onGround = false;
      for (const s of SOLIDS) {
        if (!overlaps(p, s)) continue;
        if (p.vy > 0) {
          p.y = s.y - PH;
          p.onGround = true;
          if (p.x >= s.x + 8 && p.x + PW <= s.x + s.w - 8) safe = { x: p.x, y: p.y };
        } else {
          p.y = s.y + s.h;
        }
        p.vy = 0;
      }
      if (p.onGround && dir) p.walk += dt * 14;

      for (const c of coins) {
        if (!c.taken && touchesCoin(p, c)) {
          c.taken = true;
          got += 1;
        }
      }

      blink = Math.max(0, blink - dt);
      timeLeft -= dt;

      if (p.y > H + 60) {
        lives -= 1;
        if (lives <= 0) return finish("Out of lives.");
        Object.assign(p, { x: safe.x, y: safe.y, vx: 0, vy: 0 });
        blink = 1.2;
      }
      if (p.x + PW >= FLAG_X) return finish(got === COINS.length ? "Every coin, and the flag." : "You reached the flag.");
      if (timeLeft <= 0) return finish("Time's up.");

      const now = `${got}|${lives}|${Math.ceil(timeLeft)}`;
      if (now !== shown) {
        shown = now;
        setHud({ coins: got, lives, time: Math.ceil(timeLeft) });
      }
    };

    const drawPlayer = () => {
      const cx = p.x + PW / 2;
      const swing = p.onGround ? (p.vx ? Math.sin(p.walk) * 8 : 0) : 6;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 5, p.y + PH - 14);
      ctx.lineTo(cx - 5 - swing, p.y + PH - 3);
      ctx.moveTo(cx + 5, p.y + PH - 14);
      ctx.lineTo(cx + 5 + swing, p.y + PH - 3);
      ctx.stroke();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(p.x + 3, p.y + 16, PW - 6, PH - 28, 8);
      else ctx.rect(p.x + 3, p.y + 16, PW - 6, PH - 28);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, p.y + 12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PINK;
      ctx.beginPath();
      ctx.arc(cx, p.y + 10, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(p.face > 0 ? cx : cx - 18, p.y + 7, 18, 4);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx + p.face * 5, p.y + 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (t) => {
      const camX = Math.max(0, Math.min(LEVEL_W - W, p.x - W * 0.35));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(236, 72, 153, 0.08)";
      for (let i = 0; i < 12; i++) {
        const span = W + 400;
        const x = ((((i * 430 - camX * 0.3) % span) + span) % span) - 200;
        ctx.beginPath();
        ctx.arc(x, 110 + (i % 3) * 60, 40 + (i % 4) * 18, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(-camX, 0);
      for (const s of SOLIDS) {
        if (s.x > camX + W || s.x + s.w < camX) continue;
        ctx.fillStyle = "#000";
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = PINK;
        ctx.fillRect(s.x, s.y, s.w, 4);
      }
      ctx.fillStyle = "#000";
      ctx.fillRect(FLAG_X, GROUND - 210, 6, 210);
      ctx.fillStyle = PINK;
      ctx.beginPath();
      ctx.moveTo(FLAG_X + 6, GROUND - 210);
      ctx.lineTo(FLAG_X + 70, GROUND - 185);
      ctx.lineTo(FLAG_X + 6, GROUND - 160);
      ctx.fill();
      for (const c of coins) {
        if (c.taken || c.x < camX - 20 || c.x > camX + W + 20) continue;
        const turn = Math.max(0.18, Math.abs(Math.cos(t / 260 + c.x / 90)));
        ctx.fillStyle = PINK;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 12 * turn, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.ellipse(c.x - 3 * turn, c.y - 3, 3 * turn, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!(blink > 0 && Math.floor(t / 100) % 2)) drawPlayer();
      ctx.restore();
    };

    const frame = (now) => {
      if (ended) return;
      acc += Math.min((now - last) / 1000, 0.05);
      last = now;
      while (acc >= STEP && !ended) {
        step(STEP);
        acc -= STEP;
      }
      if (ended) return;
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const keys = {
      ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
      ArrowUp: "jump", KeyW: "jump", Space: "jump",
    };
    const onKey = (down) => (e) => {
      const key = keys[e.code];
      if (!key) return;
      e.preventDefault();
      if (down && key === "jump" && !e.repeat) input.current.buffer = 0.12;
      input.current[key] = down;
    };
    const keyDown = onKey(true);
    const keyUp = onKey(false);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    raf = requestAnimationFrame(frame);

    return () => {
      ended = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [screen]);

  const start = () => {
    setHud({ coins: 0, lives: LIVES, time: TIME });
    setResult(null);
    setScreen("active");
  };

  const press = (key) => () => {
    input.current[key] = true;
    if (key === "jump") input.current.buffer = 0.12;
  };
  const release = (key) => () => {
    input.current[key] = false;
  };

  return (
    <GameShell
      title="Mario"
      rules="Run, jump and collect the pink coins on the way to the flag. Arrows or A and D to walk, Up or Space to jump. On a phone, use the buttons. Three lives, 90 seconds."
      screen={screen}
      onStart={start}
      onRestart={start}
      stats={[["Coins", `${hud.coins}/${COINS.length}`], ["Lives", hud.lives], ["Time", hud.time]]}
      result={{
        headline: result?.headline,
        detail: result ? `${result.detail}${best !== null ? ` · Best ${best}` : ""}` : null,
      }}
    >
      <div className="w-full">
        <canvas
          ref={canvasRef}
          className="aspect-video w-full rounded-3xl border border-black/10 bg-white"
          aria-label="Game screen: a figure in a pink cap runs and jumps to collect pink coins"
          role="img"
        />
        <div className="mt-5 flex items-center justify-between gap-3 md:pointer-fine:hidden">
          <div className="flex gap-3">
            <TouchButton label="Left" onPress={press("left")} onRelease={release("left")} className="w-16" />
            <TouchButton label="Right" onPress={press("right")} onRelease={release("right")} className="w-16" />
          </div>
          <TouchButton label="Jump" onPress={press("jump")} onRelease={release("jump")} className="w-28" />
        </div>
      </div>
    </GameShell>
  );
}
