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
// Width of what you actually see of each picture (vw at desktop), and the space between neighbours.
const FOOT = { video: 26, "memory-card": 21.75, "walking-card": 16, image: 30 };
const GAP_VW = 4;

const ENTRIES = [
  {
    id: "word-hunt",
    label: "01 / 05 WORD HUNT",
    // her Desktop.jpg (11 Nov); on the computer it breaks after "them" as in hers (textW)
    text: "Some things are hiding in plain sight. You will find them fast, and then wonder how long they were there.",
    textW: "30.5vw",
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

// Desktop memory card. The number rolls like the card on her live site (Marta, 2 Nov).
function MemoryCard({ className = "" }) {
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-[1.5vw] bg-[#1c1c1c] p-[1.2vw] text-white ${className}`}>
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-white px-[0.7vw] py-[0.35vw] text-[0.62vw] font-medium uppercase text-black">Memory game</span>
        <div className="text-right">
          <RollingCounter className="text-[8.4vw] font-light tracking-tight" />
          <p className="mt-[0.6vw] text-[0.5vw] text-[#e3009c]">© Mamamarta 2026</p>
        </div>
      </div>
      <p className="self-end text-right text-[0.62vw] font-light leading-[1.45]">
        A LITTLE TEST FOR YOUR MIND.<br />Flip the cards.<br />Find the pairs.<br />Trust your memory.
      </p>
      <div className="flex items-end justify-between">
        <p className="text-[3.1vw] leading-[0.95]">Memory<br />Match</p>
        <span className="grid h-[2.2vw] w-[2.2vw] place-items-center rounded-full border border-[#e3009c] text-[1vw] text-[#e3009c]" aria-hidden="true"><ArrowIcon dir="down-left" /></span>
      </div>
    </div>
  );
}

// Phone memory card, measured on MM-HOME-002 (350x450, the card of her live site): pill top left, the rolling
// number top right, the four lines right, "Memory Match" bottom left, the pink ring with its arrow bottom right.
function MemoryCardPhone() {
  return (
    <div className="relative h-[calc(var(--q)*450)] w-[calc(var(--q)*350)] overflow-hidden rounded-[calc(var(--q)*22)] bg-[#1c1c1c] text-white [font-family:'Helvetica_Neue',Helvetica,Arial,sans-serif]">
      <span className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*18)] grid h-[calc(var(--q)*25)] w-[calc(var(--q)*88)] place-items-center rounded-full bg-white text-[length:calc(var(--q)*8.5)] font-medium uppercase text-black/85">Memory game</span>
      <RollingCounter digitWidth="0.46em" className="absolute right-[calc(var(--q)*14)] top-[calc(var(--q)*-8)] text-[length:calc(var(--q)*164)] font-light" />
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

function WalkingCard({ active, className = "" }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-[1.2vw] bg-black p-[0.5vw] text-white max-lg:rounded-[22px] max-lg:p-[8px] ${className}`}>
      <div className="overflow-hidden rounded-[0.9vw] bg-white max-lg:rounded-[16px]">
        <MovingFigure active={active} pos="50% 0%" className="aspect-[300/385] w-full" />
      </div>
      {/* the same words as the phone card (WalkingCardPhone): title, line, the pink round arrow on the right */}
      <div className="flex flex-1 items-center justify-between px-[0.5vw] max-lg:px-2 max-lg:py-5">
        <div>
          <p className="text-[0.94vw] font-light uppercase leading-none tracking-[-0.03em] max-lg:text-[17px]">The Art of Moving</p>
          <p className="mt-[0.4vw] text-[0.52vw] font-light leading-[1.45] text-white/75 max-lg:mt-2 max-lg:text-[10px]">Keep moving. Collect the pink stars.</p>
        </div>
        <span className="grid h-[1.4vw] w-[1.4vw] shrink-0 place-items-center rounded-full bg-[#e3009c] text-[0.6vw] text-white max-lg:h-7 max-lg:w-7 max-lg:text-[11px]" aria-hidden="true"><ArrowIcon dir="up-right" /></span>
      </div>
    </div>
  );
}

function PlusKey({ video, active, className = "" }) {
  const [ok, setOk] = useState(true);
  if (video)
    return <LoopVideo src={video} poster="/assets/games/plus-key.png" alt="Black key with a plus sign" active={active} className={`object-contain mix-blend-multiply brightness-[1.04] contrast-[1.08] ${className}`} />;
  if (!ok) return <div className={className} aria-hidden="true" />;
  return <img src="/assets/games/plus-key.png" alt="Black key with a plus sign" onError={() => setOk(false)} className={`object-contain ${className}`} />;
}

function Visual({ entry, active }) {
  const v = entry.visual;
  if (v.kind === "video")
    // Desktop: the shown picture as large as on MM-HOME-001 (the M about 1200-1824 px at 1920); its light
    // background melts into the white page.
    return <LoopVideo src={v.src} poster={v.poster} alt={v.alt} active={active} className="h-[34vw] w-[37vw] object-cover mix-blend-multiply brightness-[1.04] contrast-[1.08]" />;
  if (v.kind === "memory-card") return <MemoryCard className="h-[28vw] w-[21.75vw]" />;
  if (v.kind === "walking-card") return <WalkingCard active={active} className="h-[28vw] w-[16vw]" />;
  return <PlusKey video={v.video} active={active} className="h-[29vw] w-[31vw]" />;
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
  const base = "inline-flex items-center justify-center gap-[0.45em] font-semibold transition-colors h-[3.5vw] text-[1.2vw]";
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

export default function FoundersChallenge() {
  const [active, setActive] = useState(0);
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
  const paused = !inView || hovering || modalOpen || game != null || reduced;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % ENTRIES.length), autoplayMs(ENTRIES[active]));
    return () => clearTimeout(t);
  }, [active, paused]);

  const onPlay = useCallback((id) => setGame(id), []);
  const closeGame = useCallback(() => setGame(null), []);
  const entry = ENTRIES[active];

  // Carousel as a row (MM-G03-00 / MM-G04-00, measured in vw of the page): the shown entry centred at
  // 79.5vw (29.5vw into this column), each neighbour 4vw from it, edge to edge of what you see (the apple
  // 25.5vw wide, the cards 21.75 / 16vw, the key 30vw). The previous one shows blurred on the left (cut at
  // 56.5vw by the soft edge), the next one peeks on the right; the rest wait out of sight and invisible,
  // so 06 → 01 moves on like any other step.
  const n = ENTRIES.length;
  const signedRel = (i) => {
    const r = (i - active + n) % n;
    return r > n / 2 ? r - n : r;
  };
  const place = (i) => {
    const rel = signedRel(i);
    // her Desktop.jpg (11 Nov): the shown entry centred at about 70.5vw (20.5vw into this column), the next one
    // from about 87vw; nothing of the previous one shows to the left of the shown M
    let c = 20.5;
    if (rel > 0) {
      let k = active;
      for (let s = 0; s < rel; s++) {
        const next = (k + 1) % n;
        c += FOOT[ENTRIES[k].visual.kind] / 2 + GAP_VW + FOOT[ENTRIES[next].visual.kind] / 2;
        k = next;
      }
    } else if (rel < 0) {
      let k = active;
      for (let s = 0; s < -rel; s++) {
        const prev = (k - 1 + n) % n;
        c -= FOOT[ENTRIES[k].visual.kind] / 2 + GAP_VW + FOOT[ENTRIES[prev].visual.kind] / 2;
        k = prev;
      }
    }
    const seen = rel >= -1 && rel <= 1;
    return { left: `${c}vw`, opacity: seen ? 1 : 0, filter: rel === -1 ? "blur(10px)" : "blur(0px)", z: rel === 0 ? 3 : seen ? 2 : 0 };
  };

  return (
    <section ref={sectionRef} id="my-system" className="relative bg-white font-[Inter] text-black">
      <span id="typography" className="absolute top-0" aria-hidden="true" />

      {/* Desktop */}
      <div className="hidden lg:grid lg:min-h-[56vw] lg:grid-cols-[50%_50%] lg:items-center">
        <div className="pl-[8.85vw] py-[6vw]">
          {/* Type measured on her 2x frames (MM-C06 _Entry, 3840 px = 1920): label 17 px, heading 154 px tight,
              body and entry text 21/34 regular dark grey, entry label 21 px caps grey. */}
          {/* Marta's reworked home (her Desktop.jpg, 11 Nov): heading 150/141, intro 22/34 black 69%. */}
          <h2 className="relative z-20 mt-[1.9vw] -ml-[0.5vw] whitespace-nowrap text-[7.8125vw] font-normal leading-[7.34vw] tracking-[-0.07em]">{HEADING_LINES[0]}<br />{HEADING_LINES[1]}</h2>
          <p className="mt-[2.9vw] max-w-[33.5vw] text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.02em] text-black/70">{INTRO}</p>
          {/* The description always takes exactly 2 lines, so the progress line and buttons never move. */}
          <div key={active} className="mm-slide-in mt-[3.2vw]">
            <p className="text-[1.146vw] font-normal uppercase tracking-[-0.01em] text-black/50">{entry.label}</p>
            <p className="mt-[0.9vw] h-[3.54vw] max-w-[37vw] overflow-hidden text-[1.146vw] font-normal leading-[1.77vw] tracking-[-0.02em] text-black/70 line-clamp-2" style={entry.textW ? { maxWidth: entry.textW } : undefined}><EntryText text={entry.text} /></p>
          </div>
          {/* her Desktop.jpg (11 Nov): two lines, back (grey, arrow left) and next (light pink, arrow right);
              the next line fills with pink over the entry's reading time, so it shows when the slider moves on */}
          <div className="relative mt-[0.7vw] flex w-[26.7vw] gap-[1.3vw]">
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
          <div className="mt-[1.6vw]">
            <Ctas entry={entry} onPlay={onPlay} />
          </div>
        </div>

        {/* Autoplay pauses only while the cursor is on the pictures themselves (Marta, 28 Oct: it has to
            move by itself; a cursor resting anywhere in the section used to stop it). */}
        <div
          className="relative h-[34vw] overflow-hidden"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
        >
          {ENTRIES.map((e, i) => {
            const p = place(i);
            return (
              <div
                key={e.id}
                className="absolute top-1/2 flex w-max -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[left,opacity,filter] duration-[850ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
                style={{ left: p.left, opacity: p.opacity, filter: p.filter, zIndex: p.z }}
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
          {/* the soft left edge: the blurred previous entry is cut at about 56.5vw of the page, as in her frames */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[10%] bg-[linear-gradient(to_right,#fff_0%,#fff_74%,rgba(255,255,255,0)_100%)]" />
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
