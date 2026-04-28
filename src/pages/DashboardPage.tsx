import type { FoodItem } from "@/@types";
import { CATEGORIES, CAT_HEX, MEMBERS } from "@/constants/constants";
import { ddayMeta, getDday } from "@/utils/utils";

interface DashboardProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

export function Dashboard({ items, onConsume }: DashboardProps) {
  const active = items.filter((i) => !i.consumed);
  const urgentItems = active.filter(
    (i) => getDday(i.expiry) <= 3 && getDday(i.expiry) >= 0,
  );
  const expiredCount = active.filter((i) => getDday(i.expiry) < 0).length;
  const fridgeCount = active.filter((i) => i.location === "냉장").length;
  const freezerCount = active.filter((i) => i.location === "냉동").length;

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: active.filter((i) => i.category === cat).length,
  })).filter((c) => c.count > 0);
  const maxCat = Math.max(...catCounts.map((c) => c.count), 1);

  const stats = [
    { icon: "🛒", value: active.length, label: "전체 재고", sub: "보관 중인 식품", bg: "#f0fdf4" },
    { icon: "⚠️", value: urgentItems.length, label: "임박 (3일 이내)", sub: "빠른 소비 필요", bg: "#fffbeb" },
    { icon: "❄️", value: fridgeCount, label: "냉장 보관", sub: `${freezerCount}개 냉동`, bg: "#eff6ff" },
    { icon: "🗑️", value: expiredCount, label: "유통 만료", sub: "폐기 필요", bg: "#fef2f2" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Alert Banner */}
      {urgentItems.length > 0 && (
        <div style={{ padding: "14px 18px", backgroundColor: "#fffbeb", borderRadius: "12px", border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: "13px", color: "#92400e" }}>
            <strong>유통기한 임박 알림</strong>{" "}
            {urgentItems.slice(0, 3).map((i) => i.name).join(", ")} 등 {urgentItems.length}개 식품을 먼저 소비하세요.
          </span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#1c1917", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#374151", marginTop: 6, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid: urgent + category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Urgent Foods */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>🔥 임박 식품</h3>
            {urgentItems.length > 0 && (
              <span style={{ background: "#fee2e2", color: "#ef4444", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                {urgentItems.length}개
              </span>
            )}
          </div>
          {urgentItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 12 }}>
              임박한 식품이 없습니다 🎉
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {urgentItems.slice(0, 5).map((item) => {
                const d = getDday(item.expiry);
                const m = ddayMeta(d);
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0, display: "inline-block" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                        {item.location} · {item.zone ? `${item.zone}칸` : ""} · {item.expiry}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "2px 8px", flexShrink: 0 }}>
                      D-{d}
                    </span>
                    <button
                      onClick={() => onConsume?.(item.id)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #d1fae5", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    >
                      <span style={{ color: "#10b981", fontWeight: 900, fontSize: 13 }}>✓</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>카테고리 현황</h3>
          {catCounts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 12 }}>
              식품이 없습니다
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {catCounts.map(({ cat, count }) => {
                const hex = CAT_HEX[cat] ?? "#94a3b8";
                const pct = Math.round((count / maxCat) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{cat}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: hex }}>{count}개</span>
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: hex, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Shared Members */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>공유 멤버</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MEMBERS.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.color + "20", border: `2px solid ${m.color}50`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {m.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{m.name}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>
                  {m.role === "owner" ? "소유자" : m.role === "editor" ? "편집자" : "열람자"}
                </div>
              </div>
            </div>
          ))}
          <div style={{ width: 46, height: 46, borderRadius: "50%", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 18, cursor: "pointer", alignSelf: "center" }}>
            +
          </div>
        </div>
      </div>
    </div>
  );
}
