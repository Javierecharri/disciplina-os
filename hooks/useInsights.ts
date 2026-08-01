"use client";

import { useMemo } from "react";
import { generateInsights } from "@/services/insights/generateInsights";
import { useAppData } from "./useAppData";

export function useInsights() {
  const { habits, categories, logs } = useAppData();
  return useMemo(() => generateInsights(habits, categories, logs), [habits, categories, logs]);
}
