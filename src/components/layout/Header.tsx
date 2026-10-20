import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon, PlusIcon } from "@/assets/icons";
import { IconLeaf, IconSettings } from "@/components/ui/icons";
import { Avatar, Button } from "@/components/ui";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthStore } from "@/stores/authStore";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/useNotifications";
import { getDday } from "@/utils";
import { getDisplayName } from "@/utils/utils";

interface HeaderProps {
  title: string;
  onAddItem?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}

function expiryMessage(expiry: string) {
  const d = getDday(expiry);
  if (d < 0) return "유통기한이 지났어요";
  if (d === 0) return "유통기한이 오늘까지예요";
  if (d === 1) return "유통기한이 내일까지예요";
  return `유통기한이 ${d}일 남았어요`;
}

export function Header({ title, onAddItem, onSettingsClick, onProfileClick }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();
  const { user, signOut } = useAuthStore();

  const displayName = getDisplayName(user);
  const userInitial = displayName[0]?.toUpperCase() ?? "?";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
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
      <div className="px-3 md:px-6 py-3 flex items-center justify-between">
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
              onClick={() => setNotifOpen((o) => !o)}
              className="relative bg-transparent border-none cursor-pointer p-2"
            >
              <BellIcon s={18} c="#6b7280" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg w-72 mt-2 shadow-md">
                <div className="px-3 py-3 border-b border-gray-200 text-xs font-semibold flex items-center justify-between">
                  알림
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={() => markRead.mutate(notifications.map((n) => n.id))}
                        className="bg-transparent border-none cursor-pointer p-0 text-[11px] font-semibold text-emerald-600"
                      >
                        모두 확인
                      </button>
                    )}
                    {onSettingsClick && (
                      <button
                        onClick={() => { setNotifOpen(false); onSettingsClick(); }}
                        title="설정"
                        className="bg-transparent border-none cursor-pointer p-0 text-gray-400 hover:text-gray-600 flex"
                      >
                        <IconSettings size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead.mutate([n.id])}
                        className="w-full text-left px-3 py-2.5 border-none border-b border-gray-100 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800 truncate">{n.food_item.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{expiryMessage(n.food_item.expiry)}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-400">알림이 없습니다.</div>
                )}
              </div>
            )}
          </div>

          {/* 재료 추가 — 데스크톱 전용 (모바일은 FAB) */}
          {!isMobile && onAddItem && (
            <Button onClick={onAddItem}>
              <PlusIcon s={16} c="#fff" />
              재료 추가
            </Button>
          )}

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="bg-transparent border-none cursor-pointer p-0 flex"
            >
              <Avatar name={userInitial} color="#10b981" size="md" src={user?.user_metadata?.avatar_url || undefined} />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-md min-w-48 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-700 truncate">
                    {displayName}
                  </p>
                  <p className="text-[12px] text-gray-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                {onProfileClick && (
                  <button
                    onClick={() => { setUserMenuOpen(false); onProfileClick(); }}
                    className="w-full text-left px-4 py-3 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none border-b border-gray-100"
                  >
                    내 프로필
                  </button>
                )}
                {onSettingsClick && (
                  <button
                    onClick={() => { setUserMenuOpen(false); onSettingsClick(); }}
                    className="w-full text-left px-4 py-3 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none border-b border-gray-100"
                  >
                    설정
                  </button>
                )}
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
