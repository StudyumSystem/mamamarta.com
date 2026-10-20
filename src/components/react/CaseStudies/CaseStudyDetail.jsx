import React from 'react';

export default function CaseStudyDetail({ study, onBack }) {
  return (
    <main className="bg-white text-black">
      <section className="mx-auto max-w-7xl xs:px-3 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-16">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-black/55 transition hover:text-pink-500"
        >
          ← Back to studies
        </button>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.34em] text-pink-500">{study.label}</p>
            <h1 className="max-w-3xl xs:text-2xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-8xl 2xl:text-9xl font-medium leading-[0.9] tracking-tighter">
              {study.title}
            </h1>
            <p className="max-w-2xl xs:text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed text-black/70">
              {study.summary}
            </p>
          </div>

          <div className="grid xs:gap-2 sm:gap-3 md:gap-4 md:rounded-[1.75rem] md:border md:border-black/10 md:bg-white lg:gap-4 lg:rounded-[1.75rem] lg:border lg:border-black/10 lg:bg-white lg:grid-cols-3 2xl:gap-5 2xl:rounded-[2rem]">
            {study.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xs uppercase tracking-[0.26em] text-black/45">{stat.label}</p>
                <p className="text-2xl font-medium text-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl xs:px-3 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-16">
        <div className="grid xs:gap-2 sm:gap-4 md:gap-8 lg:gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:gap-10 2xl:gap-12">
          <div className="space-y-8">
            <div className="grid min-h-[44vh] xs:gap-2 sm:gap-3 md:gap-4 overflow-hidden rounded-[2rem] border border-black/10 bg-white lg:gap-8 lg:grid-cols-2 shadow-sm xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,rgba(236,72,153,0.14),rgba(255,255,255,0.98)_55%,rgba(247,247,247,1))]">
                <p className="text-xs uppercase tracking-[0.28em] text-pink-500">Preview half</p>
                <div className="h-full rounded-[1.25rem] border border-black/10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(0,0,0,0.02))]" />
              </div>
              <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,rgba(255,255,255,1),rgba(236,72,153,0.08)_55%,rgba(247,247,247,1))]">
                <p className="text-xs uppercase tracking-[0.28em] text-pink-500">Detail half</p>
                <div className="space-y-3">
                  <div className="h-3 w-4/5 rounded-full bg-black/12" />
                  <div className="h-3 w-2/3 rounded-full bg-black/8" />
                  <div className="h-3 w-5/6 rounded-full bg-black/8" />
                  <div className="mt-6 h-40 rounded-[1.25rem] border border-black/10 bg-white" />
                </div>
              </div>
            </div>

            <div className="grid xs:gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:grid-cols-2 xl:gap-5 2xl:gap-6">
              {study.details.map((detail) => (
                <div key={detail.title} className="rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
                  <h2 className="text-xl font-medium tracking-tight text-black">{detail.title}</h2>
                  <p className="text-sm leading-7 text-black/65">{detail.description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,255,255,0.88))] xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-6 xl:space-y-7 2xl:space-y-8 shadow-sm backdrop-blur-md">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Role</p>
              <p className="xs:text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg 2xl:text-xl text-black/85">{study.role}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Challenge</p>
              <p className="leading-7 text-black/72">{study.challenge}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Approach</p>
              <p className="leading-7 text-black/72">{study.approach}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Outcome</p>
              <p className="leading-7 text-black/72">{study.outcome}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/45">Services</p>
              <div className="flex flex-wrap xs:gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-3">
                {study.services.map((service) => (
                  <span key={service} className="rounded-full border border-pink-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-black/70">{service}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
