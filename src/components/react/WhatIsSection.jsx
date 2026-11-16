import React from "react";
import ArrowIcon from "./ArrowIcon";

// What is an amazing experience, on WHITE as in Marta's reworked home (her Desktop.jpg, 11 Nov): no black block.
// Behind it her M, faded to pink, and her black cable running across. Desktop (1920 frame, px / 19.2 = vw):
// heading 150/141 from 150 px down at 1012 px, "experience" in italic with her pink "?" lying on its side,
// body 22/31 black 70% at 621 px, the gradient button 312x68 at 767 px (it still opens The Method).
// The cable is her own exported Figma layers (16 Nov), in two pieces; the M is unchanged.
// Phone (390 frame, --q): the same copy and order on white, her phone type (heading in three lines, 65 px
// apart), body 252 wide, button 46 tall; behind them her own phone layers (her pink M and two cable pieces).

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

// The M stays as it was live (Marta, 15 Nov 19:57: "Там треба поправити шнур в блоці … Біше нічого не змінювати"):
// her M picture, mirrored, as a mask over a pink that fades to white towards the text (strongest on the left).
const PINK = "#fcd2f0";
const PinkM = ({ className = "", style }) => (
  <div className={`absolute [transform:scaleX(-1)] ${className}`} style={style}>
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

// Her Figma update (16 Nov, file changed 00:32 UTC; Marta: "Зроби так для десктопу і мобільної версії"): only
// the cable changes. It is her own exported layers, placed at her numbers from the block's top. The cable is two pieces with
// her shadow (#000 11%, 32/19, blur 14.9) and its right loop hangs below the block, over the white gap above
// Founder's blind spot, as in her frame.
// Marta, 12 Nov: the cable moves as ONE piece, a single gentle sway with both ends fixed, the pink light running
// along it. So every cable piece sits in a wrapper the size of the whole layer box with the same origin and skew
// (global.css .mm-wire-sway-v): the pieces move as one and never split. The pink light runs over the whole box too,
// masked by each piece's picture, so it travels along the cable in one run.
const CablePiece = ({ src, box, origin, sk }) => (
  <div className="mm-wire-part mm-wire-sway-v absolute inset-0" style={{ transformOrigin: origin, "--sk": sk }}>
    <img src={src} alt="" className="absolute block max-w-none" style={box} />
    <div
      className="mm-wire-sheen absolute inset-0"
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskPosition: `${box.left} ${box.top}`,
        maskPosition: `${box.left} ${box.top}`,
        WebkitMaskSize: `${box.width} ${box.height}`,
        maskSize: `${box.width} ${box.height}`,
      }}
    />
  </div>
);
const q = (n) => `calc(var(--q) * ${n})`;

export default function WhatIsSection() {
  return (
    <section id="what-is" className="mm-phone-w relative z-[1] overflow-x-clip bg-white text-black">
      {/* Computer */}
      <div className="relative hidden h-[56.25vw] sm:block">
        {/* Desktop - 39 (16 Nov), px / 19.2 from the block's top, export boxes with blur and shadow. Her layer
            order: right cable, M, left cable, text. The box reaches 1623.5 px down for the hanging loop. */}
        <div className="pointer-events-none absolute left-0 top-0 h-[84.56vw] w-full overflow-hidden" aria-hidden="true">
          <CablePiece
            src="/assets/what-is-cable-right.webp"
            box={{ left: "57.135vw", top: "20.625vw", width: "86.172vw", height: "63.932vw" }}
            origin="-7.969vw 27.344vw"
            sk="-0.2474deg"
          />
          <PinkM style={{ left: "-2.08vw", top: "-2.08vw", width: "62.24vw", height: "57.29vw" }} />
          <CablePiece
            src="/assets/what-is-cable-left.webp"
            box={{ left: "-11.771vw", top: "7.708vw", width: "80.156vw", height: "60.417vw" }}
            origin="-7.969vw 27.344vw"
            sk="-0.2474deg"
          />
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
      <div className="relative h-[calc(var(--q)*844)] sm:hidden">
        {/* MM-HOME-002 (16 Nov): the pink M as it was live (unchanged), under both cable pieces
            (Group 94: 1248:823 top, 1248:824 bottom, boxes with her shadow). The box reaches 977 down, so the
            lower piece hangs below the screen as in her frame. */}
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(var(--q)*977)] w-full overflow-hidden" aria-hidden="true">
          <img
            src="/assets/what-is-m-phone.png"
            alt=""
            className="absolute block max-w-none"
            style={{ left: q(-131), top: q(252), width: q(561), height: q(645.67) }}
          />
          <CablePiece
            src="/assets/what-is-cable-top-phone-2.webp"
            box={{ left: q(163.21), top: q(97.86), width: q(479), height: q(450) }}
            origin="calc(var(--q) * -8) calc(var(--q) * 831)"
            sk="1.556deg"
          />
          <CablePiece
            src="/assets/what-is-cable-bottom-phone-2.webp"
            box={{ left: q(-127.95), top: q(328.55), width: q(611), height: q(647.5) }}
            origin="calc(var(--q) * -8) calc(var(--q) * 831)"
            sk="1.556deg"
          />
        </div>
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
