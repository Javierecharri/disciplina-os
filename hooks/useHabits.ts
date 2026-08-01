"use client";

import { useAppData } from "./useAppData";

export function useHabits() {
  const { habits, createHabit, updateHabit, deleteHabit, loading } = useAppData();
  return { habits, createHabit, updateHabit, deleteHabit, loading };
}
