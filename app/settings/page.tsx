"use client";

import { useAppData } from "@/hooks/useAppData";
import { HabitEditor } from "@/components/settings/HabitEditor";
import { CategoryEditor } from "@/components/settings/CategoryEditor";
import { DataManagement } from "@/components/settings/DataManagement";

export default function SettingsPage() {
  const { loading } = useAppData();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Hábitos, categorías, pesos y datos.</p>
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <>
          <HabitEditor />
          <CategoryEditor />
          <DataManagement />
        </>
      )}
    </div>
  );
}
