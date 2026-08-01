import { dayOfWeek, formatDayMonth, fromDateKey } from "@/utils/date";
import { ChartCard } from "./ChartCard";

interface HeatmapCalendarProps {
  data: { date: string; score: number | null }[];
}

type Cell = { date: string; score: number | null } | null;

function bucketClass(score: number | null): string {
  if (score === null) return "bg-muted/40";
  if (score === 0) return "bg-primary/10";
  if (score < 25) return "bg-primary/25";
  if (score < 50) return "bg-primary/45";
  if (score < 75) return "bg-primary/70";
  return "bg-primary";
}

function buildWeeks(data: { date: string; score: number | null }[]): Cell[][] {
  if (data.length === 0) return [];
  const startPad = dayOfWeek(data[0].date);
  const cells: Cell[] = [...Array(startPad).fill(null), ...data];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const weeks = buildWeeks(data);
  let lastMonth = -1;

  return (
    <ChartCard title="Actividad del último año" description="Cada cuadrado es un día">
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => {
          const firstReal = week.find((c) => c !== null);
          const month = firstReal ? fromDateKey(firstReal.date).getMonth() : -1;
          const showLabel = firstReal && month !== lastMonth && fromDateKey(firstReal.date).getDate() <= 7;
          if (showLabel) lastMonth = month;

          return (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              <span className="h-3 text-[9px] leading-3 text-muted-foreground">
                {showLabel ? MONTH_SHORT[month] : ""}
              </span>
              {week.map((cell, dayIndex) => (
                <div
                  key={cell?.date ?? `${weekIndex}-${dayIndex}`}
                  title={cell ? `${formatDayMonth(cell.date)} — ${cell.score === null ? "sin datos" : `${Math.round(cell.score)} pts`}` : undefined}
                  className={`size-[11px] rounded-[2px] ${cell ? bucketClass(cell.score) : "bg-transparent"}`}
                />
              ))}
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
