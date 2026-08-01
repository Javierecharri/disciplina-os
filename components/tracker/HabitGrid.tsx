"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Habit } from "@/types";
import { formatDayMonth, todayKey, weekDays, weekdayLabel } from "@/utils/date";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SHORTCUTS } from "@/constants/shortcuts";
import { CategoryGroup } from "./CategoryGroup";
import { TRACKER_ROW_GRID } from "./HabitRow";

interface HabitGridProps {
  habits: Habit[];
  categories: Category[];
  anchor: string;
  onAnchorChange: (next: string) => void;
}

export function HabitGrid({ habits, categories, anchor, onAnchorChange }: HabitGridProps) {
  const { getLogStatus, cycleLogStatus, setLogStatus } = useDailyLogs();
  const today = todayKey();
  const week = useMemo(() => weekDays(anchor), [anchor]);

  const activeCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories],
  );

  const habitsByCategory = useMemo(() => {
    const map = new Map<string, Habit[]>();
    for (const habit of habits) {
      if (!habit.active) continue;
      const list = map.get(habit.categoryId) ?? [];
      list.push(habit);
      map.set(habit.categoryId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [habits]);

  const orderedHabits = useMemo(() => {
    const result: Habit[] = [];
    for (const category of activeCategories) {
      result.push(...(habitsByCategory.get(category.id) ?? []));
    }
    return result;
  }, [activeCategories, habitsByCategory]);

  const todayColIndex = week.indexOf(today);
  const [focus, setFocus] = useState({ row: 0, col: todayColIndex >= 0 ? todayColIndex : 0 });
  const refsMap = useRef(new Map<string, HTMLButtonElement>());

  const registerRef = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) refsMap.current.set(key, el);
    else refsMap.current.delete(key);
  }, []);

  useEffect(() => {
    const habit = orderedHabits[focus.row];
    const date = week[focus.col];
    if (!habit || !date) return;
    refsMap.current.get(`${habit.id}__${date}`)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, week, orderedHabits.length]);

  useKeyboardShortcuts(
    useMemo(
      () => [
        {
          combo: SHORTCUTS.navDown,
          handler: () => setFocus((f) => ({ ...f, row: Math.min(f.row + 1, orderedHabits.length - 1) })),
        },
        { combo: SHORTCUTS.navUp, handler: () => setFocus((f) => ({ ...f, row: Math.max(f.row - 1, 0) })) },
        { combo: SHORTCUTS.navRight, handler: () => setFocus((f) => ({ ...f, col: Math.min(f.col + 1, 6) })) },
        { combo: SHORTCUTS.navLeft, handler: () => setFocus((f) => ({ ...f, col: Math.max(f.col - 1, 0) })) },
        {
          combo: SHORTCUTS.markCompleted,
          handler: () => {
            const habit = orderedHabits[focus.row];
            const date = week[focus.col];
            if (habit && date) setLogStatus(habit.id, date, "completed");
          },
        },
        {
          combo: SHORTCUTS.markPartial,
          handler: () => {
            const habit = orderedHabits[focus.row];
            const date = week[focus.col];
            if (habit && date) setLogStatus(habit.id, date, "partial");
          },
        },
        {
          combo: SHORTCUTS.markMissed,
          handler: () => {
            const habit = orderedHabits[focus.row];
            const date = week[focus.col];
            if (habit && date) setLogStatus(habit.id, date, "missed");
          },
        },
        {
          combo: SHORTCUTS.today,
          handler: () => {
            onAnchorChange(today);
            setFocus((f) => ({ row: f.row, col: week.indexOf(today) >= 0 ? week.indexOf(today) : 0 }));
          },
        },
      ],
      [orderedHabits, week, focus.row, focus.col, setLogStatus, onAnchorChange, today],
    ),
  );

  const handleCellFocus = useCallback(
    (key: string) => {
      const [habitId, date] = key.split("__");
      const row = orderedHabits.findIndex((h) => h.id === habitId);
      const col = week.indexOf(date);
      if (row >= 0 && col >= 0) setFocus({ row, col });
    },
    [orderedHabits, week],
  );

  if (orderedHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        <p className="text-sm">No tienes hábitos activos todavía.</p>
        <p className="text-xs">Ve a Ajustes para crear tu primer hábito.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className={`${TRACKER_ROW_GRID} sticky top-14 z-10 border-b border-border bg-background/95 px-2 pb-2 backdrop-blur md:top-0`}>
        <span />
        {week.map((date) => (
          <div key={date} className={`flex flex-col items-center ${date === today ? "text-primary" : "text-muted-foreground"}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wide">{weekdayLabel(date, true)}</span>
            <span className="text-[11px] tabular-nums">{formatDayMonth(date)}</span>
          </div>
        ))}
      </div>

      <div className="mt-1 flex flex-col">
        {activeCategories.map((category) => {
          const categoryHabits = habitsByCategory.get(category.id);
          if (!categoryHabits || categoryHabits.length === 0) return null;
          return (
            <CategoryGroup
              key={category.id}
              category={category}
              habits={categoryHabits}
              week={week}
              getStatus={getLogStatus}
              onCellActivate={cycleLogStatus}
              onCellFocus={handleCellFocus}
              registerRef={registerRef}
              todayKey={today}
            />
          );
        })}
      </div>
      <p className="mt-2 px-2 text-xs text-muted-foreground">
        Atajos: click para cambiar estado · flechas para navegar · <kbd className="font-sans">1</kbd>/
        <kbd className="font-sans">2</kbd>/<kbd className="font-sans">3</kbd> completado/parcial/fallado ·{" "}
        <kbd className="font-sans">T</kbd> hoy
      </p>
    </div>
  );
}
