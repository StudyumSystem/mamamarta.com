import React from "react";

export default function CaseStudyCard({ study, index, onSelect }) {
  return (
    <article
      key={study.slug}
      className="group relative flex xs:min-h-[45vh] sm:min-h-[48vh] md:min-h-[52vh] overflow-hidden border-b border-black/10 lg:h-full lg:border-b-0 lg:border-r"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${study.theme} opacity-100`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.05),transparent_32%)]" />
      <div className="absolute inset-0 bg-white/55" />

      <div className="relative z-10 flex w-full flex-col justify-between">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-black/45">{study.label}</p>
            <h2 className="mt-4 max-w-sm xs:text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-medium leading-[0.94] tracking-tighter text-black text-4xl sm:text-5xl lg:text-6xl">
              {study.title}
            </h2>
          </div>
          <div className="rounded-full border border-pink-500/20 bg-white px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-black/60 shadow-sm backdrop-blur-md">
            0{index + 1}
          </div>
        </header>

        <div className="max-w-xl xs:space-y-3 sm:space-y-4 md:space-y-5">
          <p className="text-base xs:text-sm sm:text-base md:text-lg lg:text-lg leading-relaxed text-black/85 text-lg sm:text-xl">{study.summary}</p>
          <p className="max-w-lg text-xs xs:text-xs sm:text-sm md:text-base lg:text-base leading-7 text-black/60 text-sm sm:text-base">{study.previewText}</p>

          <div className="flex flex-wrap xs:gap-2 sm:gap-2.5 md:gap-3 lg:gap-3">
            {study.services.slice(0, 3).map((service) => (
              <span key={service} className="rounded-full border border-pink-500/15 bg-white xs:px-2 xs:py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 lg:px-3 lg:py-1 xs:text-[0.65rem] sm:text-xs md:text-xs lg:text-xs uppercase tracking-[0.2em] text-black/70 backdrop-blur-md">
                {service}
              </span>
            ))}
          </div>

          <button
            onClick={onSelect}
            className="inline-flex items-center xs:gap-1.5 xs:rounded-full xs:border xs:border-pink-500/20 xs:bg-black xs:px-3 xs:py-2 xs:text-xs xs:font-medium xs:text-white xs:transition xs:duration-300 hover:bg-pink-500 hover:text-white gap-3 rounded-full border border-pink-500/20 bg-black px-5 py-3 text-sm font-medium text-white transition duration-300 hover:bg-pink-500 hover:text-white"
          >
            Open case study <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
