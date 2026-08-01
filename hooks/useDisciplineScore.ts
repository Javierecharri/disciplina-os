"use client";

import { useMemo } from "react";
import type { Habit } from "@/types";
import { addDays, periodRange, previousWindow, todayKey, type Period } from "@/utils/date";
import {
  buildLogIndex,
  dailyScoreSeries,
  habitCompletionRate,
  periodScore,
} from "@/services/scoring/disciplineScore";
import { disciplineStreaks } from "@/services/scoring/streaks";
import { useAppData } from "./useAppData";
import { useSettings } from "./useSettings";

export type { Period } from "@/utils/date";

export interface HabitRate {
  habit: Habit;
  rate: number;
}

export function useDisciplineScore(period: Period, anchor: string = todayKey()) {
  const { habits, logs } = useAppData();
  const { settings } = useSettings();

  return useMemo(() => {
    const activeHabits = habits.filter((h) => h.active);
    const index = buildLogIndex(logs);
    const earliest = habits.reduce(
      (min, h) => (h.createdAt.slice(0, 10) < min ? h.createdAt.slice(0, 10) : min),
      anchor,
    );

    const heroRanges = {
      today: periodRange("today", anchor, earliest),
      week: periodRange("week", anchor, earliest),
      month: periodRange("month", anchor, earliest),
      year: periodRange("year", anchor, earliest),
    };
    const heroScores = {
      today: periodScore(heroRanges.today.start, heroRanges.today.end, activeHabits, index),
      week: periodScore(heroRanges.week.start, heroRanges.week.end, activeHabits, index),
      month: periodScore(heroRanges.month.start, heroRanges.month.end, activeHabits, index),
      year: periodScore(heroRanges.year.start, heroRanges.year.end, activeHabits, index),
    };

    const weekScore = heroScores.week;
    const prevWeekRange = previousWindow(heroRanges.week);
    const prevWeekScore = periodScore(prevWeekRange.start, prevWeekRange.end, activeHabits, index);
    const weeklyTrend = weekScore !== null && prevWeekScore !== null ? weekScore - prevWeekScore : null;

    const monthScore = heroScores.month;
    const prevMonthRange = previousWindow(heroRanges.month);
    const prevMonthScore = periodScore(prevMonthRange.start, prevMonthRange.end, activeHabits, index);
    const monthlyTrend = monthScore !== null && prevMonthScore !== null ? monthScore - prevMonthScore : null;

    const selectedRange = periodRange(period, anchor, earliest);
    const selectedScore = periodScore(selectedRange.start, selectedRange.end, activeHabits, index);
    const previousRange = previousWindow(selectedRange);
    const previousScore = periodScore(previousRange.start, previousRange.end, activeHabits, index);
    const trend = selectedScore !== null && previousScore !== null ? selectedScore - previousScore : null;

    const lineStart = addDays(anchor, -89);
    const lineSeries = Array.from(dailyScoreSeries(lineStart, anchor, activeHabits, index).entries()).map(
      ([date, score]) => ({ date, score }),
    );

    const heatmapStart = addDays(anchor, -364);
    const heatmap = Array.from(dailyScoreSeries(heatmapStart, anchor, activeHabits, index).entries()).map(
      ([date, score]) => ({ date, score }),
    );

    const habitRates: HabitRate[] = activeHabits
      .map((habit) => ({ habit, rate: habitCompletionRate(habit, selectedRange.start, selectedRange.end, index) }))
      .filter((r): r is HabitRate => r.rate !== null);

    const topHabits = [...habitRates].sort((a, b) => b.rate - a.rate).slice(0, 5);
    const weakHabits = [...habitRates].sort((a, b) => a.rate - b.rate).slice(0, 5);

    const streaks = disciplineStreaks(activeHabits, logs, settings.streakThreshold, anchor);

    const allRange = periodRange("all", anchor, earliest);
    const globalScore = periodScore(allRange.start, allRange.end, activeHabits, index);

    return {
      range: selectedRange,
      selectedScore,
      trend,
      heroScores,
      weeklyTrend,
      monthlyTrend,
      lineSeries,
      heatmap,
      topHabits,
      weakHabits,
      streaks,
      globalScore,
    };
  }, [habits, logs, period, anchor, settings.streakThreshold]);
}
