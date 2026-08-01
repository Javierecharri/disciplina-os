import { Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakCardProps {
  current: number;
  best: number;
}

export function StreakCard({ current, best }: StreakCardProps) {
  return (
    <Card className="flex flex-row divide-x divide-border p-0">
      <div className="flex flex-1 items-center gap-3 p-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-status-partial/15 text-status-partial">
          <Flame className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Racha actual</span>
          <span className="text-xl font-semibold tabular-nums">{current} {current === 1 ? "día" : "días"}</span>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-3 p-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Trophy className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Mejor racha</span>
          <span className="text-xl font-semibold tabular-nums">{best} {best === 1 ? "día" : "días"}</span>
        </div>
      </div>
    </Card>
  );
}
