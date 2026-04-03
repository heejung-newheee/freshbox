import type { FoodItem } from "@/@types";
import { AlertIcon, CheckIcon } from "@/assets/icons";
import { Badge } from "@/components/common";
import { getDday, getDdayMeta } from "@/utils";

interface FoodListProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

export function FoodList({ items, onConsume }: FoodListProps) {
  const urgentItems = items.filter(
    (i) => !i.consumed && getDday(i.expiry) <= 3,
  );
  const normalItems = items.filter((i) => !i.consumed && getDday(i.expiry) > 3);

  const renderGroup = (title: string, foods: FoodItem[], iconEmoji: string) => (
    <div key={title} style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <span style={{ fontSize: "18px" }}>{iconEmoji}</span>
        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>{title}</h3>
        {foods.length > 0 && (
          <Badge
            label={foods.length.toString()}
            variant={title === "임박 식품" ? "danger" : "default"}
          />
        )}
      </div>

      {foods.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          식품이 없습니다.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {foods.map((food) => {
            const dday = getDday(food.expiry);
            const meta = getDdayMeta(dday);

            return (
              <div
                key={food.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: `1px solid ${meta.borderColor}`,
                }}
              >
                {dday <= 0 ? (
                  <AlertIcon s={16} c="#ef4444" />
                ) : (
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: meta.textColor,
                      padding: "2px 6px",
                      backgroundColor: meta.bgColor,
                      borderRadius: "4px",
                      minWidth: "32px",
                      textAlign: "center",
                    }}
                  >
                    {dday < 0 ? "만료" : `D-${dday}`}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {food.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {food.location} · {food.expiry}
                  </div>
                </div>

                <button
                  onClick={() => onConsume?.(food.id)}
                  style={{
                    padding: "6px 8px",
                    backgroundColor: "transparent",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#f0fdf4";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#10b981";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#10b981";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#e5e7eb";
                    (e.currentTarget as HTMLButtonElement).style.color = "#000";
                  }}
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
