// "Back" on the inner pages returns to the exact place the visitor came from (same page, same scroll),
// Marta's rule (26 Oct 2026). Each page change remembers the page before it; a visitor who landed
// straight on an inner page has nowhere to go back to on the site, so Back takes them to the home page.
document.addEventListener("astro:page-load", () => {
  const here = location.pathname;
  const last = sessionStorage.getItem("mm-current");
  if (last !== here) {
    sessionStorage.setItem("mm-prev", last ?? "");
    sessionStorage.setItem("mm-current", here);
  }
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-back]");
  if (!link) return;
  const prev = sessionStorage.getItem("mm-prev");
  if (prev && prev !== location.pathname) {
    e.preventDefault();
    history.back();
  }
});
