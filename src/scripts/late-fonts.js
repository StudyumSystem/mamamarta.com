// Marta's "experience" (What is heading) in her Figma's Inter 3.19 Italic, from jsDelivr (global.css, .mm-exp).
// Asked for only a moment after the page has loaded: a font in the CSS is part of the page's own load, so when the
// font server was slow or never answered, the page never finished loading (13 Nov: the phone home timed out, and an
// iPhone on a weak connection waited the same way). Until it arrives the word shows in the site's Inter italic.
const SRC = "https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-Italic.woff2";
let asked = false;

function loadItalic() {
  if (asked || !("FontFace" in window) || !document.querySelector(".mm-exp")) return;
  asked = true;
  const face = new FontFace("Inter 3.19 Italic", `url(${SRC}) format("woff2")`, { style: "italic", weight: "400", display: "swap" });
  face
    .load()
    .then((f) => document.fonts.add(f))
    .catch(() => {
      asked = false; // tried again on the next page that has the word
    });
}

const later = () => setTimeout(loadItalic, 1500);
if (document.readyState === "complete") later();
else window.addEventListener("load", later, { once: true });
document.addEventListener("astro:page-load", () => document.readyState === "complete" && later());
