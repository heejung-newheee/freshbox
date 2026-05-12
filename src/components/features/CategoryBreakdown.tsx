import type { FoodItem } from "@/@types";
import { Badge } from "@/components/common";

interface CategoryBreakdownProps {
  items: FoodItem[];
}

const CATEGORIES = ["채소", "육류", "해산물", "유제품", "가공식품", "기타"];

export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  const breakdown = CATEGORIES.map((cat) => ({
    category: cat,
    count: items.filter((i) => !i.consumed && i.category === cat).length,
  })).filter((c) => c.count > 0);

  const total = items.filter((i) => !i.consumed).length;

  if (breakdown.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">식품이 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {breakdown.map((item) => {
        const percentage = (item.count / total) * 100;
        return (
          <div key={item.category}>
            <div className="flex justify-between mb-1">
              <span className="text-[13px] font-semibold">{item.category}</span>
              <Badge label={item.count.toString()} />
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-[width] duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
