"use client";

import type { Habit, HabitStatus } from "@/types";
import { getIcon } from "@/utils/icon";
import { isFuture as dateIsFuture, weekdayLabel } from "@/utils/date";
import { StatusCell } from "./StatusCell";

export const TRACKER_ROW_GRID = "grid grid-cols-[1fr_repeat(7,2.75rem)] items-center gap-1 sm:gap-2";

interface HabitRowProps {
  habit: Habit;
  week: string[];
  color: string;
  getStatus: (habitId: string, date: string) => HabitStatus;
  onCellActivate: (habitId: string, date: string) => void;
  onCellFocus: (key: string) => void;
  registerRef: (key: string, el: HTMLButtonElement | null) => void;
  todayKey: string;
}

export function HabitRow({
  habit,
  week,
  color,
  getStatus,
  onCellActivate,
  onCellFocus,
  registerRef,
  todayKey,
}: HabitRowProps) {
  const Icon = getIcon(habit.icon);

  return (
    <div className={`${TRACKER_ROW_GRID} rounded-lg px-2 py-1.5 hover:bg-accent/40`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <Icon className="size-4" />
        </span>
        <span className="truncate text-sm font-medium">{habit.name}</span>
      </div>

      {week.map((date) => {
        const key = `${habit.id}__${date}`;
        return (
          <div key={key} className="flex justify-center">
            <StatusCell
              ref={(el) => registerRef(key, el)}
              status={getStatus(habit.id, date)}
              isToday={date === todayKey}
              isFuture={dateIsFuture(date)}
              ariaLabel={`${habit.name} — ${weekdayLabel(date)}`}
              onActivate={() => onCellActivate(habit.id, date)}
              onFocus={() => onCellFocus(key)}
            />
          </div>
        );
      })}
    </div>
  );
}
