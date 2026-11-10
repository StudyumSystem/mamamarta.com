import React from "react";

// The short, heavy arrow of Marta's buttons, drawn as a line icon. The → character drew long and thin, and
// arrow characters can turn into coloured emoji on iPhones (Marta, 2 Nov: "no emoji arrows on my website").
// dir: "right" (default), "up-right", "down-left".
const PATHS = {
  right: ["M5 12h14", "M13 6l6 6-6 6"],
  "up-right": ["M7 17L17 7", "M8 7h9v9"],
  "down-left": ["M17 7L7 17", "M16 17H7V8"],
};

export default function ArrowIcon({ dir = "right", className = "" }) {
  return (
    <svg className={`inline-block h-[0.9em] w-[0.9em] shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[dir].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
