import { cn, getDday } from "@/utils/utils";
import { useState, useRef } from "react";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useMealPlan, useUpsertMeal, useDeleteMeal } from "@/hooks/useMealPlan";
import { useAuthStore } from "@/stores/authStore";
import {
  useShoppingItems,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
  useClearCheckedItems,
} from "@/hooks/useShoppingItems";
import type { MealType } from "@/services/api";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

const MEAL_STYLE: Record<
  MealType,
  { card: string; label: string; icon: string; labelText: string }
> = {
  b: {
    card: "bg-amber-50 border-amber-200",
    label: "text-amber-700",
    icon: "🍳",
    labelText: "아침",
  },
  l: {
    card: "bg-green-50 border-green-200",
    label: "text-green-700",
    icon: "☀️",
    labelText: "점심",
  },
  d: {
    card: "bg-violet-50 border-violet-200",
    label: "text-violet-700",
    icon: "🌙",
    labelText: "저녁",
  },
};

const MEAL_TYPES: MealType[] = ["b", "l", "d"];

const RECIPES = [
  {
    name: "시금치 달걀 볶음",
    ingredients: "시금치 + 달걀",
    time: "10분",
    kcal: "280kcal",
  },
  {
    name: "우유 두부 스무디",
    ingredients: "우유 + 두부",
    time: "5분",
    kcal: "190kcal",
  },
  {
    name: "닭가슴살 시금치 덮밥",
    ingredients: "닭가슴살 + 시금치",
    time: "20분",
    kcal: "420kcal",
  },
];


function getWeekStart(offset = 0): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + offset * 7);
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(weekStart + "T00:00:00");
  end.setDate(end.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`;
}

export function MealPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=월 ... 6=일
  });
  const [editKey, setEditKey] = useState<string | null>(null); // "${dayIdx}-${mealType}"
  const [editValue, setEditValue] = useState("");
  const cancelledRef = useRef(false);
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "owner" || role === "editor";
  const [newName, setNewName] = useState("");

  const { data: shopping = [] } = useShoppingItems();
  const addItem = useAddShoppingItem();
  const toggleItem = useToggleShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const clearChecked = useClearCheckedItems();

  function addShoppingItem() {
    if (!newName.trim()) return;
    addItem.mutate({ name: newName.trim(), qty: "" });
    setNewName("");
  }

  const weekStart = getWeekStart(weekOffset);
  const { data: rows = [] } = useMealPlan(weekStart);
  const upsert = useUpsertMeal(weekStart);
  const deleteMeal = useDeleteMeal(weekStart);
  const { items } = useFoodItems();

  const mealMap = rows.reduce<
    Record<number, Partial<Record<MealType, string>>>
  >((acc, row) => {
    if (!acc[row.day]) acc[row.day] = {};
    acc[row.day][row.meal_type] = row.meal_name;
    return acc;
  }, {});

  const urgentItems = items.filter(
    (i) => !i.consumed && getDday(i.expiry) <= 5 && getDday(i.expiry) >= 0,
  );

  function startEdit(dayIdx: number, mealType: MealType) {
    cancelledRef.current = false;
    setEditKey(`${dayIdx}-${mealType}`);
    setEditValue(mealMap[dayIdx]?.[mealType] ?? "");
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setEditKey(null);
    setEditValue("");
  }

  function saveEdit(dayIdx: number, mealType: MealType) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    const trimmed = editValue.trim();
    if (trimmed) {
      upsert.mutate({ day: dayIdx, mealType, mealName: trimmed });
    } else {
      deleteMeal.mutate({ day: dayIdx, mealType });
    }
    setEditKey(null);
    setEditValue("");
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Week navigation + day tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-[13px] font-semibold transition-colors"
          >
            ◀ 이전 주
          </button>
          <span className="text-[14px] font-bold text-stone-800">
            {formatWeekRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-[13px] font-semibold transition-colors"
          >
            다음 주 ▶
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const active = i === selectedDay;
            const b = mealMap[i]?.b;
            const l = mealMap[i]?.l;
            const d = mealMap[i]?.d;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "py-2.5 px-1.5 rounded-xl border-none cursor-pointer text-center transition-all",
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                )}
              >
                <div className="text-[15px] font-extrabold mb-1">{day}</div>
                {[b, l, d].map((meal, mi) => (
                  <div
                    key={mi}
                    className="text-[9px] opacity-75 overflow-hidden text-ellipsis whitespace-nowrap w-full"
                  >
                    {meal ?? "·"}
                  </div>
                ))}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {MEAL_TYPES.map((mealType) => {
          const s = MEAL_STYLE[mealType];
          const value = mealMap[selectedDay]?.[mealType];
          const key = `${selectedDay}-${mealType}`;
          const isEditing = editKey === key;

          return (
            <div key={mealType} className={`${s.card} border rounded-2xl p-5`}>
              <div
                className={`text-[12px] font-bold ${s.label} mb-2 flex items-center justify-between`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{s.icon}</span>
                  {s.labelText}
                </span>
                {canEdit && !isEditing && value && (
                  <button
                    onClick={() =>
                      deleteMeal.mutate({ day: selectedDay, mealType })
                    }
                    className="text-gray-300 hover:text-red-400 transition-colors text-[18px] leading-none"
                    title="삭제"
                  >
                    ×
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing) e.currentTarget.blur();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    onBlur={() => saveEdit(selectedDay, mealType)}
                    placeholder={`${s.labelText} 입력...`}
                    className="text-sm font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                  />
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => saveEdit(selectedDay, mealType)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] flex items-center justify-center shrink-0 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={cancelEdit}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 text-[14px] flex items-center justify-center shrink-0 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className={cn("flex items-center justify-between group", canEdit && "cursor-pointer")}
                  onClick={() => canEdit && startEdit(selectedDay, mealType)}
                >
                  <div
                    className={`text-base font-extrabold ${value ? "text-stone-900" : "text-gray-300"}`}
                  >
                    {value ?? "미정"}
                  </div>
                  <span className="text-[13px] ml-2 opacity-0 group-hover:opacity-60 transition-opacity">
                    ✏️
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom: recommendations + shopping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[14px] font-bold">🛒 장보기 목록</h3>
            {canEdit && shopping.some((s) => s.checked) && (
              <button
                onClick={() => clearChecked.mutate()}
                className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
              >
                완료 항목 지우기
              </button>
            )}
          </div>
          <p className="text-[12px] text-gray-400 mb-3.5">이번 주 식단 기반 부족 재료</p>

          <div className="flex flex-col gap-1 flex-1">
            {shopping.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50 group">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => canEdit && toggleItem.mutate({ id: item.id, checked: !item.checked })}
                  disabled={!canEdit}
                  className="w-4 h-4 accent-emerald-500 shrink-0 disabled:cursor-not-allowed"
                />
                <span className={cn("text-[13px] flex-1", item.checked ? "line-through text-gray-300" : "text-gray-700")}>
                  {item.name}
                </span>
                {canEdit && (
                  <button
                    onClick={() => deleteItem.mutate(item.id)}
                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-[16px] leading-none ml-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 항목 추가 */}
          {canEdit && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addShoppingItem(); }}
                placeholder="재료명"
                className="flex-1 text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <button
                onClick={addShoppingItem}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-lg transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-[14px] font-bold mb-3.5">
            🔥 임박 재료 활용 추천
          </h3>
          <div className="flex gap-1.5 flex-wrap mb-3.5">
            {(urgentItems.length > 0 ? urgentItems : items.slice(0, 4))
              .slice(0, 5)
              .map((i) => (
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
                  <div className="text-[13px] font-bold text-stone-900">
                    {r.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {r.ingredients} · ⏱{r.time} · {r.kcal}
                  </div>
                </div>
                <span className="text-sm text-gray-300">›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
