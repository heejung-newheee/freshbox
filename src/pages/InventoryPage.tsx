import { useState } from "react";
import type { FoodItem } from "@/@types";
import { CATEGORIES, CAT_COLORS } from "@/constants/constants";
import { ddayMeta, getDday } from "@/utils/utils";

interface InventoryProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
  onAddItem?: () => void;
}

export function Inventory({ items, onConsume, onAddItem }: InventoryProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<"" | "냉장" | "냉동">("");
  const [category, setCategory] = useState("전체");

  const active = items.filter((i) => !i.consumed);

  let filtered = active;
  if (search) filtered = filtered.filter((i) => i.name.includes(search));
  if (location) filtered = filtered.filter((i) => i.location === location);
  if (category !== "전체") filtered = filtered.filter((i) => i.category === category);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search + Location filter row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px" }}>
          <span style={{ color: "#9ca3af", fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="식품 검색..."
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#374151", outline: "none" }}
          />
        </div>
        {(["", "냉장", "냉동"] as const).map((loc) => {
          const label = loc === "" ? "전체" : loc === "냉장" ? "❄️ 냉장" : "🧊 냉동";
          return (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              style={{
                padding: "8px 14px", borderRadius: 8, border: `1px solid ${location === loc ? "#10b981" : "#e5e7eb"}`,
                background: location === loc ? "#ecfdf5" : "#fff",
                color: location === loc ? "#059669" : "#6b7280",
                fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={onAddItem}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}
        >
          + 재료추가
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["전체", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: `1px solid ${category === cat ? "#10b981" : "#e5e7eb"}`,
              background: category === cat ? "#10b981" : "#fff",
              color: category === cat ? "#fff" : "#6b7280",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 70px 70px 110px 110px 80px 80px", padding: "10px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          {["D-DAY", "식품명", "위치", "구역", "구매일", "유통기한", "수량", ""].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            해당하는 식품이 없습니다
          </div>
        ) : (
          filtered.map((item) => {
            const d = getDday(item.expiry);
            const m = ddayMeta(d);
            const catCls = CAT_COLORS[item.category] ?? "bg-stone-100 text-stone-500";
            const [catBg, catText] = catCls.split(" ");
            const catBgHex = catBg.includes("red") ? "#fee2e2" : catBg.includes("green") ? "#dcfce7" : catBg.includes("blue") ? "#dbeafe" : catBg.includes("yellow") ? "#fef9c3" : catBg.includes("purple") ? "#f3e8ff" : catBg.includes("orange") ? "#ffedd5" : catBg.includes("cyan") ? "#cffafe" : "#f3f4f6";
            const catTextHex = catText.includes("red") ? "#ef4444" : catText.includes("green") ? "#16a34a" : catText.includes("blue") ? "#3b82f6" : catText.includes("yellow") ? "#ca8a04" : catText.includes("purple") ? "#9333ea" : catText.includes("orange") ? "#ea580c" : catText.includes("cyan") ? "#0891b2" : "#6b7280";

            return (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 70px 70px 110px 110px 80px 80px", padding: "12px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                {/* D-DAY */}
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "3px 10px" }}>
                    {m.label}
                  </span>
                </div>
                {/* 식품명 */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{item.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: catTextHex, background: catBgHex, borderRadius: 4, padding: "1px 6px", marginTop: 2, display: "inline-block" }}>
                    {item.category}
                  </span>
                </div>
                {/* 위치 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>{item.location}</div>
                {/* 구역 */}
                <div style={{ fontSize: 12, color: "#6b7280" }}>{item.zone ?? "-"}</div>
                {/* 구매일 */}
                <div style={{ fontSize: 12, color: "#6b7280" }}>{item.bought}</div>
                {/* 유통기한 */}
                <div style={{ fontSize: 12, color: "#6b7280" }}>{item.expiry}</div>
                {/* 수량 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                  {item.quantity}{item.unit}
                </div>
                {/* 소비 버튼 */}
                <div>
                  <button
                    onClick={() => onConsume?.(item.id)}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d1fae5", background: "#f0fdf4", color: "#10b981", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    ✓ 소비
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
