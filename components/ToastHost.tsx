"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type ToastMessage } from "@/lib/toast";

const AUTO_DISMISS_MS = 4500;

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, AUTO_DISMISS_MS);
    });
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
