import type { HabitWeight } from "@/types";

export interface SeedHabit {
  name: string;
  categoryKey: string;
  weight: HabitWeight;
  icon: string;
}

/**
 * Seed habits created on first launch, grouped by category key (see seedCategories.ts).
 * All start as targetType "daily" — the user can change frequency/weight per habit in Settings.
 */
export const SEED_HABITS: SeedHabit[] = [
  // Salud Física
  { name: "Dormir 7h+", categoryKey: "salud-fisica", weight: 5, icon: "Moon" },
  { name: "Entrenamiento", categoryKey: "salud-fisica", weight: 5, icon: "Dumbbell" },
  { name: "Movilidad", categoryKey: "salud-fisica", weight: 3, icon: "Activity" },
  { name: "2L Agua", categoryKey: "salud-fisica", weight: 2, icon: "GlassWater" },
  { name: "Proteína", categoryKey: "salud-fisica", weight: 3, icon: "Beef" },
  { name: "8000 pasos", categoryKey: "salud-fisica", weight: 3, icon: "Footprints" },
  { name: "Último café antes de las 14h", categoryKey: "salud-fisica", weight: 2, icon: "Coffee" },
  { name: "No móvil antes de dormir", categoryKey: "salud-fisica", weight: 3, icon: "PhoneOff" },

  // Salud Mental
  { name: "Meditación", categoryKey: "salud-mental", weight: 3, icon: "Flower2" },
  { name: "Respiración", categoryKey: "salud-mental", weight: 2, icon: "Wind" },
  { name: "Reflexión nocturna", categoryKey: "salud-mental", weight: 3, icon: "NotebookPen" },

  // Negocios
  { name: "Deep Work mañana", categoryKey: "negocios", weight: 5, icon: "Target" },
  { name: "Bloque Patrimonio", categoryKey: "negocios", weight: 4, icon: "TrendingUp" },
  { name: "Crowmie foco", categoryKey: "negocios", weight: 5, icon: "Rocket" },
  { name: "Inbox Zero", categoryKey: "negocios", weight: 2, icon: "Mail" },

  // Aprendizaje
  { name: "Lectura", categoryKey: "aprendizaje", weight: 4, icon: "BookOpen" },
  { name: "CFI", categoryKey: "aprendizaje", weight: 3, icon: "GraduationCap" },
  { name: "Aprender algo nuevo", categoryKey: "aprendizaje", weight: 3, icon: "Lightbulb" },

  // Relaciones
  { name: "Hablar con familia", categoryKey: "relaciones", weight: 3, icon: "Phone" },
  { name: "Networking", categoryKey: "relaciones", weight: 2, icon: "Handshake" },

  // Sistema Personal
  { name: "Planificar mañana", categoryKey: "sistema-personal", weight: 3, icon: "ListChecks" },
  { name: "No móvil al despertar", categoryKey: "sistema-personal", weight: 3, icon: "AlarmClock" },
  { name: "Rutina mañana", categoryKey: "sistema-personal", weight: 4, icon: "Sunrise" },
  { name: "Rutina noche", categoryKey: "sistema-personal", weight: 4, icon: "Sunset" },
];
