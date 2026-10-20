import React from "react";

export default function PlatformSection() {
  return (
    <section id="mindset" className="h-screen flex sm:items-center">
      <div className="flex sm:mx-auto w-full flex flex-col sm:flex sm:flex-row xl:flex xl:flex-row sm:justify-center justify-between py-6 sm:items-center sm:gap-12">
        <div className="order-1 md:order-2 xl:order-2 flex flex-col sm:h-[35vw] px-6">
          <header className="mb-8 md:mb-10 sm:mb-12 xl:mb-14 2xl:mb-16">
            <h2 className="sm:text-[8vw] text-[10vh] font-medium leading-[0.8] tracking-tighter text-black flex flex-col">
              <span className="relative">P<span className="text-pink-500">l</span>atform</span>
              <span className="relative">Mind<span className="inline-block translate-x-1 pr-[3px]"><span className="block w-12 h-3 bg-pink-500 "></span></span>set</span>
            </h2>
          </header>
          <div className="sm:w-[35vw] w-[70vw]">
            <p className="sm:text-[1.75vw] text-[2vh] text-gray-900 font-light">From product to platform. As your product evolves through real use and continuous refinement, it sharpens its identity, earns trust, and naturally expands into a platform.</p>
          </div>
          <div className="order-3 md:order-3 xl:order-3 md:col-start-2 xl:col-start-2 mt-auto hidden sm:block">
            <div className="w-30 h-[1px] bg-pink-500 mb-1"></div>
            <p className="text-[0.8vw] tracking-widest text-gray-400 font-medium">Platform layer</p>
          </div>
        </div>
        <div className="order-2 md:order-1 xl:order-1 flex justify-start sm:justify-end px-6">
          <img src={'/assets/moving-objects-loop.gif'} alt="Moving Objects" className="relative aspect-square sm:w-[35vw] " />
        </div>
        <div className="order-3 px-6 block sm:hidden">
            <div className="w-20 h-[1px] bg-pink-500 mb-1"></div>
            <p className="sm:text-[0.8rem] text-[0.6rem] tracking-widest text-gray-400 font-medium">Platform layer</p>
          </div>
      </div>
    </section>
  );
}
