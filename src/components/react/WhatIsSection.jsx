import React, { useState } from "react";

export default function WhatIsSection() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section id="what-is" className="relative px-6 py-12 min-h-screen overflow-hidden bg-black xs:px-6 sm:px-8 md:px-16 sm:px-20 xl:px-24 2xl:px-32 xs:py-16 sm:py-20 md:py-20 sm:py-24 xl:py-28 2xl:py-32 text-white md:px-16 flex flex-col md:justify-center xl:justify-start" onPointerEnter={() => setIsHovering(true)} onPointerLeave={() => setIsHovering(false)}>
      <div
        className="absolute inset-y-0 right-0 z-20 w-full max-w-[68rem] pointer-events-none select-none mix-blend-screen"
        aria-hidden="true"
      >
        {/* <div className="absolute right-0 sm:top-1/2 h-[50vw] sm:h-[88%] sm:w-[72%] -translate-y-1/2 bg-[radial-gradient(circle_at_35%_50%,rgba(255,255,255,0.24),rgba(255,255,255,0.08)_28%,rgba(255,255,255,0.02)_55%,transparent_76%)] blur-3xl opacity-90"></div> */}

        <div className="flex relative items-end h-full w-full overflow-hidden">
          <img
            src={'/assets/m-letter.png'}
            alt=""
            data-parallax="-12"
            className="sm:h-screen scale-120 right-0 absolute sm:top-0 sm:right-0 transition-transform duration-300"
          />
          <img
            src={'assets/wire.png'}
            alt=""
            className="bottom-[25vh] scale-[2] sm:scale-[1] sm:h-auto absolute sm:top-[10vh] sm:right-[-80px] transition-transform duration-300 sm:w-[55rem] rotate-130 sm:rotate-0"
          />
        </div>
      </div>

      <div className="relative z-10 xs:max-w-2xl sm:max-w-3xl md:max-w-4xl sm:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl h-full flex flex-col justify-between h-full flex-1">
        <img data-reveal src={'/assets/whatIs.png'} alt="What is" className="mb-10 sm:w-[45vw] w-[80vw]" />
        <div data-reveal className="sm:max-w-lg max-w-[65vw]">
          <p className="text-[4vw] xs:text-xs sm:text-sm md:text-xl sm:text-2xl xl:text-[1.5rem] 2xl:text-2xl font-thin text-gray-200">An amazing experience is where proven design language is adapted to your product until it feels native, precise, and impossible to ignore.</p>
        </div>

        <div data-reveal className="sm:mt-8 mt-auto">
          <div className="w-22 h-[1px] bg-pink-500 opacity-60"></div>
          <p className="text-[2vw] mt-1 tracking-[0.2em] text-gray-500 font-medium xs:text-[0.3rem] sm:text-[0.35rem] md:text-[0.45rem] sm:text-[0.52rem] xl:text-[0.65rem] 2xl:text-[0.8rem]">Interaction layer</p>
        </div>
      </div>
    </section>
  );
}
