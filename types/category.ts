export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
