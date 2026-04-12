import type { FoodItem } from "@/@types";
import { Header, Sidebar } from "@/components/layout";
import { AddModal } from "@/components/modal";
import * as api from "@/services/api";
import { getDday } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const pageTitle = {
  "/": "대시보드",
  "/inventory": "재고 목록",
  "/fridge": "냉장고 맵",
  "/meal": "식단 플래너",
  "/share": "공유 관리",
};

export default function MainLayout() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  // 식품 목록 조회
  const { data: items = [] } = useQuery({
    queryKey: ["foodItems"],
    queryFn: api.getFoodItems,
  });

  // 식품 추가 mutation
  const addItemMutation = useMutation({
    mutationFn: api.addFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
  });

  const active = items.filter((i) => !i.consumed);
  const urgentCount = active.filter((i) => getDday(i.expiry) <= 3).length;

  const title =
    pageTitle[location.pathname as keyof typeof pageTitle] || "FreshBox";

  const handleAddItem = async (formData: Omit<FoodItem, "id" | "consumed">) => {
    try {
      await addItemMutation.mutateAsync(formData);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("재료 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily:
          "'Apple SD Gothic Neo','Noto Sans KR','Segoe UI', sans-serif",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        itemCount={active.length}
      />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "228px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Header
          title={title}
          urgentCount={urgentCount}
          onAddItem={() => setShowAddModal(true)}
        />

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <Outlet
            context={{
              items,
              urgentCount,
            }}
          />
        </div>
      </main>

      {/* Status Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 16px",
          backgroundColor: "#fef3c7",
          borderTop: "1px solid #fcd34d",
          fontSize: "12px",
          color: "#92400e",
          textAlign: "center",
          display: addItemMutation.isPending ? "block" : "none",
        }}
      >
        {addItemMutation.isPending ? "재료를 추가 중입니다..." : ""}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}
