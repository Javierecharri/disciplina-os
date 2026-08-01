"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, ListChecks, Moon, Settings2, Sun, Download } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAppData } from "@/hooks/useAppData";
import { downloadSnapshot } from "@/utils/export";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { exportData } = useAppData();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function onToggleEvent() {
      setOpen((prev) => !prev);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("toggle-command-palette", onToggleEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("toggle-command-palette", onToggleEvent);
    };
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  const handleExport = useCallback(async () => {
    setOpen(false);
    downloadSnapshot(await exportData());
  }, [exportData]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Navega o ejecuta una acción">
      <CommandInput placeholder="Buscar una acción..." />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Navegación">
          <CommandItem onSelect={() => go("/tracker")}>
            <ListChecks />
            Habit Tracker
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings2 />
            Configuración
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun /> : <Moon />}
            Cambiar tema
          </CommandItem>
          <CommandItem onSelect={handleExport}>
            <Download />
            Exportar datos (JSON)
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-end gap-1 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <CommandShortcut>⌘K</CommandShortcut>
        <span>para abrir en cualquier momento</span>
      </div>
    </CommandDialog>
  );
}
