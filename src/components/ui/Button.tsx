import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 focus:ring-emerald-500/40",
        secondary:
          "bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 focus:ring-slate-400/30 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 focus:ring-red-500/40",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400/30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        outline:
          "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-400/30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
        link: "text-emerald-600 underline-offset-4 hover:underline focus:ring-0",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-5 text-base",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
