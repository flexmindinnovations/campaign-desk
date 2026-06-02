import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "./utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastCallback = (toast: Toast) => void;
let toastListeners = new Set<ToastCallback>();

export const toast = {
  show: (type: ToastType, message: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    toastListeners.forEach(listener => listener({ id, type, message, duration }));
  },
  success: (message: string, duration = 4000) => toast.show("success", message, duration),
  error: (message: string, duration = 4000) => toast.show("error", message, duration),
  warning: (message: string, duration = 4000) => toast.show("warning", message, duration),
  info: (message: string, duration = 4000) => toast.show("info", message, duration)
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const addToast = (newToast: Toast) => {
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.duration || 4000);
    };

    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, []);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    warning: <AlertTriangle className="text-amber-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />
  };

  const borderColors = {
    success: "border-emerald-500/25 dark:border-emerald-500/20",
    error: "border-rose-500/25 dark:border-rose-500/20",
    warning: "border-amber-500/25 dark:border-amber-500/20",
    info: "border-blue-500/25 dark:border-blue-500/20"
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-200",
              borderColors[t.type]
            )}
          >
            {/* Indicator Icon */}
            <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
            
            {/* Message Body */}
            <div className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-100">
              {t.message}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
