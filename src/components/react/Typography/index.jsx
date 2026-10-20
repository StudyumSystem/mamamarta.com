import React, { useEffect, useRef, useState } from "react";
import Counter from "./Counter.jsx";

const cards = [
  { id: "m" },
  {
    id: "executive-summary",
    section: "Section 1",
    title: "Executive Summary",
    description: "Set the stage for your business plan by presenting a concise overview of your company’s purpose, vision, and goals.",
  },
  { id: "apple" },
  {
    id: "human-walking",
    section: "Section 2",
    title: "Redefine Your Look",
    description: "A sleek, modern trench coat blends bold elegance with timeless sophistication for any occasion.",
  },
  { id: 'google' },
  { id: 'x' }
];

export default function TypographySection() {
  const railRef = useRef(null);
  
  // State to track the scroll progress from 0.0 to 1.0
  const [scrollProgress, setScrollProgress] = useState(0);

  // The card row loops forever: the cards are there twice, and whenever the row reaches the first card's
  // copy it jumps back by exactly one set, which looks the same, so it never reaches an end. It slides on
  // its own while on screen; a touch, the mouse over it or a scroll by hand pauses it. Off for reduced motion.
  const loopWidth = () => {
    const track = railRef.current?.firstElementChild;
    const first = track?.children[0];
    const copy = track?.children[cards.length];
    return first && copy ? copy.offsetLeft - first.offsetLeft : 0;
  };
  const wrap = (rail) => {
    const w = loopWidth();
    if (w > 0 && rail.scrollLeft >= w) rail.scrollLeft -= w;
    return w;
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SPEED = 40; // pixels per second
    let visible = false;
    let pausedUntil = 0;
    let pos = rail.scrollLeft;
    let last = performance.now();
    let frame;
    const pause = (ms = 3500) => { pausedUntil = performance.now() + ms; };
    const hover = () => pause(60_000);
    const leave = () => pause(1500);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 });
    io.observe(rail);
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (now <= pausedUntil) pos = rail.scrollLeft; // he scrolled by hand: carry on from there
      else if (visible) {
        const w = loopWidth();
        if (w > 0) {
          pos += SPEED * dt;
          if (pos >= w) pos -= w;
          rail.scrollLeft = pos;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    rail.addEventListener("pointerdown", pause);
    rail.addEventListener("touchstart", pause, { passive: true });
    rail.addEventListener("wheel", pause, { passive: true });
    rail.addEventListener("mouseenter", hover);
    rail.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      rail.removeEventListener("pointerdown", pause);
      rail.removeEventListener("touchstart", pause);
      rail.removeEventListener("wheel", pause);
      rail.removeEventListener("mouseenter", hover);
      rail.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Calculate exactly how far the user has scrolled
  const handleScroll = (e) => {
    // Position within one set of cards (0 to 1); scrolling by hand past the copy wraps around too.
    const w = wrap(e.target);
    if (w > 0) setScrollProgress((e.target.scrollLeft % w) / w);
  };

  return (
    <section id="typography" className="px-3 py-6 min-h-screen max-h-screen bg-white text-black xs:px-4 sm:px-8 md:pt-4 sm:pt-6 xl:mt-6 2xl:mt-8 pb-8 font-sans overflow-hidden">
      <div className="mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="w-full sm:px-[3rem] order-1" data-reveal>
          <div>
            <p className="mb-4 sm:mb-2 text-2xl tracking-tight xs:text-sm sm:text-base md:text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl">Every digital product starts with structure.</p>
          </div>

          <div className="flex justify-between w-full flex-col sm:items-center md:flex-row xl:flex-row 2xl:flex-row">
            <h1 className="mb-8 text-[17vw] sm:mb-4 text-7xl font-medium leading-[0.95] xs:text-3xl sm:text-4xl md:text-6xl sm:text-7xl xl:text-8xl 2xl:text-9xl">My Interface<br />Systems</h1>
            <p className="text-[3.7vw] max-w-[68vw] sm:max-w-[22vw] md:max-w-[22vw] lg:max-w-[22vw] leading-snug text-pink-500 sm:text-[1.6vw]">Interfaces begin as systems. Hierarchy, rhythm, and visual logic shape how products communicate and function.</p>
          </div>
        </div>

        {/* Building Blocks & CUSTOM SCROLLBAR */}
        <div data-reveal className="order-3 sm:order-2 grid grid-cols-1 items-end gap-4 xs:gap-5 sm:gap-6 md:grid-cols-12 md:gap-8 sm:gap-10 2xl:gap-12 sm:px-[3rem]">
          <div className="md:col-span-4">
            <div className="max-w-[340px]">
              <h3 className="mb-3 sm:mb-1 text-lg font-medium xs:text-[0.35rem] sm:text-[0.4rem] md:text-[0.5rem] sm:text-[0.6rem] xl:text-[0.7rem] 2xl:text-[0.8rem]">The Building Blocks</h3>
              <p className="sm:leading-tight text-gray-600 xs:text-[0.35rem] sm:text-[0.4rem] md:text-[0.5rem] sm:text-[0.6rem] xl:text-[0.7rem] 2xl:text-[0.8rem]">Launch. Get feedback. Refine. Rinse again.<br />A continuous loop that drives real growth.</p>
            </div>
          </div>
          
          <div className="md:col-span-8 sr-only sm:not-sr-only">
            <div className="relative h-px w-full bg-gray-200">
              {/* The Pink Thumb */}
              <div 
                className="absolute top-0 h-full w-24 bg-pink-500 transition-all duration-75 ease-out"
                style={{ 
                  // Move left based on percentage, but subtract the width of the thumb (w-24 = 6rem) 
                  // so it stops exactly at the end of the gray line.
                  left: `calc(${scrollProgress * 100}% - ${scrollProgress * 6}rem)` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* HORIZONTAL SCROLLING CONTENT */}
        <div
          ref={railRef}
          onScroll={handleScroll}
          className="order-2 scrollbar-hide overflow-x-auto bg-white"
        >
          <div className="marquee-track flex items-center gap-8">
            {[...cards, ...cards].map((card, idx) => {
              const key = `${card.id}-${idx}`;
              
              if (card.id === "human-walking") {
                return (
                  <article key={key} className="w-[55vw] sm:max-w-[min(100%,200px)] h-[42.5vh] flex-shrink-0 rounded-[1rem] bg-black p-0 text-white">
                    <div className="flex h-full flex-col">
                      <div className="relative overflow-hidden rounded-[1rem] object-contain bg-neutral-200 w-full border-5 border-black bg-white/50">
                        <video src={'/assets/human-walking.mp4'} autoPlay loop muted playsInline preload="auto" className="object-top object-cover transition-transform h-full w-full sm:max-w-[min(100%,200px)]" />
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                        <h2 className="font-thin text-[0.75rem] sm:text-[0.65rem] mt-2 leading-[1.05] tracking-tight text-white">{card.title}</h2>
                        <p className="text-[0.45rem] sm:text-[0.32rem] font-thin mt-1 leading-relaxed text-white/55">A sleek, modern trench coat blends bold elegance</p>
                        <p className="text-[0.45rem] sm:text-[0.32rem] font-thin leading-relaxed text-white/55">with timeless sophistication for any occasion.</p>
                        <button className="mt-2 mb-3 p-[0.3rem] inline-flex items-center gap-1 rounded-full border border-white/20 bg-gradient-to-r from-[#1a1a1f] to-[#3a3a40] text-[0.85rem] font-medium text-white transition-all duration-300 hover:scale-[1.03] hover:border-white/35 xs:text-[0.2rem] sm:text-[0.22rem] md:text-[0.25rem] sm:text-[0.35rem] 2xl:text-[0.4rem]">
                          <span className="tracking-tight font-light text-[0.5rem] sm:text-[0.35rem] ml-1">Learn more</span>
                          <span className="grid h-3 w-3 place-items-center rounded-full bg-pink-500 text-white">
                            <span className="leading-none text-[0.4rem] sm:text-[0.3rem]">↗</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }

              if (["apple", "x", "m"].includes(card.id)) {
                return <video key={key} autoPlay muted loop playsInline preload="auto" src={`/assets/${card.id}.mp4`} className="h-[45vh] object-contain" />;
              }

              if (card.id === "google") {
                return <video key={key} autoPlay muted loop playsInline preload="auto" src={`/assets/${card.id}.mp4`} className="h-[45vh] object-contain" />;
              }

              return (
                <div key={key} className="bg-black flex flex-col p-[1.25rem] rounded-[0.75rem] text-white min-w-[70vw] sm:min-w-[min(100%,250px)] h-[42.5vh] justify-between">
                  <div className="flex justify-between">
                    <div className="h-4 pointer-events-none rounded-full bg-white px-2 py-1">
                      <p className="text-[0.45rem] font-medium uppercase text-black/75 xs:text-[0.2rem] sm:text-[0.22rem] md:text-[0.25rem] sm:text-[0.32rem] xl:text-[0.4rem] 2xl:text-[0.5rem]">{card.section}</p>
                    </div>
                    <div className=" right-4 top-0 pointer-events-none flex flex-col items-end">
                      <div className="leading-none">
                        <Counter fontSize={60} background={false} speed={1000} />
                      </div>
                      <div className="mt-1 text-[0.62rem] font-medium text-pink-500 xs:text-[0.25rem] sm:text-[0.3rem] md:text-[0.35rem] sm:text-[0.4rem] xl:text-[0.45rem] 2xl:text-[0.55rem]">© MamaMarta 2025</div>
                    </div>
                  </div>
                  <div className="leading-tighter text-[1.75vw] sm:text-[min(100%,6px)] justify-end flex clamp-3">
                    <div className="w-[60%] text-right font-extralight">{card.description}</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <h2 className="text-[11vw] sm:text-[min(38px,8vw)] left-4 bottom-4 max-w-[10ch] text-white" style={{ lineHeight: 0.95 }}>{card.title}</h2>
                    <div className=" right-6 bottom-6 md:right-4 md:bottom-4 xl:right-4 xl:bottom-4 2xl:right-4 2xl:bottom-4">
                      <button className="grid h-10 w-10 md:h-6 md:w-6 sm:h-7 sm:w-7 xl:h-8 xl:w-8 2xl:h-10 2xl:w-10 place-items-center rounded-full border-1 md:border-1 sm:border-1.5 border-pink-500 bg-transparent text-pink-500 transition-all duration-300 hover:scale-110 hover:bg-pink-500 hover:text-white active:scale-95">
                        <span className="text-xl md:text-xs sm:text-xs xl:text-xs 2xl:text-xs">↙</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}