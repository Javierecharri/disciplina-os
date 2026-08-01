"use client";

import { useMemo } from "react";
import { periodRange, todayKey, type Period } from "@/utils/date";
import { buildLogIndex, categoryScore, earliestTrackedDate } from "@/services/scoring/disciplineScore";
import { useAppData } from "./useAppData";

/** Category breakdown for an independent period — decoupled from the main Discipline Score period. */
export function useCategoryScores(period: Period, anchor: string = todayKey()) {
  const { habits, categories, logs } = useAppData();

  return useMemo(() => {
    const activeHabits = habits.filter((h) => h.active);
    const index = buildLogIndex(logs);
    const earliest = earliestTrackedDate(habits, logs, anchor);
    const range = periodRange(period, anchor, earliest);

    return categories.map((category) => ({
      category,
      score: categoryScore(range.start, range.end, activeHabits, index, category.id),
    }));
  }, [habits, categories, logs, period, anchor]);
}
