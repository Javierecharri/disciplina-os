"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Download, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppData } from "@/hooks/useAppData";
import { useSettings } from "@/hooks/useSettings";
import { downloadSnapshot, readSnapshotFile } from "@/utils/export";

export function DataManagement() {
  const { exportData, importData, resetData } = useAppData();
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    downloadSnapshot(await exportData());
    toast.success("Backup descargado");
  }

  async function handleImportFile(file: File) {
    try {
      const snapshot = await readSnapshotFile(file);
      await importData(snapshot);
      toast.success("Datos importados correctamente");
    } catch {
      toast.error("El archivo no es un backup válido de Disciplina OS.");
    }
  }

  async function handleReset() {
    await resetData();
    toast.success("Datos reiniciados a los valores de fábrica");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos y preferencias</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Umbral de racha</span>
            <span className="text-sm tabular-nums text-muted-foreground">{settings.streakThreshold} pts</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Puntuación mínima del Discipline Score diario para que cuente como &ldquo;día bueno&rdquo; en tu racha.
          </p>
          <Slider
            value={[settings.streakThreshold]}
            min={40}
            max={100}
            step={5}
            onValueChange={(value) => updateSettings({ streakThreshold: (value as number[])[0] })}
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            Exportar JSON
          </Button>

          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" />
            Importar JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <RotateCcw className="size-4" />
                  Reset datos
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Reiniciar todos los datos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán todos tus hábitos, categorías y el historial registrado, y se restaurarán los valores
                  de fábrica. Esta acción no se puede deshacer. Considera exportar un backup antes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-white hover:bg-destructive/90">
                  Reiniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
