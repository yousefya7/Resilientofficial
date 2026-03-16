import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function CursorInner() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    const tick = () => {
      if (cursorRef.current) {
        const { x, y } = posRef.current;
        cursorRef.current.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      setHovering(!!el.closest("a, button, [role='button'], label, select, input, [data-cursor-hover]"));
    };

    const onLeave = () => setVisible(false);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 24,
        height: 24,
        pointerEvents: "none",
        zIndex: 2147483647,
        willChange: "transform",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          transition: "transform 0.12s ease-out, filter 0.12s ease-out",
          transform: hovering ? "scale(1.45)" : "scale(1)",
          mixBlendMode: "screen",
          filter: hovering
            ? "sepia(1) saturate(8) hue-rotate(185deg) brightness(1.2) drop-shadow(0 0 4px rgba(0,128,255,0.8))"
            : "none",
        }}
      >
        <img
          src="/images/logo-icon.png"
          alt=""
          draggable={false}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  if (!mounted || isTouch) return null;

  return createPortal(<CursorInner />, document.body);
}
