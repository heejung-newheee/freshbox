import { supabase } from "@/utils/supabase";
import type { FoodItem } from "@/@types";

export interface Todo {
  id: string;
  contents: string;
  isDone: boolean;
  createdAt: string;
  pinned?: boolean;
  userId?: string;
}

export const getTodos = async (userId: string) => {
  const { data, error } = await supabase
    .from("todos")
    .select()
    .match({ userId })
    .order("createdAt", { ascending: false });
  if (error) throw error;
  return data as Todo[];
};

// Food Items API
export const addFoodItem = async (item: Omit<FoodItem, "id" | "consumed">) => {
  const { data, error } = await supabase
    .from("food_items")
    .insert([
      {
        ...item,
        consumed: false,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return (data?.[0] || null) as FoodItem | null;
};

const normalizeItem = (item: any): FoodItem => ({
  ...item,
  location:
    item.location === "냉장칸" ? "냉장"
    : item.location === "냉동칸" ? "냉동"
    : item.location,
  category: item.category === "가공식품" ? "가공" : item.category,
  zone: item.zone ? item.zone.replace(/칸$/, "") : item.zone,
});

export const getFoodItems = async () => {
  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .eq("consumed", false)
    .order("expiry", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeItem) as FoodItem[];
};

export const deleteFoodItem = async (id: string) => {
  const { error } = await supabase.from("food_items").delete().eq("id", id);

  if (error) throw error;
};

export const markFoodItemConsumed = async (id: string) => {
  const { error } = await supabase
    .from("food_items")
    .update({ consumed: true })
    .eq("id", id);

  if (error) throw error;
};
