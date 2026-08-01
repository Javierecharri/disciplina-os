/** All date utils work with plain "YYYY-MM-DD" strings in local time to avoid timezone drift. */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, amount: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + amount);
  return toDateKey(d);
}

/** Monday-start week. Returns the date key for the Monday of the week containing `key`. */
export function startOfWeek(key: string): string {
  const d = fromDateKey(key);
  const day = d.getDay(); // 0=Sunday..6=Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

export function endOfWeek(key: string): string {
  return addDays(startOfWeek(key), 6);
}

export function weekDays(anchorKey: string): string[] {
  const start = startOfWeek(anchorKey);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function startOfMonth(key: string): string {
  const d = fromDateKey(key);
  return toDateKey(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(key: string): string {
  const d = fromDateKey(key);
  return toDateKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function startOfYear(key: string): string {
  const d = fromDateKey(key);
  return toDateKey(new Date(d.getFullYear(), 0, 1));
}

export function endOfYear(key: string): string {
  const d = fromDateKey(key);
  return toDateKey(new Date(d.getFullYear(), 11, 31));
}

export function dateRange(startKey: string, endKey: string): string[] {
  const dates: string[] = [];
  let cur = startKey;
  while (cur <= endKey) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

export function dayOfWeek(key: string): number {
  return fromDateKey(key).getDay();
}

const WEEKDAY_LABELS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEKDAY_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_LABELS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function weekdayLabel(key: string, short = false): string {
  const idx = dayOfWeek(key);
  return short ? WEEKDAY_SHORT_ES[idx] : WEEKDAY_LABELS_ES[idx];
}

export function formatDayMonth(key: string): string {
  const d = fromDateKey(key);
  return `${d.getDate()} ${MONTH_LABELS_ES[d.getMonth()].slice(0, 3)}`;
}

export function formatWeekRange(anchorKey: string): string {
  const start = startOfWeek(anchorKey);
  const end = endOfWeek(anchorKey);
  return `${formatDayMonth(start)} – ${formatDayMonth(end)}`;
}

export function monthLabel(key: string): string {
  const d = fromDateKey(key);
  return `${MONTH_LABELS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function isFuture(key: string): boolean {
  return key > todayKey();
}

export type Period = "today" | "week" | "month" | "year" | "all";

export interface DateWindow {
  start: string;
  end: string;
}

export function periodRange(period: Period, anchor: string, earliestDate: string): DateWindow {
  switch (period) {
    case "today":
      return { start: anchor, end: anchor };
    case "week":
      return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
    case "month":
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    case "year":
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
    case "all":
      return { start: earliestDate < anchor ? earliestDate : anchor, end: anchor };
  }
}

/** Shifts a date window back by one of its own length (used for period-over-period comparisons). */
export function previousWindow(window: DateWindow): DateWindow {
  const start = fromDateKey(window.start);
  const end = fromDateKey(window.end);
  const lengthDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  const prevEnd = addDays(window.start, -1);
  const prevStart = addDays(prevEnd, -(lengthDays - 1));
  return { start: prevStart, end: prevEnd };
}
