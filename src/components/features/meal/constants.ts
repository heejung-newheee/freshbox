import type { MealType } from "@/services/api";

export const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export const MEAL_STYLE: Record<
  MealType,
  { card: string; label: string; chip: string; icon: string; labelText: string }
> = {
  b: {
    card: "bg-amber-50 border-amber-200",
    label: "text-amber-700",
    chip: "bg-amber-100 text-amber-800",
    icon: "🍳",
    labelText: "아침",
  },
  l: {
    card: "bg-green-50 border-green-200",
    label: "text-green-700",
    chip: "bg-green-100 text-green-800",
    icon: "☀️",
    labelText: "점심",
  },
  d: {
    card: "bg-violet-50 border-violet-200",
    label: "text-violet-700",
    chip: "bg-violet-100 text-violet-800",
    icon: "🌙",
    labelText: "저녁",
  },
};

export const MEAL_TYPES: MealType[] = ["b", "l", "d"];
