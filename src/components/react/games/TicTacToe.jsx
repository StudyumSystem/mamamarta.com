import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen, PINK } from "./GameModal.jsx";
import { takeQuote, prefersReducedMotion, recordStars, ROUND_STARS } from "./shared.js";
import { play as playSound } from "./sound.js";
import Burst from "./Burst.jsx";
const sound = (name) => playSound(name, "tic-tac-toe");

// 11 Nov (her MM-G03-02 / -04 frames): grey #969696 lines on the light grey panel, a played square turns white,
// a three-in-a-row gets a thin pink line across it; the round ends on the score screen ("Well played",
// "Round completed", "YOU WON"). Her frames only show the win: the loss and draw wording and Stars are
// placeholders until Marta answers (questions in the progress log, 11 Nov part 2).
const RESULT = {
  X: { value: "YOU WON", stars: ROUND_STARS },
  O: { value: "APPLE WON", stars: 50 },
  draw: { value: "DRAW", stars: 100 },
};

// MM-GAME-03 Tic-Tac-Toe (Marta's spec): player is the fur X and always starts, the computer is the black Apple.
// Balanced opponent: takes a win, usually blocks, sometimes plays loosely. Same completion screen for win, loss and draw.
// 12 Nov (Marta): the first round is the classic 3x3, the second a 4x4 board where four in a row wins (rows,
// columns, both diagonals), then 3x3 or 4x4 by chance (playAgain). Same board size, so the squares are smaller.
const INSTRUCTIONS = {
  3: "You're the X. The computer is Apple. Take turns placing your symbols. Get three in a row to win.",
  4: "You're the X. The computer is Apple. Take turns placing your symbols. Get four in a row to win.",
};
const X_SRC = "/assets/games/ttt-x.png";
const APPLE_SRC = "/assets/games/ttt-apple.png";

// Every winning line of an n x n board: rows, columns, both diagonals (3x3: the classic 8; 4x4: 10).
function linesOf(n) {
  const out = [];
  const run = (f) => Array.from({ length: n }, (_, k) => f(k));
  for (let r = 0; r < n; r++) out.push(run((k) => r * n + k));
  for (let c = 0; c < n; c++) out.push(run((k) => k * n + c));
  out.push(run((k) => k * n + k), run((k) => k * n + n - 1 - k));
  return out;
}
const LINES = { 3: linesOf(3), 4: linesOf(4) };
const sizeOf = (board) => Math.round(Math.sqrt(board.length));

function winner(board) {
  for (const line of LINES[sizeOf(board)]) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) return { who: first, line };
  }
  return null;
}

// The empty square that would finish a line for `who` (all but one of it theirs), or -1.
function completing(board, who) {
  for (const cells of LINES[sizeOf(board)]) {
    const mine = cells.filter((i) => board[i] === who).length;
    const empty = cells.filter((i) => !board[i]);
    if (mine === cells.length - 1 && empty.length === 1) return empty[0];
  }
  return -1;
}

// How many lines `who` could finish with one more move.
const threats = (board, who) =>
  LINES[sizeOf(board)].filter((cells) => cells.filter((i) => board[i] === who).length === cells.length - 1 && cells.some((i) => !board[i])).length;

// 4x4: Apple wins if it can, always blocks a three with the fourth square open, usually spoils a move that would
// give the player two such threats at once, and otherwise builds on open lines, preferring the four middle squares.
const CENTRE_4 = [5, 6, 9, 10];
function computerMove4(board) {
  const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const win = completing(board, "O");
  if (win >= 0) return win;
  const block = completing(board, "X");
  if (block >= 0) return block;
  const double = (who) => free.find((i) => { const b = board.slice(); b[i] = who; return threats(b, who) >= 2; });
  const own = double("O");
  if (own != null) return own;
  const spoil = double("X");
  if (spoil != null && Math.random() < 0.75) return spoil;
  let best = free[0], bestScore = -1;
  for (const i of free) {
    let s = CENTRE_4.includes(i) ? 2 : 0;
    for (const cells of LINES[4]) {
      if (!cells.includes(i)) continue;
      const o = cells.filter((c) => board[c] === "O").length, x = cells.filter((c) => board[c] === "X").length;
      if (!x) s += [1, 3, 8][o] ?? 0; // a line still open for Apple
      if (!o) s += [0, 2, 6][x] ?? 0; // a line the player is building
    }
    s += Math.random() * 1.5;
    if (s > bestScore) { bestScore = s; best = i; }
  }
  return best;
}

function computerMove(board) {
  if (board.length === 16) return computerMove4(board);
  const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const win = completing(board, "O");
  if (win >= 0) return win;
  const block = completing(board, "X");
  if (block >= 0 && Math.random() < 0.85) return block;
  if (Math.random() < 0.3) return free[Math.floor(Math.random() * free.length)];
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return free[Math.floor(Math.random() * free.length)];
}

// Marta, 11 Nov 19:50: the symbols are her animations (her Letter X video, the apple video of the home slider),
// and they sit straight on the grey board: no white square behind them. The videos' white melts into the
// grey (multiply); the still picture shows until the video has loaded.
const X_VIDEO = "/assets/games/ttt-x.mp4";
const APPLE_VIDEO = "/assets/apple.mp4";
// 12 Nov 01:51 (Marta: "there is a small delay, the change is jarring; if I click, the X must appear and move"):
// her X video is 18 MB, so a new X waited for it and jumped from the still picture to the video. Now the whole
// video is fetched once as soon as the game opens and every X plays it from memory, so it starts at once.
// (The earlier first-frame layer is gone: the half-white X is her design, see the note to Marta.)
// The phone (Marta, 12 Nov, her iPhone: grey boxes): iPhone Safari applies neither mix-blend-mode nor a filter to a
// <video>, so the phone plays copies with that same whitening baked into the pixels (scripts/make-phone-videos.mjs:
// x 1.12 then gamma 1.6, the background pure #FFFFFF), with no blend or filter; the X copy is 0.75 MB, not 18 MB.
// Below the computer's width (lg, 1024 px), as everywhere on the site.
const isPhone = () => typeof window !== "undefined" && !window.matchMedia?.("(min-width: 1024px)").matches;
const PHONE_X = { video: "/assets/games/ttt-x-phone.mp4", poster: "/assets/games/ttt-x-phone-poster.webp" };
const PHONE_APPLE = { video: "/assets/games/ttt-apple-phone.mp4", poster: "/assets/games/ttt-apple-phone-poster.webp" };
// 14 Nov (Marta, her iPhone: "when you place the X, it blinks. This must not happen"). Three things blinked:
// - every square was a disabled button while Apple "thinks", and iPhone Safari draws a disabled button at 40%
//   opacity: the whole board went pale for that moment and came back. The squares are no longer disabled (a tap
//   then is simply not taken, as before).
// - a new symbol was a bare <video>: empty until its poster had loaded, then the poster, then a flash as the
//   video took over. Now her poster (the video's own first frame) is a picture already loaded when the game opens,
//   always under the video, and the video shows only once it is really playing, so the poster and the moving
//   symbol meet without a gap.
// - an X placed before her video had come into memory kept the address it was given, and the next turn changed
//   it to the copy in memory, which reloaded that X. Each symbol now keeps the address it started with.
const loaded = {}; // video file -> its copy in memory
function preload() {
  if (typeof fetch === "undefined") return;
  for (const s of [PHONE_X, PHONE_APPLE]) {
    if (!(s.video in loaded)) {
      loaded[s.video] = null;
      fetch(s.video).then((r) => (r.ok ? r.blob() : null)).then((b) => { if (b) loaded[s.video] = URL.createObjectURL(b); }).catch(() => {});
    }
    if (!loaded[s.poster]) { const i = new Image(); i.src = s.poster; loaded[s.poster] = i; }
  }
}

// hop: a winning symbol jumps (12 Nov). The jump is on the video itself, so it still melts into the square.
// 12 Nov 02:39 (Marta: "the square white and the figure dark") and 04:02 ("the figures have a background again!
// a white square with the figure on it, that's all, no greyish shades"): the videos' near-white background is
// lifted to pure white first (the mm-ttt-dark filter below), so it vanishes on the white square, and only then
// the figure's mid-tones are deepened. (The first try only deepened, which turned that near-white grey.)
// 13 Nov (Marta, voice: pure white #FFFFFF everywhere, animations on pure white too): the computer now plays the
// same white-baked copies as the phone (no blend or filter, which Safari on a Mac doesn't apply to a video either).
const Symbol = ({ who, hop = null }) => {
  const s = who === "X" ? PHONE_X : PHONE_APPLE;
  const [src] = useState(() => loaded[s.video] || s.video); // never changes while the symbol is on the board
  const [live, setLive] = useState(false);
  const vRef = useRef(null);
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;
    // shown once a frame of it is on the screen: playing, and its time has moved on from the start
    const on = () => { if (!v.paused && v.currentTime > 0) setLive(true); };
    v.addEventListener("timeupdate", on);
    v.play?.().catch(() => {}); // a phone in low-power mode may refuse; the poster then stays, still and whole
    return () => v.removeEventListener("timeupdate", on);
  }, []);
  const fit = "absolute inset-0 h-full w-full object-contain";
  return (
    <span
      className={`${hop ? "mm-hop" : "mm-symbol"} relative block ${who === "X" ? "h-[80%] w-[80%]" : "h-full w-full"}`}
      style={{ clipPath: "inset(3%)", ...(hop ? { "--delay": hop } : null) }}
      role="img"
      aria-label={who === "X" ? "X" : "Apple"}
    >
      <img src={s.poster} alt="" className={fit} draggable={false} />
      <video
        ref={vRef}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className={fit}
        style={{ opacity: live ? 1 : 0 }}
      />
    </span>
  );
};

const DarkFilter = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <filter id="mm-ttt-dark" colorInterpolationFilters="sRGB">
      {/* anything from about 89% white up becomes pure white */}
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.12" />
        <feFuncG type="linear" slope="1.12" />
        <feFuncB type="linear" slope="1.12" />
      </feComponentTransfer>
      {/* then the figure a little darker; white stays white */}
      <feComponentTransfer>
        <feFuncR type="gamma" exponent="1.6" />
        <feFuncG type="gamma" exponent="1.6" />
        <feFuncB type="gamma" exponent="1.6" />
      </feComponentTransfer>
    </filter>
  </svg>
);

// The pink line across a winning row, in board units (each square 1 x 1), a little past the outer centres.
function lineEnds(line, n) {
  const at = (i) => [(i % n) + 0.5, Math.floor(i / n) + 0.5];
  const [a, b] = [at(line[0]), at(line[line.length - 1])];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const k = 0.32 / len;
  return [a[0] - dx * k, a[1] - dy * k, b[0] + dx * k, b[1] + dy * k];
}

export default function TicTacToe({ open, onClose }) {
  const [size, setSize] = useState(3); // 3 for the first round, 4 after Play again
  const [board, setBoard] = useState(Array(9).fill(null));
  const [line, setLine] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("play"); // play | score | done
  const [outcome, setOutcome] = useState(null); // X | O | draw
  const [fx, setFx] = useState(null); // the finish: null | hop | burst (a win) | fade (draw, loss, reduced motion)
  const boardRef = useRef(null);
  const rounds = useRef(0); // rounds played since the game opened
  const reach = useRef(200);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback((n = 3) => {
    clearTimers();
    setSize(n);
    setBoard(Array(n * n).fill(null));
    setLine(null);
    setQuote(null);
    setBusy(false);
    setPhase("play");
    setOutcome(null);
    setFx(null);
  }, []);

  // Back or close resets an unfinished round; reopening starts with an empty 3x3 board.
  useEffect(() => { if (open) { preload(); rounds.current = 0; reset(3); } return clearTimers; }, [open, reset]);

  // 12 Nov 04:02 (Marta: "mix the grid at random, so it's more fun: first 3x3, the next round 4x4, then random"):
  // the second round is always 4x4, every round after that 3x3 or 4x4 by chance.
  const playAgain = () => {
    rounds.current += 1;
    reset(rounds.current === 1 ? 4 : Math.random() < 0.5 ? 3 : 4);
  };

  // 12 Nov (Marta): a short finish before the score screen. A win: the winning symbols jump, then pink and black
  // confetti bursts from the winning line. A draw or a loss stays quiet: the board fades. Reduced motion: a fade.
  const end = (who) => {
    setBusy(true);
    setOutcome(who);
    recordStars("tic-tac-toe", RESULT[who].stars);
    if (who === "X") sound("win"); else sound("back");
    if (prefersReducedMotion()) {
      later(() => setFx("fade"), 450);
      later(() => setPhase("score"), 1250);
    } else if (who === "X") {
      later(() => setFx("hop"), 350);
      later(() => { reach.current = (boardRef.current?.offsetWidth || 400) * 0.42; setFx("burst"); }, 800);
      later(() => setPhase("score"), 1850);
    } else {
      const at = who === "O" ? 650 : 250; // Apple's line is drawn first
      later(() => setFx("fade"), at);
      later(() => setPhase("score"), at + 850);
    }
  };

  const finish = (b) => {
    const w = winner(b);
    if (w) { setLine(w.line); end(w.who); return true; }
    if (b.every(Boolean)) { end("draw"); return true; }
    return false;
  };

  const play = (i) => {
    if (busy || board[i] || phase !== "play") return;
    const b = board.slice();
    b[i] = "X";
    setBoard(b);
    sound("flip");
    if (finish(b)) return;
    setBusy(true); // board locked while the computer "thinks"
    later(() => {
      const c = b.slice();
      c[computerMove(c)] = "O";
      setBoard(c);
      if (!finish(c)) { setBusy(false); sound("flip"); }
    }, 550 + Math.random() * 300);
  };

  const toQuote = useCallback(() => { setQuote(takeQuote("tic-tac-toe")); setPhase("done"); }, []);
  const ended = phase !== "play";
  const ends = line && lineEnds(line, size);
  const hopping = (fx === "hop" || fx === "burst") && outcome === "X" && line;

  return (
    <GameModal
      open={open}
      onClose={onClose}
      onBack={phase === "done" ? () => setPhase("score") : null}
      label="Tic-Tac-Toe"
      game
      stage={phase !== "done"}
      instructions={ended ? null : INSTRUCTIONS[size]}
      textBox={[356, 689]}
      stars={ended ? null : outcome ? RESULT[outcome].stars : 0}
      hud={!ended}
      confirm={ended ? "completed" : board.some(Boolean) && !outcome ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={playAgain} />
      ) : phase === "score" ? (
        <ScoreScreen badge="Well played" label="Round completed" value={RESULT[outcome].value} stars={RESULT[outcome].stars} onDone={toQuote} />
      ) : (
        <div className={`flex flex-1 items-center justify-center overflow-clip px-[15px] py-8 lg:pointer-events-none lg:absolute lg:inset-0 lg:items-start lg:p-0 ${size === 4 ? "lg:pt-[calc(212*var(--mm-u))]" : "lg:pt-[calc(247*var(--mm-u))]"}`}>
          {/* MM-G03-02 (11 Nov): 175 px squares at 1920, 1 px #969696 lines; empty squares grey, played squares white (her Active frame).
              4x4 (12 Nov): four squares a side; the board itself is square and splits into equal rows, so the lines
              stay straight when a square comes out at a fraction of a pixel.
              12 Nov (Marta: the board is smaller than in her design, "h?"): on the computer the board is placed as in
              her frames, in her frame's px measured against the screen's height (--mm-u, see GameModal): 3x3 is
              525 x 525, 247 from the panel's top (MM-G03-01); 4x4 is 700 x 700 with the same 175 squares, 212 from
              the top (MM-G03-02 _Desktop_4*4 _Grid). On the phone both stay 310 wide, as her two phone frames. */}
          <div
            ref={boardRef}
            className={`${fx === "fade" ? "mm-fade-out" : ""} relative grid aspect-square w-[min(310px,100%,calc(100cqh-64px))] max-w-[420px] ${size === 4 ? "grid-cols-4 grid-rows-4 lg:w-[calc(700*var(--mm-u))]" : "grid-cols-3 grid-rows-3 lg:w-[calc(525*var(--mm-u))]"} gap-px border border-[#969696] bg-[#969696] lg:pointer-events-auto lg:max-w-none`}
            style={fx === "fade" ? { animationDuration: "850ms" } : undefined}
            role="grid"
            aria-label={`Tic-Tac-Toe board, ${size} by ${size}`}
          >
            <DarkFilter />
            {board.map((v, i) => {
              const k = hopping ? line.indexOf(i) : -1;
              return (
                <button
                  key={`${size}-${i}`}
                  type="button"
                  onClick={() => play(i)}
                  aria-disabled={!!v || busy}
                  aria-label={v ? (v === "X" ? "X" : "Apple") : `Empty square ${i + 1}`}
                  // her MM-G03-02 Desktop / Active (1161:862) and phone frame: empty squares the panel's #F0F0F0,
                  // a played square white #FFFFFF, so the X and the apple sit on white with no edge (13 Nov 22:30)
                  className={`flex min-h-0 min-w-0 items-center justify-center ${k >= 0 ? "overflow-visible" : "overflow-hidden"} ${v ? "bg-white" : "bg-[#F0F0F0]"} ${
                    !v && !busy ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {v && <Symbol who={v} hop={k >= 0 ? `${k * 80}ms` : null} />}
                </button>
              );
            })}
            {ends && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <line
                  x1={ends[0]} y1={ends[1]} x2={ends[2]} y2={ends[3]}
                  stroke={PINK} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"
                  className="mm-draw-line" pathLength="1"
                />
              </svg>
            )}
            {fx === "burst" && line &&
              line.map((i) => (
                <Burst
                  key={i}
                  x={`${((i % size) + 0.5) / size * 100}%`}
                  y={`${(Math.floor(i / size) + 0.5) / size * 100}%`}
                  rings={[{ n: size === 4 ? 14 : 18, reach: reach.current, size: 9 }]}
                  fall="30px"
                  dur="950ms"
                />
              ))}
          </div>
        </div>
      )}
    </GameModal>
  );
}
