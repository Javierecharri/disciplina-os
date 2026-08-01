"use client";

import { useAppData } from "./useAppData";

export function useCategories() {
  const { categories, createCategory, updateCategory, deleteCategory, loading } = useAppData();
  return { categories, createCategory, updateCategory, deleteCategory, loading };
}
