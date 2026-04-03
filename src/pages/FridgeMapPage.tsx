import type { FoodItem } from "@/@types";
import { FridgeMap } from "@/components/features";

interface FridgeMapPageProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

export function FridgeMapPage({ items, onConsume }: FridgeMapPageProps) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <FridgeMap items={items} onConsume={onConsume} />

      {/* Tip Section */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #dcfce7",
        }}
      >
        <h4
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#10b981",
            marginBottom: "8px",
          }}
        >
          💡 냉장고 보관 TIP
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>냉장칸</span> - 채소, 과일, 유제품
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>냉동칸</span> - 육류, 해산물
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>야채칸</span> - 신선한 채소 보관
          </div>
        </div>
      </div>
    </div>
  );
}
