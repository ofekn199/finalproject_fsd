import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "../components/Toast";

/*
 * ToastContext — app-wide notification system.
 *
 * Any component can call showToast("message", "success" | "error") from anywhere.
 * A single <Toast> is rendered at the top of the app so it's never cut off.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast("Post updated!", "success");
 */

interface ToastEntry {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((t, i) => (
        <Toast key={t.id} message={t.message} type={t.type} index={i} onDone={() => removeToast(t.id)} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
