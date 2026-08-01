import type { Category, DailyLog, Habit } from "@/types";
import { addDays, endOfMonth, startOfMonth, todayKey } from "@/utils/date";
import { buildLogIndex, categoryScore, habitCompletionRate } from "@/services/scoring/disciplineScore";
import { habitStreaks } from "@/services/scoring/streaks";

export type InsightTone = "positive" | "neutral" | "warning";

export interface Insight {
  id: string;
  text: string;
  tone: InsightTone;
}

export function generateInsights(habits: Habit[], categories: Category[], logs: DailyLog[]): Insight[] {
  const insights: Insight[] = [];
  const today = todayKey();
  const index = buildLogIndex(logs);
  const activeHabits = habits.filter((h) => h.active);

  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = today;
  const prevMonthAnchor = addDays(thisMonthStart, -1);
  const prevMonthStart = startOfMonth(prevMonthAnchor);
  const prevMonthEnd = endOfMonth(prevMonthAnchor);

  // 1. Category momentum vs previous month.
  for (const category of categories) {
    const current = categoryScore(thisMonthStart, thisMonthEnd, activeHabits, index, category.id);
    const previous = categoryScore(prevMonthStart, prevMonthEnd, activeHabits, index, category.id);
    if (current === null || previous === null || previous === 0) continue;
    const delta = current - previous;
    if (Math.abs(delta) < 5) continue;
    insights.push({
      id: `category-momentum-${category.id}`,
      text:
        delta > 0
          ? `La categoría ${category.name} ha subido ${Math.round(delta)} pts respecto al mes anterior.`
          : `La categoría ${category.name} ha bajado ${Math.round(Math.abs(delta))} pts respecto al mes anterior.`,
      tone: delta > 0 ? "positive" : "warning",
    });
  }

  // 2. Longest active streak.
  let bestStreakHabit: { habit: Habit; current: number } | null = null;
  for (const habit of activeHabits) {
    const { current } = habitStreaks(habit, logs, today);
    if (current >= 3 && (!bestStreakHabit || current > bestStreakHabit.current)) {
      bestStreakHabit = { habit, current };
    }
  }
  if (bestStreakHabit) {
    insights.push({
      id: `streak-${bestStreakHabit.habit.id}`,
      text: `Llevas ${bestStreakHabit.current} días consecutivos cumpliendo ${bestStreakHabit.habit.name}.`,
      tone: "positive",
    });
  }

  // 3. Weakest habit over the last 30 days.
  const last30Start = addDays(today, -29);
  let weakest: { habit: Habit; rate: number } | null = null;
  for (const habit of activeHabits) {
    const rate = habitCompletionRate(habit, last30Start, today, index);
    if (rate === null) continue;
    if (rate < 0.6 && (!weakest || rate < weakest.rate)) {
      weakest = { habit, rate };
    }
  }
  if (weakest) {
    insights.push({
      id: `weakest-${weakest.habit.id}`,
      text: `El hábito más débil de los últimos 30 días es ${weakest.habit.name} (${Math.round(weakest.rate * 100)}% de cumplimiento).`,
      tone: "warning",
    });
  }

  // 4. Best category this month.
  let bestCategory: { category: Category; score: number } | null = null;
  for (const category of categories) {
    const score = categoryScore(thisMonthStart, thisMonthEnd, activeHabits, index, category.id);
    if (score === null) continue;
    if (!bestCategory || score > bestCategory.score) bestCategory = { category, score };
  }
  if (bestCategory) {
    insights.push({
      id: `best-category-${bestCategory.category.id}`,
      text: `La mejor categoría de este mes ha sido ${bestCategory.category.name} (${Math.round(bestCategory.score)} pts).`,
      tone: "positive",
    });
  }

  return insights;
}
