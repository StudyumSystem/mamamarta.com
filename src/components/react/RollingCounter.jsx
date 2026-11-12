import React, { useEffect, useRef, useState } from "react";

// The changing number of the memory card (01 → 99 once a second, then over again). It used to roll its digits
// up like her old live site, but a rolling digit slid into the pink line under it and the digits' narrow
// columns cut the right side of the number (Marta, 11 Nov 19:23: "change this animation"). Now the number
// stays whole in one place: the old one fades up and away while the new one fades in from just below, softly
// blurred, all within a few px of the number itself. Sized by the surrounding font size, so the same counter
// fits the computer card and the phone card.
export default function RollingCounter({ start = 1, end = 99, speed = 1000, className = "" }) {
  const [value, setValue] = useState(start);
  const prev = useRef(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () =>
        setValue((v) => {
          prev.current = v;
          return v >= end ? start : v + 1;
        }),
      speed
    );
    return () => clearInterval(id);
  }, [start, end, speed]);
  const pad = (n) => String(n).padStart(2, "0");
  // 12 Nov (Marta: "it twitches, floats, isn't sharp; with every number it blinks and jumps"): every digit now
  // has the same width (tabular figures), so the number never shifts sideways; the old and the new number sit
  // in exactly the same place and only cross-fade, quickly, with no blur and no movement.
  return (
    <span className={`inline-grid whitespace-nowrap leading-none tabular-nums ${className}`} aria-label={pad(value)}>
      {prev.current !== null && (
        <span key={`out-${prev.current}`} className="mm-num-out [grid-area:1/1]" aria-hidden="true">{pad(prev.current)}</span>
      )}
      <span key={`in-${value}`} className="mm-num-in [grid-area:1/1]" aria-hidden="true">{pad(value)}</span>
    </span>
  );
}
