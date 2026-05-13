import type { FoodItem } from "@/@types";
import { Header, Sidebar, BottomTabBar } from "@/components/layout";
import { AddModal } from "@/components/modal";
import * as api from "@/services/api";
import { getDday } from "@/utils";
import { cn } from "@/utils/utils";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { IconPlus } from "@/components/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const pageTitle: Record<string, string> = {
  "/": "대시보드",
  "/inventory": "재고 목록",
  "/fridge": "냉장고 맵",
  "/meal": "식단 플래너",
  "/share": "공유 관리",
};

export default function MainLayout() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["foodItems"],
    queryFn: api.getFoodItems,
  });

  const addItemMutation = useMutation({
    mutationFn: api.addFoodItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["foodItems"] }),
  });

  const active = items.filter((i) => !i.consumed);
  const urgentCount = active.filter((i) => getDday(i.expiry) <= 3).length;
  const title = pageTitle[location.pathname] ?? "FreshBox";

  const handleAddItem = async (formData: Omit<FoodItem, "id" | "consumed">) => {
    try {
      await addItemMutation.mutateAsync(formData);
      setShowAddModal(false);
    } catch {
      alert("재료 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar: tablet 이상만 표시 */}
      {!isMobile && (
        <Sidebar itemCount={active.length} compact={isTablet} />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all",
          !isMobile && (isTablet ? "ml-15" : "ml-55"),
        )}
      >
        <Header
          title={title}
          urgentCount={urgentCount}
          onAddItem={() => setShowAddModal(true)}
        />

        <div className={cn("flex-1 p-4 md:p-5 lg:p-6 overflow-y-auto", isMobile && "pb-20")}>
          <Outlet context={{ items, urgentCount, onAddItem: () => setShowAddModal(true) }} />
        </div>
      </main>

      {/* Bottom Tab Bar: 모바일만 */}
      {isMobile && <BottomTabBar />}

      {/* FAB: 모바일 전용 플로팅 추가 버튼 */}
      {isMobile && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+68px)] right-4 z-50 w-13 h-13 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <IconPlus size={22} className="text-white" />
        </button>
      )}

      {/* 추가 중 상태바 */}
      {addItemMutation.isPending && (
        <div className="fixed bottom-0 left-0 right-0 py-2 px-4 bg-amber-50 border-t border-amber-300 text-xs text-amber-800 text-center z-50">
          재료를 추가 중입니다...
        </div>
      )}

      {showAddModal && (
        <AddModal onClose={() => setShowAddModal(false)} onAdd={handleAddItem} />
      )}
    </div>
  );
}
