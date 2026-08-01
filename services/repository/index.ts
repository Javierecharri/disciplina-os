import { createLocalStorageRepository } from "./localStorageRepository";
import type { AppRepository } from "./types";

/**
 * Single point of truth for data access. Swapping to Supabase in v2 means writing a
 * SupabaseRepository that implements AppRepository and returning it here — nothing
 * above this layer (hooks, components) needs to change.
 */
export function getRepository(): AppRepository {
  return createLocalStorageRepository();
}

export * from "./types";
export { CategoryNotEmptyError } from "./localStorageRepository";
