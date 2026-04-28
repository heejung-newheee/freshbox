import type { FoodItem } from "@/@types";
import { ZONES_냉장, ZONES_냉동 } from "@/constants/constants";
import { ddayMeta, getDday } from "@/utils/utils";

interface FridgeMapProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

function FridgeSection({
  title,
  icon,
  items,
  zones,
}: {
  title: string;
  icon: string;
  items: FoodItem[];
  zones: readonly string[];
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1c1917" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{items.length}개 보관 중</div>
        </div>
      </div>

      {/* Zones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {zones.map((zone) => {
          const zoneItems = items.filter((i) => i.zone === zone);
          return (
            <div key={zone}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 3, height: 14, background: "#10b981", borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                  {zone}칸
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>({zoneItems.length})</span>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 12px", minHeight: 44, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {zoneItems.length === 0 ? (
                  <span style={{ fontSize: 12, color: "#d1d5db" }}>비어있음</span>
                ) : (
                  zoneItems.map((item) => {
                    const d = getDday(item.expiry);
                    const m = ddayMeta(d);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 20,
                          border: `1px solid ${m.border}`, background: "#fff",
                          fontSize: 12, cursor: "default",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontWeight: 600, color: "#374151" }}>{item.name}</span>
                        <span style={{ fontWeight: 700, color: m.color }}>D-{d}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FridgeMap({ items }: FridgeMapProps) {
  const active = items.filter((i) => !i.consumed);
  const fridgeItems = active.filter((i) => i.location === "냉장");
  const freezerItems = active.filter((i) => i.location === "냉동");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <FridgeSection title="냉장칸" icon="❄️" items={fridgeItems} zones={ZONES_냉장} />
      <FridgeSection title="냉동칸" icon="🧊" items={freezerItems} zones={ZONES_냉동} />
    </div>
  );
}
