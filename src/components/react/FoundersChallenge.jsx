import React, { useCallback, useEffect, useRef, useState } from "react";
import WordHunt from "./games/WordHunt.jsx";
import MemoryMatch from "./games/MemoryMatch.jsx";
import TicTacToe from "./games/TicTacToe.jsx";
import ArtOfMoving from "./games/ArtOfMoving.jsx";
import ConnectPath from "./games/ConnectPath.jsx";

// MM-HOME "The founder's challenge" (Marta's spec 01-home.md, frames MM-G01-00 … MM-G05-00, MM-C06 _Entry).
// Desktop: text left, carousel right with 6 entries; autoplay every 5 s in a loop (06 → 01), paused while the
// cursor is over it or a game modal is open ("mm-modal"). Each Play opens its game as a modal over the Homepage.
// Mobile: the 6 entries stacked, no carousel, no autoplay.
// Entry 06 opens the two forms (Flow A / Flow B) through the window event "mm-open-form" (forms: next part).

const AUTOPLAY_MS = 5000;
// Width of what you actually see of each picture (vw at desktop), and the space between neighbours.
const FOOT = { video: 26, "memory-card": 21.75, "walking-card": 16, image: 30 };
const GAP_VW = 4;

const ENTRIES = [
  {
    id: "word-hunt",
    label: "01 / WORD HUNT · 60 SEC",
    text: "Think you can spot what others miss? Hidden words are waiting in plain sight. How many can you uncover?",
    visual: { kind: "video", src: "/assets/m.mp4", poster: "/assets/m-poster.webp", alt: "Letter M" },
  },
  {
    id: "memory-match",
    label: "02 / MEMORY MATCH · 60 SEC",
    text: "20 cards, 10 pairs. A brand works the same way: people come back to what they recognise.",
    visual: { kind: "memory-card" },
  },
  {
    id: "tic-tac-toe",
    label: "03 / TIC-TAC-TOE · 60 SEC",
    text: "Every move is a decision. Three in a row sounds easy. But can you outsmart your opponent? Your move.",
    visual: { kind: "video", src: "/assets/apple.mp4", poster: "/assets/apple-poster.webp", alt: "Black apple" },
  },
  {
    id: "art-of-moving",
    label: "04 / THE ART OF MOVING · 60 SEC",
    text: ["Momentum. Keep moving, collect the pink.", "Growth is a series of small, well-timed steps."],
    visual: { kind: "walking-card" },
  },
  {
    id: "connect-the-path",
    label: "05 / CONNECT THE PATH · 60 SEC",
    text: "Every point has a purpose. A good product leads people there without a map. Can you complete it?",
    visual: { kind: "video", src: "/assets/google.mp4", poster: "/assets/google-poster.webp", alt: "Glove in the shape of a G" },
  },
  {
    id: "collaborate",
    label: "WHAT IF YOUR BRAND HAD ITS OWN GAME?",
    text: "Turn your idea into something people can play with. Suggest a game for MamaMarta or create a custom interactive experience for your brand.",
    visual: { kind: "image", src: "/assets/games/plus-key.png", alt: "Black key with a plus sign" },
  },
];

const GAME_COMPONENTS = {
  "word-hunt": WordHunt,
  "memory-match": MemoryMatch,
  "tic-tac-toe": TicTacToe,
  "art-of-moving": ArtOfMoving,
  "connect-the-path": ConnectPath,
};

const openForm = (flow) => window.dispatchEvent(new CustomEvent("mm-open-form", { detail: { flow } }));

const Arrow = () => <span aria-hidden="true">→</span>;
const GamepadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="7" width="18" height="11" rx="5" /><path d="M8 10.5v4M6 12.5h4" /><circle cx="15.5" cy="11.5" r="0.9" fill="currentColor" /><circle cx="17.5" cy="13.8" r="0.9" fill="currentColor" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V5h6v2" /><path d="M3 12h18" />
  </svg>
);

// A looping video loaded the way the live site's card row does it (scripts/lazy-videos.js: data-lazy-video +
// data-src, fetched and played when it comes on screen, paused off it). On top, the entry that becomes the
// shown one is started again here, muted first, so the browser always lets it play.
function LoopVideo({ src, poster, alt, active, className }) {
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
  return <video ref={ref} data-lazy-video data-src={src} poster={poster} muted autoPlay loop playsInline preload="none" aria-label={alt} className={className} />;
}

function MemoryCard({ className = "" }) {
  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-[1.5vw] bg-[#1c1c1c] p-[1.2vw] text-white max-lg:rounded-[22px] max-lg:p-[18px] ${className}`}>
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-white px-[0.7vw] py-[0.35vw] text-[0.62vw] font-medium uppercase text-black max-lg:px-3 max-lg:py-1.5 max-lg:text-[10px]">Memory game</span>
        <div className="text-right">
          <p className="text-[8.4vw] font-light leading-[0.85] tracking-tight max-lg:text-[30vw]">01</p>
          <p className="mt-[0.6vw] text-[0.5vw] text-[#e3009c] max-lg:mt-2 max-lg:text-[8px]">© MamaMarta 2026</p>
        </div>
      </div>
      <p className="self-end text-right text-[0.62vw] font-light leading-[1.45] max-lg:text-[10px]">
        A LITTLE TEST FOR YOUR MIND.<br />Flip the cards.<br />Find the pairs.<br />Trust your memory.
      </p>
      <div className="flex items-end justify-between">
        <p className="text-[3.1vw] leading-[0.95] max-lg:text-[12vw]">Memory<br />Match</p>
        <span className="grid h-[2.2vw] w-[2.2vw] place-items-center rounded-full border border-[#e3009c] text-[1vw] max-lg:h-9 max-lg:w-9 max-lg:text-base" aria-hidden="true">↙</span>
      </div>
    </div>
  );
}

function WalkingCard({ active, className = "" }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-[1.2vw] bg-black p-[0.5vw] text-white max-lg:rounded-[22px] max-lg:p-[8px] ${className}`}>
      <div className="overflow-hidden rounded-[0.9vw] bg-white max-lg:rounded-[16px]">
        <LoopVideo src="/assets/human-walking.mp4" poster="/assets/human-walking-poster.webp" alt="Walking figure" active={active} className="aspect-[300/385] w-full object-cover object-top" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-[1vw] text-center max-lg:py-5">
        <p className="text-[0.95vw] font-light max-lg:text-[17px]">Redefine Your Look</p>
        <p className="mt-[0.4vw] text-[0.5vw] font-light leading-[1.5] text-white/55 max-lg:mt-2 max-lg:text-[9px]">
          A sleek, modern trench coat blends bold elegance<br />with timeless sophistication for any occasion.
        </p>
        <span className="mt-[0.8vw] inline-flex items-center gap-[0.4vw] rounded-full border border-white/20 bg-gradient-to-r from-[#1a1a1f] to-[#3a3a40] py-[0.25vw] pl-[0.6vw] pr-[0.25vw] text-[0.5vw] font-light max-lg:mt-3 max-lg:gap-2 max-lg:py-1 max-lg:pl-3 max-lg:pr-1 max-lg:text-[10px]" aria-hidden="true">
          Learn more
          <span className="grid h-[1.1vw] w-[1.1vw] place-items-center rounded-full bg-[#e3009c] text-[0.55vw] max-lg:h-5 max-lg:w-5 max-lg:text-[10px]">↗</span>
        </span>
      </div>
    </div>
  );
}

function PlusKey({ className = "" }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className={className} aria-hidden="true" />;
  return <img src="/assets/games/plus-key.png" alt="Black key with a plus sign" onError={() => setOk(false)} className={`object-contain ${className}`} />;
}

function Visual({ entry, active, mobile }) {
  const v = entry.visual;
  if (v.kind === "video")
    // Desktop: the shown picture as large as on MM-HOME-001 (the M about 1200-1824 px at 1920); its light
    // background melts into the white page.
    return <LoopVideo src={v.src} poster={v.poster} alt={v.alt} active={active} className={mobile ? "w-full object-contain" : "h-[34vw] w-[37vw] object-cover mix-blend-multiply brightness-[1.04] contrast-[1.08]"} />;
  if (v.kind === "memory-card") return <MemoryCard className={mobile ? "aspect-[435/560] w-full" : "h-[28vw] w-[21.75vw]"} />;
  if (v.kind === "walking-card") return <WalkingCard active={active} className={mobile ? "w-full" : "h-[28vw] w-[16vw]"} />;
  return <PlusKey className={mobile ? "aspect-square w-full" : "h-[29vw] w-[31vw]"} />;
}

function Ctas({ entry, onPlay, stacked }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold transition-colors h-[60px] text-[18px] lg:h-[3.5vw] lg:text-[1.2vw]";
  if (entry.id === "collaborate")
    return (
      <div className={`flex gap-[1.1vw] ${stacked ? "flex-col gap-4" : ""}`}>
        <button type="button" onClick={() => openForm("suggest")} className={`${base} border border-black bg-white text-black hover:bg-black hover:text-white lg:w-[16.25vw] max-lg:w-full`}>
          Suggest a game <GamepadIcon />
        </button>
        <button type="button" onClick={() => openForm("brand")} className={`${base} mm-gradient text-white lg:w-[16.25vw] max-lg:w-full`}>
          Create for my brand <BriefcaseIcon />
        </button>
      </div>
    );
  return (
    <button type="button" onClick={() => onPlay(entry.id)} className={`${base} mm-gradient text-white lg:w-[16.25vw] max-lg:w-full`}>
      Play <Arrow />
    </button>
  );
}

const EntryText = ({ text }) =>
  Array.isArray(text) ? text.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>) : text;

export default function FoundersChallenge() {
  const [active, setActive] = useState(0);
  const [hoverSeg, setHoverSeg] = useState(null);
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

  // Autoplay: a fresh 5 s after every change; nothing runs while paused.
  const paused = !inView || hovering || modalOpen || game != null || reduced;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % ENTRIES.length), AUTOPLAY_MS);
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
    let c = 29.5;
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
          <p className="text-[0.9vw] font-normal text-[#333]">M's Interface System</p>
          <h2 className="relative z-20 mt-[1.7vw] whitespace-nowrap text-[8vw] font-normal leading-[0.91] tracking-[-0.08em]">The founder’s<br />challenge</h2>
          <p className="mt-[3.3vw] max-w-[35.5vw] text-[1.1vw] font-normal leading-[1.62] text-[#3d3d3d]">
            5 small games. Each one is built on a principle Marta uses in every product. Play first. Talk later.
          </p>
          {/* The description always takes exactly 2 lines, so the progress line and buttons never move. */}
          <div key={active} className="mm-slide-in mt-[3.6vw]">
            <p className="text-[1.1vw] font-normal uppercase text-[#7a7a7a]">{entry.label}</p>
            <p className="mt-[1vw] h-[calc(1.1vw*1.62*2)] max-w-[37vw] overflow-hidden text-[1.1vw] font-normal leading-[1.62] text-[#3d3d3d] line-clamp-2"><EntryText text={entry.text} /></p>
          </div>
          <div className="relative mt-[1.6vw] flex w-[32.2vw]" role="tablist" aria-label="The founder's challenge">
            {ENTRIES.map((e, i) => (
              <button
                key={e.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={e.label}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHoverSeg(i)}
                onMouseLeave={() => setHoverSeg(null)}
                className="group flex h-[1.4vw] flex-1 items-center"
              >
                <span
                  className={`block h-[2px] w-full transition-colors duration-300 ${
                    i === active ? "bg-[#e3009c]" : hoverSeg === i ? "bg-black/35" : "bg-black/10"
                  }`}
                />
              </button>
            ))}
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
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[15%] bg-[linear-gradient(to_right,#fff_0%,#fff_74%,rgba(255,255,255,0)_100%)]" />
        </div>
      </div>

      {/* Mobile: all six stacked */}
      <div className="px-[20px] pb-14 pt-12 lg:hidden">
        <p className="text-[13px] font-light text-black/75">M's Interface System</p>
        <h2 className="mt-3 text-[13vw] font-normal leading-[0.95] tracking-[-0.03em]">The founder’s<br />challenge</h2>
        <p className="mt-6 text-[15px] font-light leading-[1.55] text-black/75">
          5 small games. Each one is built on a principle Marta uses in every product. Play first. Talk later.
        </p>
        {ENTRIES.map((e) => (
          <div key={e.id} className="mt-12">
            <p className="text-[14px] font-light uppercase text-black/55">{e.label}</p>
            <p className="mt-3 text-[15px] font-light leading-[1.55] text-black/80"><EntryText text={e.text} /></p>
            <div className="mt-6 flex justify-center">
              <Visual entry={e} active={false} mobile />
            </div>
            <div className="mt-6">
              <Ctas entry={e} onPlay={onPlay} stacked />
            </div>
          </div>
        ))}
      </div>

      {Object.entries(GAME_COMPONENTS).map(([id, Game]) => (
        <Game key={id} open={game === id} onClose={closeGame} />
      ))}
    </section>
  );
}
