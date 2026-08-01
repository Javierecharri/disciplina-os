export const HABIT_STATUSES = ["completed", "partial", "missed", "unset"] as const;

export type HabitStatus = (typeof HABIT_STATUSES)[number];

/** Weight applied to a status when computing the Discipline Score. `unset` counts as unfulfilled. */
export const STATUS_VALUE: Record<HabitStatus, number> = {
  completed: 1,
  partial: 0.5,
  missed: 0,
  unset: 0,
};

/** Cycle order used when clicking a tracker cell: unset -> completed -> partial -> missed -> completed... */
export const STATUS_CYCLE: HabitStatus[] = ["completed", "partial", "missed"];

export function nextStatus(current: HabitStatus): HabitStatus {
  if (current === "unset") return "completed";
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}
