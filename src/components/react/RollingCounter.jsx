import React, { useEffect, useState } from "react";

// The rolling number of the memory card on Marta's live site (Typography/Counter.jsx): two digit columns that
// roll up, counting 01 → 99 once a second and starting over. Sized by the surrounding font size (em), so the
// same counter fits the computer card and the phone card.
function Digit({ value, duration, width }) {
  return (
    <span className="inline-block h-[1.1em] overflow-hidden align-top" style={{ width }}>
      <span
        className="flex flex-col transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(${-value * 1.1}em)`, transitionDuration: `${duration}ms` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex h-[1.1em] items-center justify-center">{i}</span>
        ))}
      </span>
    </span>
  );
}

// digitWidth: the width of each digit column (em); narrower for the phone card's tighter number.
export default function RollingCounter({ start = 1, end = 99, speed = 1000, digitWidth = "0.6em", className = "" }) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setValue((v) => (v >= end ? start : v + 1)), speed);
    return () => clearInterval(id);
  }, [start, end, speed]);
  return (
    <span className={`inline-flex leading-none ${className}`} aria-label={String(value).padStart(2, "0")}>
      <Digit value={Math.floor(value / 10)} duration={3000} width={digitWidth} />
      <Digit value={value % 10} duration={1000} width={digitWidth} />
    </span>
  );
}
