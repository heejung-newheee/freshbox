import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "../../utils/utils";
import {
  IconBox,
  IconDashboard,
  IconFork,
  IconFridge,
  IconLeaf,
  IconSettings,
  IconShare,
} from "../ui/icons";
import { ROLE_META } from "@/constants/constants";

const NAV: {
  id: string;
  path: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  label: string;
}[] = [
  { id: "dashboard", path: "/", Icon: IconDashboard, label: "대시보드" },
  { id: "inventory", path: "/inventory", Icon: IconBox, label: "재고 목록" },
  { id: "fridge", path: "/fridge", Icon: IconFridge, label: "냉장고 맵" },
  { id: "meal", path: "/meal", Icon: IconFork, label: "주간 식단 플래너" },
  { id: "share", path: "/share", Icon: IconShare, label: "공유 관리" },
];

interface Props {
  itemCount: number;
  compact?: boolean;
  onSettingsClick?: () => void;
}

export function Sidebar({ itemCount, compact = false, onSettingsClick }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { pathname } = useLocation();
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const roleLabel = role ? ROLE_META[role]?.label : "멤버";

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 bg-white border-r border-slate-100 flex flex-col z-40 transition-all",
        compact ? "w-15" : "w-55",
      )}
    >
      {/* Logo */}
      <div
        className={cn("pt-5 pb-4", compact ? "px-3" : "px-5")}
        onClick={() => navigate("/")}
      >
        <div
          className={cn(
            "flex items-center",
            compact ? "justify-center" : "gap-3",
          )}
        >
          <div className="w-10 h-10 rounded-[14px] bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
            <IconLeaf size={20} />
          </div>
          {!compact && (
            <div>
              <div className="text-[17px] font-black text-stone-900 tracking-tight leading-tight">
                FreshBox
              </div>
              <div className="text-[9px] text-slate-400 tracking-[0.12em] font-semibold mt-0.5">
                SMART FRIDGE MANAGER
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Nav */}
      <div className="flex-1 px-2 py-1 overflow-y-auto">
        {!compact && (
          <div className="text-[10px] font-bold text-slate-300 tracking-[0.12em] px-2 mb-1.5">
            MENU
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ id, path, Icon, label }) => {
            const active = pathname === path;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                title={compact ? label : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl border-none cursor-pointer text-sm text-left transition-all duration-150",
                  compact && "justify-center",
                  active
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "bg-transparent text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-700",
                )}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-emerald-500 shrink-0"
                      : "text-slate-400 shrink-0"
                  }
                />
                {!compact && (
                  <>
                    <span className="flex-1">{label}</span>
                    {path === "/inventory" && (
                      <span
                        className={cn(
                          "text-[11px] font-bold px-2 py-0.5 rounded-full",
                          active
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        {itemCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User */}
      {!compact && (
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-slate-50">
            <div
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0"
              style={{
                backgroundColor: "#10b98120",
                border: "2px solid #10b98160",
                color: "#10b981",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-700 truncate">
                {user?.email ?? ""}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{roleLabel}</div>
            </div>
            {role === "owner" && (
              <button
                onClick={onSettingsClick}
                title="설정"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                <IconSettings size={15} />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
