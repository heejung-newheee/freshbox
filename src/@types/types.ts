export type Location = "냉장칸" | "냉동칸" | "야채칸";
export type Category =
  | "채소"
  | "육류"
  | "해산물"
  | "유제품"
  | "가공식품"
  | "기타";
export type Role = "owner" | "editor" | "viewer";

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  location: Location;
  bought: string;
  expiry: string;
  quantity?: number;
  unit?: string;
  consumed: boolean;
}

export interface MealPlan {
  b: string; // breakfast
  l: string; // lunch
  d: string; // dinner
}

export interface Member {
  id: number;
  name: string;
  email: string;
  role: Role;
  color: string;
}

export interface DdayMeta {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}
