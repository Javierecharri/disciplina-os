"use client";

import type { Category, Habit, HabitStatus } from "@/types";
import { getIcon } from "@/utils/icon";
import { HabitRow } from "./HabitRow";

interface CategoryGroupProps {
  category: Category;
  habits: Habit[];
  week: string[];
  getStatus: (habitId: string, date: string) => HabitStatus;
  onCellActivate: (habitId: string, date: string) => void;
  onCellFocus: (key: string) => void;
  registerRef: (key: string, el: HTMLButtonElement | null) => void;
  todayKey: string;
}

export function CategoryGroup({ category, habits, ...rowProps }: CategoryGroupProps) {
  const Icon = getIcon(category.icon);

  return (
    <section className="mb-1">
      <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" style={{ color: category.color }} />
        {category.name}
      </div>
      <div className="flex flex-col">
        {habits.map((habit) => (
          <HabitRow key={habit.id} habit={habit} color={category.color} {...rowProps} />
        ))}
      </div>
    </section>
  );
}
