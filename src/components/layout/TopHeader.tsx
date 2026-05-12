import { useState } from "react";
import type { FoodItem } from "../../@types/types";
import { MEMBERS } from "../../constants/constants";
import { getDday, getDdayMeta, cn } from "../../utils/utils";
import { Avatar, DdayBadge, PrimaryButton } from "../ui/ui-components";
import { IconBell, IconPlus } from "../ui/icons";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "대시보드",
  inventory: "재고 목록",
  fridge: "냉장고 맵",
  meal: "식단 플래너",
  share: "공유 관리",
};

interface Props {
  tab: string;
  items: FoodItem[];
  onAddClick: () => void;
  isMobile: boolean;
}

export function TopHeader({ tab, items, onAddClick, isMobile }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const urgent = items.filter((i) => !i.consumed && getDday(i.expiry) <= 3);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-100 h-16 md:h-14 flex items-center px-4 md:px-8 gap-4">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-black text-stone-900 tracking-tight">
          {PAGE_TITLES[tab]}
        </h1>
      </div>

      {/* Notification button */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((p) => !p)}
          className="relative w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-colors"
        >
          <IconBell size={18} />
          {urgent.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          )}
        </button>

        {/* Notification dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white border border-stone-100 rounded-2xl shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
              <p className="text-sm font-bold text-stone-800">알림</p>
            </div>
            {urgent.length === 0 ? (
              <div className="px-4 py-8 text-center text-stone-400 text-sm">
                새 알림이 없어요 ✨
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {urgent.slice(0, 5).map((item, idx) => {
                  const meta = getDdayMeta(getDday(item.expiry));
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "px-4 py-3 flex items-center gap-3 hover:bg-stone-50 transition-colors",
                        idx < urgent.length - 1
                          ? "border-b border-stone-50"
                          : "",
                      )}
                    >
                      <DdayBadge meta={meta} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          유통기한: {item.expiry}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {urgent.length > 5 && (
                  <div className="px-4 py-2.5 text-center text-xs text-stone-400 border-t border-stone-50">
                    외 {urgent.length - 5}개 더 있어요
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add button (hidden on mobile) */}
      {!isMobile && (
        <PrimaryButton onClick={onAddClick} className="shrink-0">
          <IconPlus size={16} />
          재료 추가
        </PrimaryButton>
      )}

      {/* Member avatars (desktop) */}
      {!isMobile && (
        <div className="flex items-center -space-x-1.5 ml-2">
          {MEMBERS.slice(0, 3).map((m, i) => (
            <div key={m.id} className={i === 0 ? "z-3" : i === 1 ? "z-2" : "z-1"}>
              <Avatar name={m.name} color={m.color} size="sm" />
            </div>
          ))}
          {MEMBERS.length > 3 && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-stone-200 text-stone-600">
              +{MEMBERS.length - 3}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
