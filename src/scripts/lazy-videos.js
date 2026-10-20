// Videos below the first screen (marked data-lazy-video, with data-src and a poster) load only when they
// come near, play while on screen and pause when off it: a phone downloads what it shows, not the whole
// page at once. With reduced motion they stay on their poster.
// React parts can render their videos after this runs (the card row rebuilds itself as it hydrates), so new
// ones are picked up as they appear.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const seen = new WeakSet();

const io = new IntersectionObserver(
  (entries) => {
    for (const { target: v, isIntersecting } of entries) {
      if (isIntersecting) {
        if (!v.getAttribute("src") && v.dataset.src) {
          v.src = v.dataset.src;
          v.preload = "auto";
        }
        v.play().catch(() => undefined);
      } else if (v.getAttribute("src")) {
        v.pause();
      }
    }
  },
  { rootMargin: "300px 0px" },
);

function watch(root = document) {
  if (reduced) return;
  for (const v of root.querySelectorAll?.("video[data-lazy-video]") ?? []) {
    if (seen.has(v)) continue;
    seen.add(v);
    io.observe(v);
  }
}

new MutationObserver((records) => {
  for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) (n.matches?.("video[data-lazy-video]") ? watch(n.parentElement ?? document) : watch(n));
}).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("astro:page-load", () => watch());
