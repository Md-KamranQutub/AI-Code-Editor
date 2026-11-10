import { useRef, useState } from "react";

/* Drag handle. direction "x" = vertical bar (resizes widths), "y" = horizontal bar (resizes heights).
   onDrag receives the pixel delta since the last move. */
export default function Resizer({ direction = "x", onDrag, className = "" }) {
  const last = useRef(0);
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const pos = (e) => (direction === "x" ? e.clientX : e.clientY);

  return (
    <div
      role="separator"
      aria-orientation={direction === "x" ? "vertical" : "horizontal"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        last.current = pos(e);
        setActive(true);
        document.body.style.userSelect = "none";
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const p = pos(e);
        onDrag(p - last.current);
        last.current = p;
      }}
      onPointerUp={() => {
        dragging.current = false;
        setActive(false);
        document.body.style.userSelect = "";
      }}
      onPointerCancel={() => {
        dragging.current = false;
        setActive(false);
        document.body.style.userSelect = "";
      }}
      className={`shrink-0 transition-colors hover:bg-[#2BB5A6]/50 ${
        direction === "x" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
      } ${active ? "bg-[#2BB5A6]/60" : ""} ${className}`}
    />
  );
}
