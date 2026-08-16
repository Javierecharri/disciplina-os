import { Card } from "@/components/ui/card";
import type { HabitKpi } from "@/hooks/useHabitKpis";
import { formatDayMonth } from "@/utils/date";
import { getIcon } from "@/utils/icon";

export function HabitKpiCard({ habit, completed, total, startDate }: HabitKpi) {
  const Icon = getIcon(habit.icon);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="flex flex-row items-center gap-3 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-xs text-muted-foreground">
          {habit.name} · desde {formatDayMonth(startDate)}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold tabular-nums">
            {completed}/{total}
          </span>
          <span className="text-xs italic text-muted-foreground">{pct}%</span>
        </div>
      </div>
    </Card>
  );
}
