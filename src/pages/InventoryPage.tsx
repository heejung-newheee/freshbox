import { useState } from "react";
import { FoodList } from "@/components/features";
import type { FoodItem } from "@/@types";

interface InventoryProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

const CATEGORIES = [
  "전체",
  "채소",
  "육류",
  "해산물",
  "유제품",
  "가공식품",
  "기타",
];
const LOCATIONS = ["냉장칸", "냉동칸", "야채칸"];

export function Inventory({ items, onConsume }: InventoryProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLocation, setSelectedLocation] = useState("");

  let filtered = items;
  if (selectedCategory !== "전체") {
    filtered = filtered.filter((i) => i.category === selectedCategory);
  }
  if (selectedLocation) {
    filtered = filtered.filter((i) => i.location === selectedLocation);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          backgroundColor: "#fff",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          flexWrap: "wrap",
        }}
      >
        {/* Category Filter */}
        <div style={{ display: "flex", gap: "8px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 12px",
                backgroundColor:
                  selectedCategory === cat ? "#10b981" : "#f3f4f6",
                color: selectedCategory === cat ? "#fff" : "#1f2937",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Filter */}
        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() =>
                setSelectedLocation(selectedLocation === loc ? "" : loc)
              }
              style={{
                padding: "6px 12px",
                backgroundColor:
                  selectedLocation === loc ? "#3b82f6" : "#f3f4f6",
                color: selectedLocation === loc ? "#fff" : "#1f2937",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Food List */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <FoodList items={filtered} onConsume={onConsume} />
      </div>
    </div>
  );
}
