"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDayMonth } from "@/utils/date";
import { ChartCard } from "./ChartCard";

interface DisciplineLineChartProps {
  data: { date: string; score: number | null }[];
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { date: string; score: number | null } }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium">{formatDayMonth(point.date)}</div>
      <div className="text-muted-foreground">{point.score === null ? "Sin datos" : `${Math.round(point.score)}%`}</div>
    </div>
  );
}

export function DisciplineLineChart({ data }: DisciplineLineChartProps) {
  const chartData = data.map((d) => ({ ...d, score: d.score ?? undefined }));

  return (
    <ChartCard title="Discipline Score" description="Últimos 90 días">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDayMonth(value)}
              interval={13}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
