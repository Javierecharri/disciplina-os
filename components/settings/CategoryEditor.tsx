"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { getIcon } from "@/utils/icon";
import { CategoryNotEmptyError } from "@/services/repository";
import type { Category } from "@/types";
import { IconSelect } from "./IconSelect";

function CategoryRowEditor({ category }: { category: Category }) {
  const { updateCategory, deleteCategory } = useCategories();
  const Icon = getIcon(category.icon);

  async function handleDelete() {
    try {
      await deleteCategory(category.id);
      toast.success(`${category.name} eliminada`);
    } catch (error) {
      if (error instanceof CategoryNotEmptyError) {
        toast.error("Mueve o elimina sus hábitos antes de borrar esta categoría.");
      } else {
        toast.error("No se pudo eliminar la categoría.");
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border py-2.5 last:border-0">
      <input
        type="color"
        value={category.color}
        onChange={(e) => updateCategory(category.id, { color: e.target.value })}
        className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        aria-label={`Color de ${category.name}`}
      />
      <IconSelect value={category.icon} onChange={(icon) => updateCategory(category.id, { icon })} className="h-8 w-32" />
      <Icon className="hidden size-4 shrink-0 sm:block" style={{ color: category.color }} />
      <Input
        defaultValue={category.name}
        onBlur={(e) => {
          const value = e.target.value.trim();
          if (value && value !== category.name) updateCategory(category.id, { name: value });
        }}
        className="h-8 min-w-40 flex-1"
      />
      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function CategoryEditor() {
  const { categories, createCategory } = useCategories();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Circle");
  const [color, setColor] = useState("#5b5bd6");

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createCategory({ name: trimmed, icon, color, order: categories.length });
    setName("");
    setIcon("Circle");
    toast.success(`${trimmed} creada`);
  }

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <p className="text-xs text-muted-foreground">{categories.length} categorías</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {sorted.map((category) => (
            <CategoryRowEditor key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            aria-label="Color de la nueva categoría"
          />
          <IconSelect value={icon} onChange={setIcon} className="h-8 w-32" />
          <Input
            placeholder="Nueva categoría…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 min-w-40 flex-1"
          />
          <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="size-4" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
