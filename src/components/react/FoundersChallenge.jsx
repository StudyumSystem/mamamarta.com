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

// The phone has her own labels and texts (MM-HOME-002, 13 Nov 21:46 UTC, iPhone 16 & 17 Pro - 2): phoneLabel /
// phoneText where they differ from the computer's.
const ENTRIES = [
  {
    id: "word-hunt",
    label: "01 / 05 WORD HUNT",
    // her current Figma (12 Nov): the text box is 528 px wide on the computer (textW)
    text: "Some things are hiding in plain sight. You will find them fast, and then wonder how long they were there.",
    textW: "27.5vw",
    visual: { kind: "video", src: "/assets/m.mp4", poster: "/assets/m-poster.webp", alt: "Letter M" },
  },
  // 02-06: her updated texts (kept Figma copy, 12 Nov: the "Homepage / Slider Position" frames of MM-GAME-02 … 05
  // and MM-C06), Inter 22/34 -0.04em black 69%, text boxes 617 px wide (598 for The Art of Moving).
  {
    id: "memory-match",
    label: "02 / 05 MEMORY MATCH",
    text: "Half of what you need is already in front of you. Finding the pair feels like remembering, not learning.",
    textW: px(617),
    visual: { kind: "memory-card" },
  },
  {
    id: "tic-tac-toe",
    label: "03 / 05 TIC-TAC-TOE",
    text: "Every move closes a door. You will feel the cost of a move you did not think about.",
    phoneLabel: "03 / Tic-tac-toe",
    phoneText: ["Every move is a decision. Three in a row sounds easy. But can you outsmart your opponent?", "Your move."],
    textW: px(617),
    visual: { kind: "video", src: "/assets/apple.mp4", poster: "/assets/apple-poster.webp", alt: "Black apple" },
  },
  {
    id: "art-of-moving",
    label: "04 / 05 THE ART OF MOVING",
    text: "Keep moving and collect the pink. Small steps, on time, build the whole run.",
    phoneLabel: "04 / The Art of Moving",
    phoneText: ["Momentum. Keep moving, collect the pink.", "Growth is a series of small, well-timed steps."],
    textW: px(598),
    visual: { kind: "walking-card" },
  },
  {
    id: "connect-the-path",
    label: "05 / 05 CONNECT THE PATH",
    text: "Every point matters. A good product leads people there without a map.",
    phoneLabel: "05 / Connect the Path",
    phoneText: "Every point has a purpose. A good product leads people there without a map. Can you complete it?",
    textW: px(617),
    visual: { kind: "video", src: "/assets/google.mp4", poster: "/assets/google-poster.webp", alt: "Glove in the shape of a G" },
  },
  {
    id: "collaborate",
    label: "WHAT IF YOUR BRAND HAD ITS OWN GAME?",
    text: "Bring your idea, or let us shape one together. Turn your brand into an interactive experience your audience can play with.",
    phoneText: "Turn your idea into something people can play with. Suggest a game for MamaMarta or create a custom interactive experience for your brand.",
    textW: px(617),
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

// Her own icon for "Suggest a game" (Design System > Icons, Icon_Gaming_Controller_Outline_18: a game controller
// outline with a short bar on top), drawn as a line icon. Phone buttons only for now; the computer keeps its icon.
const ControllerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" className="shrink-0">
    <path d="M7.4 6.2h9.2c1.5 0 2.7 1 3 2.5l1.3 6.2c.3 1.5-.8 2.9-2.3 2.9-.9 0-1.6-.5-2-1.2l-1-1.8H8.4l-1 1.8c-.4.7-1.1 1.2-2 1.2-1.5 0-2.6-1.4-2.3-2.9l1.3-6.2c.3-1.5 1.5-2.5 3-2.5z" />
    <path d="M10 6.2V5h4v1.2" />
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
// The phone (Marta, 12 Nov: "no animations"): the same walk, leap, walk, stumble, from copies whose white is in
// the pixels (scripts/make-phone-videos.mjs: the computer's brightness / contrast baked in, the background pure
// #FFFFFF), so no blend or filter is needed; iPhone Safari applies neither to a <video>.
const PHONE_CLIPS = [
  { src: "/assets/human-walking-phone.mp4", poster: "/assets/human-walking-phone-poster.webp", fix: "" },
  { src: "/assets/games/jump-phone.mp4", fix: "" },
  { src: "/assets/games/stumble-phone.mp4", fix: "" },
];

// phone: the phone copies above (the leap and stumble keep their 1.04 scale, which hides their thin side lines)
function MovingFigure({ active = true, pos = "50% 0%", className = "", order = MOVE_ORDER, phone = false }) {
  const clips = phone ? PHONE_CLIPS : MOVES;
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
    const cur = order[step];
    const nextIdx = order[(step + 1) % order.length];
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (playing && (i === cur || i === nextIdx) && !v.getAttribute("src")) { v.src = clips[i].src; v.preload = "auto"; }
      if (i !== cur || !playing) { v.pause(); return; }
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [step, playing]);
  const onEnded = (i) => {
    if (i !== order[step]) return;
    const nextStep = (step + 1) % order.length;
    const nv = vids.current[order[nextStep]];
    if (nv) { try { nv.currentTime = 0; } catch { /* not loaded yet */ } }
    // one clip only: the step doesn't change, so it is started again here
    if (nextStep === step) { nv?.play().catch(() => {}); return; }
    setStep(nextStep);
  };
  return (
    <div ref={box} className={`relative overflow-hidden bg-white ${className}`}>
      {clips.map((m, i) => (
        <video
          key={m.src}
          ref={(v) => (vids.current[i] = v)}
          poster={i === 0 ? m.poster || "/assets/human-walking-poster.webp" : undefined}
          muted
          playsInline
          preload="none"
          aria-label={i === 0 ? "Walking figure" : undefined}
          aria-hidden={i === 0 ? undefined : "true"}
          onEnded={() => onEnded(i)}
          className={`absolute inset-0 h-full w-full object-cover ${m.fix} ${i === order[step] ? "" : "opacity-0"}`}
          style={{ transform: i > 0 ? "scale(-1.04, 1.04)" : "scaleX(-1)", objectPosition: pos }}
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
// Colours (13 Nov, Marta: the phone card was lighter than hers): her card's own black #171717, pink #F600A9 and
// the four lines #E1E6E2 at 86%, as on the computer card.
function MemoryCardPhone() {
  return (
    <div className="relative h-[calc(var(--q)*450)] w-[calc(var(--q)*350)] overflow-hidden rounded-[calc(var(--q)*22)] bg-[#171717] text-white [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif]">
      <span className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*18)] grid h-[calc(var(--q)*25)] w-[calc(var(--q)*88)] place-items-center rounded-full bg-white text-[length:calc(var(--q)*8.5)] font-medium uppercase text-black/85">Memory game</span>
      <span className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*13)] text-[length:calc(var(--q)*150)] font-light leading-none"><RollingCounter /></span>
      <p className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*156)] text-[length:calc(var(--q)*8)] text-[#F600A9]">© Mamamarta 2026</p>
      <p className="absolute right-[calc(var(--q)*23)] top-[calc(var(--q)*226)] text-right text-[length:calc(var(--q)*9.5)] font-light leading-[calc(var(--q)*12.6)] tracking-[-0.03em] text-[#E1E6E2]/[.86]">
        A LITTLE TEST FOR YOUR MIND.<br />Flip the cards.<br />Find the pairs.<br />Trust your memory.
      </p>
      <p className="absolute left-[calc(var(--q)*21)] top-[calc(var(--q)*331)] text-[length:calc(var(--q)*48)] font-normal leading-[calc(var(--q)*46)] tracking-[-0.02em]">Memory<br />Match</p>
      <span className="absolute right-[calc(var(--q)*24)] top-[calc(var(--q)*393)] grid h-[calc(var(--q)*35)] w-[calc(var(--q)*35)] place-items-center rounded-full border border-[#F600A9] text-[length:calc(var(--q)*15)] text-white" aria-hidden="true"><ArrowIcon dir="down-left" /></span>
    </div>
  );
}

// Phone walking card, MM-HOME-002 (13 Nov 21:46 UTC, smaller than before): black 278 x 357, picture 256 x 292 inset
// 11 px, "THE ART OF MOVING" Inter 400 14/20 white at 308, "Keep moving. Collect the pink stars." Inter 400 12/20
// white 70% at 328, both -0.04em, the pink round arrow 30 x 30 #F600A9 on the right.
function WalkingCardPhone() {
  return (
    <div className="relative h-[calc(var(--q)*357)] w-[calc(var(--q)*278)] overflow-hidden rounded-[calc(var(--q)*19)] bg-black text-white">
      <div className="absolute left-[calc(var(--q)*11)] top-[calc(var(--q)*11)] w-[calc(var(--q)*256)] overflow-hidden rounded-[calc(var(--q)*13)] bg-white">
        <MovingFigure pos="50% 20%" phone className="h-[calc(var(--q)*292)] w-full" />
      </div>
      <p className="absolute left-[calc(var(--q)*11)] top-[calc(var(--q)*308)] whitespace-nowrap text-[length:calc(var(--q)*14)] font-normal uppercase leading-[calc(var(--q)*20)] tracking-[-0.04em]">The Art of Moving</p>
      <p className="absolute left-[calc(var(--q)*11)] top-[calc(var(--q)*328)] whitespace-nowrap text-[length:calc(var(--q)*12)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-white/70">Keep moving. Collect the pink stars.</p>
      <span className="absolute right-[calc(var(--q)*11)] top-[calc(var(--q)*313)] grid h-[calc(var(--q)*30)] w-[calc(var(--q)*30)] place-items-center rounded-full bg-[#F600A9] text-[length:calc(var(--q)*11)] text-white" aria-hidden="true"><ArrowIcon dir="up-right" /></span>
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
// the object plus her gaps above and below, so nothing of the picture's own edge can show (Marta, 2 Nov: "no
// frames, the background pure white #FFFFFF, one with the landing"). w = picture width, h = window height,
// y = picture top in the window.
// Marta, 12 Nov 23:36 (her iPhone): grey block, white boxes round the M, the key… These were <video>s whose own
// background is off-white/light grey, made white only by mix-blend-mode: multiply + a filter. iPhone Safari draws
// a playing <video> in its own layer and doesn't blend it (nor match its colours to the page), so the videos'
// grey showed across the screen and their whitened posters as white boxes; Chrome (our checks) blends them, so
// it never showed there. Marta, 12 Nov (later): "no animations" on the phone with the stills. The phone now plays
// her videos again, from phone copies (scripts/make-phone-videos.mjs, max 720 wide, no sound) whose background is
// pure #FFFFFF in the pixels (the computer's brightness 1.04 / contrast 1.08 baked in), with a poster made the same
// way, and no blend or filter at all: white in the file is white on every screen. ar = the copy's width / height.
// The computer keeps its videos.
// word-hunt (13 Nov, MM-HOME-002 "image 43"): her window is 389 x 278 with 32 px above and below it (pad); her M
// fills it, the flat top on the window's top edge and the dots ending on its bottom, 278 wide, its middle at 190 of
// 390 (x moves it from the middle). In the video's frame the M runs 121-665 of 782 down and 87-635 of 720 across,
// so 368 wide puts it at her size and -61 its top on the window's edge.
// 13 Nov 21:46 UTC (her new MM-HOME-002): every picture is smaller and has its own space above (top, from the
// text) and below (bottom, to Play). Her boxes: the M 339 x 242 at x 23, Memory Match 278 x 357 at 50, the apple
// 303 x 341 at 40, The Art of Moving 278 x 357 at 52, the glove 288 x 289 at 48, the key 268 x 283 at 61. Each
// video keeps the place it had in her earlier boxes (M 389 x 278, apple 350 x 393, glove 328 x 329, key the same),
// scaled to the new box: box = her box's height, y = the video's top from the box's top, x = the middle's shift.
const PHONE_PICTURE = {
  "word-hunt": { w: 320.7, box: 242, y: -53.2, x: -2.5, top: 36, bottom: 46, ar: "720 / 782" },
  "tic-tac-toe": { w: 403.5, box: 341, y: -40.7, x: -3.5, top: 22, bottom: 57, ar: "720 / 794" },
  "connect-the-path": { w: 382, box: 289, y: -61.5, x: -3, top: 42, bottom: 42, ar: "720 / 794" },
  // her key video has more white around the key than the still, so it is drawn a little wider than the key's box
  collaborate: { w: 275, box: 283, y: 4, top: 32, bottom: 45, ar: "640 / 706" },
};
// the two cards: space above and below, and the shift of the card's middle from the page's
const PHONE_CARD = {
  "memory-match": { top: 37, bottom: 46, x: -6 },
  "art-of-moving": { top: 36, bottom: 46, x: -4 },
};
const phoneCopy = (src, ext) => src.replace(/\.mp4$/, ext);
const q = (n) => `calc(var(--q) * ${n})`;

function PhoneVisual({ entry }) {
  const v = entry.visual;
  const c = PHONE_CARD[entry.id];
  if (c)
    return (
      <div className="flex justify-center" style={{ paddingTop: q(c.top), paddingBottom: q(c.bottom), transform: `translateX(${q(c.x)})` }}>
        {/* her Memory Match is the 350 x 450 card drawn at 278 x 357 */}
        {v.kind === "memory-card" ? <div style={{ "--q": "calc(100vw / 390 * 0.7943)" }}><MemoryCardPhone /></div> : <WalkingCardPhone />}
      </div>
    );
  const p = PHONE_PICTURE[entry.id];
  const style = { width: q(p.w), top: q(p.top + p.y), aspectRatio: p.ar };
  if (p.x) style.marginLeft = q(p.x);
  const box = { height: q(p.top + p.box + p.bottom) };
  const src = v.kind === "video" ? v.src : v.video;
  // active={false}: the lazy loader (scripts/lazy-videos.js) fetches and plays it when it comes near
  return (
    <div className="relative -mx-[calc(var(--q)*20)] overflow-hidden bg-white" style={box}>
      <LoopVideo src={phoneCopy(src, "-phone.mp4")} poster={phoneCopy(src, "-phone-poster.webp")} alt={v.alt} active={false} className="absolute left-1/2 block h-auto max-w-none -translate-x-1/2 bg-white" style={style} />
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

// Phone buttons (MM-HOME-002, 13 Nov 21:46 UTC): every button the full 350 x 46, text Inter 16 semibold
// -0.023em. Play →; under the last entry one button, "Make a game for my brand" with her arrow
// (Icon_Arrow_Right_Outline_18), which opens the brand form.
function PhoneCtas({ entry, onPlay }) {
  const base = "mm-gradient flex w-full items-center justify-center gap-[0.4em] font-semibold tracking-[-0.023em] text-white h-[calc(var(--q)*46)] text-[length:calc(var(--q)*16)]";
  if (entry.id === "collaborate")
    return (
      <button type="button" onClick={() => openForm("brand")} className={base}>
        Make a game for my brand <ArrowIcon />
      </button>
    );
  return (
    <button type="button" onClick={() => onPlay(entry.id)} className={base}>
      Play <ArrowIcon />
    </button>
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
          <p className="mt-[3.125vw] max-w-[32.81vw] text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.04em] text-black/[.69]">{INTRO}</p>
          {/* The description always takes exactly 2 lines, so the progress line and buttons never move. */}
          <div key={active} className="mm-slide-in mt-[3.54vw]">
            <p className="text-[1.146vw] font-normal uppercase leading-[1.094vw] tracking-[-0.017em] text-black/50">{entry.label}</p>
            <p className="mt-[1.04vw] h-[3.54vw] max-w-[37vw] overflow-hidden text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.04em] text-black/[.69] line-clamp-2" style={entry.textW ? { maxWidth: entry.textW } : undefined}><EntryText text={entry.text} /></p>
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
      {/* 13 Nov 21:46 UTC, her new phone frame (iPhone 16 & 17 Pro - 2, 390 x 3811): heading 64/60 -0.06em at
          16, 65; intro 303 wide 20 below it; the first label 36 below the intro, every next label 70 below the Play
          before it; text 12 below its label (Word Hunt 333 wide, the rest 325); all text Inter 14/20 -0.04em, labels
          and intro black 60%, entry text black 70%; 56 below the last button. */}
      <div className="mm-phone-w px-[calc(var(--q)*20)] pt-[calc(var(--q)*65)] pb-[calc(var(--q)*56)] lg:hidden">
        <h2 className="-ml-[calc(var(--q)*4)] whitespace-nowrap text-[length:calc(var(--q)*64)] font-normal leading-[calc(var(--q)*60)] tracking-[-0.06em]">{HEADING_LINES[0]}<br />{HEADING_LINES[1]}</h2>
        <p className="mt-[calc(var(--q)*20)] w-[calc(var(--q)*303)] text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/60">{INTRO}</p>
        {ENTRIES.map((e, i) => (
          <div key={e.id} className={i === 0 ? "mt-[calc(var(--q)*36)]" : "mt-[calc(var(--q)*70)]"}>
            <p className="text-[length:calc(var(--q)*14)] font-normal uppercase leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/60">{e.phoneLabel || e.label}</p>
            <p className={`mt-[calc(var(--q)*12)] text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/70 ${e.id === "word-hunt" ? "w-[calc(var(--q)*333)]" : "w-[calc(var(--q)*325)]"}`}><EntryText text={e.phoneText || e.text} /></p>
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
