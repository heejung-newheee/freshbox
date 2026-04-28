import { useState } from "react";
import type { FoodItem } from "@/@types";
import { MEAL_PLAN } from "@/constants/constants";
import { getDday } from "@/utils/utils";

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
  { name: "쌀", qty: "1kg", color: "#ef4444" },
  { name: "양파", qty: "3개", color: "#ef4444" },
  { name: "마늘", qty: "1통", color: "#f59e0b" },
  { name: "간장", qty: "1병", color: "#f59e0b" },
  { name: "참기름", qty: "1병", color: "#10b981" },
  { name: "고추장", qty: "1통", color: "#10b981" },
];

const MEAL_ICONS: Record<string, string> = {
  아침: "🍳",
  점심: "☀️",
  저녁: "🌙",
};

const MEAL_BG: Record<string, string> = {
  아침: "#fffbeb",
  점심: "#f0fdf4",
  저녁: "#f5f3ff",
};

const MEAL_BORDER: Record<string, string> = {
  아침: "#fde68a",
  점심: "#bbf7d0",
  저녁: "#ddd6fe",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Day tabs */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {DAYS.map((day) => {
            const active = day === selectedDay;
            const m = MEAL_PLAN[day];
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? "#10b981" : "#f9fafb",
                  color: active ? "#fff" : "#6b7280",
                  textAlign: "center", transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800 }}>{day}</div>
                <div style={{ fontSize: 10, marginTop: 3, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m?.b?.slice(0, 4) ?? "미정"}~
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {meals.map(({ type, value }) => (
          <div
            key={type}
            style={{
              background: MEAL_BG[type], border: `1px solid ${MEAL_BORDER[type]}`,
              borderRadius: 14, padding: "20px",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{MEAL_ICONS[type]}</span> {type}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1c1917" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Bottom: recommendations + shopping */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recipe Recommendations */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🔥 임박 재료 활용 추천</h3>
          {/* Ingredient tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {(urgentItems.length > 0 ? urgentItems : items.slice(0, 4)).slice(0, 5).map((i) => (
              <span
                key={i.id}
                style={{ padding: "4px 10px", borderRadius: 20, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 600, color: "#15803d" }}
              >
                {i.name}
              </span>
            ))}
          </div>
          {/* Recipe list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {RECIPES.map((r) => (
              <div
                key={r.name}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <span style={{ fontSize: 18 }}>🔍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                    {r.ingredients} · ⏱{r.time} · {r.kcal}
                  </div>
                </div>
                <span style={{ fontSize: 14, color: "#d1d5db" }}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping List */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🛒 장보기 목록</h3>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>이번 주 식단 기반 부족 재료</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SHOPPING.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{s.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
