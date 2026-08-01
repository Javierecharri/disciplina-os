"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, Minus, X } from "lucide-react";
import type { HabitStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusCellProps {
  status: HabitStatus;
  isToday: boolean;
  isFuture: boolean;
  ariaLabel: string;
  onActivate: () => void;
  onFocus: () => void;
}

const STATUS_STYLES: Record<HabitStatus, string> = {
  completed: "bg-status-completed border-status-completed text-white",
  partial: "bg-status-partial border-status-partial text-white",
  missed: "bg-status-missed border-status-missed text-white",
  unset: "bg-transparent border-border text-transparent hover:border-muted-foreground/50",
};

const STATUS_ICON: Record<HabitStatus, typeof Check | null> = {
  completed: Check,
  partial: Minus,
  missed: X,
  unset: null,
};

export const StatusCell = forwardRef<HTMLButtonElement, StatusCellProps>(function StatusCell(
  { status, isToday, isFuture, ariaLabel, onActivate, onFocus },
  ref,
) {
  const Icon = STATUS_ICON[status];

  return (
    <button
      ref={ref}
      type="button"
      disabled={isFuture}
      onClick={onActivate}
      onFocus={onFocus}
      aria-label={ariaLabel}
      className={cn(
        "flex size-8 items-center justify-center rounded-full border-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-30",
        STATUS_STYLES[status],
        isToday && "ring-1 ring-primary/40 ring-offset-1 ring-offset-background",
      )}
    >
      <motion.span
        key={status}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="flex items-center justify-center"
      >
        {Icon && <Icon className="size-4" strokeWidth={3} />}
      </motion.span>
    </button>
  );
});
