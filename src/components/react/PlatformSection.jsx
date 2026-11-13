import React from "react";

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
    <section id="mindset" className="mm-phone-w block h-[calc(var(--q)*844)] overflow-hidden bg-white pt-[calc(var(--q)*40)] sm:block sm:h-[53.02vw] sm:min-h-0 sm:overflow-visible sm:py-0 sm:pt-[9.375vw]">
      <div className="flex w-full flex-col sm:flex-row sm:items-stretch sm:gap-[8.18vw] sm:pl-[8.85vw]">
        <div className="order-1 flex flex-col pl-[calc(var(--q)*14)] sm:order-2 sm:h-[34.01vw] sm:px-0">
          <header className="mb-[calc(var(--q)*30)] sm:mb-[2.6vw]">
            <h2 data-reveal-lines className="flex flex-col whitespace-nowrap text-[16.41vw] font-medium leading-[16.67vw] tracking-[-0.06em] text-black sm:text-[7.8125vw] sm:font-medium sm:leading-[7.344vw] sm:tracking-[-0.06em]">
              <span className="relative">P<span className="font-normal text-[#F600A9] sm:font-medium sm:text-[#e3009c]">l</span>atform</span>
              <span className="relative">Mind<span className="hidden translate-x-1 pr-[3px] sm:inline-block"><span className="block h-3 w-12 bg-[#e3009c] sm:h-[0.63vw] sm:w-[3.7vw]"></span></span><span className="font-normal text-[#F600A9] sm:hidden">_</span>set</span>
            </h2>
          </header>
          <div data-reveal className="ml-[calc(var(--q)*6)] w-[calc(var(--q)*292)] sm:ml-[0.677vw] sm:w-[29.64vw]">
            <p className="text-[14px] leading-[20px] text-black/70 max-sm:tracking-[-0.04em] max-sm:text-black/60 sm:text-[1.146vw] sm:leading-[1.615vw] sm:tracking-[-0.04em]">A product is never finished. It grows through real use, and a system built to hold it.</p>
          </div>
          <div className="mt-auto hidden sm:ml-[0.677vw] sm:mb-[0.417vw] sm:block">
            <div className="mb-[0.9vw] h-[2px] w-[9.8vw] bg-[#f48fcf]"></div>
            <p className="text-[1.146vw] uppercase leading-[1.094vw] tracking-[-0.017em] text-black/50">Platform layer</p>
          </div>
        </div>
        {/* phone: her picture 388 x 349 at the screen's left edge, 120 px under the body */}
        <div className="order-2 mt-[calc(var(--q)*120)] w-[calc(var(--q)*388)] sm:order-1 sm:mt-0 sm:w-auto sm:px-0">
          {/* Below the computer's width (Marta, 12 Nov, her iPhone: "the background is grey"): iPhone Safari doesn't
              blend a <video>, so the phone gets a copy whose background is pure #FFFFFF in the pixels
              (scripts/make-phone-videos.mjs) on a white box, no blend; the computer keeps its #fafafa and blend. */}
          <div data-reveal className="relative aspect-[388/349] w-full overflow-hidden bg-white sm:aspect-auto sm:h-[34.01vw] sm:w-[34.95vw] lg:bg-[#fafafa]">
            <video data-lazy-video data-src={'/assets/moving-objects-loop-phone.mp4'} poster={'/assets/moving-objects-loop-phone-poster.webp'} preload="none" muted loop playsInline aria-label="Moving objects" className="absolute inset-0 h-full w-full scale-[1.18] object-cover lg:hidden" />
            <video data-lazy-video data-src={'/assets/moving-objects-loop.mp4'} poster={'/assets/moving-objects-loop-poster.webp'} preload="none" muted loop playsInline aria-label="Moving objects" className="absolute inset-0 hidden h-full w-full scale-[1.18] object-cover mix-blend-multiply lg:block" />
          </div>
        </div>
        <div className="order-3 mt-[calc(var(--q)*50)] block pl-[calc(var(--q)*20)] sm:hidden">
          <div className="mb-[calc(var(--q)*9)] h-[1px] w-[calc(var(--q)*119)] bg-[#f48fcf]"></div>
          {/* Phone: sentence case in her phone frame (desktop keeps caps), Inter 12/15 -0.04em black 63%. */}
          <p className="text-[length:calc(var(--q)*12)] leading-[calc(var(--q)*15)] tracking-[-0.04em] text-black/[.63]">Platform layer</p>
        </div>
      </div>
    </section>
  );
}
