"use client";

import { useAppData } from "./useAppData";

export function useDailyLogs() {
  const { logs, getLogStatus, cycleLogStatus, setLogStatus, loading } = useAppData();
  return { logs, getLogStatus, cycleLogStatus, setLogStatus, loading };
}
