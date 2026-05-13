import { useState, useRef, useEffect } from "react";
import { BellIcon, SearchIcon, PlusIcon } from "@/assets/icons";
import { IconLeaf } from "@/components/ui/icons";
import { Avatar } from "@/components/common";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface HeaderProps {
  title: string;
  urgentCount?: number;
  onAddItem?: () => void;
}

export function Header({ title, urgentCount = 0, onAddItem }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const hasUnread = urgentCount > readCount;

  const handleBellClick = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) setReadCount(urgentCount);
  };
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      {/* Main row */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: logo on mobile, page title on desktop */}
        {isMobile ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
              <IconLeaf size={16} className="text-white" />
            </div>
            <span className="text-[17px] font-black text-stone-900 tracking-tight">
              FreshBox
            </span>
          </div>
        ) : (
          <h1 className="text-lg font-bold">{title}</h1>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          {/* Search icon (mobile toggle) / input (desktop) */}
          {/* {isMobile ? (
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="bg-transparent border-none cursor-pointer p-2"
            >
              <SearchIcon s={18} c={searchOpen ? "#10b981" : "#6b7280"} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 pl-3 rounded-md flex-[0_1_200px]">
              <SearchIcon s={16} c="#9ca3af" />
              <input
                type="text"
                placeholder="검색..."
                className="flex-1 border-none bg-transparent py-2 px-3 text-[13px] outline-none"
              />
            </div>
          )} */}

          {/* Notification */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className="relative bg-transparent border-none cursor-pointer p-2"
            >
              <BellIcon s={18} c="#6b7280" />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {urgentCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg min-w-62.5 mt-2 shadow-md">
                <div className="px-3 py-3 border-b border-gray-200 text-xs font-semibold">
                  알림
                </div>
                <div className="p-3 text-xs">
                  {urgentCount > 0 ? (
                    <div className="text-gray-500">
                      곧 만료될 식품이 {urgentCount}개 있습니다.
                    </div>
                  ) : (
                    <div className="text-gray-400">알림이 없습니다.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Button — desktop only (mobile uses FAB) */}
          {!isMobile && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-1.5 bg-emerald-500 text-white border-none px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon s={16} c="#fff" />
              재료 추가
            </button>
          )}

          {/* Avatar */}
          <Avatar name="H" color="#10b981" size="md" />
        </div>
      </div>

      {/* Search expansion row — mobile only */}
      {isMobile && searchOpen && (
        <div className="px-4 pb-3" ref={searchRef}>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2.5 rounded-xl">
            <SearchIcon s={14} c="#9ca3af" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="식품 검색..."
              className="flex-1 border-none bg-transparent text-[13px] text-gray-700 outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
