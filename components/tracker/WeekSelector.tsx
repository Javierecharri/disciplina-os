"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, formatWeekRange, todayKey } from "@/utils/date";

interface WeekSelectorProps {
  anchor: string;
  onChange: (next: string) => void;
}

export function WeekSelector({ anchor, onChange }: WeekSelectorProps) {
  const isCurrentWeek = formatWeekRange(anchor) === formatWeekRange(todayKey());

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg border border-border">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-r-none"
          onClick={() => onChange(addDays(anchor, -7))}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-32 select-none px-1 text-center text-sm font-medium tabular-nums">
          {formatWeekRange(anchor)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-l-none"
          onClick={() => onChange(addDays(anchor, 7))}
          aria-label="Semana siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <Button variant="secondary" size="sm" disabled={isCurrentWeek} onClick={() => onChange(todayKey())}>
        Hoy
      </Button>
    </div>
  );
}
