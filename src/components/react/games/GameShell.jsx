import React from "react";

// Shared frame for every game: Default, Active and Game Over screens (Figma "Dev Instractions").
export const TAGLINE = "The challenge is yours. The experience is ours.";

export function PinkButton({ children, onClick, variant = "solid", className = "" }) {
  const base =
    "inline-flex items-center justify-center gap-3 rounded-full px-7 py-3 text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2";
  const styles =
    variant === "solid"
      ? "bg-black text-white hover:bg-pink-500"
      : "border border-black/15 bg-white text-black hover:border-pink-500 hover:text-pink-500";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export default function GameShell({ title, rules, screen, onStart, onRestart, stats, result, children }) {
  return (
    <section className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center px-5 py-12 font-[Inter] text-black md:py-20">
      <a href="/games" className="self-start text-sm text-black/50 transition-colors hover:text-pink-500">
        ← All games
      </a>
      <h1 className="mt-6 text-center text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>

      {screen === "default" && (
        <div className="mt-10 flex flex-col items-center text-center">
          <p className="max-w-md text-lg font-light text-black/70">{rules}</p>
          <PinkButton onClick={onStart} className="mt-10">
            Start <span aria-hidden="true">→</span>
          </PinkButton>
          <p className="mt-12 text-sm text-black/40">{TAGLINE}</p>
        </div>
      )}

      {screen === "active" && (
        <div className="mt-8 flex w-full flex-col items-center">
          {stats && (
            <div className="mb-8 flex gap-8 text-sm uppercase tracking-[0.2em] text-black/60" aria-live="polite">
              {stats.map(([label, value]) => (
                <span key={label}>
                  {label} <strong className="ml-1 font-semibold text-pink-500">{value}</strong>
                </span>
              ))}
            </div>
          )}
          {children}
        </div>
      )}

      {screen === "over" && (
        <div className="mt-10 flex flex-col items-center text-center" role="status">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-500">Game over</p>
          <p className="mt-4 text-3xl font-semibold md:text-5xl">{result?.headline}</p>
          {result?.detail && <p className="mt-4 text-lg font-light text-black/60">{result.detail}</p>}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <PinkButton onClick={onRestart}>Play again</PinkButton>
            <a
              href="/games"
              className="inline-flex items-center rounded-full border border-black/15 px-7 py-3 font-semibold transition-colors hover:border-pink-500 hover:text-pink-500"
            >
              More games
            </a>
          </div>
          <p className="mt-12 text-sm text-black/40">{TAGLINE}</p>
        </div>
      )}
    </section>
  );
}
