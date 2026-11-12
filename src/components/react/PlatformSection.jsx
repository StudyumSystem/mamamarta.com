import React from "react";

// Platform Mind_set. Computer: her current Figma (kept copy, 12 Nov, frame 1920 x 1018), every place from the frame's
// top-left: the moving shapes in a light box 671 x 653 at 170, 180; heading Inter Medium 172/141 -0.06em at 998, 180
// (pink "l" and the pink bar 71 x 12); body 22/31 -0.04em, 569 wide at 1011, 512; the pink line 188 wide at 785 and
// "PLATFORM LAYER" 22/21 caps at 804, black 50%. Phone as before.
export default function PlatformSection() {
  return (
    <section id="mindset" className="flex min-h-screen items-center bg-white py-16 sm:block sm:h-[53.02vw] sm:min-h-0 sm:py-0 sm:pt-[9.375vw]">
      <div className="flex w-full flex-col gap-10 sm:flex-row sm:items-stretch sm:gap-[8.18vw] sm:pl-[8.85vw]">
        <div className="order-1 flex flex-col px-6 sm:order-2 sm:h-[34.01vw] sm:px-0">
          <header className="mb-8 sm:mb-[2.6vw]">
            <h2 data-reveal-lines className="flex flex-col whitespace-nowrap text-[18vw] font-normal leading-[0.92] tracking-tighter text-black sm:text-[8.958vw] sm:font-medium sm:leading-[7.344vw] sm:tracking-[-0.06em]">
              <span className="relative">P<span className="text-[#e3009c]">l</span>atform</span>
              <span className="relative">Mind<span className="inline-block translate-x-1 pr-[3px]"><span className="block h-3 w-12 bg-[#e3009c] sm:h-[0.63vw] sm:w-[3.7vw]"></span></span>set</span>
            </h2>
          </header>
          <div data-reveal className="w-[78vw] sm:ml-[0.677vw] sm:w-[29.64vw]">
            <p className="text-[15px] leading-[1.41] text-black/70 sm:text-[1.146vw] sm:leading-[1.615vw] sm:tracking-[-0.04em]">A product is never finished. It grows through real use, and a system built to hold it.</p>
          </div>
          <div className="mt-auto hidden sm:ml-[0.677vw] sm:mb-[0.417vw] sm:block">
            <div className="mb-[0.9vw] h-[2px] w-[9.8vw] bg-[#f48fcf]"></div>
            <p className="text-[1.146vw] uppercase leading-[1.094vw] tracking-[-0.017em] text-black/50">Platform layer</p>
          </div>
        </div>
        <div className="order-2 px-6 sm:order-1 sm:px-0">
          <div data-reveal className="relative aspect-square w-full overflow-hidden bg-[#fafafa] sm:aspect-auto sm:h-[34.01vw] sm:w-[34.95vw]">
            <video data-lazy-video data-src={'/assets/moving-objects-loop.mp4'} poster={'/assets/moving-objects-loop-poster.webp'} preload="none" muted loop playsInline aria-label="Moving objects" className="absolute inset-0 h-full w-full scale-[1.18] object-cover mix-blend-multiply" />
          </div>
        </div>
        <div className="order-3 block px-6 sm:hidden">
          <div className="mb-1 h-[1px] w-20 bg-pink-500"></div>
          {/* Phone: sentence case in her phone frame (desktop keeps caps). */}
          <p className="text-[13px] tracking-[-0.01em] text-gray-500">Platform layer</p>
        </div>
      </div>
    </section>
  );
}
