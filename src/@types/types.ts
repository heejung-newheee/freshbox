export type Location = "냉장" | "냉동" | "김치냉장고" | "실온";
export type Zone = "상단" | "중단" | "하단" | "야채" | "도어" | "좌" | "우";
export type Category =
  | "채소/과일"
  | "육류/달걀"
  | "해산물"
  | "유제품"
  | "두부/콩류"
  | "가공식품"
  | "김치/반찬"
  | "양념"
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
