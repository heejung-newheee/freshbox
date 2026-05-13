import type { FoodItem, MealPlan, Member, Category } from "../@types/types";

// 미사용 더미 데이터
export const ITEMS_INIT: FoodItem[] = [
  {
    id: "1",
    name: "닭가슴살",
    category: "육류/달걀",
    location: "냉동",
    zone: "상단",
    bought: "2026-02-20",
    expiry: "2026-03-07",
    quantity: 3,
    unit: "개",
    consumed: false,
  },
  {
    id: "2",
    name: "우유",
    category: "유제품",
    location: "냉장",
    zone: "도어",
    bought: "2026-03-01",
    expiry: "2026-03-06",
    quantity: 1,
    unit: "개",
    consumed: false,
  },
  {
    id: "3",
    name: "달걀",
    category: "유제품",
    location: "냉장",
    zone: "도어",
    bought: "2026-02-25",
    expiry: "2026-03-25",
    quantity: 10,
    unit: "개",
    consumed: false,
  },
  {
    id: "4",
    name: "시금치",
    category: "채소/과일",
    location: "냉장",
    zone: "야채",
    bought: "2026-03-02",
    expiry: "2026-03-04",
    quantity: 1,
    unit: "묶음",
    consumed: false,
  },
  {
    id: "5",
    name: "된장",
    category: "양념",
    location: "냉장",
    zone: "도어",
    bought: "2026-01-10",
    expiry: "2026-07-10",
    quantity: 1,
    unit: "통",
    consumed: false,
  },
  {
    id: "6",
    name: "냉동만두",
    category: "가공식품",
    location: "냉동",
    zone: "하단",
    bought: "2026-02-15",
    expiry: "2026-05-15",
    quantity: 2,
    unit: "봉",
    consumed: false,
  },
  {
    id: "7",
    name: "두부",
    category: "두부/콩류",
    location: "냉장",
    zone: "중단",
    bought: "2026-03-01",
    expiry: "2026-03-05",
    quantity: 1,
    unit: "모",
    consumed: false,
  },
  {
    id: "8",
    name: "삼겹살",
    category: "육류/달걀",
    location: "냉동",
    zone: "중단",
    bought: "2026-02-28",
    expiry: "2026-04-28",
    quantity: 2,
    unit: "팩",
    consumed: false,
  },
  {
    id: "9",
    name: "당근",
    category: "채소/과일",
    location: "냉장",
    zone: "야채",
    bought: "2026-03-01",
    expiry: "2026-03-20",
    quantity: 3,
    unit: "개",
    consumed: false,
  },
  {
    id: "10",
    name: "요거트",
    category: "유제품",
    location: "냉장",
    zone: "상단",
    bought: "2026-03-02",
    expiry: "2026-03-12",
    quantity: 2,
    unit: "개",
    consumed: false,
  },
];

export const MEAL_PLAN: Record<string, MealPlan> = {
  월: { b: "달걀 스크램블", l: "시금치 된장국", d: "닭가슴살 샐러드" },
  화: { b: "요거트 볼", l: "두부 조림", d: "냉동만두 전골" },
  수: { b: "달걀 후라이", l: "된장찌개", d: "삼겹살 구이" },
  목: { b: "우유 시리얼", l: "닭가슴살 볶음밥", d: "두부 찌개" },
  금: { b: "달걀 찜", l: "당근 라페 샌드", d: "삼겹살 시금치" },
  토: { b: "브런치 에그", l: "된장찌개", d: "치킨 스테이크" },
  일: { b: "요거트 파르페", l: "만두 국", d: "삼겹살 파티" },
};

export const MEMBERS: Member[] = [
  {
    id: 1,
    name: "heejung",
    email: "heejung@email.com",
    role: "owner",
    color: "#10b981",
  },
  {
    id: 2,
    name: "지민",
    email: "jimin@email.com",
    role: "editor",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "수현",
    email: "suhyun@email.com",
    role: "viewer",
    color: "#f59e0b",
  },
];

export const CAT_COLORS: Record<Category, string> = {
  "채소/과일": "bg-green-100 text-green-600",
  "육류/달걀": "bg-red-100 text-red-500",
  해산물: "bg-cyan-100 text-cyan-500",
  유제품: "bg-blue-100 text-blue-500",
  "두부/콩류": "bg-orange-100 text-orange-500",
  양념: "bg-yellow-100 text-yellow-600",
  가공식품: "bg-purple-100 text-purple-500",
  기타: "bg-stone-100 text-stone-500",
};

export const CAT_DOT: Record<Category, string> = {
  "채소/과일": "bg-green-400",
  "육류/달걀": "bg-red-400",
  해산물: "bg-cyan-400",
  유제품: "bg-blue-400",
  "두부/콩류": "bg-orange-400",
  양념: "bg-yellow-400",
  가공식품: "bg-purple-400",
  기타: "bg-stone-400",
};

export const CAT_HEX: Record<Category, string> = {
  "채소/과일": "#4ade80",
  "육류/달걀": "#f87171",
  해산물: "#22d3ee",
  유제품: "#60a5fa",
  "두부/콩류": "#fb923c",
  양념: "#fbbf24",
  가공식품: "#c084fc",
  기타: "#94a3b8",
};

export const ZONES_냉장 = ["상단", "중단", "하단", "야채", "도어"] as const;
export const ZONES_냉동 = ["상단", "중단", "하단"] as const;
export const ZONES_김치냉장고 = ["상단", "하단"] as const;
export const CATEGORIES: Category[] = [
  "채소/과일",
  "육류/달걀",
  "해산물",
  "유제품",
  "두부/콩류",
  "양념",
  "가공식품",
  "기타",
];
export const ROLE_META = {
  owner: { label: "소유자", cls: "bg-emerald-100 text-emerald-700" },
  editor: { label: "편집자", cls: "bg-blue-100 text-blue-700" },
  viewer: { label: "열람자", cls: "bg-amber-100 text-amber-700" },
};
export const TODAY = new Date();
