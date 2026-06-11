import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {leftIcon}
        </span>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-900 shadow-xs transition-colors",
          "placeholder:text-slate-400 placeholder:font-normal",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
          "dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500",
          error
            ? "border-red-400 focus:ring-red-500/20 focus:border-red-400"
            : "border-slate-200 dark:border-slate-700",
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {rightIcon}
        </span>
      )}
    </div>
  )
);
Input.displayName = "Input";
