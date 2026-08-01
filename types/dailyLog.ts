import type { HabitStatus } from "./status";

export interface DailyLog {
  id: string;
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  habitId: string;
  status: HabitStatus;
  notes?: string;
  updatedAt: string;
}

export type DailyLogInput = Omit<DailyLog, "id" | "updatedAt">;
