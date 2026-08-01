import type { HabitRate } from "@/hooks/useDisciplineScore";
import { getIcon } from "@/utils/icon";
import { ChartCard } from "./ChartCard";

interface HabitRateListProps {
  title: string;
  description?: string;
  items: HabitRate[];
  barClassName: string;
}

export function HabitRateList({ title, description, items, barClassName }: HabitRateListProps) {
  return (
    <ChartCard title={title} description={description}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Aún no hay datos suficientes.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ habit, rate }) => {
            const Icon = getIcon(habit.icon);
            return (
              <li key={habit.id} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm">{habit.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{Math.round(rate * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${Math.round(rate * 100)}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
