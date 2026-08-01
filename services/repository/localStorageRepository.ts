import type { Category, DailyLog, Habit } from "@/types";
import { SEED_CATEGORIES } from "@/constants/seedCategories";
import { SEED_HABITS } from "@/constants/seedHabits";
import { generateId } from "@/utils/id";
import { readJSON, removeKey, writeJSON, writeJSONSync } from "./storage";
import type { AppRepository, DataSnapshot } from "./types";

export const SCHEMA_VERSION = 1;

const KEYS = {
  schemaVersion: "habitos:schemaVersion",
  categories: "habitos:categories",
  habits: "habitos:habits",
  logs: "habitos:logs",
} as const;

function now(): string {
  return new Date().toISOString();
}

export class CategoryNotEmptyError extends Error {
  constructor(categoryId: string) {
    super(`La categoría ${categoryId} tiene hábitos asociados. Muévelos o elimínalos primero.`);
    this.name = "CategoryNotEmptyError";
  }
}

class LocalStorageRepository implements AppRepository {
  private categoriesCache: Category[];
  private habitsCache: Habit[];
  private logsCache: DailyLog[];

  constructor() {
    this.categoriesCache = readJSON<Category[]>(KEYS.categories, []);
    this.habitsCache = readJSON<Habit[]>(KEYS.habits, []);
    this.logsCache = readJSON<DailyLog[]>(KEYS.logs, []);
    this.seedIfEmpty();
  }

  private seedIfEmpty() {
    if (this.categoriesCache.length > 0 || this.habitsCache.length > 0) return;

    const categoryIdByKey = new Map<string, string>();
    const timestamp = now();

    this.categoriesCache = SEED_CATEGORIES.map((seed) => {
      const id = generateId("cat");
      categoryIdByKey.set(seed.key, id);
      return {
        id,
        name: seed.name,
        icon: seed.icon,
        color: seed.color,
        order: seed.order,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    this.habitsCache = SEED_HABITS.map((seed, index) => ({
      id: generateId("habit"),
      name: seed.name,
      categoryId: categoryIdByKey.get(seed.categoryKey)!,
      weight: seed.weight,
      icon: seed.icon,
      active: true,
      targetType: "daily",
      order: index,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    this.persistCategories();
    this.persistHabits();
    writeJSONSync(KEYS.schemaVersion, SCHEMA_VERSION);
  }

  private persistCategories() {
    writeJSON(KEYS.categories, this.categoriesCache);
  }

  private persistHabits() {
    writeJSON(KEYS.habits, this.habitsCache);
  }

  private persistLogs() {
    writeJSON(KEYS.logs, this.logsCache);
  }

  habits = {
    getAll: async (): Promise<Habit[]> => {
      return [...this.habitsCache].sort((a, b) => a.order - b.order);
    },
    getById: async (id: string): Promise<Habit | null> => {
      return this.habitsCache.find((h) => h.id === id) ?? null;
    },
    create: async (input: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit> => {
      const timestamp = now();
      const habit: Habit = { ...input, id: generateId("habit"), createdAt: timestamp, updatedAt: timestamp };
      this.habitsCache.push(habit);
      this.persistHabits();
      return habit;
    },
    update: async (id: string, patch: Partial<Habit>): Promise<Habit> => {
      const index = this.habitsCache.findIndex((h) => h.id === id);
      if (index === -1) throw new Error(`Habit ${id} not found`);
      const updated: Habit = { ...this.habitsCache[index], ...patch, id, updatedAt: now() };
      this.habitsCache[index] = updated;
      this.persistHabits();
      return updated;
    },
    delete: async (id: string): Promise<void> => {
      this.habitsCache = this.habitsCache.filter((h) => h.id !== id);
      this.logsCache = this.logsCache.filter((l) => l.habitId !== id);
      this.persistHabits();
      this.persistLogs();
    },
  };

  categories = {
    getAll: async (): Promise<Category[]> => {
      return [...this.categoriesCache].sort((a, b) => a.order - b.order);
    },
    getById: async (id: string): Promise<Category | null> => {
      return this.categoriesCache.find((c) => c.id === id) ?? null;
    },
    create: async (input: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> => {
      const timestamp = now();
      const category: Category = { ...input, id: generateId("cat"), createdAt: timestamp, updatedAt: timestamp };
      this.categoriesCache.push(category);
      this.persistCategories();
      return category;
    },
    update: async (id: string, patch: Partial<Category>): Promise<Category> => {
      const index = this.categoriesCache.findIndex((c) => c.id === id);
      if (index === -1) throw new Error(`Category ${id} not found`);
      const updated: Category = { ...this.categoriesCache[index], ...patch, id, updatedAt: now() };
      this.categoriesCache[index] = updated;
      this.persistCategories();
      return updated;
    },
    delete: async (id: string): Promise<void> => {
      const hasHabits = this.habitsCache.some((h) => h.categoryId === id);
      if (hasHabits) throw new CategoryNotEmptyError(id);
      this.categoriesCache = this.categoriesCache.filter((c) => c.id !== id);
      this.persistCategories();
    },
  };

  logs = {
    getAll: async (): Promise<DailyLog[]> => {
      return [...this.logsCache];
    },
    getByDateRange: async (startDate: string, endDate: string): Promise<DailyLog[]> => {
      return this.logsCache.filter((l) => l.date >= startDate && l.date <= endDate);
    },
    getByHabitId: async (habitId: string): Promise<DailyLog[]> => {
      return this.logsCache.filter((l) => l.habitId === habitId);
    },
    upsert: async (input: Omit<DailyLog, "id" | "updatedAt">): Promise<DailyLog> => {
      const index = this.logsCache.findIndex((l) => l.date === input.date && l.habitId === input.habitId);
      const timestamp = now();
      if (index === -1) {
        const log: DailyLog = { ...input, id: generateId("log"), updatedAt: timestamp };
        this.logsCache.push(log);
        this.persistLogs();
        return log;
      }
      const updated: DailyLog = { ...this.logsCache[index], ...input, updatedAt: timestamp };
      this.logsCache[index] = updated;
      this.persistLogs();
      return updated;
    },
  };

  async exportSnapshot(): Promise<DataSnapshot> {
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now(),
      categories: [...this.categoriesCache],
      habits: [...this.habitsCache],
      logs: [...this.logsCache],
    };
  }

  async importSnapshot(snapshot: DataSnapshot): Promise<void> {
    if (snapshot.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Versión de esquema no soportada: ${snapshot.schemaVersion}`);
    }
    this.categoriesCache = snapshot.categories;
    this.habitsCache = snapshot.habits;
    this.logsCache = snapshot.logs;
    writeJSONSync(KEYS.categories, this.categoriesCache);
    writeJSONSync(KEYS.habits, this.habitsCache);
    writeJSONSync(KEYS.logs, this.logsCache);
    writeJSONSync(KEYS.schemaVersion, SCHEMA_VERSION);
  }

  async resetAll(): Promise<void> {
    this.categoriesCache = [];
    this.habitsCache = [];
    this.logsCache = [];
    removeKey(KEYS.categories);
    removeKey(KEYS.habits);
    removeKey(KEYS.logs);
    removeKey(KEYS.schemaVersion);
    this.seedIfEmpty();
  }
}

let instance: LocalStorageRepository | null = null;

export function createLocalStorageRepository(): AppRepository {
  if (!instance) instance = new LocalStorageRepository();
  return instance;
}
