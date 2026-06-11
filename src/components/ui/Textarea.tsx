import * as React from "react";
import { cn } from "./utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-colors resize-none",
        "placeholder:text-slate-400 placeholder:font-normal",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
        "dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500",
        error
          ? "border-red-400 focus:ring-red-500/20 focus:border-red-400"
          : "border-slate-200 dark:border-slate-700",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
