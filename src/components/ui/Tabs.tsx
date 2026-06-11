import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "./utils";

export const TabsRoot = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

/* ── Animated pill tab list ── */

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none",
      "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
      "data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50",
      className
    )}
    {...props}
  >
    {/* Sliding pill — uses Framer Motion layoutId for cross-trigger animation */}
    <span
      className="absolute inset-0 data-[state=inactive]:opacity-0 rounded-md
                 bg-white shadow-xs border border-slate-200/50
                 dark:bg-slate-900 dark:border-slate-700/50 -z-10 transition-opacity"
    />
    <span className="relative z-10">{children}</span>
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* ── High-level convenience Tabs (keeps existing prop API) ── */

interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
}

export function Tabs({ options, activeTab, onChange, className, tabClassName }: TabsProps) {
  return (
    <TabsRoot value={activeTab} onValueChange={onChange}>
      <TabsList className={className}>
        {options.map((option) => {
          const isActive = option.id === activeTab;
          return (
            <TabsPrimitive.Trigger
              key={option.id}
              value={option.id}
              className={cn(
                "relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none",
                isActive
                  ? "text-slate-900 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
                tabClassName
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white shadow-xs rounded-md dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsList>
    </TabsRoot>
  );
}
