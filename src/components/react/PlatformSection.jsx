import React from "react";

// The shapes, as her Figma shows them (14 Nov, Marta, her iPhone screenshot of nine full circles in a grid: "Ця анімація
// внизу не така як у моєму дизайні в фігма... зроби так як на макеті"). Her frame (917:206, 1050:3) is the first
// moment of her moving-objects-loop.mp4: a 720 x 720 square in nine 240 cells, one black circle (r 71) in each, every
// circle 92 off its cell's middle along one axis and cut by its cell's edge, so most show as half circles. Her video
// then slides them into a grid of full circles, grows them into a black field and white shapes on black, none of which
// is in her design. Drawn here instead, never leaving her frame: always black on white, each circle slides slowly
// across its own cell to the other side and later back, one after another, so the picture keeps her mix of cut halves
// and is her frame exactly at the start and at every loop. With reduced motion it stays on her frame.
// [column, row, axis, side]: the circle sits 92 from the cell's middle on that axis and side at the start
const SHAPES = [
  [0, 0, "y", 1], [1, 0, "x", -1], [2, 0, "y", -1],
  [0, 1, "y", 1], [1, 1, "y", -1], [2, 1, "x", 1],
  [0, 2, "y", -1], [1, 2, "x", 1], [2, 2, "y", 1],
];
// the order they move in, 1.8 s apart (global.css .mm-shape: each slide 2.6 s, a loop 32.4 s)
const ORDER = [4, 0, 8, 2, 6, 1, 7, 3, 5];

function PlatformShapes() {
  return (
    <svg viewBox="0 0 720 720" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Moving objects" className="absolute inset-0 block h-full w-full bg-white sm:scale-[1.18]">
      <defs>
        {SHAPES.map(([c, r], i) => (
          // 1 unit wider on every side: two cut circles meeting on a cell line (her double circle on the left) join
          // with no hairline of white between them
          <clipPath id={`mm-shape-cell-${i}`} key={i}>
            <rect x={c * 240 - 1} y={r * 240 - 1} width="242" height="242" />
          </clipPath>
        ))}
      </defs>
      {SHAPES.map(([c, r, axis, side], i) => (
        <g clipPath={`url(#mm-shape-cell-${i})`} key={i}>
          <circle
            className={`mm-shape mm-shape-${axis}${side > 0 ? "p" : "n"}`}
            cx={120 + 240 * c}
            cy={120 + 240 * r}
            r="71"
            fill="#111111"
            style={{ transform: axis === "x" ? `translateX(${92 * side}px)` : `translateY(${92 * side}px)`, animationDelay: `${ORDER.indexOf(i) * 1.8}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

// Platform Mind_set. Computer: her current Figma (kept copy, 12 Nov, frame 1920 x 1018), every place from the frame's
// top-left: the moving shapes in a light box 671 x 653 at 170, 180; heading Inter Medium 150/141 -0.06em at 998, 180
// (150 in MM-HOME-001 of 13 Nov, was 172)
// (pink "l" and the pink bar 71 x 12); body 22/31 -0.04em, 569 wide at 1011, 512; the pink line 188 wide at 785 and
// "PLATFORM LAYER" 22/21 caps at 804, black 50%.
// Phone, MM-HOME-002 (iPhone 16 & 17 Pro - 5, 390 x 844, 13 Nov): heading Inter Medium 64/65 -0.06em at 14, 40, its pink
// "l" and "_" Inter Regular #F600A9 (letters, not a bar); body 14/20 -0.04em black 60%, 292 wide at 20, 200; the shapes
// 388 x 349 at 0, 380; the pink line at 20, 779 and "Platform layer" 12/15 black 63% under it.
export default function PlatformSection() {
  return (
    <section id="mindset" className="mm-phone-w block h-[calc(var(--q)*844)] overflow-hidden bg-white pt-[calc(var(--q)*65)] sm:block sm:h-[53.02vw] sm:min-h-0 sm:overflow-visible sm:py-0 sm:pt-[9.375vw]">
      <div className="flex w-full flex-col sm:flex-row sm:items-stretch sm:gap-[8.18vw] sm:pl-[8.85vw]">
        <div className="order-1 flex flex-col pl-[calc(var(--q)*14)] sm:order-2 sm:h-[34.01vw] sm:px-0">
          {/* 14 Nov, phone to her MM-HOME-002 layer numbers: heading Inter 400 64/60 at 14, 65 (was medium 64/65 at 40),
              the text 35 under it, the shapes still at 380 */}
          <header className="mb-[calc(var(--q)*35)] sm:mb-[2.6vw]">
            <h2 data-reveal-lines className="flex flex-col whitespace-nowrap text-[16.41vw] font-normal leading-[15.385vw] tracking-[-0.06em] text-black sm:text-[7.8125vw] sm:font-medium sm:leading-[7.344vw] sm:tracking-[-0.06em]">
              <span className="relative">P<span className="font-normal text-[#F600A9] sm:font-medium sm:text-[#e3009c]">l</span>atform</span>
              <span className="relative">Mind<span className="hidden translate-x-1 pr-[3px] sm:inline-block"><span className="block h-3 w-12 bg-[#e3009c] sm:h-[0.63vw] sm:w-[3.7vw]"></span></span><span className="font-normal text-[#F600A9] sm:hidden">_</span>set</span>
            </h2>
          </header>
          {/* 14 Nov (her rule: her newest frame is the spec): the phone takes her MM-HOME-002 text, 192 wide at 20, 5719;
              the computer keeps her desktop line */}
          <div data-reveal className="ml-[calc(var(--q)*6)] w-[calc(var(--q)*192)] sm:ml-[0.677vw] sm:w-[29.64vw]">
            <p className="text-[14px] leading-[20px] text-black/70 max-sm:tracking-[-0.04em] max-sm:text-black/60 sm:hidden">A product is never truly finished. It evolves through real use, thoughtful decisions, and a system built to grow with it.</p>
            <p className="hidden text-black/70 sm:block sm:text-[max(1.146vw,13px)] sm:leading-[max(1.615vw,18px)] sm:tracking-[-0.04em]">A product is never finished. It grows through real use, and <br />a system built to hold it.</p>
          </div>
          <div className="mt-auto hidden sm:ml-[0.677vw] sm:mb-[0.417vw] sm:block">
            <div className="mb-[0.9vw] h-[2px] w-[9.8vw] bg-[#f48fcf]"></div>
            {/* 14 Nov: on a tablet (768) these were 8-9 px; the px floors only reach below 1150 wide, so laptop and desktop keep her vw */}
            <p className="text-[max(1.146vw,12px)] uppercase leading-[max(1.094vw,13px)] tracking-[-0.017em] text-black/50">Platform layer</p>
          </div>
        </div>
        {/* phone: her picture 388 x 349 at the screen's left edge, at 380 of her frame (14 Nov: it sat 20 higher);
            14 Nov later: her phone text is 4 lines (80) now, so 80 under it keeps the shapes at 380 */}
        <div className="order-2 mt-[calc(var(--q)*80)] w-[calc(var(--q)*388)] sm:order-1 sm:mt-0 sm:w-auto sm:px-0">
          {/* Marta, 12 Nov (her iPhone: "the background is grey") and 14 Nov ("фон все одно далі сірий... там де пише
              Mindset"): every screen plays the copy whose background is pure #FFFFFF in the pixels
              (scripts/make-phone-videos.mjs) on a white box, no blend or filter. On the phone the shapes are at her
              picture's own size (her frame shows them smaller, no zoom); the computer keeps its zoom. */}
          <div data-reveal className="relative aspect-[388/349] w-full overflow-hidden bg-white sm:aspect-auto sm:h-[34.01vw] sm:w-[34.95vw]">
            <PlatformShapes />
          </div>
        </div>
        <div className="order-3 mt-[calc(var(--q)*50)] block pl-[calc(var(--q)*20)] sm:hidden">
          <div className="mb-[calc(var(--q)*9)] h-[1px] w-[calc(var(--q)*119)] bg-[#f48fcf]"></div>
          {/* Phone: MM-HOME-002 1050:3 "Platform layer" has textCase UPPER, Inter 400 14/20, -0.56 px (-0.04em), black 60%. */}
          <p className="text-[length:calc(var(--q)*14)] uppercase leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/60">Platform layer</p>
        </div>
      </div>
    </section>
  );
}
