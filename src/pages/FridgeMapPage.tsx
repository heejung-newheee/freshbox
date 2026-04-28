import type { FoodItem } from "@/@types";
import { FridgeMap } from "@/components/features";

interface FridgeMapPageProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

const TIPS = [
  { icon: "🧊", title: "냉동칸", desc: "육류·해산물은 소분 후 냉동 보관하면 신선도가 오래 유지됩니다." },
  { icon: "🥬", title: "야채칸", desc: "채소는 신문지나 키친타월로 감싸면 수분 유지에 효과적입니다." },
  { icon: "🚪", title: "도어칸", desc: "온도 변화가 잦은 도어칸은 소스류·조미료 보관에 적합합니다." },
];

export function FridgeMapPage({ items, onConsume }: FridgeMapPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FridgeMap items={items} onConsume={onConsume} />

      {/* TIP Section */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d", marginBottom: 14 }}>
          💡 냉장고 보관 TIP
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {TIPS.map((tip) => (
            <div key={tip.title} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #dcfce7" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{tip.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
