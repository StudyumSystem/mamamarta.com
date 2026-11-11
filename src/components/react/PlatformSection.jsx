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
            {/* her Desktop.jpg (11 Nov): regular weight, lines 140 px apart, the site's pink, a longer underscore */}
            <h2 data-reveal-lines className="flex flex-col whitespace-nowrap text-[18vw] font-normal leading-[0.92] tracking-tighter text-black sm:text-[7.4vw] sm:leading-[7.3vw]">
              <span className="relative">P<span className="text-[#e3009c]">l</span>atform</span>
              <span className="relative">Mind<span className="inline-block translate-x-1 pr-[3px]"><span className="block h-3 w-12 bg-[#e3009c] sm:h-[0.63vw] sm:w-[3.65vw]"></span></span>set</span>
            </h2>
          </header>
          <div data-reveal className="w-[78vw] sm:w-[30.5vw]">
            {/* her Desktop.jpg (11 Nov): body 22/31 black 69%, PLATFORM LAYER 22 px black 50% */}
            <p className="text-[15px] leading-[1.41] text-black/70 sm:text-[1.146vw] sm:leading-[1.615vw] sm:tracking-[-0.02em]">A product is never finished. It grows through real use, and a system built to hold it.</p>
          </div>
          <div className="mt-auto hidden sm:block">
            <div className="mb-[0.9vw] h-[2px] w-[9.8vw] bg-[#f48fcf]"></div>
            <p className="text-[1.146vw] uppercase text-black/50">Platform layer</p>
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
