import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";

function DigitScroller({ digit, duration = 0.7, fontSize = 88, itemWidth }) {
    const innerRef = useRef(null);
    const defaultH = Math.round(fontSize * 1.1);
    const [itemH, setItemH] = useState(defaultH);
    const width = itemWidth ?? Math.round(fontSize * 0.6);

    useLayoutEffect(() => {
        const el = innerRef.current?.querySelector(".digit-item");
        if (el) {
            const h = Math.round(el.getBoundingClientRect().height);
            setItemH(h || defaultH);
            gsap.set(innerRef.current, { y: -digit * (h || defaultH) });
        }

        const ro = new ResizeObserver(() => {
            const el2 = innerRef.current?.querySelector(".digit-item");
            if (el2) {
                const h2 = Math.round(el2.getBoundingClientRect().height);
                setItemH(h2 || defaultH);
            }
        });
        if (innerRef.current) ro.observe(innerRef.current);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fontSize]);

    useEffect(() => {
        if (!innerRef.current) return;
        const y = -digit * itemH;
        gsap.killTweensOf(innerRef.current);
        gsap.to(innerRef.current, { y, duration, ease: "power3.out", overwrite: true, force3D: true });
    }, [digit, itemH, duration]);

    return (
        <div style={{ overflow: "hidden", height: itemH, width }}>
            <div ref={innerRef}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="digit-item"
                        style={{ height: itemH, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 400 }}
                    >
                        {i}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Counter({ start = 1, end = 99, speed = 1000, loop = true, fontSize = 88, background = false, itemWidth }) {
    const [value, setValue] = useState(start);

    useEffect(() => {
        const id = setInterval(() => {
            setValue((v) => {
                if (v >= end) {
                    return loop ? start : end;
                }
                return v + 1;
            });
        }, speed);
        return () => clearInterval(id);
    }, [end, speed, loop, start]);

    const tens = Math.floor(value / 10);
    const ones = value % 10;

    const wrapperStyle = background ? { padding: 2, background: "#000" } : { padding: 0, background: "transparent" };

    return (
        <div style={wrapperStyle}>
            <div style={{ display: "inline-flex", gap: 0 }}>
                <DigitScroller digit={tens} duration={3} fontSize={Math.round(fontSize)} itemWidth={itemWidth} />
                <DigitScroller digit={ones} duration={1} fontSize={Math.round(fontSize)} itemWidth={itemWidth} />
            </div>
        </div>
    );
}
