// Scroll animations (GSAP ScrollTrigger). What moves is marked in the components:
//   data-reveal        fades in and rises as it comes into view
//   data-reveal-lines  each child (a line of a heading) rises in turn, from behind a mask
//   data-parallax="-12" drifts that many percent of its height while its section scrolls by
// Nobody who asked their device for less motion gets any of it.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let ctx;

function init() {
  ctx?.revert();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ctx = gsap.context(() => {
    for (const el of gsap.utils.toArray("[data-reveal]")) {
      gsap.from(el, {
        y: 48,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }
    for (const el of gsap.utils.toArray("[data-reveal-lines]")) {
      el.style.overflow = "hidden";
      gsap.from(el.children, {
        yPercent: 105,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }
    for (const el of gsap.utils.toArray("[data-parallax]")) {
      gsap.to(el, {
        yPercent: Number(el.dataset.parallax) || -10,
        ease: "none",
        scrollTrigger: { trigger: el.closest("section") ?? el, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
  });
}

// Only once the page has its full height (images loaded): measured earlier, everything below the fold
// counts as already on screen and plays at once on load. Again after each page change (view transitions).
const whenLoaded = (f) => (document.readyState === "complete" ? requestAnimationFrame(f) : window.addEventListener("load", () => requestAnimationFrame(f), { once: true }));
document.addEventListener("astro:page-load", () => whenLoaded(init));
ScrollTrigger.config({ ignoreMobileResize: true });
