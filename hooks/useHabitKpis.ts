"use client";

import { useMemo } from "react";
import type { Habit } from "@/types";
import { todayKey } from "@/utils/date";
import { habitCumulativeCompletion } from "@/services/scoring/disciplineScore";
import { useAppData } from "./useAppData";

export interface HabitKpi {
  habit: Habit;
  completed: number;
  total: number;
  startDate: string;
}

/** Cumulative completion KPIs for every habit pinned to the Dashboard via Settings. */
export function useHabitKpis(anchor: string = todayKey()): HabitKpi[] {
  const { habits, logs } = useAppData();

  return useMemo(() => {
    return habits
      .filter((h) => h.active && h.pinnedKpi)
      .map((habit) => ({ habit, ...habitCumulativeCompletion(habit, logs, anchor) }));
  }, [habits, logs, anchor]);
}
