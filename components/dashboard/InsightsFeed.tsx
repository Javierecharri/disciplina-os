import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import type { Insight } from "@/services/insights/generateInsights";
import { ChartCard } from "./ChartCard";

const TONE_ICON = {
  positive: TrendingUp,
  neutral: Sparkles,
  warning: AlertTriangle,
};

const TONE_COLOR = {
  positive: "text-status-completed",
  neutral: "text-primary",
  warning: "text-status-partial",
};

export function InsightsFeed({ insights }: { insights: Insight[] }) {
  return (
    <ChartCard title="Insights" description="Generados automáticamente">
      {insights.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Sigue registrando tus hábitos para ver insights aquí.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {insights.map((insight) => {
            const Icon = TONE_ICON[insight.tone];
            return (
              <li key={insight.id} className="flex items-start gap-2.5 text-sm">
                <Icon className={`mt-0.5 size-4 shrink-0 ${TONE_COLOR[insight.tone]}`} />
                <span>{insight.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
