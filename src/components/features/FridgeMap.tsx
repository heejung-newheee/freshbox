import type { FoodItem } from "@/@types";

interface FridgeMapProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

const LOCATIONS = ["냉장칸", "냉동칸", "야채칸"];
// const CATEGORIES = ["채소", "육류", "해산물", "유제품", "가공식품", "기타"];

export function FridgeMap({ items, onConsume }: FridgeMapProps) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
    >
      {LOCATIONS.map((location) => {
        const locationItems = items.filter(
          (i) => !i.consumed && i.location === location,
        );

        return (
          <div
            key={location}
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                }}
              >
                {location === "냉장칸"
                  ? "🌡️"
                  : location === "냉동칸"
                    ? "❄️"
                    : "🥬"}
              </span>
              {location} ({locationItems.length})
            </h3>

            {locationItems.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                비어있습니다.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {locationItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => onConsume?.(item.id)}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "#f0fdf4";
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#10b981";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLDivElement
                      ).style.backgroundColor = "#fff";
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#e5e7eb";
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
