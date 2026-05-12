import { useLocation, useNavigate } from "react-router-dom";
import { IconDashboard, IconBox, IconFridge, IconFork, IconShare } from "../ui/icons";
import { cn } from "../../utils/utils";

const TABS = [
  { path: "/", Icon: IconDashboard, label: "홈" },
  { path: "/inventory", Icon: IconBox, label: "재고" },
  { path: "/fridge", Icon: IconFridge, label: "맵" },
  { path: "/meal", Icon: IconFork, label: "식단" },
  { path: "/share", Icon: IconShare, label: "공유" },
] as const;

interface Props {
  urgentCount: number;
}

export function BottomTabBar({ urgentCount }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-100 flex pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ path, Icon, label }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-all active:scale-95"
          >
            {path === "/inventory" && urgentCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-14px)] w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {urgentCount}
              </span>
            )}
            <Icon
              size={22}
              className={cn("transition-colors", active ? "text-emerald-500" : "text-stone-300")}
            />
            <span
              className={cn(
                "text-[10px] font-semibold transition-colors",
                active ? "text-emerald-500" : "text-stone-400",
              )}
            >
              {label}
            </span>
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
