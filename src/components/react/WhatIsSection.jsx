import React from "react";

// What is an amazing experience, to Marta's MM-HOME-001 / 002. Desktop (1920 frame): heading 173-924 px from
// 156 px down, body 18/26 in two lines up to 821 px, then the pink gradient "Wanna dive deeper? →" (296x68)
// that opens The method. The M on the right is dark grey, the wire runs across it.
export default function WhatIsSection() {
  return (
    <section id="what-is" className="relative flex min-h-screen flex-col overflow-hidden bg-black px-6 py-12 text-white sm:px-[9vw] sm:pt-[8.1vw] sm:pb-[6vw]">
      <div
        className="pointer-events-none absolute top-[max(42%,340px)] right-0 bottom-0 z-20 w-full max-w-[68rem] select-none [mask-image:linear-gradient(to_bottom,transparent,black_22%)] sm:top-0 sm:[mask-image:none]"
        aria-hidden="true"
      >
        <div className="relative flex h-full w-full items-end overflow-hidden">
          <img
            src={'/assets/m-letter.webp'}
            alt=""
            data-parallax="-12"
            className="absolute right-0 scale-120 brightness-[0.42] contrast-[1.15] transition-transform duration-300 sm:top-0 sm:right-0 sm:h-screen"
          />
          <img
            src={'/assets/wire.webp'}
            alt=""
            className="absolute bottom-[25vh] scale-[2] rotate-130 transition-transform duration-300 sm:top-[10vh] sm:right-[-80px] sm:h-auto sm:w-[55rem] sm:scale-[1] sm:rotate-0"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col">
        <img data-reveal src={'/assets/whatIs.webp'} alt="What is an amazing experience?" className="mb-8 w-[80vw] sm:mb-[2.9vw] sm:w-[39vw]" />
        <div data-reveal className="max-w-[78vw] sm:max-w-[34.5vw]">
          <p className="text-[15px] leading-[1.45] text-gray-200 sm:text-[clamp(13px,1.04vw,20px)] sm:leading-[1.55]">An amazing experience is where proven design language is adapted to your product until it feels native, precise, and impossible to ignore.</p>
        </div>
        <div data-reveal className="mt-8 sm:mt-[4.4vw]">
          <a
            href="/what-is"
            className="mm-gradient group inline-flex w-fit items-center justify-center gap-1.5 px-5 py-3 text-[15px] font-semibold text-white sm:min-h-[clamp(44px,3.54vw,68px)] sm:min-w-[clamp(200px,15.4vw,296px)] sm:px-6 sm:py-0 sm:text-[clamp(14px,1.146vw,22px)]"
          >
            Wanna dive deeper? <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
