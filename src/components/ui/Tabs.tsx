import { motion } from "framer-motion";
import { cn } from "./utils";

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

export function Tabs({
  options,
  activeTab,
  onChange,
  className,
  tabClassName
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800",
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.id === activeTab;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-hidden",
              isActive 
                ? "text-slate-900 dark:text-slate-50" 
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
              tabClassName
            )}
          >
            {/* Sliding Pill Active Background */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white shadow-xs rounded-md dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
