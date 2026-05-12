import type { FoodItem } from "@/@types";
import { AlertIcon, CheckIcon } from "@/assets/icons";
import { Badge } from "@/components/common";
import { getDday, getDdayMeta } from "@/utils";

interface FoodListProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

export function FoodList({ items, onConsume }: FoodListProps) {
  const urgentItems = items.filter((i) => !i.consumed && getDday(i.expiry) <= 3);
  const normalItems = items.filter((i) => !i.consumed && getDday(i.expiry) > 3);

  const renderGroup = (title: string, foods: FoodItem[], iconEmoji: string) => (
    <div key={title} className="mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-200">
        <span className="text-lg">{iconEmoji}</span>
        <h3 className="text-sm font-bold">{title}</h3>
        {foods.length > 0 && (
          <Badge
            label={foods.length.toString()}
            variant={title === "임박 식품" ? "danger" : "default"}
          />
        )}
      </div>

      {foods.length === 0 ? (
        <div className="py-5 text-center text-gray-400 text-[13px]">식품이 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {foods.map((food) => {
            const dday = getDday(food.expiry);
            const meta = getDdayMeta(dday);
            return (
              <div
                key={food.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                style={{ borderColor: meta.borderColor }}
              >
                {dday <= 0 ? (
                  <AlertIcon s={16} c="#ef4444" />
                ) : (
                  <div
                    className="text-xs font-bold px-1.5 py-0.5 rounded min-w-8 text-center"
                    style={{ color: meta.textColor, backgroundColor: meta.bgColor }}
                  >
                    {dday < 0 ? "만료" : `D-${dday}`}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold">{food.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {food.location} · {food.expiry}
                  </div>
                </div>

                <button
                  onClick={() => onConsume?.(food.id)}
                  className="px-2 py-1.5 bg-transparent border border-gray-200 rounded text-[11px] font-semibold cursor-pointer hover:bg-green-50 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  <CheckIcon s={12} c="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {urgentItems.length > 0 && renderGroup("임박 식품", urgentItems, "🔥")}
      {renderGroup("일반 식품", normalItems, "📦")}
    </div>
  );
}
