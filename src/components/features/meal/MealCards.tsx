import { useRef, useState } from "react";
import type { MealType } from "@/services/api";
import { Button, Input } from "@/components/ui";
import { cn } from "@/utils/utils";
import { MEAL_STYLE, MEAL_TYPES } from "./constants";

interface MealCardsProps {
  meals: Partial<Record<MealType, { name: string; ingredients: string }>>;
  canEdit: boolean;
  // name 이 빈 문자열이면 삭제로 처리
  onSave: (mealType: MealType, name: string, ingredients: string) => void;
  onDelete: (mealType: MealType) => void;
}

// 선택한 하루의 아침·점심·저녁 카드. 날짜가 바뀌면 key 로 다시 마운트해 편집 상태를 초기화
export function MealCards({ meals, canEdit, onSave, onDelete }: MealCardsProps) {
  const [editing, setEditing] = useState<MealType | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const cancelledRef = useRef(false);
  const ingredientsRef = useRef<HTMLInputElement>(null);

  function startEdit(mealType: MealType) {
    cancelledRef.current = false;
    setEditing(mealType);
    setEditValue(meals[mealType]?.name ?? "");
    setEditIngredients(meals[mealType]?.ingredients ?? "");
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setEditing(null);
    setEditValue("");
    setEditIngredients("");
  }

  function saveEdit(mealType: MealType) {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    onSave(mealType, editValue.trim(), editIngredients.trim());
    setEditing(null);
    setEditValue("");
    setEditIngredients("");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {MEAL_TYPES.map((mealType) => {
        const s = MEAL_STYLE[mealType];
        const value = meals[mealType];
        const isEditing = editing === mealType;

        return (
          <div key={mealType} className={`${s.card} border rounded-xl p-3 md:p-4`}>
            <div
              className={`text-[12px] font-bold ${s.label} mb-2 flex items-center justify-between`}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base">{s.icon}</span>
                {s.labelText}
              </span>
              {canEdit && !isEditing && value?.name && (
                <button
                  onClick={() => onDelete(mealType)}
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
                    saveEdit(mealType);
                }}
              >
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      ingredientsRef.current?.focus();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  placeholder={`${s.labelText} 입력...`}
                  className="font-semibold bg-white"
                />
                <div className="flex items-center gap-1.5">
                  <Input
                    ref={ingredientsRef}
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.nativeEvent.isComposing)
                        saveEdit(mealType);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    placeholder="재료 또는 노트 (쉼표로 구분)"
                    className="flex-1 min-w-0 bg-white text-gray-500"
                  />
                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => saveEdit(mealType)}
                    className="w-9.5 px-0 text-[14px]"
                  >
                    ✓
                  </Button>
                  <Button
                    variant="secondary"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={cancelEdit}
                    className="w-9.5 px-0 text-[14px]"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-start justify-between group",
                  canEdit && "cursor-pointer",
                )}
                onClick={() => canEdit && startEdit(mealType)}
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
  );
}
