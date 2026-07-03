import { cn, getDday } from "@/utils/utils";
import { useState, useRef } from "react";
import type { RecipeRecommendation } from "@/services/api";

function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: RecipeRecommendation;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold text-stone-900 truncate">
              {recipe.koreanName}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate">
              {recipe.name}
              {recipe.area && ` · ${recipe.area}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[16px] shrink-0 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {recipe.thumbnail && (
            <img
              src={recipe.thumbnail}
              alt={recipe.name}
              className="w-full h-44 object-cover"
            />
          )}
          <div className="p-6 flex flex-col gap-4">
            {recipe.fullIngredients.length > 0 && (
              <div>
                <h3 className="text-[13px] font-bold text-stone-700 mb-2">
                  재료
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {recipe.fullIngredients.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[12px] text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-medium">{item.ingredient}</span>
                      {item.measure && (
                        <span className="text-gray-400">{item.measure}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipe.instructions && (
              <div>
                <h3 className="text-[13px] font-bold text-stone-700 mb-2">
                  만드는 법
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {recipe.instructions}
                </p>
              </div>
            )}

            {recipe.youtube && (
              <a
                href={recipe.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors"
              >
                ▶ YouTube에서 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useFoodItems } from "@/hooks/useFoodItems";
import { useMealPlan, useUpsertMeal, useDeleteMeal } from "@/hooks/useMealPlan";
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
  const weekLabels = ["1", "2", "3", "4", "5"];
  const weekLabel = weekLabels[Math.ceil(start.getDate() / 7) - 1] ?? "5";
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()} [${weekLabel}주]`;
}

export function MealPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=월 ... 6=일
  });
  const [editKey, setEditKey] = useState<string | null>(null); // "${dayIdx}-${mealType}"
  const [editValue, setEditValue] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const cancelledRef = useRef(false);
  const ingredientsRef = useRef<HTMLInputElement>(null);
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

  function startEdit(dayIdx: number, mealType: MealType) {
    cancelledRef.current = false;
    setEditKey(`${dayIdx}-${mealType}`);
    const meal = mealMap[dayIdx]?.[mealType];
    setEditValue(meal?.name ?? "");
    setEditIngredients(meal?.ingredients ?? "");
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setEditKey(null);
    setEditValue("");
    setEditIngredients("");
  }

  function saveEdit(dayIdx: number, mealType: MealType) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    const trimmed = editValue.trim();
    if (trimmed) {
      upsert.mutate({
        day: dayIdx,
        mealType,
        mealName: trimmed,
        ingredients: editIngredients.trim(),
      });
    } else {
      deleteMeal.mutate({ day: dayIdx, mealType });
    }
    setEditKey(null);
    setEditValue("");
    setEditIngredients("");
  }

  return (
    <>
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
        </div>

        {/* Meal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {MEAL_TYPES.map((mealType) => {
            const s = MEAL_STYLE[mealType];
            const value = mealMap[selectedDay]?.[mealType];
            const key = `${selectedDay}-${mealType}`;
            const isEditing = editKey === key;

            return (
              <div key={mealType} className={`${s.card} border rounded-xl p-4`}>
                <div
                  className={`text-[12px] font-bold ${s.label} mb-2 flex items-center justify-between`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">{s.icon}</span>
                    {s.labelText}
                  </span>
                  {canEdit && !isEditing && value?.name && (
                    <button
                      onClick={() =>
                        deleteMeal.mutate({ day: selectedDay, mealType })
                      }
                      className="text-gray-300 hover:text-red-400 transition-colors text-[18px] leading-none cursor-pointer"
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div
                    className="flex flex-col gap-1.5"
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node))
                        saveEdit(selectedDay, mealType);
                    }}
                  >
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing)
                          ingredientsRef.current?.focus();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      placeholder={`${s.labelText} 입력...`}
                      className="text-sm font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={ingredientsRef}
                        value={editIngredients}
                        onChange={(e) => setEditIngredients(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing)
                            saveEdit(selectedDay, mealType);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        placeholder="재료 또는 노트 (쉼표로 구분)"
                        className="text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-gray-500"
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
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-start justify-between group",
                      canEdit && "cursor-pointer",
                    )}
                    onClick={() => canEdit && startEdit(selectedDay, mealType)}
                  >
                    <div>
                      <div
                        className={`text-base font-extrabold ${value?.name ? "text-stone-900" : "text-gray-300"}`}
                      >
                        {value?.name ?? "미정"}
                      </div>
                      {value?.ingredients && (
                        <div className="text-[11px] text-gray-400 mt-1">
                          {value.ingredients}
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] ml-2 opacity-0 group-hover:opacity-60 transition-opacity shrink-0">
                      ✏️
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom: shopping + notes */}
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
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      addShoppingItem();
                  }}
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
          {/* 노트 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
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
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
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
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">
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
