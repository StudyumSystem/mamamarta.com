import React from "react";

// Menu of the inner pages (Library, What is, Bio) as in Marta's desktop frames (1920 wide):
// Back at the left, the six links centred, the open page in pink. On the phone the inner pages
// have no menu, only Back (Marta, 26 Oct 2026); that is PhoneBack below.
export const PINK = "#F600A9";

export const navLinks = [
  { href: "/library", label: "Library" },
  { href: "/#system", label: "My System" },
  { href: "/what-is", label: "What is" },
  { href: "/#mindset", label: "The Mindset" },
  { href: "/bio", label: "Bio" },
  { href: "/#contact", label: "Contact" },
];

// One Back for every inner page (12 Nov, Marta: "the Back buttons must be identical on Bio and The Method";
// the one on The Method is the reference, on Bio it looked bigger). Every Back below is this one link, so
// size, font, weight, letter spacing and colour can't drift apart. It carries its own unit, --bu = one pixel
// of her 1920 x 1080 frame fitted to the screen (the smaller of width and height), so it never follows a
// page's own --u: Bio's --u follows the width only, which made its Back bigger than The Method's on any
// window shorter than 16:9. Her frames: 22 px on the computer (line 21, at 170 / 123 px from the top left),
// 14 px on the phone (21 / 24 px; its line height is left to the place it stands in, so nothing around it moves).
const backUnit = { "--bu": "min(calc(100vw / 1920), calc(100dvh / 1080))" };
const backText =
  "underline underline-offset-4 tracking-normal text-[14px] font-normal md:font-light md:text-[length:calc(var(--bu)*22)] transition-colors duration-300 hover:text-[#F600A9]";
const backColour = (light) => (light ? "text-[#b0b0b0]" : "text-[#555] md:text-[#7e7e7e]");
// The top-left place on the computer
const backTopDesktop = "md:absolute md:left-[calc(var(--bu)*170)] md:top-[calc(var(--bu)*123)] md:z-20 md:leading-[calc(var(--bu)*26)]";

// data-back: returns to the exact place the visitor came from (scripts/back-link.js)
function BackLink({ className = "", light = false }) {
  return (
    <a href="/" data-back style={backUnit} className={`${backText} ${backColour(light)} ${className}`}>
      Back
    </a>
  );
}

// Back at the top left on every screen size (Bio, The Method): 21 / 24 px on the phone, her 170 / 123 on the computer.
// Needs a positioned (relative) page wrapper.
export function TopBack() {
  return <BackLink className={`absolute left-[21px] top-[24px] z-20 ${backTopDesktop}`} />;
}

// Marta's spec (28 Oct 2026, MM-BIO / MM-LIBRARY / MM-METHOD): no main navigation on the inner pages,
// only Back at the top left on the computer (hidden on the phone). The pages still pass `active`; it is no longer used.
export default function InnerNav() {
  return <BackLink className={`hidden md:block ${backTopDesktop}`} />;
}

// Back at the bottom of a page, on every screen size (Bio).
export function BottomBack({ className = "", light = false }) {
  return <BackLink className={className} light={light} />;
}

// Phone only; light: on a black block
export function PhoneBack({ className = "", light = false }) {
  return <BackLink className={`md:hidden ${className}`} light={light} />;
}
