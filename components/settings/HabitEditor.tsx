"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Gauge, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useHabits } from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { getIcon } from "@/utils/icon";
import type { Habit, HabitWeight } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WEIGHTS: HabitWeight[] = [1, 2, 3, 4, 5];

function HabitRowEditor({ habit }: { habit: Habit }) {
  const { updateHabit, deleteHabit } = useHabits();
  const { categories } = useCategories();
  const Icon = getIcon(habit.icon);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border py-2.5 last:border-0">
      <span className="flex size-7 shrink-0 items-center justify-center">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <Input
        defaultValue={habit.name}
        onBlur={(e) => {
          const value = e.target.value.trim();
          if (value && value !== habit.name) updateHabit(habit.id, { name: value });
        }}
        className="h-8 min-w-40 flex-1"
      />
      <Select value={habit.categoryId} onValueChange={(value) => value && updateHabit(habit.id, { categoryId: value })}>
        <SelectTrigger className="h-8 w-36">
          <SelectValue>{(value: string | null) => categories.find((c) => c.id === value)?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(habit.weight)}
        onValueChange={(value) => value && updateHabit(habit.id, { weight: Number(value) as HabitWeight })}
      >
        <SelectTrigger className="h-8 w-24">
          <SelectValue>{(value: string | null) => (value ? `Peso ${value}` : "")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {WEIGHTS.map((weight) => (
            <SelectItem key={weight} value={String(weight)}>
              Peso {weight}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Switch
        checked={habit.active}
        onCheckedChange={(checked) => updateHabit(habit.id, { active: checked })}
        aria-label={habit.active ? "Desactivar hábito" : "Activar hábito"}
      />
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8", habit.pinnedKpi ? "text-primary" : "text-muted-foreground")}
        onClick={() => updateHabit(habit.id, { pinnedKpi: !habit.pinnedKpi })}
        aria-label={habit.pinnedKpi ? "Quitar KPI del Dashboard" : "Mostrar como KPI en el Dashboard"}
        title="KPI en Dashboard"
      >
        <Gauge className="size-4" />
      </Button>
      {habit.pinnedKpi && (
        <Input
          type="date"
          value={habit.kpiStartDate ?? habit.createdAt.slice(0, 10)}
          onChange={(e) => updateHabit(habit.id, { kpiStartDate: e.target.value })}
          className="h-8 w-36"
          aria-label="Cuenta el KPI desde"
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{habit.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará también todo su historial registrado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteHabit(habit.id);
                toast.success(`${habit.name} eliminado`);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function HabitEditor() {
  const { habits, createHabit } = useHabits();
  const { categories } = useCategories();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [weight, setWeight] = useState<HabitWeight>(3);

  const effectiveCategoryId = categoryId || categories[0]?.id || "";

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || !effectiveCategoryId) return;
    const category = categories.find((c) => c.id === effectiveCategoryId);
    await createHabit({
      name: trimmed,
      categoryId: effectiveCategoryId,
      weight,
      icon: category?.icon ?? "Circle",
      active: true,
      targetType: "daily",
      order: habits.length,
    });
    setName("");
    setWeight(3);
    toast.success(`${trimmed} creado`);
  }

  const sorted = [...habits].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hábitos</CardTitle>
        <p className="text-xs text-muted-foreground">{habits.length} hábitos · los cambios se guardan al instante</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {sorted.map((habit) => (
            <HabitRowEditor key={habit.id} habit={habit} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Input
            placeholder="Nuevo hábito…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 flex-1 min-w-40"
          />
          <Select value={effectiveCategoryId} onValueChange={(value) => value && setCategoryId(value)}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Categoría">
                {(value: string | null) => categories.find((c) => c.id === value)?.name ?? "Categoría"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(weight)} onValueChange={(value) => value && setWeight(Number(value) as HabitWeight)}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue>{(value: string | null) => (value ? `Peso ${value}` : "")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WEIGHTS.map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Peso {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !effectiveCategoryId}>
            <Plus className="size-4" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
