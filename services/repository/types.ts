import type { Category, CategoryInput, DailyLog, DailyLogInput, Habit, HabitInput } from "@/types";

export interface HabitRepository {
  getAll(): Promise<Habit[]>;
  getById(id: string): Promise<Habit | null>;
  create(input: HabitInput): Promise<Habit>;
  update(id: string, patch: Partial<HabitInput>): Promise<Habit>;
  delete(id: string): Promise<void>;
}

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(input: CategoryInput): Promise<Category>;
  update(id: string, patch: Partial<CategoryInput>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface DailyLogRepository {
  getAll(): Promise<DailyLog[]>;
  getByDateRange(startDate: string, endDate: string): Promise<DailyLog[]>;
  getByHabitId(habitId: string): Promise<DailyLog[]>;
  upsert(input: DailyLogInput): Promise<DailyLog>;
}

/** Versioned snapshot used for export/import so future schema migrations (e.g. to Supabase) stay lossless. */
export interface DataSnapshot {
  schemaVersion: number;
  exportedAt: string;
  categories: Category[];
  habits: Habit[];
  logs: DailyLog[];
}

export interface AppRepository {
  habits: HabitRepository;
  categories: CategoryRepository;
  logs: DailyLogRepository;
  exportSnapshot(): Promise<DataSnapshot>;
  importSnapshot(snapshot: DataSnapshot): Promise<void>;
  resetAll(): Promise<void>;
}
