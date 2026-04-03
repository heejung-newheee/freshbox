import type { FoodItem } from "@/@types";
import { Stat } from "@/components/common";
import { CategoryBreakdown } from "@/components/features";
import { getDday } from "@/utils";

interface DashboardProps {
  items: FoodItem[];
}

export function Dashboard({ items }: DashboardProps) {
  const active = items.filter((i) => !i.consumed);
  const urgentCount = active.filter((i) => getDday(i.expiry) <= 3).length;
  const expiredCount = active.filter((i) => getDday(i.expiry) < 0).length;
  const wellStockedCount = active.filter((i) => getDday(i.expiry) > 7).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Alert Banner */}
      {urgentCount > 0 && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            border: "1px solid #fcd34d",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "13px",
                color: "#92400e",
                marginBottom: "4px",
              }}
            >
              유통기한 임박 알림
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#b45309",
              }}
            >
              시금치, 우육 등 3개 식품을 먼저 소비하세요.
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        <Stat
          icon="🛒"
          value={active.length}
          label="전체 재고"
          sublabel="보관 중인 식품"
        />
        <Stat
          icon="🔥"
          value={urgentCount}
          label={`임박 (3일 이내)`}
          sublabel={`빨른 소비 필요`}
        />
        <Stat
          icon="❄️"
          value={wellStockedCount}
          label="냉장 보관"
          sublabel="3개 냉동"
        />
        <Stat
          icon="🗑️"
          value={expiredCount}
          label="유통 만료"
          sublabel="폐기 필요"
        />
      </div>

      {/* Grid Layout */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Urgent Foods */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}
          >
            🔥 임박 식품
          </h3>
          {urgentCount === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              임박한 식품이 없습니다.
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {active
                .filter((i) => getDday(i.expiry) <= 3 && getDday(i.expiry) >= 0)
                .slice(0, 5)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#fee2e2",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#dc2626",
                    }}
                  >
                    {item.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}
          >
            카테고리 현황
          </h3>
          <CategoryBreakdown items={items} />
        </div>
      </div>
    </div>
  );
}
