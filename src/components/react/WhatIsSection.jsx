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

// Her pink "?" on its side (12 Nov: her own 4x picture, 271 x 152, drawn at her 68 x 38 of the 150 px heading).
// Marta, 12 Nov: the "?" must JOIN the last letter of "experience" on every screen, so it is placed on the word
// itself, in em of the heading's size, never on the page. Kept Figma copy (Desktop - 39, text 1200:2885 and
// vector "?" 1208:69): its drawn shape starts 682.3 px right of the word's start and 360.5 px below the heading's
// top, i.e. 98.8 px below the top of the word's letters (baseline 407 px with her 150/141 lines, ascent 0.96875em).
// In em of 150: left 4.5487, top 0.6587, size 0.4533 x 0.2533. The dot lands on the end of the e's tail.
const Mark = () => (
  <img
    src="/assets/what-is-question.png"
    width={271}
    height={152}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute max-w-none"
    style={{ left: `${682.3 / 150}em`, top: `${98.8 / 150}em`, width: `${68 / 150}em`, height: `${38 / 150}em` }}
  />
);

// Her Figma (12 Nov): "What’s" with her typographic apostrophe (U+2019), on the computer and the phone.
// "experience" is her Figma's own "Inter Italic" 400 (Figma's Inter is 3.19, whose italic keeps the upright
// letters' flat e and c endings); the site's other Inter is 4.x, whose italic is drawn differently. global.css
// (.mm-exp) loads Inter 3.19 Italic for this one word.
const Heading = ({ className = "" }) => (
  <h2 className={className}>
    What’s
    <br />
    an amazing
    <br />
    <em className="mm-exp relative">
      experience
      <Mark />
    </em>
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

// Her cable (12 Nov, Marta: it moved as two halves and looked split; it must move as ONE piece, a single gentle
// sway, both ends fixed, the pink light still running along it, no appearing, nothing else). One picture, one
// motion (global.css .mm-wire-sway); the pink light runs inside it, so it moves with it.
const Cable = () => (
  <div className="mm-wire-part mm-wire-sway absolute inset-0">
    <img src="/assets/what-is-line.webp" alt="" className="block h-full w-full max-w-none" />
    <div className="mm-wire-sheen absolute inset-0" />
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
        <div className="pointer-events-none absolute left-0 top-0 h-[56.25vw] w-[100vw]" aria-hidden="true">
          <Cable />
        </div>

        <div className="absolute left-[52.7vw] top-[7.71vw] z-10">
          <Heading className="text-[7.8125vw] font-normal leading-[7.34vw] tracking-[-0.06em]" />
        </div>
        {/* her Figma: body 22/31, -0.04em, 658 wide at 1011, 621; button text 22 semibold -0.017em */}
        <p className="absolute left-[52.66vw] top-[32.34vw] z-10 w-[34.27vw] text-[1.146vw] leading-[1.615vw] tracking-[-0.04em] text-black/70">{BODY}</p>
        <a
          href="/what-is"
          className="mm-gradient group absolute left-[52.66vw] top-[39.95vw] z-10 inline-flex h-[3.54vw] w-[16.25vw] items-center justify-center gap-[0.3em] text-[1.146vw] font-semibold tracking-[-0.017em] text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>

      {/* Phone */}
      <div className="relative h-[calc(var(--q)*893)] sm:hidden">
        <PinkM
          className="left-[calc(var(--q)*-24)] top-[calc(var(--q)*441)] h-[calc(var(--q)*455)] w-[calc(var(--q)*380)]"
        />
        <div className="pointer-events-none absolute left-[calc(var(--q)*-40)] top-[calc(var(--q)*430)] aspect-[16/9] w-[calc(var(--q)*820)]" aria-hidden="true">
          <Cable />
        </div>
        {/* MM-HOME-002 (13 Nov): heading Inter Medium 64/65 -0.06em at 14, 40 ("experience" stays her italic 400);
            body 14/20 -0.04em 260 wide at 20, 265; button 46 tall at 20, 378, at least her 199 wide, 16 semibold -0.023em */}
        <Heading className="absolute left-[calc(var(--q)*14)] top-[calc(var(--q)*40)] z-10 text-[length:calc(var(--q)*64)] font-medium leading-[calc(var(--q)*65)] tracking-[-0.06em]" />
        <p className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*265)] z-10 w-[calc(var(--q)*260)] text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/70">
          {BODY}
        </p>
        <a
          href="/what-is"
          className="mm-gradient absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*378)] z-10 flex h-[calc(var(--q)*46)] min-w-[calc(var(--q)*199)] items-center justify-center gap-[0.3em] px-[calc(var(--q)*13)] text-[length:calc(var(--q)*16)] font-semibold tracking-[-0.023em] text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
