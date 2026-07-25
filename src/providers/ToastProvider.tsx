import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id"> & { duration?: number }) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      message,
      type,
      duration = 4000,
    }: Omit<Toast, "id"> & { duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full glass rounded-xl shadow-lg border border-white/10 p-4 flex gap-3 items-start overflow-hidden relative"
            >
              {/* Active glow indicator on the side */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  t.type === "success"
                    ? "bg-emerald-500"
                    : t.type === "error"
                    ? "bg-rose-500"
                    : "bg-brand-primary"
                }`}
              />

              <div className="flex-shrink-0 mt-0.5">
                {t.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                )}
                {t.type === "error" && (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                )}
                {t.type === "info" && (
                  <Info className="h-5 w-5 text-cyan-400" />
                )}
              </div>

              <div className="flex-1">
                {t.title && (
                  <h4 className="text-sm font-semibold font-heading text-white">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
