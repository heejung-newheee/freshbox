export function MealPlanner() {
  const days = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Recommendation Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
          🥘 오늘의 추천 식단
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {[
            { emoji: "🍚", name: "요기트 볶", items: "요거트 + 우육" },
            { emoji: "🥗", name: "점심 조림", items: "두부 조림" },
            { emoji: "🌙", name: "저녁", items: "냉동만두 전궁" },
          ].map((recipe) => (
            <div
              key={recipe.name}
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                {recipe.emoji}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>
                {recipe.name}
              </div>
              <div
                style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}
              >
                {recipe.items}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Plan */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
          📅 주간 식단
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
          }}
        >
          {days.map((day) => (
            <div
              key={day}
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                {day}요일
              </div>
              <div style={{ color: "#9ca3af" }}>미정</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
