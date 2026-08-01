"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { Category } from "@/types";
import { ChartCard } from "./ChartCard";

interface CategoryRadarChartProps {
  data: { category: Category; score: number | null }[];
}

export function CategoryRadarChart({ data }: CategoryRadarChartProps) {
  const chartData = data.map((d) => ({ name: d.category.name, score: d.score ?? 0 }));

  return (
    <ChartCard title="Comparativa de categorías" description="Periodo seleccionado">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Radar dataKey="score" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
