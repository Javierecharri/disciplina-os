"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDisciplineScore, type Period } from "@/hooks/useDisciplineScore";
import { useCategoryScores } from "@/hooks/useCategoryScores";
import { useHabitKpis } from "@/hooks/useHabitKpis";
import { useInsights } from "@/hooks/useInsights";
import { useAppData } from "@/hooks/useAppData";
import { todayKey } from "@/utils/date";
import { ScoreHero } from "@/components/dashboard/ScoreHero";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { DisciplineLineChart } from "@/components/dashboard/DisciplineLineChart";
import { HeatmapCalendar } from "@/components/dashboard/HeatmapCalendar";
import { HabitKpiCard } from "@/components/dashboard/HabitKpiCard";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { CategoryRadarChart } from "@/components/dashboard/CategoryRadarChart";
import { HabitRateList } from "@/components/dashboard/HabitRateList";
import { InsightsFeed } from "@/components/dashboard/InsightsFeed";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

const PERIOD_LABEL: Record<Period, string> = {
  today: "Hoy",
  week: "Semana",
  month: "Mes",
  year: "Año",
  all: "Todo",
};

const CATEGORY_PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

export default function DashboardPage() {
  const { loading } = useAppData();
  const [period, setPeriod] = useState<Period>("week");
  const [categoryPeriod, setCategoryPeriod] = useState<Period>("week");
  const anchor = todayKey();
  const data = useDisciplineScore(period, anchor);
  const categoryScores = useCategoryScores(categoryPeriod, anchor);
  const habitKpis = useHabitKpis(anchor);
  const insights = useInsights();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse text-sm text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Solo lectura — tu progreso, automáticamente.</p>
        </div>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <TabsList>
            {PERIOD_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ScoreHero
        periodLabel={PERIOD_LABEL[period]}
        score={data.selectedScore}
        trend={data.trend}
        heroScores={data.heroScores}
        globalScore={data.globalScore}
      />

      <StreakCard current={data.streaks.current} best={data.streaks.best} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <DisciplineLineChart data={data.lineSeries} />
        </div>
        <div className="lg:col-span-2">
          <HeatmapCalendar data={data.heatmap} />
        </div>

        {habitKpis.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {habitKpis.map((kpi) => (
              <HabitKpiCard key={kpi.habit.id} {...kpi} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground">Comparativa por categoría</h2>
          <Tabs value={categoryPeriod} onValueChange={(value) => setCategoryPeriod(value as Period)}>
            <TabsList>
              {CATEGORY_PERIOD_OPTIONS.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value}>
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <CategoryBarChart data={categoryScores} periodLabel={PERIOD_LABEL[categoryPeriod]} />
        <CategoryRadarChart data={categoryScores} periodLabel={PERIOD_LABEL[categoryPeriod]} />
        <HabitRateList
          title="Top hábitos"
          description="Más cumplidos en el periodo"
          items={data.topHabits}
          barClassName="bg-status-completed"
        />
        <HabitRateList
          title="Hábitos débiles"
          description="Menos cumplidos en el periodo"
          items={data.weakHabits}
          barClassName="bg-status-missed"
        />
        <div className="lg:col-span-2">
          <InsightsFeed insights={insights} />
        </div>
      </div>
    </div>
  );
}
