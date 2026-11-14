import React, { useEffect, useRef } from "react";

// 14 Nov (Marta, her iPhone 12 Pro Max, Safari and Chrome, screen recording: "Показує оцей фон, на якому розташовані
// анімації... саме гірше тут. Дуже явно видно"): the M, the apple, the glove and the key each showed as a box a shade
// off the page's white, though their white is #FFFFFF in the file. An iPhone plays a <video> in a layer of its own with
// the video's colour handling, not the page's (super-white and bright-white can come out brighter than the page), so
// video white and page white don't match there; Chrome on a computer draws them the same, so our checks never saw it.
// Every frame is now also drawn onto a canvas laid exactly over the video: a canvas is page content, so its white is
// the page's white. If the device still draws the clip's background a shade under white, that level is measured once
// on the canvas and lifted to 255. The video stays under it and plays as before (the lazy loader, the poster until the
// first frame is drawn), so where a canvas can't draw, the video shows as it did.
// The wrapper takes the box (className and style as they were on the video); its object-fit class goes to the video
// inside and the canvas fits the frame the same way.

const FIT = /(?:^|\s)object-(cover|contain|fill)(?=\s|$)/;

function useCanvasCopy(vRef, cRef, fit) {
  useEffect(() => {
    const v = vRef.current;
    const c = cRef.current;
    if (!v || !c) return;
    let ctx;
    try {
      ctx = c.getContext("2d", { alpha: false });
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    let frames = 0;
    let tries = 0;
    let measured = false;
    let pending = 0;
    let byFrame = false;
    let stopped = false;
    let clean = true;

    // 14 Nov (the white check, her rule: pure #FFFFFF round every picture and video): the clips' white background
    // comes out of the video as 244-254 here and there (compression), never quite 255. Near-white is lifted to pure
    // white on the canvas: from the darkest channel 244 up it is 255, from 228 to 244 it is lifted gradually (so soft
    // shadows don't get a hard edge), below 228 nothing changes.
    const whiten = (w, h) => {
      try {
        const img = ctx.getImageData(0, 0, w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const m = r < g ? (r < b ? r : b) : g < b ? g : b;
          if (m < 228) continue;
          if (m >= 244) {
            d[i] = d[i + 1] = d[i + 2] = 255;
          } else {
            const t = (m - 228) / 16;
            d[i] = r + (255 - r) * t;
            d[i + 1] = g + (255 - g) * t;
            d[i + 2] = b + (255 - b) * t;
          }
        }
        ctx.putImageData(img, 0, 0);
      } catch {
        clean = false;
      }
    };

    // one picture (a video frame or the poster) onto the canvas, fitted as the video is, near-white lifted to white
    const paint = (src, sw, sh) => {
      if (!sw || !sh || !c.clientWidth) return null;
      const r = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(c.clientWidth * r));
      const h = Math.max(1, Math.round(c.clientHeight * r));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      let dw = w;
      let dh = h;
      if (fit !== "fill") {
        const s = fit === "cover" ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
        dw = sw * s;
        dh = sh * s;
      }
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      try {
        ctx.drawImage(src, dx, dy, dw, dh);
      } catch {
        return null;
      }
      if (clean) whiten(w, h);
      if (c.style.visibility !== "visible") c.style.visibility = "visible";
      return [dx, dy, dw, dh, w, h];
    };

    // 14 Nov: until the clip's first frame, the poster is shown the same way (its edges weren't pure white either)
    let poster = null;
    const showPoster = () => {
      if (!frames && poster && poster.complete && poster.naturalWidth) paint(poster, poster.naturalWidth, poster.naturalHeight);
    };
    const posterSrc = v.getAttribute("poster");
    if (posterSrc) {
      poster = new Image();
      poster.decoding = "async";
      poster.onload = showPoster;
      poster.src = posterSrc;
    }

    const draw = () => {
      if (v.readyState < 2 || !v.videoWidth) return showPoster();
      const box = paint(v, v.videoWidth, v.videoHeight);
      if (!box) return;
      frames++;
      if (!measured && (frames === 3 || frames % 60 === 0)) measure(...box);
    };

    // the clip's background at its four corners (inside the drawn frame); if it is near white but under 255 on this
    // device, the canvas is brightened by exactly that much, so the background is the page's #FFFFFF
    const measure = (dx, dy, dw, dh, w, h) => {
      tries++;
      try {
        const x0 = Math.max(0, Math.ceil(dx) + 2);
        const y0 = Math.max(0, Math.ceil(dy) + 2);
        const x1 = Math.min(w - 1, Math.floor(dx + dw) - 3);
        const y1 = Math.min(h - 1, Math.floor(dy + dh) - 3);
        const levels = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]
          .map(([x, y]) => {
            const d = ctx.getImageData(x, y, 1, 1).data;
            return Math.min(d[0], d[1], d[2]);
          })
          .sort((a, b) => a - b);
        const level = levels[1];
        // a corner on the shape itself (the Platform clip's black phase): try again later, at most 6 times
        if (level >= 225) {
          measured = true;
          if (level < 255) c.style.filter = `brightness(${(255 / level).toFixed(3)})`;
        } else if (tries >= 6) measured = true;
      } catch {
        measured = true;
      }
    };

    const loop = () => {
      pending = 0;
      if (stopped) return;
      draw();
      if (v.paused || v.ended) return;
      byFrame = typeof v.requestVideoFrameCallback === "function";
      pending = byFrame ? v.requestVideoFrameCallback(loop) : requestAnimationFrame(loop);
    };
    const start = () => {
      if (!pending) loop();
    };
    const once = () => draw();

    v.addEventListener("play", start);
    v.addEventListener("playing", start);
    v.addEventListener("loadeddata", once);
    v.addEventListener("seeked", once);
    window.addEventListener("resize", once);
    if (!v.paused) start();
    else once();
    return () => {
      stopped = true;
      if (poster) poster.onload = null;
      if (pending) (byFrame ? v.cancelVideoFrameCallback?.(pending) : cancelAnimationFrame(pending));
      v.removeEventListener("play", start);
      v.removeEventListener("playing", start);
      v.removeEventListener("loadeddata", once);
      v.removeEventListener("seeked", once);
      window.removeEventListener("resize", once);
    };
  }, [fit]);
}

// className / style: the box, as they were on the <video>; videoRef: the <video> itself, for its caller; the rest goes
// to the <video> (data-lazy-video, data-src, poster, muted, loop, playsInline, preload, aria-label...).
export default function WhiteVideo({ className = "", style, videoRef, ...video }) {
  const own = useRef(null);
  const vRef = videoRef || own;
  const cRef = useRef(null);
  const fit = (className.match(FIT) || [])[1] || "fill";
  const box = className.replace(new RegExp(FIT.source, "g"), " ").replace(/\s+/g, " ").trim();
  const positioned = /(?:^|\s)(absolute|fixed|relative|sticky)(?=\s|$)/.test(box);
  useCanvasCopy(vRef, cRef, fit);
  return (
    <div className={positioned ? box : `relative ${box}`} style={style}>
      <video ref={vRef} {...video} className={`absolute inset-0 block h-full w-full bg-white object-${fit}`} />
      <canvas ref={cRef} aria-hidden="true" className="pointer-events-none absolute inset-0 block h-full w-full" style={{ visibility: "hidden" }} />
    </div>
  );
}
