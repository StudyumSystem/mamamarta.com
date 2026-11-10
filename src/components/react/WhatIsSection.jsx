import React from "react";
import ArrowIcon from "./ArrowIcon";

// What is an amazing experience, to Marta's MM-HOME-001 / 002. Desktop (1920 frame): heading 173-924 px from
// 156 px down, body 18/26 in two lines up to 821 px, then the pink gradient "Wanna dive deeper?" (296x68)
// that opens The method. The M on the right is dark grey, the wire runs across it.
// Phone (MM-HOME-002, px of the 390 frame in --q, Marta 2 Nov: "the design fell apart, make it exactly as in
// my Figma"): the block is 893 tall; the heading's three lines sit 65 px apart (the heading picture is cut
// into its three lines to open them up), the body 252 wide in four lines from 265, the button 199x46 at 378,
// the light M from 441 at the bottom left with the wire's loop over it.
const HEADING = "/assets/whatIs.webp"; // 1200x633: lines 200 px apart in the picture

// The three lines of the heading picture, each moved down 12 px more than the one before it. The "g" of
// "amazing" hangs into the third line's band, so the cuts step around it.
const LINES = [
  { clip: "polygon(0 0, 100% 0, 100% 30.8%, 0 30.8%)", y: 0 },
  { clip: "polygon(0 30.8%, 100% 30.8%, 100% 69.5%, 85% 69.5%, 85% 63.2%, 0 63.2%)", y: 12 },
  { clip: "polygon(0 63.2%, 85% 63.2%, 85% 69.5%, 100% 69.5%, 100% 100%, 0 100%)", y: 24 },
];

export default function WhatIsSection() {
  return (
    <section id="what-is" className="mm-phone-w relative flex h-[calc(var(--q)*893)] flex-col overflow-hidden bg-black text-white sm:h-auto sm:min-h-screen sm:px-[9vw] sm:pt-[8.1vw] sm:pb-[6vw]">
      <div
        className="pointer-events-none absolute inset-0 z-20 w-full select-none sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0 sm:max-w-[68rem]"
        aria-hidden="true"
      >
        <div className="relative flex h-full w-full items-end overflow-hidden">
          <img
            src={'/assets/m-letter.webp'}
            alt=""
            data-parallax="-12"
            className="absolute max-w-none brightness-[0.9] contrast-[1.05] [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%)] left-[calc(var(--q)*-24)] top-[calc(var(--q)*441)] w-[calc(var(--q)*380)] transition-transform duration-300 sm:left-auto sm:top-0 sm:right-0 sm:h-screen sm:w-auto sm:max-w-full sm:scale-120 sm:brightness-[0.42] sm:contrast-[1.15] sm:[mask-image:none]"
          />
          <img
            src={'/assets/wire.webp'}
            alt=""
            className="absolute bottom-[calc(var(--q)*186)] scale-[2] rotate-130 transition-transform duration-300 sm:top-[10vh] sm:bottom-auto sm:right-[-80px] sm:h-auto sm:w-[55rem] sm:scale-[1] sm:rotate-0"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="relative z-10 sm:hidden">
        <div data-reveal className="absolute left-[calc(var(--q)*14)] top-[calc(var(--q)*47)] h-[calc(var(--q)*192)] w-[calc(var(--q)*318)]">
          {LINES.map((l, i) => (
            <img
              key={i}
              src={HEADING}
              alt={i === 0 ? "What is an amazing experience?" : ""}
              aria-hidden={i === 0 ? undefined : "true"}
              className="absolute left-0 top-0 w-full max-w-none"
              style={{ clipPath: l.clip, transform: `translateY(calc(var(--q) * ${l.y}))` }}
            />
          ))}
        </div>
        <p data-reveal className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*265)] w-[calc(var(--q)*252)] text-[length:calc(var(--q)*13.5)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.02em] text-white">
          An experience that feels effortless is rarely accidental. It's shaped by the decisions people never notice, but always feel.
        </p>
        <a
          data-reveal
          href="/what-is"
          className="mm-gradient mm-gradient-rev absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*378)] flex h-[calc(var(--q)*46)] w-[calc(var(--q)*199)] items-center justify-center gap-[0.3em] border border-[#e3009c]/25 text-[length:calc(var(--q)*15.5)] font-semibold text-white"
        >
          Wanna dive deeper? <ArrowIcon />
        </a>
      </div>

      {/* Computer */}
      <div className="relative z-10 hidden flex-col sm:flex">
        <img data-reveal src={HEADING} alt="What is an amazing experience?" className="mb-[2.9vw] w-[39vw]" />
        <div data-reveal className="max-w-[34.5vw]">
          <p className="text-[clamp(13px,1.04vw,20px)] leading-[1.55] text-gray-200">An experience that feels effortless is rarely accidental. It's shaped by the decisions people never notice, but always feel.</p>
        </div>
        <div data-reveal className="mt-[4.4vw]">
          <a
            href="/what-is"
            className="mm-gradient group inline-flex w-fit items-center justify-center gap-1.5 font-semibold text-white min-h-[clamp(44px,3.54vw,68px)] min-w-[clamp(200px,15.4vw,296px)] px-6 text-[clamp(14px,1.146vw,22px)]"
          >
            Wanna dive deeper? <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
