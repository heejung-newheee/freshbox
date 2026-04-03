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
      <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
        식품이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {breakdown.map((item) => {
        const percentage = (item.count / total) * 100;
        return (
          <div key={item.category}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {item.category}
              </span>
              <Badge label={item.count.toString()} />
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "#e5e7eb",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percentage}%`,
                  backgroundColor: "#3b82f6",
                  borderRadius: "3px",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
