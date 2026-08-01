import type { DailyLog, Habit, HabitStatus } from "@/types";
import { STATUS_VALUE } from "@/types";
import { dateRange, dayOfWeek, endOfWeek, isFuture, startOfWeek } from "@/utils/date";

export type LogIndex = Map<string, HabitStatus>;

function logKey(habitId: string, date: string): string {
  return `${habitId}__${date}`;
}

export function buildLogIndex(logs: DailyLog[]): LogIndex {
  const index: LogIndex = new Map();
  for (const log of logs) index.set(logKey(log.habitId, log.date), log.status);
  return index;
}

function statusOn(index: LogIndex, habitId: string, date: string): HabitStatus {
  return index.get(logKey(habitId, date)) ?? "unset";
}

const STATUS_RANK: Record<HabitStatus, number> = { completed: 2, partial: 1, missed: 0, unset: 0 };

/** Best status a "weekly" habit achieved within the ISO (Mon-Sun) week containing `date`. */
function weeklyBestStatus(habit: Habit, index: LogIndex, date: string): HabitStatus {
  const days = dateRange(startOfWeek(date), endOfWeek(date));
  let best: HabitStatus = "unset";
  for (const day of days) {
    const status = statusOn(index, habit.id, day);
    if (STATUS_RANK[status] > STATUS_RANK[best]) best = status;
  }
  return best;
}

/**
 * Whether `habit` contributes to the Discipline Score on `date`.
 * Days before the habit's creation date are excluded UNLESS a log already exists for that
 * day — this lets backfilling past history work, while a plain "unset" day before creation
 * still doesn't retroactively count as missed.
 */
export function isHabitCountedOnDate(habit: Habit, date: string, index: LogIndex): boolean {
  if (!habit.active) return false;
  if (isFuture(date)) return false;
  if (date < habit.createdAt.slice(0, 10) && !index.has(logKey(habit.id, date))) return false;

  if (habit.targetType === "daily") return true;
  if (habit.targetType === "custom") return habit.targetDays?.includes(dayOfWeek(date)) ?? false;
  if (habit.targetType === "weekly") return endOfWeek(date) === date; // resolves once, on the week's last day
  return false;
}

export interface WeightedResult {
  score: number | null; // null when no habit was scheduled that day
  totalWeight: number;
}

export function dailyScore(date: string, habits: Habit[], index: LogIndex): WeightedResult {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const habit of habits) {
    if (!isHabitCountedOnDate(habit, date, index)) continue;
    const status = habit.targetType === "weekly" ? weeklyBestStatus(habit, index, date) : statusOn(index, habit.id, date);
    weightedSum += habit.weight * STATUS_VALUE[status];
    totalWeight += habit.weight;
  }

  if (totalWeight === 0) return { score: null, totalWeight: 0 };
  return { score: (weightedSum / totalWeight) * 100, totalWeight };
}

/** Map of date -> daily score (null for days with no scheduled habits), for every day in [start, end]. */
export function dailyScoreSeries(startDate: string, endDate: string, habits: Habit[], index: LogIndex): Map<string, number | null> {
  const series = new Map<string, number | null>();
  for (const date of dateRange(startDate, endDate)) {
    series.set(date, dailyScore(date, habits, index).score);
  }
  return series;
}

/** Average of daily scores in [start, end], ignoring days with no scheduled habits. Null if none apply. */
export function periodScore(startDate: string, endDate: string, habits: Habit[], index: LogIndex): number | null {
  const scores: number[] = [];
  for (const date of dateRange(startDate, endDate)) {
    const { score } = dailyScore(date, habits, index);
    if (score !== null) scores.push(score);
  }
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function categoryScore(
  startDate: string,
  endDate: string,
  habits: Habit[],
  index: LogIndex,
  categoryId: string,
): number | null {
  return periodScore(startDate, endDate, habits.filter((h) => h.categoryId === categoryId), index);
}

/** Fraction (0-1) of scheduled occurrences a single habit completed (weighted: completed=1, partial=0.5) in range. */
export function habitCompletionRate(habit: Habit, startDate: string, endDate: string, index: LogIndex): number | null {
  let occurrences = 0;
  let sum = 0;
  for (const date of dateRange(startDate, endDate)) {
    if (!isHabitCountedOnDate(habit, date, index)) continue;
    const status = habit.targetType === "weekly" ? weeklyBestStatus(habit, index, date) : statusOn(index, habit.id, date);
    occurrences += 1;
    sum += STATUS_VALUE[status];
  }
  if (occurrences === 0) return null;
  return sum / occurrences;
}

/** Earliest date with any data: the oldest habit creation date, or an earlier backfilled log, whichever comes first. */
export function earliestTrackedDate(habits: Habit[], logs: DailyLog[], fallback: string): string {
  let earliest = fallback;
  for (const habit of habits) {
    const created = habit.createdAt.slice(0, 10);
    if (created < earliest) earliest = created;
  }
  for (const log of logs) {
    if (log.date < earliest) earliest = log.date;
  }
  return earliest;
}
