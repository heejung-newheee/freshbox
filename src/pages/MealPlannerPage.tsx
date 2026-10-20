import { cn, getDday } from "@/utils/utils";
import { useState } from "react";
import type { RecipeRecommendation } from "@/services/api";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useMealPlan, useMonthMealPlans, useUpsertMeal, useDeleteMeal } from "@/hooks/useMealPlan";
import { useAuthStore } from "@/stores/authStore";
import { useMealNotes, useUpdateMealNotes } from "@/hooks/useMealNotes";
import {
  useShoppingItems,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
  useClearCheckedItems,
} from "@/hooks/useShoppingItems";
import type { MealType } from "@/services/api";
import { useRecipeRecommendations } from "@/hooks/useRecipes";
import { Button, Input } from "@/components/ui";
import { DAYS, MealCards, MonthCalendar, RecipeModal } from "@/components/features";

function getWeekStart(offset = 0): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + offset * 7);
  // toISOString()은 UTC 기준이라 KST 오전 9시 전엔 하루 전 날짜가 됨 → 로컬 날짜로 포맷
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(weekStart + "T00:00:00");
  end.setDate(end.getDate() + 6);
  const weekLabels = ["1", "2", "3", "4", "5"];
  const weekLabel = weekLabels[Math.ceil(start.getDate() / 7) - 1] ?? "5";
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()} [${weekLabel}주]`;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// 해당 월을 덮는 주 목록 (월요일 시작). offset은 이번 주 기준 주 차이
function getMonthWeeks(monthOffset: number) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const thisMonday = new Date(getWeekStart(0) + "T00:00:00");
  const monday = new Date(first);
  monday.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const weeks: { offset: number; monday: Date }[] = [];
  for (; monday <= last; monday.setDate(monday.getDate() + 7)) {
    weeks.push({
      offset: Math.round((monday.getTime() - thisMonday.getTime()) / WEEK_MS),
      monday: new Date(monday),
    });
  }
  return { year: first.getFullYear(), month: first.getMonth(), weeks };
}

export function MealPlanner() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=월 ... 6=일
  });
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "owner" || role === "editor";
  const [newName, setNewName] = useState("");

  const { data: notesData = "" } = useMealNotes();
  const updateNotes = useUpdateMealNotes();
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const notesValue = notesDraft ?? notesData;
  const handleNotesSave = () => {
    if (notesDraft !== null) {
      updateNotes.mutate(notesDraft);
      setNotesDraft(null);
    }
  };

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
    Record<
      number,
      Partial<Record<MealType, { name: string; ingredients: string }>>
    >
  >((acc, row) => {
    if (!acc[row.day]) acc[row.day] = {};
    acc[row.day][row.meal_type] = {
      name: row.meal_name,
      ingredients: row.ingredients,
    };
    return acc;
  }, {});

  const monthView = getMonthWeeks(monthOffset);
  const monthWeekStarts = monthView.weeks.map((w) => getWeekStart(w.offset));
  const monthResults = useMonthMealPlans(
    viewMode === "month" ? monthWeekStarts : [],
  );
  const monthMaps = monthResults.map((r) =>
    (r.data ?? []).reduce<Record<number, Partial<Record<MealType, string>>>>(
      (acc, row) => {
        (acc[row.day] ??= {})[row.meal_type] = row.meal_name;
        return acc;
      },
      {},
    ),
  );

  function switchToMonth() {
    // 현재 선택된 날짜가 포함된 달을 보여줌
    const sel = new Date(getWeekStart(weekOffset) + "T00:00:00");
    sel.setDate(sel.getDate() + selectedDay);
    const now = new Date();
    setMonthOffset(
      (sel.getFullYear() - now.getFullYear()) * 12 +
        sel.getMonth() -
        now.getMonth(),
    );
    setViewMode("month");
  }

  const urgentItems = items.filter(
    (i) => !i.consumed && getDday(i.expiry) <= 5 && getDday(i.expiry) >= 0,
  );

  const recipeSource = (
    urgentItems.length > 0 ? urgentItems : items.slice(0, 4)
  ).slice(0, 5);
  const { data: recipes = [], isLoading: recipesLoading } =
    useRecipeRecommendations(recipeSource.map((i) => i.name));
  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeRecommendation | null>(null);

  function saveMeal(mealType: MealType, name: string, ingredients: string) {
    if (name) {
      upsert.mutate({ day: selectedDay, mealType, mealName: name, ingredients });
    } else {
      deleteMeal.mutate({ day: selectedDay, mealType });
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Week navigation + day tabs */}
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 md:px-5 md:py-4">
          <div className="flex justify-end mb-3">
            <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
              {(["week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    mode === "month" ? switchToMonth() : setViewMode("week")
                  }
                  className={cn(
                    "px-3 py-1 rounded-md text-[12px] font-bold transition-colors",
                    viewMode === mode
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {mode === "week" ? "주간" : "월간"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="secondary"
              onClick={() =>
                viewMode === "week"
                  ? setWeekOffset((o) => o - 1)
                  : setMonthOffset((o) => o - 1)
              }
            >
              {viewMode === "week" ? "◀ 이전 주" : "◀ 이전 달"}
            </Button>
            <span className="text-[14px] font-bold text-stone-800">
              {viewMode === "week"
                ? formatWeekRange(weekStart)
                : `${monthView.year}년 ${monthView.month + 1}월`}
            </span>
            <Button
              variant="secondary"
              onClick={() =>
                viewMode === "week"
                  ? setWeekOffset((o) => o + 1)
                  : setMonthOffset((o) => o + 1)
              }
            >
              {viewMode === "week" ? "다음 주 ▶" : "다음 달 ▶"}
            </Button>
          </div>
          {viewMode === "month" ? (
            <MonthCalendar
              month={monthView.month}
              weeks={monthView.weeks}
              weekMeals={monthMaps}
              weekOffset={weekOffset}
              selectedDay={selectedDay}
              onSelect={(offset, day) => {
                setWeekOffset(offset);
                setSelectedDay(day);
              }}
            />
          ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:grid-cols-7 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0">
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
                    "px-1 shrink-0 w-20 md:w-auto py-3 rounded-xl border-none cursor-pointer text-center transition-all",
                    active
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <div className="text-[12px] font-extrabold mb-1.5">{day}</div>
                  {[b, l, d].map((meal, mi) => (
                    <div
                      key={mi}
                      className="text-[14px] opacity-75 overflow-hidden text-ellipsis whitespace-nowrap w-full px-1"
                    >
                      {meal?.name ?? "·"}
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* Meal cards */}
        <MealCards
          key={`${weekStart}-${selectedDay}`}
          meals={mealMap[selectedDay] ?? {}}
          canEdit={canEdit}
          onSave={saveMeal}
          onDelete={(mealType) =>
            deleteMeal.mutate({ day: selectedDay, mealType })
          }
        />

        {/* Bottom: shopping + notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-5 flex flex-col">
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
            <p className="text-[12px] text-gray-400 mb-3.5">
              이번 주 식단 기반 부족 재료
            </p>

            <div className="flex flex-col gap-1 flex-1">
              {shopping.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50 group"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() =>
                      canEdit &&
                      toggleItem.mutate({ id: item.id, checked: !item.checked })
                    }
                    disabled={!canEdit}
                    className="w-4 h-4 accent-emerald-500 shrink-0 disabled:cursor-not-allowed"
                  />
                  <span
                    className={cn(
                      "text-[13px] flex-1",
                      item.checked
                        ? "line-through text-gray-300"
                        : "text-gray-700",
                    )}
                  >
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
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      addShoppingItem();
                  }}
                  placeholder="재료명"
                  className="flex-1"
                />
                <Button onClick={addShoppingItem}>+</Button>
              </div>
            )}
          </div>
          {/* 노트 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-5 flex flex-col">
            <h3 className="text-[14px] font-bold mb-1">📝 메모</h3>
            <p className="text-[12px] text-gray-400 mb-3.5">
              사야 할 것, 식단 관련 메모
            </p>
            <div className="relative flex-1">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={handleNotesSave}
                placeholder="메모를 입력하세요..."
                className="w-full resize-none text-[13px] text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 min-h-40 leading-relaxed block"
              />
              {updateNotes.isPending && (
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 pointer-events-none">
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] text-emerald-400 font-medium">
                    저장 중
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipe recommendations - full width */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-5">
          <div className="flex items-center gap-3 mb-3.5">
            <h3 className="text-[14px] font-bold">🔥 임박 재료 활용 추천</h3>
            <div className="flex gap-1.5 flex-wrap">
              {recipeSource.map((i) => (
                <span
                  key={i.id}
                  className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[12px] font-semibold text-green-800"
                >
                  {i.name}
                </span>
              ))}
            </div>
          </div>
          {recipesLoading ? (
            <div className="py-4 text-center text-[12px] text-gray-400">
              레시피 추천 중...
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-4 text-center text-[12px] text-gray-400">
              재료를 추가하면 레시피를 추천해드려요
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {recipes.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setSelectedRecipe(r)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors w-full text-left cursor-pointer"
                >
                  {r.thumbnail && (
                    <img
                      src={r.thumbnail}
                      alt={r.name}
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-stone-900 truncate">
                      {r.koreanName}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {r.area && <span>{r.area} · </span>}
                      {r.ingredients}
                    </div>
                  </div>
                  <span className="text-gray-300 text-[12px] shrink-0">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </>
  );
}
