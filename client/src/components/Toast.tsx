import { useEffect, useState } from "react";

/*
 * Toast — a single fixed-position notification that auto-dismisses after ~3 s.
 * Rendered by ToastContext; stacks vertically when multiple toasts are active.
 *
 * Props:
 *   message  — text to display
 *   type     — "success" (green) | "error" (red)
 *   onDone   — called after the fade-out so the parent can remove it from state
 *   index    — vertical offset when several toasts stack (0 = topmost)
 */

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDone: () => void;
  index?: number;
}

export default function Toast({ message, type = "success", onDone, index = 0 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 2800);
    const done = setTimeout(onDone, 3200);
    return () => { clearTimeout(hide); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      style={{
        ...toastStyle,
        ...(type === "error" ? errorStyle : successStyle),
        top: 24 + index * 60,
        opacity: visible ? 1 : 0,
      }}
    >
      <span style={{ marginRight: 8, fontSize: 16 }}>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

const toastStyle: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  padding: "12px 24px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
  transition: "opacity 0.4s ease",
  pointerEvents: "none",
  whiteSpace: "nowrap",
};

const successStyle: React.CSSProperties = {
  background: "rgba(34,197,94,0.18)",
  border: "1px solid rgba(34,197,94,0.5)",
  color: "#4ade80",
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.18)",
  border: "1px solid rgba(239,68,68,0.5)",
  color: "#f87171",
};
