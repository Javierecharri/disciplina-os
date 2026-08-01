export type HabitWeight = 1 | 2 | 3 | 4 | 5;

export type HabitTargetType = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  weight: HabitWeight;
  icon: string;
  color?: string;
  active: boolean;
  targetType: HabitTargetType;
  /** 0=Sunday .. 6=Saturday. Only used when targetType is "custom". */
  targetDays?: number[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type HabitInput = Omit<Habit, "id" | "createdAt" | "updatedAt">;

/**
 * Whether a habit is scheduled to be tracked on the given day of week (0=Sunday).
 * "weekly" habits are handled separately by the scoring service (they resolve once per
 * ISO week, on the week's last day) since they can't be reduced to a single weekday.
 */
export function isHabitScheduledOnDay(habit: Habit, dayOfWeek: number): boolean {
  if (habit.targetType === "daily") return true;
  if (habit.targetType === "custom") return habit.targetDays?.includes(dayOfWeek) ?? false;
  return false;
}
