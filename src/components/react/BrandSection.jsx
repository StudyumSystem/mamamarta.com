import React from "react";

export default function BrandSection() {
  return (
    <section id="contact" className="relative w-full h-screen sm:h-[50vh] overflow-hidden flex">
      <div id="book" className="absolute top-0" aria-hidden="true"></div>
      <div className="flex flex-row xl:items-center justify-center w-full h-full relative px-4 py-6 sm:px-[8vw] sm:py-0 sm:items-center">
        <div className="absolute inset-0 z-0 h-screen sm:h-screen md:h-[50vh] sm:h-[50vh]">
          <video data-lazy-video data-src={'/assets/hero-bg.mp4'} poster={'/assets/hero-bg-poster.webp'} preload="none" className="w-full h-full object-cover" muted loop playsInline></video>
          <div className="absolute inset-0 bg-black/5"></div>
        </div>

        <div className="relative z-10 w-full flex flex-col gap-8 sm:gap-6 md:grid md:grid-cols-2 md:gap-14 sm:gap-16 xl:gap-20 2xl:gap-24 md:items-center">
          <div className="flex flex-col self-start md:self-center shrink-0">
            <h2 data-reveal-lines className="text-white leading-[0.75] lg:leading-[0.79] select-none">
              <span className="block text-[25.5vw] sm:text-[10.5vw] lg:text-[10.36vw] font-bold">MAMA</span>
              <span className="block text-[25.5vw] sm:text-[10.5vw] lg:text-[11.3vw] font-light lg:font-normal tracking-wide lg:tracking-normal">MARTA</span>
            </h2>
          </div>

          <div data-reveal className="flex flex-1 flex-col items-between text-white self-start sm:self-center sm:pt-0 overflow-hidden sm:justify-between h-full w-[70vw]">
            <div className="">
              <p className="text-lg sm:text-[1.35vw] lg:text-[clamp(16px,1.146vw,22px)] lg:leading-[1.41] font-light lg:font-normal">Design house for digital products.</p>
              <p className="text-lg sm:text-[1.35vw] lg:text-[clamp(16px,1.146vw,22px)] lg:leading-[1.41] font-light lg:font-normal line-clamp-2">Crafted to shape systems, interactions, and digital identity.</p>
            </div>

            <div className="flex flex-wrap justify-start gap-2 sm:gap-3 md:gap-5 sm:gap-6 xl:gap-8 2xl:gap-10 sm:mt-4">
              <a
                href="#book"
                className="mt-6 sm:mt-0 group inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-xs border border-white/20 px-3 py-3 sm:px-4 sm:py-2 lg:px-6 lg:py-0 lg:justify-center lg:min-w-[clamp(220px,15.4vw,296px)] lg:min-h-[clamp(50px,3.54vw,68px)] text-[3.5vw] sm:text-sm lg:text-[clamp(16px,1.146vw,22px)] font-medium lg:font-semibold backdrop-blur-md transition-all duration-300 text-white"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)'}
                style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
              >
                Book a Discovery Call <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
            <div className="w-full flex flex-col gap-4 sm:gap-5 md:flex-row md:gap-6 sm:gap-8 xl:gap-10 2xl:gap-12 justify-between items-start md:items-end xl:items-end md:pt-0 self-end mt-auto xl:mt-0">
              <div className="flex gap-4 sm:gap-5">
                <a href="https://www.linkedin.com/company/mamamarta/" target="_blank" rel="noreferrer" className="inline-flex p-2 -m-2 hover:opacity-70 transition-opacity"><i className="ri-linkedin-fill">
                  <img src={'/assets/linkedin.png'} alt="LinkedIn" className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 sm:w-7 sm:h-7 lg:w-[clamp(28px,2.08vw,40px)] lg:h-[clamp(28px,2.08vw,40px)]" />
                </i></a>
                <a href="https://www.instagram.com/mymamamarta/" target="_blank" rel="noreferrer" className="inline-flex p-2 -m-2 hover:opacity-70 transition-opacity"><i className="ri-instagram-line">
                  <img src={'/assets/instagram.png'} alt="Instagram" className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 sm:w-7 sm:h-7 lg:w-[clamp(28px,2.08vw,40px)] lg:h-[clamp(28px,2.08vw,40px)]" />
                </i></a>
                <a href="mailto:mymamamarta@icloud.com" className="inline-flex p-2 -m-2 hover:opacity-70 transition-opacity"><i className="ri-at-line">
                  <img src={'/assets/email.png'} alt="Email" className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 sm:w-7 sm:h-7 lg:w-[clamp(28px,2.08vw,40px)] lg:h-[clamp(28px,2.08vw,40px)]" />
                </i></a>
              </div>
              <p className="text-xs sm:text-sm md:text-xs sm:text-sm lg:text-[clamp(14px,0.94vw,18px)] font-light tracking-wide opacity-80 lg:opacity-[0.84]">© MamaMarta 2026 </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
