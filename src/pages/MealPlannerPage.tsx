import type { FoodItem } from "@/@types";
import { MEAL_PLAN } from "@/constants/constants";
import { cn, getDday } from "@/utils/utils";
import { useState } from "react";

interface MealPlannerProps {
  items?: FoodItem[];
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
type Day = (typeof DAYS)[number];

const RECIPES = [
  { name: "시금치 달걀 볶음", ingredients: "시금치 + 달걀", time: "10분", kcal: "280kcal" },
  { name: "우유 두부 스무디", ingredients: "우유 + 두부", time: "5분", kcal: "190kcal" },
  { name: "닭가슴살 시금치 덮밥", ingredients: "닭가슴살 + 시금치", time: "20분", kcal: "420kcal" },
];

const SHOPPING = [
  { name: "쌀", qty: "1kg", cls: "bg-red-500" },
  { name: "양파", qty: "3개", cls: "bg-red-500" },
  { name: "마늘", qty: "1통", cls: "bg-amber-400" },
  { name: "간장", qty: "1병", cls: "bg-amber-400" },
  { name: "참기름", qty: "1병", cls: "bg-emerald-500" },
  { name: "고추장", qty: "1통", cls: "bg-emerald-500" },
];

const MEAL_STYLE: Record<string, { card: string; label: string; icon: string }> = {
  아침: { card: "bg-amber-50 border-amber-200", label: "text-amber-700", icon: "🍳" },
  점심: { card: "bg-green-50 border-green-200", label: "text-green-700", icon: "☀️" },
  저녁: { card: "bg-violet-50 border-violet-200", label: "text-violet-700", icon: "🌙" },
};

export function MealPlanner({ items = [] }: MealPlannerProps) {
  const [selectedDay, setSelectedDay] = useState<Day>("화");

  const urgentItems = items.filter(
    (i) => !i.consumed && getDday(i.expiry) <= 5 && getDday(i.expiry) >= 0,
  );

  const meal = MEAL_PLAN[selectedDay];
  const meals = [
    { type: "아침", value: meal?.b ?? "미정" },
    { type: "점심", value: meal?.l ?? "미정" },
    { type: "저녁", value: meal?.d ?? "미정" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Day tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const active = day === selectedDay;
            const m = MEAL_PLAN[day];
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "py-2.5 px-1.5 rounded-xl border-none cursor-pointer text-center transition-all",
                  active ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                )}
              >
                <div className="text-[15px] font-extrabold">{day}</div>
                <div className="text-[10px] mt-0.5 opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
                  {m?.b?.slice(0, 4) ?? "미정"}~
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal cards */}
      <div className="grid grid-cols-3 gap-3.5">
        {meals.map(({ type, value }) => {
          const s = MEAL_STYLE[type];
          return (
            <div key={type} className={`${s.card} border rounded-2xl p-5`}>
              <div className={`text-[12px] font-bold ${s.label} mb-2 flex items-center gap-1.5`}>
                <span className="text-base">{s.icon}</span> {type}
              </div>
              <div className="text-base font-extrabold text-stone-900">{value}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom: recommendations + shopping */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recipe Recommendations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-[14px] font-bold mb-3.5">🔥 임박 재료 활용 추천</h3>
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            {(urgentItems.length > 0 ? urgentItems : items.slice(0, 4)).slice(0, 5).map((i) => (
              <span
                key={i.id}
                className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[12px] font-semibold text-green-800"
              >
                {i.name}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            {RECIPES.map((r) => (
              <div
                key={r.name}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">🔍</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-stone-900">{r.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {r.ingredients} · ⏱{r.time} · {r.kcal}
                  </div>
                </div>
                <span className="text-sm text-gray-300">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-[14px] font-bold mb-1">🛒 장보기 목록</h3>
          <p className="text-[12px] text-gray-400 mb-3.5">이번 주 식단 기반 부족 재료</p>
          <div className="flex flex-col gap-2.5">
            {SHOPPING.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full inline-block ${s.cls}`} />
                  <span className="text-[13px] text-gray-700">{s.name}</span>
                </div>
                <span className="text-[12px] text-gray-400 font-semibold">{s.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
