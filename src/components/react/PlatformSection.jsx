import React from "react";

// Platform Mind_set to Marta's MM-HOME-001 / 002. Desktop (1920 frame): the moving shapes in a light square box
// 173-840 px that crops them at its edges, the heading from 1008 px, body 22/31, "PLATFORM LAYER" in caps
// under a pink line, level with the bottom of the box. Body 18/26 in three lines, as in the frame.
export default function PlatformSection() {
  return (
    <section id="mindset" className="flex min-h-screen items-center bg-white py-16 sm:py-[9.4vw]">
      <div className="flex w-full flex-col gap-10 sm:flex-row sm:items-stretch sm:gap-[8.75vw] sm:pl-[9vw]">
        <div className="order-1 flex flex-col px-6 sm:order-2 sm:h-[34vw] sm:px-0">
          <header className="mb-8 sm:mb-[2.6vw]">
            <h2 data-reveal-lines className="flex flex-col text-[10vh] font-medium leading-[0.8] tracking-tighter text-black sm:text-[7.4vw] sm:leading-[0.86]">
              <span className="relative">P<span className="text-pink-500">l</span>atform</span>
              <span className="relative">Mind<span className="inline-block translate-x-1 pr-[3px]"><span className="block h-3 w-12 bg-pink-500 sm:h-[0.6vw] sm:w-[2.9vw]"></span></span>set</span>
            </h2>
          </header>
          <div data-reveal className="w-[78vw] sm:w-[31.5vw]">
            <p className="text-[15px] leading-[1.41] text-gray-800 sm:text-[clamp(13px,1.04vw,20px)] sm:leading-[1.55]">A product is never truly finished. It evolves through real use, thoughtful decisions, and a system built to grow with it.</p>
          </div>
          <div className="mt-auto hidden sm:block">
            <div className="mb-[0.6vw] h-[1px] w-[9.8vw] bg-pink-500"></div>
            <p className="text-[clamp(11px,0.94vw,18px)] uppercase tracking-[0.04em] text-gray-500">Platform layer</p>
          </div>
        </div>
        <div className="order-2 px-6 sm:order-1 sm:px-0">
          <div data-reveal className="relative aspect-square w-full overflow-hidden bg-[#fafafa] sm:w-[34.7vw]">
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
