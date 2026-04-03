import { useState } from "react";
import type { FoodItem } from "@/@types";
import { XIcon } from "@/assets/icons";

interface AddModalProps {
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, "id" | "consumed">) => void;
}

const CATEGORIES = ["채소", "육류", "해산물", "유제품", "가공식품", "기타"];
const LOCATIONS = ["냉장칸", "냉동칸", "야채칸", "김치냉장고", "실온", "기타"];

export function AddModal({ onClose, onAdd }: AddModalProps) {
  const [form, setForm] = useState({
    name: "",
    category: "채소" as const,
    location: "냉장칸" as const,
    bought: new Date().toISOString().split("T")[0],
    expiry: "",
    quantity: 1,
    unit: "개",
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name || !form.expiry) {
      alert("식품명과 유통기한은 필수입니다");
      return;
    }

    onAdd({
      name: form.name,
      category: form.category,
      location: form.location,
      bought: form.bought,
      expiry: form.expiry,
      quantity: form.quantity,
      unit: form.unit,
    });

    setForm({
      name: "",
      category: "채소",
      location: "냉장칸",
      bought: new Date().toISOString().split("T")[0],
      expiry: "",
      quantity: 1,
      unit: "개",
    });
    onClose();
  };

  const iStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#1f2937",
    outline: "none" as const,
    background: "#f9fafb",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const lStyle = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#4b5563",
    marginBottom: "6px",
    display: "block" as const,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "28px",
          width: "440px",
          maxWidth: "92vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}
            >
              새 재료 추가
            </div>
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}
            >
              냉장고에 보관할 식품을 등록하세요
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <XIcon s={14} c="#6b7280" />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 식품명 */}
          <div>
            <label style={lStyle}>식품명 *</label>
            <input
              type="text"
              style={iStyle}
              placeholder="예: 브로콜리"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* 카테고리 & 위치 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={lStyle}>카테고리</label>
              <select
                style={iStyle}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lStyle}>보관 위치</label>
              <select
                style={iStyle}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 수량 & 단위 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={lStyle}>수량</label>
              <input
                type="number"
                style={iStyle}
                min="1"
                value={form.quantity}
                onChange={(e) => set("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label style={lStyle}>단위</label>
              <input
                type="text"
                style={iStyle}
                placeholder="개"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
          </div>

          {/* 구매일 & 유통기한 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={lStyle}>구매일</label>
              <input
                type="date"
                style={iStyle}
                value={form.bought}
                onChange={(e) => set("bought", e.target.value)}
              />
            </div>
            <div>
              <label style={lStyle}>유통기한 *</label>
              <input
                type="date"
                style={iStyle}
                value={form.expiry}
                onChange={(e) => set("expiry", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: "#6b7280",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#f9fafb";
            }}
          >
            취소
          </button>
          <button
            onClick={handleAdd}
            style={{
              flex: 1.5,
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: "#10b981",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#059669";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#10b981";
            }}
          >
            재료 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
