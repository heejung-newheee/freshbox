export type Location = "냉장" | "냉동";
export type Zone = "상단" | "중단" | "하단" | "야채" | "도어";
export type Category =
  | "채소"
  | "육류"
  | "해산물"
  | "유제품"
  | "양념"
  | "가공"
  | "두부"
  | "기타";
export type Role = "owner" | "editor" | "viewer";

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  location: Location;
  zone?: Zone;
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
