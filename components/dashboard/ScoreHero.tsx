import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";

interface ScoreHeroProps {
  periodLabel: string;
  score: number | null;
  trend: number | null;
  heroScores: { today: number | null; week: number | null; month: number | null; year: number | null };
  globalScore: number | null;
}

function StatTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value === null ? "—" : Math.round(value)}</span>
    </div>
  );
}

export function ScoreHero({ periodLabel, score, trend, heroScores, globalScore }: ScoreHeroProps) {
  return (
    <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-center gap-3 sm:items-start">
        <div className="flex items-center gap-3">
          <ScoreRing score={score} />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Discipline Score · {periodLabel}</span>
            {trend !== null && (
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend >= 0 ? "text-status-completed" : "text-status-missed",
                )}
              >
                {trend >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {trend >= 0 ? "+" : ""}
                {Math.round(trend)} pts vs. periodo anterior
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Semana" value={heroScores.week} />
        <StatTile label="Mes" value={heroScores.month} />
        <StatTile label="Año" value={heroScores.year} />
        <StatTile label="Global" value={globalScore} />
      </div>
    </Card>
  );
}
