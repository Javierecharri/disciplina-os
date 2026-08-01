import type { DailyLog, Habit } from "@/types";
import { addDays, dateRange, todayKey } from "@/utils/date";
import { buildLogIndex, dailyScore, earliestTrackedDate, isHabitCountedOnDate } from "./disciplineScore";

/**
 * Generic streak scan over an ascending list of dates.
 * `evaluate(date)` returns true (extends streak), false (breaks streak), or null (day not
 * applicable — skipped without breaking or extending).
 */
function scanStreaks(dates: string[], evaluate: (date: string) => boolean | null): { current: number; best: number } {
  let best = 0;
  let running = 0;
  for (const date of dates) {
    const result = evaluate(date);
    if (result === null) continue;
    if (result) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  // Current streak: walk backward from the most recent applicable day.
  let current = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const result = evaluate(dates[i]);
    if (result === null) continue;
    if (result) current += 1;
    else break;
  }

  return { current, best };
}

export interface StreakResult {
  current: number;
  best: number;
}

export function habitStreaks(habit: Habit, logs: DailyLog[], asOfDate: string = todayKey()): StreakResult {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const index = buildLogIndex(habitLogs);
  const start = earliestTrackedDate([habit], habitLogs, asOfDate);
  if (start > asOfDate) return { current: 0, best: 0 };
  const dates = dateRange(start, asOfDate);

  return scanStreaks(dates, (date) => {
    if (!isHabitCountedOnDate(habit, date, index)) return null;
    return index.get(`${habit.id}__${date}`) === "completed";
  });
}

/** Discipline Streak: consecutive days where the overall weighted Discipline Score meets `threshold`. */
export function disciplineStreaks(
  habits: Habit[],
  logs: DailyLog[],
  threshold: number,
  asOfDate: string = todayKey(),
): StreakResult {
  if (habits.length === 0) return { current: 0, best: 0 };
  const start = earliestTrackedDate(habits, logs, asOfDate);
  if (start > asOfDate) return { current: 0, best: 0 };

  const index = buildLogIndex(logs);
  const dates = dateRange(start, asOfDate);

  return scanStreaks(dates, (date) => {
    const { score } = dailyScore(date, habits, index);
    if (score === null) return null;
    return score >= threshold;
  });
}

export function nextDayKey(date: string): string {
  return addDays(date, 1);
}
