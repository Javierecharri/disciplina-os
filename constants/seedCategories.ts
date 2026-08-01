import type { CategoryInput } from "@/types";

/**
 * Seed categories. Colors are used as accents for chart series, badges and habit icons.
 * These are created once on first launch — the user can rename, recolor, add or delete afterwards.
 */
export const SEED_CATEGORIES: (CategoryInput & { key: string })[] = [
  { key: "salud-fisica", name: "Salud Física", icon: "Dumbbell", color: "#f97316", order: 0 },
  { key: "salud-mental", name: "Salud Mental", icon: "Brain", color: "#8b5cf6", order: 1 },
  { key: "negocios", name: "Negocios", icon: "Briefcase", color: "#06b6d4", order: 2 },
  { key: "aprendizaje", name: "Aprendizaje", icon: "BookOpen", color: "#eab308", order: 3 },
  { key: "relaciones", name: "Relaciones", icon: "Users", color: "#ec4899", order: 4 },
  { key: "sistema-personal", name: "Sistema Personal", icon: "Settings2", color: "#22c55e", order: 5 },
];
