"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "success" }: { title: string; description?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start justify-between rounded-lg border p-4 shadow-lg backdrop-blur-xs transition-all duration-300 animate-in slide-in-from-bottom-2",
              t.type === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-950",
              t.type === "error" && "border-red-200 bg-red-50/95 text-red-950",
              t.type === "info" && "border-blue-200 bg-blue-50/95 text-blue-950"
            )}
          >
            <div className="flex items-start space-x-3">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />}
              {t.type === "info" && <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />}
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-xs opacity-90 mt-0.5">{t.description}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 inline-flex text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      toast: (options: { title: string; description?: string; type?: ToastType }) => {
        console.log("Toast:", options.title, options.description);
      },
    };
  }
  return context;
}
