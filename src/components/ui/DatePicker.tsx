import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";

import "react-day-picker/style.css";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 py-1.5 text-sm shadow-xs transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100",
            selectedDate
              ? "border-slate-200 text-slate-900 dark:border-slate-700"
              : "border-slate-200 text-slate-400 dark:border-slate-700",
            className
          )}
        >
          <span>{selectedDate ? format(selectedDate, "dd-MM-yyyy") : placeholder}</span>
          <Calendar size={14} className="text-slate-400 shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className={cn(
            "z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-lg",
            "dark:border-slate-700 dark:bg-slate-900",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate}
            showOutsideDays
            classNames={{
              root: "text-sm",
              months: "flex flex-col",
              month: "space-y-3",
              month_caption: "flex justify-center items-center relative h-7",
              caption_label: "text-sm font-semibold text-slate-900 dark:text-slate-100",
              nav: "flex items-center gap-1",
              button_previous: cn(
                "absolute left-0 h-7 w-7 flex items-center justify-center rounded-md",
                "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
                "dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              ),
              button_next: cn(
                "absolute right-0 h-7 w-7 flex items-center justify-center rounded-md",
                "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
                "dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              ),
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "w-8 text-[10px] font-semibold text-slate-400 text-center pb-1",
              week: "flex w-full mt-1",
              day: "relative p-0 text-center",
              day_button: cn(
                "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                "hover:bg-emerald-50 hover:text-emerald-700",
                "dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              ),
              selected: "[&>button]:bg-emerald-500 [&>button]:text-white [&>button]:hover:bg-emerald-600",
              today: "[&>button]:font-bold [&>button]:text-emerald-600 dark:[&>button]:text-emerald-400",
              outside: "[&>button]:text-slate-300 dark:[&>button]:text-slate-600",
              disabled: "[&>button]:text-slate-200 dark:[&>button]:text-slate-700 [&>button]:cursor-not-allowed",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />,
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
