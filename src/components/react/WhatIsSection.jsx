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
// apart), body 252 wide, button 46 tall; behind them her own phone layers (her pink M and two cable pieces).

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

// Phone (Marta, 14 Nov: her MM-HOME-002 What is screen, frame 1224:184): her own two cable pieces, exported at 3x
// with their shadows (1224:185 the loop at the top right, 1224:190 the S with two loops down to the bottom left),
// placed at her frame's numbers (390 frame, --q). They meet behind the button, as on the computer. Each sways
// like the computer's cable: every point moves up or down by 2.2% of its distance from the line joining the
// piece's two ends, so both ends stay where they are (origin = the end behind the button, --sk = the skew that
// keeps the far end on that line). The pink light runs along each piece.
const PhoneCable = ({ src, box, origin, sk }) => (
  <div className="pointer-events-none absolute" aria-hidden="true" style={box}>
    <div className="mm-wire-part mm-wire-sway-v absolute inset-0" style={{ transformOrigin: origin, "--sk": sk }}>
      <img src={src} alt="" className="block h-full w-full max-w-none" />
      <div
        className="mm-wire-sheen absolute inset-0"
        style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
    </div>
  </div>
);
const q = (n) => `calc(var(--q) * ${n})`;

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
        {/* her Figma: body 22/31, -0.04em, 658 wide at 1011, 621; button text 22 semibold -0.017em;
            her line breaks after "never notice," (14 Nov) */}
        <p className="absolute left-[52.66vw] top-[32.34vw] z-10 w-[34.27vw] text-[1.146vw] leading-[1.615vw] tracking-[-0.04em] text-black/70">It is never accidental. It is the decisions people never notice,<br />but always feel.</p>
        <a
          href="/what-is"
          className="mm-gradient group absolute left-[52.66vw] top-[39.95vw] z-10 inline-flex h-[3.54vw] w-[16.25vw] items-center justify-center gap-[0.3em] text-[1.146vw] font-semibold tracking-[-0.017em] text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>

      {/* Phone */}
      <div className="relative h-[calc(var(--q)*844)] overflow-hidden sm:hidden">
        {/* Her layer order: the top cable, her soft pink M over it, the lower cable, then the text. */}
        <PhoneCable
          src="/assets/what-is-cable-top-phone.png"
          box={{ left: q(145.88), top: q(92), width: q(476.33), height: q(439) }}
          origin="26.68% 69.02%"
          sk="1.3256deg"
        />
        {/* her pink M (Mask group 1224:186, its blur and fade already in the picture), 28 px of blur round her box */}
        <img
          src="/assets/what-is-m-phone.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute max-w-none"
          style={{ left: q(-131), top: q(252), width: q(561), height: q(645.67) }}
        />
        <PhoneCable
          src="/assets/what-is-cable-bottom-phone.png"
          box={{ left: q(-106.55), top: q(336.32), width: q(588.33), height: q(645) }}
          origin="65.15% 11.63%"
          sk="2.1636deg"
        />
        {/* MM-HOME-002, 13 Nov 21:46 UTC (iPhone 16 & 17 Pro - 8, one 844 screen, right after the first screen):
            heading Inter Medium 64/65 -0.06em at 14, 65 ("experience" stays her italic 400); body 14/20 -0.04em
            black 70% at 20, 280 in her three lines; button the full 350 x 46 at 20, 375, 16 semibold -0.023em */}
        <Heading className="absolute left-[calc(var(--q)*14)] top-[calc(var(--q)*65)] z-10 text-[length:calc(var(--q)*64)] font-normal leading-[calc(var(--q)*60)] tracking-[-0.06em]" />
        <p className="absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*280)] z-10 whitespace-nowrap text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/70">
          It is never accidental.<br />It is the decisions people<br />never notice, but always feel.
        </p>
        <a
          href="/what-is"
          className="mm-gradient absolute left-[calc(var(--q)*20)] top-[calc(var(--q)*375)] z-10 flex h-[calc(var(--q)*46)] w-[calc(var(--q)*350)] items-center justify-center gap-[0.3em] text-[length:calc(var(--q)*16)] font-semibold tracking-[-0.023em] text-white"
        >
          See what's underneath <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
