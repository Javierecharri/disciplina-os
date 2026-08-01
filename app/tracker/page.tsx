"use client";

import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { WeekSelector } from "@/components/tracker/WeekSelector";
import { HabitGrid } from "@/components/tracker/HabitGrid";
import { todayKey } from "@/utils/date";

export default function TrackerPage() {
  const { habits, loading: habitsLoading } = useHabits();
  const { categories, loading: categoriesLoading } = useCategories();
  const [anchor, setAnchor] = useState(todayKey());

  const loading = habitsLoading || categoriesLoading;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground">Registra tu día. Un clic cambia el estado.</p>
        </div>
        <WeekSelector anchor={anchor} onChange={setAnchor} />
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <HabitGrid habits={habits} categories={categories} anchor={anchor} onAnchorChange={setAnchor} />
      )}
    </div>
  );
}
