"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Category, CategoryInput, DailyLog, Habit, HabitInput, HabitStatus } from "@/types";
import { nextStatus } from "@/types";
import { getRepository, type DataSnapshot } from "@/services/repository";
import { todayKey } from "@/utils/date";

interface AppDataContextValue {
  loading: boolean;
  habits: Habit[];
  categories: Category[];
  logs: DailyLog[];
  createHabit: (input: HabitInput) => Promise<Habit>;
  updateHabit: (id: string, patch: Partial<HabitInput>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  createCategory: (input: CategoryInput) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getLogStatus: (habitId: string, date: string) => HabitStatus;
  cycleLogStatus: (habitId: string, date: string) => Promise<void>;
  setLogStatus: (habitId: string, date: string, status: HabitStatus, notes?: string) => Promise<void>;
  exportData: () => Promise<DataSnapshot>;
  importData: (snapshot: DataSnapshot) => Promise<void>;
  resetData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => getRepository(), []);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [habitsData, categoriesData, logsData] = await Promise.all([
        repo.habits.getAll(),
        repo.categories.getAll(),
        repo.logs.getAll(),
      ]);
      if (cancelled) return;
      setHabits(habitsData);
      setCategories(categoriesData);
      setLogs(logsData);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const createHabit = useCallback(
    async (input: HabitInput) => {
      const habit = await repo.habits.create(input);
      setHabits((prev) => [...prev, habit]);
      return habit;
    },
    [repo],
  );

  const updateHabit = useCallback(
    async (id: string, patch: Partial<HabitInput>) => {
      const updated = await repo.habits.update(id, patch);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      return updated;
    },
    [repo],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await repo.habits.delete(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      setLogs((prev) => prev.filter((l) => l.habitId !== id));
    },
    [repo],
  );

  const createCategory = useCallback(
    async (input: CategoryInput) => {
      const category = await repo.categories.create(input);
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [repo],
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<CategoryInput>) => {
      const updated = await repo.categories.update(id, patch);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    [repo],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await repo.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [repo],
  );

  const getLogStatus = useCallback(
    (habitId: string, date: string): HabitStatus => {
      return logs.find((l) => l.habitId === habitId && l.date === date)?.status ?? "unset";
    },
    [logs],
  );

  const setLogStatus = useCallback(
    async (habitId: string, date: string, status: HabitStatus, notes?: string) => {
      const log = await repo.logs.upsert({ habitId, date, status, notes });
      setLogs((prev) => {
        const index = prev.findIndex((l) => l.habitId === habitId && l.date === date);
        if (index === -1) return [...prev, log];
        const next = [...prev];
        next[index] = log;
        return next;
      });
    },
    [repo],
  );

  const cycleLogStatus = useCallback(
    async (habitId: string, date: string) => {
      const current = getLogStatus(habitId, date);
      await setLogStatus(habitId, date, nextStatus(current));
    },
    [getLogStatus, setLogStatus],
  );

  const exportData = useCallback(() => repo.exportSnapshot(), [repo]);

  const importData = useCallback(
    async (snapshot: DataSnapshot) => {
      await repo.importSnapshot(snapshot);
      const [habitsData, categoriesData, logsData] = await Promise.all([
        repo.habits.getAll(),
        repo.categories.getAll(),
        repo.logs.getAll(),
      ]);
      setHabits(habitsData);
      setCategories(categoriesData);
      setLogs(logsData);
    },
    [repo],
  );

  const resetData = useCallback(async () => {
    await repo.resetAll();
    const [habitsData, categoriesData, logsData] = await Promise.all([
      repo.habits.getAll(),
      repo.categories.getAll(),
      repo.logs.getAll(),
    ]);
    setHabits(habitsData);
    setCategories(categoriesData);
    setLogs(logsData);
  }, [repo]);

  const value: AppDataContextValue = {
    loading,
    habits,
    categories,
    logs,
    createHabit,
    updateHabit,
    deleteHabit,
    createCategory,
    updateCategory,
    deleteCategory,
    getLogStatus,
    cycleLogStatus,
    setLogStatus,
    exportData,
    importData,
    resetData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}

export function useToday(): string {
  return todayKey();
}
