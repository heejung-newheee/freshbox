import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon, PlusIcon } from "@/assets/icons";
import { IconLeaf } from "@/components/ui/icons";
import { Avatar } from "@/components/common";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthStore } from "@/stores/authStore";

interface HeaderProps {
  title: string;
  urgentCount?: number;
  onAddItem?: () => void;
}

export function Header({ title, urgentCount = 0, onAddItem }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const hasUnread = urgentCount > readCount;
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();
  const { user, signOut } = useAuthStore();

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleBellClick = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) setReadCount(urgentCount);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: 모바일은 로고(홈 이동), 데스크톱은 페이지 타이틀 */}
        {isMobile ? (
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          >
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
              <IconLeaf size={16} className="text-white" />
            </div>
            <span className="text-[17px] font-black text-stone-900 tracking-tight">
              FreshBox
            </span>
          </button>
        ) : (
          <h1 className="text-lg font-bold">{title}</h1>
        )}

        <div className="flex items-center gap-2 md:gap-4">
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

          {/* 재료 추가 — 데스크톱 전용 (모바일은 FAB) */}
          {!isMobile && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-1.5 bg-emerald-500 text-white border-none px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-emerald-600 transition-colors"
            >
              <PlusIcon s={16} c="#fff" />
              재료 추가
            </button>
          )}

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="bg-transparent border-none cursor-pointer p-0"
            >
              <Avatar name={userInitial} color="#10b981" size="md" />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md min-w-48 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[12px] text-gray-400">로그인 계정</p>
                  <p className="text-[13px] font-semibold text-gray-700 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-[13px] text-red-500 font-semibold hover:bg-red-50 transition-colors rounded-b-xl cursor-pointer bg-transparent border-none"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
