'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListener: ((toast: Toast) => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (toastListener) {
    toastListener({
      id: Math.random().toString(36).substring(7),
      message,
      type,
    });
  }
}

export default function Toasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm
            transition-all duration-300 ease-out
            ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : ''}
            ${toast.type === 'error' ? 'bg-red-50 text-red-900 border border-red-200' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 text-blue-900 border border-blue-200' : ''}
          `}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
