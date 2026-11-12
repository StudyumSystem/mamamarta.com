import React from "react";
import ArrowIcon from "./ArrowIcon";

// What is an amazing experience, on WHITE as in Marta's reworked home (her Desktop.jpg, 11 Nov): no black block.
// Behind it her M, faded to pink, and her black cable running across. Desktop (1920 frame, px / 19.2 = vw):
// heading 150/141 from 150 px down at 1012 px, "experience" in italic with her pink "?" lying on its side,
// body 22/31 black 70% at 621 px, the gradient button 312x68 at 767 px (it still opens The Method).
// The M and the cable are her own pictures (m-letter, wire): the M mirrored, its greys turned to her light pink
// (the picture over a pink square with "lighten": black becomes the pink, white stays white); the cable twice,
// laid over the page with "multiply" so its white disappears; the two cables meet behind the button.
// Phone (390 frame, --q): the same copy and order on white, her phone type (heading in three lines, 65 px
// apart), body 252 wide, button 46 tall, the pink M and the cable's loops below.

const PINK = "#fcd2f0";

// Her pink "?" on its side, taken from her heading picture (whatIs.webp, 1200x633, lines 200 px apart,
// type about 213 px): only the corner where the "?" is, so nothing of the letters comes with it.
// Its dot is drawn here (it sits too close to the "e" to cut cleanly), its hook comes from the picture.
// 12 Nov 01:38, Marta sent the "?" itself (68 x 38, her 1920 frame): in her Figma it is a pink "?" in Inter
// Regular 91 px (heading 150 px) turned 87.65° so it lies on its side, the dot on the left. It is drawn the same
// way here, as type, so it stays sharp on every screen: a box her glyph's size (68 x 38 of 150), the dot where
// she placed it on the end of the e's tail (11 Nov 20:00).
const Squiggle = () => (
  <span
    aria-hidden="true"
    className="relative inline-block"
    style={{ width: `${68 / 150}em`, height: `${38 / 150}em`, marginLeft: "-0.085em", verticalAlign: "-0.03em" }}
  >
    <span
      className="absolute left-1/2 top-1/2 not-italic"
      style={{
        fontSize: `${91 / 150}em`,
        lineHeight: 1,
        fontWeight: 400,
        letterSpacing: 0,
        color: "#F600A9",
        transform: "translate(-50%, -50%) rotate(87.65deg)",
      }}
    >
      ?
    </span>
  </span>
);

const Heading = ({ className = "" }) => (
  <h2 className={className}>
    What is
    <br />
    an amazing
    <br />
    <em className="font-normal italic">experience</em>
    <Squiggle />
    <span className="sr-only">?</span>
  </h2>
);

const BODY = "It is never accidental. It is the decisions people never notice, but always feel.";

// The M, mirrored, in pink: her M picture's shape as a mask over a pink that fades to white towards the
// text, as in her picture (strongest on the left).
const PinkM = ({ className = "", style }) => (
  <div className={`pointer-events-none absolute [transform:scaleX(-1)] ${className}`} aria-hidden="true" style={style}>
    <div
      className="h-full w-full"
      style={{
        background: `linear-gradient(to left, ${PINK} 0%, ${PINK} 30%, rgba(252,210,240,0.5) 62%, rgba(252,210,240,0) 88%)`,
        WebkitMaskImage: "url(/assets/m-letter.webp)",
        maskImage: "url(/assets/m-letter.webp)",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
      }}
    />
  </div>
);

export default function WhatIsSection() {
  return (
    <section id="what-is" className="mm-phone-w relative overflow-hidden bg-white text-black">
      {/* Computer */}
      <div className="relative hidden h-[56.25vw] sm:block">
        <PinkM style={{ left: "-2.08vw", top: "-2.08vw", width: "62.24vw", height: "57.29vw" }} />
        {/* Her cable layer (Line.png, 11 Nov 17:44): the whole 1920x1080 frame at 2x, cable and its grey slabs on
            transparent, so it lies over the frame exactly as in her design */}
        {/* fixed in place (its ends stay on the screen's edges); it draws in and a pink light runs along it */}
        <div className="pointer-events-none absolute left-0 top-0 h-[56.25vw] w-[100vw]" aria-hidden="true">
          <img src="/assets/what-is-line.webp" alt="" className="mm-wire-draw h-full w-full max-w-none" />
          <div className="mm-wire-sheen absolute inset-0" />
        </div>

        <div className="absolute left-[52.7vw] top-[7.81vw] z-10">
          <Heading className="text-[7.8125vw] font-normal leading-[7.34vw] tracking-[-0.06em]" />
        </div>
        <p className="absolute left-[52.7vw] top-[32.35vw] z-10 w-[30.5vw] text-[1.094vw] leading-[1.615vw] tracking-[-0.02em] text-black/70">{BODY}</p>
        <a
          href="/what-is"
          className="mm-gradient group absolute left-[52.66vw] top-[39.95vw] z-10 inline-flex h-[3.54vw] w-[16.25vw] items-center justify-center gap-[0.3em] text-[1.146vw] font-semibold text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>

      {/* Phone */}
      <div className="relative h-[calc(var(--q)*893)] sm:hidden">
        <PinkM
          className="left-[calc(var(--q)*-24)] top-[calc(var(--q)*441)] h-[calc(var(--q)*455)] w-[calc(var(--q)*380)]"
        />
        <div className="pointer-events-none absolute left-[calc(var(--q)*-40)] top-[calc(var(--q)*430)] w-[calc(var(--q)*820)]" aria-hidden="true">
          <img src="/assets/what-is-line.webp" alt="" className="mm-wire-draw block w-full max-w-none" />
          <div className="mm-wire-sheen absolute inset-0" />
        </div>
        <Heading className="absolute left-[calc(var(--q)*18)] top-[calc(var(--q)*47)] z-10 text-[length:calc(var(--q)*56)] font-normal leading-[calc(var(--q)*65)] tracking-[-0.06em]" />
        <p className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*265)] z-10 w-[calc(var(--q)*252)] text-[length:calc(var(--q)*13.5)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.02em] text-black/70">
          {BODY}
        </p>
        <a
          href="/what-is"
          className="mm-gradient absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*378)] z-10 flex h-[calc(var(--q)*46)] items-center justify-center gap-[0.3em] px-[calc(var(--q)*20)] text-[length:calc(var(--q)*15.5)] font-semibold text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
