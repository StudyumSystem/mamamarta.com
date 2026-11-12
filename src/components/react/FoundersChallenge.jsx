import React, { useCallback, useEffect, useRef, useState } from "react";
import WordHunt from "./games/WordHunt.jsx";
import MemoryMatch from "./games/MemoryMatch.jsx";
import TicTacToe from "./games/TicTacToe.jsx";
import ArtOfMoving from "./games/ArtOfMoving.jsx";
import ConnectPath from "./games/ConnectPath.jsx";
import ArrowIcon from "./ArrowIcon.jsx";
import RollingCounter from "./RollingCounter.jsx";

// MM-HOME "The founder's challenge" (Marta's spec 01-home.md, frames MM-G01-00 … MM-G05-00, MM-C06 _Entry).
// Desktop: text left, carousel right with 6 entries; autoplay for each entry's reading time in a loop (06 → 01), paused while the
// cursor is over it or a game modal is open ("mm-modal"). Each Play opens its game as a modal over the Homepage.
// Mobile: the 6 entries stacked, no carousel, no autoplay.
// Entry 06 opens the two forms (Flow A / Flow B) through the window event "mm-open-form" (forms: next part).

// Each entry stays as long as its text takes to read (Marta, 10 Nov: 5 s was too fast to read, "about 8 s"):
// 3 s to take in the picture plus 0.3 s a word, between 7 and 10 s (01 is about 8.7 s, 04 7.2 s, 06 9.9 s).
const wordsOf = (text) => [].concat(text).join(" ").split(/\s+/).filter(Boolean).length;
const autoplayMs = (entry) => Math.min(10000, Math.max(7000, 3000 + 300 * wordsOf(entry.text)));
// Desktop slider, measured on her frame Desktop - 40 (1920 wide) and her Desktop.jpg (11 Nov): px of the 1920
// frame, drawn in vw so every screen width keeps her proportions. w x h = the entry's size, y = its top in the
// 1080 tall block, gap = the space to the entry after it. Her strip: the M 699 wide (our M video is drawn
// 726 wide so its letter has her size and place), Memory Match 420x540, the apple 532 wide, The Art of
// Moving 420x540 (her MM-G04-00 card), the glove 577x579, 74 / 59 / 58 / 69 px apart; the key (not in her frame) as before.
const px = (n) => `${+(n / 19.2).toFixed(4)}vw`;
const SLIDE = {
  "word-hunt": { w: 726, h: 787, y: 177, gap: 51 },
  "memory-match": { w: 420, h: 540, y: 287, gap: 59 },
  // the apple's box is larger than her 532 (its video has wide white sides) so the apple itself has the weight
  // of the M and the cards; it sits closer to the next entry for the same visible gap
  "tic-tac-toe": { w: 680, h: 750, y: 155, gap: -50 },
  "art-of-moving": { w: 420, h: 540, y: 287, gap: 69 },
  // the glove's picture and the key's have wide white sides, so their boxes sit closer for the same look
  "connect-the-path": { w: 577, h: 579, y: 251, gap: -20 },
  collaborate: { w: 595, h: 557, y: 262, gap: 17 },
};
// The next entry starts where her Memory Match card does (1663 px), so only its first 257 px show (61% of
// her card); a narrower one (the walking card) starts further right so no more than that share of it shows.
// The shown one sits whole before it. The slider's column starts at 960 px (half the page).
const NEXT_X = 1663;
const PEEK = 257 / 420;
const COLUMN_X = 960;
const nextX = (s) => Math.max(NEXT_X, 1920 - PEEK * s.w);

const ENTRIES = [
  {
    id: "word-hunt",
    label: "01 / 05 WORD HUNT",
    // her current Figma (12 Nov): the text box is 528 px wide on the computer (textW)
    text: "Some things are hiding in plain sight. You will find them fast, and then wonder how long they were there.",
    textW: "27.5vw",
    visual: { kind: "video", src: "/assets/m.mp4", poster: "/assets/m-poster.webp", alt: "Letter M" },
  },
  {
    id: "memory-match",
    label: "02 / 05 MEMORY MATCH",
    text: "20 cards, 10 pairs. A brand works the same way: people come back to what they recognise.",
    visual: { kind: "memory-card" },
  },
  {
    id: "tic-tac-toe",
    label: "03 / 05 TIC-TAC-TOE",
    text: "Every move is a decision. Three in a row sounds easy. But can you outsmart your opponent? Your move.",
    visual: { kind: "video", src: "/assets/apple.mp4", poster: "/assets/apple-poster.webp", alt: "Black apple" },
  },
  {
    id: "art-of-moving",
    label: "04 / 05 THE ART OF MOVING",
    text: ["Momentum. Keep moving, collect the pink.", "Growth is a series of small, well-timed steps."],
    visual: { kind: "walking-card" },
  },
  {
    id: "connect-the-path",
    label: "05 / 05 CONNECT THE PATH",
    text: "Every point has a purpose. A good product leads people there without a map. Can you complete it?",
    visual: { kind: "video", src: "/assets/google.mp4", poster: "/assets/google-poster.webp", alt: "Glove in the shape of a G" },
  },
  {
    id: "collaborate",
    label: "WHAT IF YOUR BRAND HAD ITS OWN GAME?",
    text: "Turn your idea into something people can play with. Suggest a game for Mamamarta or create a custom interactive experience for your brand.",
    // Her jelly key animation (Marta, 10 Nov); the still key is its poster until the video plays.
    visual: { kind: "image", src: "/assets/games/plus-key.png", video: "/assets/games/plus-key.mp4", alt: "Black key with a plus sign" },
  },
];

// Her Desktop.jpg (11 Nov): the games block's heading and intro.
const HEADING_LINES = ["Founder's", "blind spot"];
const INTRO = "A game lets someone feel a complex product before they ever use it. Five of them, built from what founders stop seeing.";

const GAME_COMPONENTS = {
  "word-hunt": WordHunt,
  "memory-match": MemoryMatch,
  "tic-tac-toe": TicTacToe,
  "art-of-moving": ArtOfMoving,
  "connect-the-path": ConnectPath,
};

const openForm = (flow) => window.dispatchEvent(new CustomEvent("mm-open-form", { detail: { flow } }));

const GamepadIcon = () => (
  <svg width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="7" width="18" height="11" rx="5" /><path d="M8 10.5v4M6 12.5h4" /><circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" /><circle cx="17.5" cy="13.8" r="0.9" fill="currentColor" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="1.25em" height="1.25em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V5h6v2" /><path d="M3 12h18" />
  </svg>
);

// A looping video loaded the way the live site's card row does it (scripts/lazy-videos.js: data-lazy-video +
// data-src, fetched and played when it comes on screen, paused off it). On top, the entry that becomes the
// shown one is started again here, muted first, so the browser always lets it play.
function LoopVideo({ src, poster, alt, active, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    // Hidden (the other screen size's copy) or reduced motion: leave it to the lazy loader / the poster.
    if (!active || !el.getClientRects().length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!el.getAttribute("src")) { el.src = src; el.preload = "auto"; }
    const play = () => el.play().catch(() => {});
    play();
    el.addEventListener("canplay", play);
    return () => el.removeEventListener("canplay", play);
  }, [active, src]);
  return <video ref={ref} data-lazy-video data-src={src} poster={poster} muted autoPlay loop playsInline preload="none" aria-label={alt} className={className} style={style} />;
}

// The Art of Moving card's figure (Marta, 10 Nov): her walk, her leap, the walk again, her stumble and rise,
// one after another, all mirrored so the figure moves to the right. The two new clips have a light grey
// background and a soft shadow: whitened and blended into the white card, edges pushed out of view.
// Plays only while the card is on screen (and, on desktop, while it is the shown entry).
const MOVES = [
  { src: "/assets/human-walking.mp4", fix: "" },
  { src: "/assets/games/jump.mp4", fix: "mix-blend-multiply [filter:brightness(1.18)_contrast(1.25)]" },
  { src: "/assets/games/stumble.mp4", fix: "mix-blend-multiply [filter:brightness(1.18)_contrast(1.25)]" },
];
const MOVE_ORDER = [0, 1, 0, 2];

function MovingFigure({ active = true, pos = "50% 0%", className = "" }) {
  const box = useRef(null);
  const vids = useRef([]);
  const [step, setStep] = useState(0);
  // On screen = intersecting; the hidden copy of the other screen size never is, so it never plays.
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) { setOnScreen(true); return; }
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const playing = active && onScreen && !reduced;
  useEffect(() => {
    const cur = MOVE_ORDER[step];
    const nextIdx = MOVE_ORDER[(step + 1) % MOVE_ORDER.length];
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (playing && (i === cur || i === nextIdx) && !v.getAttribute("src")) { v.src = MOVES[i].src; v.preload = "auto"; }
      if (i !== cur || !playing) { v.pause(); return; }
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [step, playing]);
  const onEnded = (i) => {
    if (i !== MOVE_ORDER[step]) return;
    const nextStep = (step + 1) % MOVE_ORDER.length;
    const nv = vids.current[MOVE_ORDER[nextStep]];
    if (nv) { try { nv.currentTime = 0; } catch { /* not loaded yet */ } }
    setStep(nextStep);
  };
  return (
    <div ref={box} className={`relative overflow-hidden bg-white ${className}`}>
      {MOVES.map((m, i) => (
        <video
          key={m.src}
          ref={(v) => (vids.current[i] = v)}
          poster={i === 0 ? "/assets/human-walking-poster.webp" : undefined}
          muted
          playsInline
          preload="none"
          aria-label={i === 0 ? "Walking figure" : undefined}
          aria-hidden={i === 0 ? undefined : "true"}
          onEnded={() => onEnded(i)}
          className={`absolute inset-0 h-full w-full object-cover ${m.fix} ${i === MOVE_ORDER[step] ? "" : "opacity-0"}`}
          style={{ transform: m.fix ? "scale(-1.04, 1.04)" : "scaleX(-1)", objectPosition: pos }}
        />
      ))}
    </div>
  );
}

// Desktop memory card, her card in Desktop - 40 (420 x 540, #171717, Arial): the MEMORY GAME pill top left,
// the number 194 px top right (it rolls like the card on her live site, Marta 2 Nov), the pink © line and the
// four lines right, "Memory Match" 64 px bottom left, the pink ring with its arrow bottom right.
function MemoryCard() {
  return (
    <div className="relative overflow-hidden bg-[#171717] text-left text-white [font-family:Arial,Helvetica,sans-serif]" style={{ width: px(420), height: px(540), borderRadius: px(18) }}>
      <span className="absolute grid place-items-center rounded-full bg-white uppercase text-black" style={{ left: px(24), top: px(22), width: px(106), height: px(32), fontSize: px(10), lineHeight: px(11) }}>Memory game</span>
      {/* the number ends where the pink line does, so no digit is cut by the card's edge (Marta, 11 Nov 19:23) */}
      <span className="absolute font-normal leading-none" style={{ right: px(29), top: px(8), fontSize: px(194) }}><RollingCounter /></span>
      <p className="absolute whitespace-nowrap text-right text-[#F600A9]" style={{ right: px(29), top: px(186), fontSize: px(10), lineHeight: px(14) }}>© Mamamarta 2026</p>
      <p className="absolute whitespace-nowrap text-right text-[#E1E6E2]/[.86]" style={{ right: px(29), top: px(270), fontSize: px(12), lineHeight: px(15) }}>
        A LITTLE TEST FOR YOUR MIND.<br />Flip the cards.<br />Find the pairs.<br />Trust your memory.
      </p>
      <p className="absolute whitespace-nowrap font-normal" style={{ left: px(24), top: px(403), fontSize: px(64), lineHeight: px(55) }}>Memory<br />Match</p>
      <span className="absolute grid place-items-center rounded-full border border-[#F600A9] text-white" style={{ left: px(348), top: px(470), width: px(43), height: px(43), fontSize: px(14) }} aria-hidden="true"><ArrowIcon dir="down-left" /></span>
    </div>
  );
}

// Phone memory card, measured on MM-HOME-002 (350x450, the card of her live site): pill top left, the rolling
// number top right, the four lines right, "Memory Match" bottom left, the pink ring with its arrow bottom right.
function MemoryCardPhone() {
  return (
    <div className="relative h-[calc(var(--q)*450)] w-[calc(var(--q)*350)] overflow-hidden rounded-[calc(var(--q)*22)] bg-[#1c1c1c] text-white [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif]">
      <span className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*18)] grid h-[calc(var(--q)*25)] w-[calc(var(--q)*88)] place-items-center rounded-full bg-white text-[length:calc(var(--q)*8.5)] font-medium uppercase text-black/85">Memory game</span>
      <span className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*13)] text-[length:calc(var(--q)*150)] font-light leading-none"><RollingCounter /></span>
      <p className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*156)] text-[length:calc(var(--q)*8)] text-[#e3009c]">© Mamamarta 2026</p>
      <p className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*226)] text-right text-[length:calc(var(--q)*9.5)] font-light leading-[calc(var(--q)*12.6)] tracking-[-0.03em] text-white/85">
        A LITTLE TEST FOR YOUR MIND.<br />Flip the cards.<br />Find the pairs.<br />Trust your memory.
      </p>
      <p className="absolute left-[calc(var(--q)*21)] top-[calc(var(--q)*331)] text-[length:calc(var(--q)*48)] font-normal leading-[calc(var(--q)*46)] tracking-[-0.02em]">Memory<br />Match</p>
      <span className="absolute right-[calc(var(--q)*24)] top-[calc(var(--q)*393)] grid h-[calc(var(--q)*35)] w-[calc(var(--q)*35)] place-items-center rounded-full border border-[#e3009c] text-[length:calc(var(--q)*15)] text-white" aria-hidden="true"><ArrowIcon dir="down-left" /></span>
    </div>
  );
}

// Phone walking card, her new phone frame of 9 Nov (350 x 450): picture inset 12 px and 370 tall, then
// "THE ART OF MOVING", "Keep moving. Collect the pink stars." and the pink round arrow on the right.
// Her title font looks geometric (Montserrat-like); Inter Light until she names it.
function WalkingCardPhone({ active }) {
  return (
    <div className="flex w-[calc(var(--q)*350)] flex-col overflow-hidden rounded-[calc(var(--q)*24)] bg-black p-[calc(var(--q)*12)] pb-[calc(var(--q)*18)] text-white">
      <div className="w-full overflow-hidden rounded-[calc(var(--q)*16)] bg-white">
        <MovingFigure pos="50% 20%" className="h-[calc(var(--q)*370)] w-full" />
      </div>
      <div className="mt-[calc(var(--q)*18)] flex items-center justify-between">
        <div>
          <p className="text-[length:calc(var(--q)*18.5)] font-light uppercase leading-none tracking-[-0.03em]">The Art of Moving</p>
          <p className="mt-[calc(var(--q)*7)] text-[length:calc(var(--q)*9.5)] font-light leading-[calc(var(--q)*14)] text-white/75">Keep moving. Collect the pink stars.</p>
        </div>
        <span className="grid h-[calc(var(--q)*30)] w-[calc(var(--q)*30)] shrink-0 place-items-center rounded-full bg-[#e3009c] text-[length:calc(var(--q)*11)] text-white" aria-hidden="true"><ArrowIcon dir="up-right" /></span>
      </div>
    </div>
  );
}

// Desktop walking card, her card in MM-G04-00 "Homepage / Slider Position 04" (Marta, 11 Nov 19:23: the
// centred 306-wide card was "still not the card format of the design"): black 420 x 540, the size of the
// Memory Match card, the picture 400 x 454 inset 10 px, then on the left "THE ART OF MOVING" Inter 22 px and
// "Keep moving. Collect the pink stars." 14 px white 69%, the pink round arrow 38 px on the right.
function WalkingCard({ active }) {
  return (
    <div className="relative overflow-hidden bg-black text-left text-white" style={{ width: px(420), height: px(540), borderRadius: px(24) }}>
      <div className="absolute overflow-hidden bg-white" style={{ left: px(10), top: px(10), width: px(400), height: px(454), borderRadius: px(16) }}>
        <MovingFigure active={active} pos="50% 0%" className="h-full w-full" />
      </div>
      <p className="absolute whitespace-nowrap font-normal uppercase" style={{ left: px(22), top: px(481), fontSize: px(22), lineHeight: px(21) }}>The Art of Moving</p>
      <p className="absolute whitespace-nowrap text-white/[.69]" style={{ left: px(22), top: px(509), fontSize: px(14), lineHeight: px(17) }}>Keep moving. Collect the pink stars.</p>
      <span className="absolute grid place-items-center rounded-full bg-[#F600A9] text-white" style={{ right: px(22), top: px(483), width: px(38), height: px(38), fontSize: px(15) }} aria-hidden="true"><ArrowIcon dir="up-right" /></span>
    </div>
  );
}

function PlusKey({ video, active, className = "", style }) {
  const [ok, setOk] = useState(true);
  if (video)
    return <LoopVideo src={video} poster="/assets/games/plus-key.png" alt="Black key with a plus sign" active={active} className={`object-contain mix-blend-multiply brightness-[1.04] contrast-[1.08] ${className}`} style={style} />;
  if (!ok) return <div className={className} style={style} aria-hidden="true" />;
  return <img src="/assets/games/plus-key.png" alt="Black key with a plus sign" onError={() => setOk(false)} className={`object-contain ${className}`} style={style} />;
}

// Desktop: each picture at its size in her frame (SLIDE); the videos' light background melts into the white
// page. The glove's video is drawn 2% wider than its box and cut to it, so the thin grey line along its edge
// never shows.
function Visual({ entry, active }) {
  const v = entry.visual;
  const s = SLIDE[entry.id];
  const size = { width: px(s.w), height: px(s.h) };
  if (v.kind === "video") {
    const video = <LoopVideo src={v.src} poster={v.poster} alt={v.alt} active={active} className="block h-full w-full object-cover mix-blend-multiply brightness-[1.04] contrast-[1.08]" />;
    // The apple (Marta, 11 Nov 19:23 "too small", 19:42 "cut on the left"): its video has wide white around it,
    // so its box is larger (SLIDE) and the whole video is shown, never cut; the box's white melts into the page.
    if (entry.id === "tic-tac-toe")
      return (
        <div style={size}>
          {/* its white right margin is cut off (the apple ends at 83% of the box), so the box never lies over the next card */}
          <LoopVideo src={v.src} poster={v.poster} alt={v.alt} active={active} className="block h-full w-full object-contain mix-blend-multiply brightness-[1.04] contrast-[1.08] [clip-path:inset(0_12%_0_0)]" />
        </div>
      );
    if (entry.id !== "connect-the-path") return <div style={size}>{video}</div>;
    return (
      <div className="relative overflow-hidden" style={size}>
        <div className="absolute inset-y-0 -left-[1%] -right-[1%]">{video}</div>
      </div>
    );
  }
  if (v.kind === "memory-card") return <MemoryCard />;
  if (v.kind === "walking-card") return <WalkingCard active={active} />;
  return <PlusKey video={v.video} active={active} className="block h-full w-full" style={size} />;
}

// Phone pictures, measured on MM-HOME-002 (px of the 390 frame): each one shows through a window the size of
// the object plus her gaps above and below, so nothing of the video's own edge (a light box, a grey line)
// can show, and the video is blended into the pure white page (Marta, 2 Nov: "no frames, the background
// pure white #FFFFFF, one with the landing"). w = video width, h = window height, y = video top in the window.
const PHONE_PICTURE = {
  "word-hunt": { w: 356, h: 342, y: -25 },
  "tic-tac-toe": { w: 466, h: 466, y: -15 },
  "connect-the-path": { w: 435, h: 389, y: -58 },
  // her key video has more white around the key than the still, so it is drawn narrower to keep the key's size
  collaborate: { w: 275, h: 357, y: 36 },
};

function PhoneVisual({ entry }) {
  const v = entry.visual;
  if (v.kind === "memory-card") return <div className="flex justify-center pt-[calc(var(--q)*31)] pb-[calc(var(--q)*33)]"><MemoryCardPhone /></div>;
  if (v.kind === "walking-card") return <div className="flex justify-center pt-[calc(var(--q)*32)] pb-[calc(var(--q)*33)]"><WalkingCardPhone /></div>;
  const p = PHONE_PICTURE[entry.id];
  const style = { width: `calc(var(--q) * ${p.w})`, top: `calc(var(--q) * ${p.y})` };
  return (
    <div className="relative -mx-[calc(var(--q)*20)] overflow-hidden bg-white" style={{ height: `calc(var(--q) * ${p.h})` }}>
      {v.kind === "video" || v.video ? (
        <LoopVideo src={v.video || v.src} poster={v.video ? v.src : v.poster} alt={v.alt} active={false} className="absolute left-1/2 max-w-none -translate-x-1/2 mix-blend-multiply brightness-[1.06] contrast-[1.1]" style={style} />
      ) : (
        <img src={v.src} alt={v.alt} className="absolute left-1/2 h-auto max-w-none -translate-x-1/2" style={style} />
      )}
    </div>
  );
}

function Ctas({ entry, onPlay }) {
  // her Figma: buttons 312 x 68, text 22 semibold -0.017em
  const base = "inline-flex items-center justify-center gap-[0.45em] font-semibold tracking-[-0.017em] transition-colors h-[3.54vw] text-[1.146vw]";
  if (entry.id === "collaborate")
    return (
      <div className="flex gap-[1.1vw]">
        <button type="button" onClick={() => openForm("suggest")} className={`${base} border border-black bg-white text-black hover:bg-black hover:text-white w-[16.25vw]`}>
          Suggest a game <GamepadIcon />
        </button>
        <button type="button" onClick={() => openForm("brand")} className={`${base} mm-gradient text-white w-[16.25vw]`}>
          Create for my brand <BriefcaseIcon />
        </button>
      </div>
    );
  return (
    <button type="button" onClick={() => onPlay(entry.id)} className={`${base} mm-gradient text-white w-[16.25vw]`}>
      Play <ArrowIcon />
    </button>
  );
}

// Phone buttons (MM-HOME-002): Play 199x46 in the middle, the two collaborate buttons 300x46, 15 px apart.
function PhoneCtas({ entry, onPlay }) {
  const base = "flex items-center justify-center gap-[0.3em] font-semibold h-[calc(var(--q)*46)] text-[length:calc(var(--q)*15.5)]";
  if (entry.id === "collaborate")
    return (
      <div className="flex flex-col items-center gap-[calc(var(--q)*15)]">
        <button type="button" onClick={() => openForm("suggest")} className={`${base} w-[calc(var(--q)*300)] border border-black bg-white text-black`}>
          Suggest a game <GamepadIcon />
        </button>
        <button type="button" onClick={() => openForm("brand")} className={`${base} mm-gradient w-[calc(var(--q)*300)] text-white`}>
          Create for my brand <BriefcaseIcon />
        </button>
      </div>
    );
  return (
    <div className="flex justify-center">
      <button type="button" onClick={() => onPlay(entry.id)} className={`${base} mm-gradient w-[calc(var(--q)*199)] text-white`}>
        Play <ArrowIcon />
      </button>
    </div>
  );
}

const EntryText = ({ text }) =>
  Array.isArray(text) ? text.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>) : text;

// start / still: only for check pages (an entry shown from the start, no autoplay); the home uses neither.
export default function FoundersChallenge({ start = 0, still = false }) {
  const [active, setActive] = useState(start);
  const [hovering, setHovering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [game, setGame] = useState(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(!!mq?.matches);
    const onModal = (e) => setModalOpen(!!e.detail?.open);
    // "Explore the games →" on a form's success screen moves the slider to 01.
    const onGo = (e) => Number.isInteger(e.detail?.index) && setActive(e.detail.index);
    window.addEventListener("mm-modal", onModal);
    window.addEventListener("mm-slider-go", onGo);
    return () => {
      window.removeEventListener("mm-modal", onModal);
      window.removeEventListener("mm-slider-go", onGo);
    };
  }, []);

  // Autoplay runs only while the section is on screen, so a visitor arriving at it always meets 01
  // (Marta, 28 Oct: it used to have moved on to 02 before anyone scrolled down to it).
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Autoplay: a fresh reading time after every change; nothing runs while paused.
  const paused = still || !inView || hovering || modalOpen || game != null || reduced;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % ENTRIES.length), autoplayMs(ENTRIES[active]));
    return () => clearTimeout(t);
  }, [active, paused]);

  const onPlay = useCallback((id) => setGame(id), []);
  const closeGame = useCallback(() => setGame(null), []);
  const entry = ENTRIES[active];

  // Slider as a strip (her Desktop - 40, 11 Nov: "one shown whole and only part of the next one, so people see
  // there are more"): the next entry starts at nextX (1663 px of 1920, later for the narrow walking card) and is
  // cut by the page's right edge; the shown one sits whole before it, its own gap away. The previous one fades out as it moves off to
  // the left, the rest wait out of sight, so 06 → 01 moves on like any other step.
  const n = ENTRIES.length;
  const signedRel = (i) => {
    const r = (i - active + n) % n;
    return r > n / 2 ? r - n : r;
  };
  const slide = (k) => SLIDE[ENTRIES[(k + n) % n].id];
  const place = (i) => {
    const rel = signedRel(i);
    // left edge in px of the 1920 frame
    const next = nextX(slide(active + 1));
    let x = next - slide(active).gap - slide(active).w;
    if (rel > 0) {
      x = next;
      for (let k = active + 1; k < active + rel; k++) x += slide(k).w + slide(k).gap;
    } else if (rel < 0) {
      for (let k = active - 1; k >= active + rel; k--) x -= slide(k).gap + slide(k).w;
    }
    const s = SLIDE[ENTRIES[i].id];
    const seen = rel === 0 || rel === 1;
    return { left: px(x - COLUMN_X), top: `calc(50% + ${px(s.y - 540)})`, opacity: seen ? 1 : 0, seen, z: rel === 0 ? 3 : seen ? 2 : 0 };
  };

  return (
    <section ref={sectionRef} id="my-system" className="relative bg-white font-[Inter] text-black">
      <span id="typography" className="absolute top-0" aria-hidden="true" />

      {/* Desktop */}
      <div className="hidden lg:grid lg:min-h-[56.25vw] lg:grid-cols-[50%_50%] lg:items-center">
        {/* Her current Figma (kept copy, 12 Nov, frame at 31999, 1920 x 1080), every place from the frame's top:
            heading 150/141 -0.06em at 158, 182; intro 22/34 -0.04em, 630 wide at 524; label 22/21 caps at 660;
            entry text 22/34 at 701; the two lines at 797; Play 312 x 68 at 839. */}
        <div className="self-start pl-[8.85vw] pt-[9.48vw] pb-[6vw]">
          <h2 className="relative z-20 -ml-[0.625vw] whitespace-nowrap text-[7.8125vw] font-normal leading-[7.34vw] tracking-[-0.06em]">{HEADING_LINES[0]}<br />{HEADING_LINES[1]}</h2>
          <p className="mt-[3.125vw] max-w-[32.81vw] text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.04em] text-black/70">{INTRO}</p>
          {/* The description always takes exactly 2 lines, so the progress line and buttons never move. */}
          <div key={active} className="mm-slide-in mt-[3.54vw]">
            <p className="text-[1.146vw] font-normal uppercase leading-[1.094vw] tracking-[-0.017em] text-black/50">{entry.label}</p>
            <p className="mt-[1.04vw] h-[3.54vw] max-w-[37vw] overflow-hidden text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.04em] text-black/70 line-clamp-2" style={entry.textW ? { maxWidth: entry.textW } : undefined}><EntryText text={entry.text} /></p>
          </div>
          {/* her Desktop.jpg (11 Nov): two lines, back (grey, arrow left) and next (light pink, arrow right);
              the next line fills with pink over the entry's reading time, so it shows when the slider moves on */}
          <div className="relative mt-[0.76vw] flex w-[26.7vw] gap-[1.3vw]">
            <button
              type="button"
              aria-label="Previous game"
              onClick={() => setActive((i) => (i - 1 + ENTRIES.length) % ENTRIES.length)}
              className="group relative flex h-[1.4vw] flex-1 items-center"
            >
              <span className="block h-[2px] w-full bg-black/10 transition-colors duration-300 group-hover:bg-black/35" />
              <span className="absolute left-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[0.22vw] border-r-[0.42vw] border-y-transparent border-r-black/15 transition-colors duration-300 group-hover:border-r-black/40" />
            </button>
            <button
              type="button"
              aria-label="Next game"
              onClick={() => setActive((i) => (i + 1) % ENTRIES.length)}
              className="group relative flex h-[1.4vw] flex-1 items-center"
            >
              <span className="relative block h-[2px] w-full overflow-hidden bg-[#f9c4e8]">
                <span
                  key={active}
                  className="absolute inset-y-0 left-0 bg-[#e3009c]"
                  style={reduced ? { width: `${((active + 1) / ENTRIES.length) * 100}%` } : { animation: `mm-entry-timer ${autoplayMs(entry)}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                />
              </span>
              <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[0.22vw] border-l-[0.42vw] border-y-transparent border-l-[#f48fcf] transition-colors duration-300 group-hover:border-l-[#e3009c]" />
            </button>
          </div>
          <div className="mt-[1.484vw]">
            <Ctas entry={entry} onPlay={onPlay} />
          </div>
        </div>

        {/* Autoplay pauses only while the cursor is on the pictures themselves (Marta, 28 Oct: it has to
            move by itself; a cursor resting anywhere in the section used to stop it). */}
        <div
          className="relative self-stretch overflow-hidden"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          {ENTRIES.map((e, i) => {
            const p = place(i);
            return (
              <div
                key={e.id}
                className="absolute w-max transition-[left,opacity] duration-[850ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                style={{ left: p.left, top: p.top, opacity: p.opacity, zIndex: p.z, pointerEvents: p.seen ? undefined : "none" }}
                aria-hidden={i !== active}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => (i === active ? (e.id === "collaborate" ? null : onPlay(e.id)) : setActive(i))}
                  className="block cursor-pointer"
                >
                  <Visual entry={e} active={i === active} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: all six stacked */}
      {/* Phone, measured line by line on MM-HOME-002 (px of the 390 frame in --q): her type is set tighter
          than plain Inter (Marta, 2 Nov: wider letter spacing and other weights on the site), and every text
          box is her width, so each paragraph breaks into the same lines as hers. */}
      <div className="mm-phone-w px-[calc(var(--q)*20)] pt-[calc(var(--q)*42)] pb-[calc(var(--q)*60)] lg:hidden">
        {/* the computer's copy, at her phone heading size (62/65) */}
        <h2 className="-ml-[calc(var(--q)*2)] whitespace-nowrap text-[length:calc(var(--q)*62)] font-normal leading-[calc(var(--q)*65)] tracking-[-0.07em]">{HEADING_LINES[0]}<br />{HEADING_LINES[1]}</h2>
        <p className="mt-[calc(var(--q)*24)] w-[calc(var(--q)*302)] text-[length:calc(var(--q)*13.5)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.02em] text-[#666]">{INTRO}</p>
        {ENTRIES.map((e, i) => (
          <div key={e.id} className={i === 0 ? "mt-[calc(var(--q)*41)]" : "mt-[calc(var(--q)*57)]"}>
            <p className="text-[length:calc(var(--q)*13)] font-normal uppercase leading-[calc(var(--q)*18)] tracking-[-0.01em] text-[#707070]">{e.label}</p>
            <p className="mt-[calc(var(--q)*13)] w-[calc(var(--q)*302)] text-[length:calc(var(--q)*13.5)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.02em] text-[#4a4a4a]"><EntryText text={e.text} /></p>
            <PhoneVisual entry={e} />
            <PhoneCtas entry={e} onPlay={onPlay} />
          </div>
        ))}
      </div>

      {Object.entries(GAME_COMPONENTS).map(([id, Game]) => (
        <Game key={id} open={game === id} onClose={closeGame} />
      ))}
    </section>
  );
}
