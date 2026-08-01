"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Category } from "@/types";
import { ChartCard } from "./ChartCard";

interface CategoryBarChartProps {
  data: { category: Category; score: number | null }[];
  periodLabel: string;
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; score: number | null } }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{point.name}</div>
      <div className="text-muted-foreground">{point.score === null ? "Sin datos" : `${Math.round(point.score)}%`}</div>
    </div>
  );
}

export function CategoryBarChart({ data, periodLabel }: CategoryBarChartProps) {
  const chartData = data.map((d) => ({ name: d.category.name, score: d.score ?? 0, color: d.category.color }));

  return (
    <ChartCard title="Cumplimiento por categoría" description={periodLabel}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(value: string | number | boolean | null | undefined) => `${Math.round(Number(value ?? 0))}%`}
                style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
