export type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastMessage) => void;

const listeners = new Set<Listener>();
let nextId = 0;

export function showToast(message: string, type: ToastType = "success") {
  const toast: ToastMessage = { id: ++nextId, message, type };
  listeners.forEach((listener) => listener(toast));
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
