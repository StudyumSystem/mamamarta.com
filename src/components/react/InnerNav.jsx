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

// Marta's spec (28 Oct 2026, MM-BIO / MM-LIBRARY / MM-METHOD): no main navigation on the inner pages,
// only Back at the top left on the computer. The pages still pass `active`; it is no longer used.
// data-back: returns to the exact place the visitor came from (scripts/back-link.js)
export default function InnerNav({ light = false, underline = true }) {
  return (
    <a
      href="/"
      data-back
      className={`hidden md:block absolute left-[calc(var(--u)*170)] top-[calc(var(--u)*123)] z-20 leading-[calc(var(--u)*26)] text-[length:calc(var(--u)*22)] ${underline ? "font-light underline underline-offset-4" : "font-normal"} transition-colors duration-300 hover:text-[#F600A9] ${light ? "text-[#b0b0b0]" : "text-[#7e7e7e]"}`}
    >
      Back
    </a>
  );
}

// Back at the bottom of a page, on every screen size (Bio).
export function BottomBack({ className = "" }) {
  return (
    <a href="/" data-back className={`text-[14px] md:text-[length:calc(var(--u)*22)] font-light underline underline-offset-4 text-[#555] md:text-[#7e7e7e] ${className}`}>
      Back
    </a>
  );
}

// light: on a black block
export function PhoneBack({ className = "", light = false }) {
  return (
    <a
      href="/"
      data-back
      className={`md:hidden text-[14px] underline underline-offset-4 ${light ? "text-[#b0b0b0]" : "text-[#555]"} ${className}`}
    >
      Back
    </a>
  );
}
