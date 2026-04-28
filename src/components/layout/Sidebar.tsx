import { useLocation, useNavigate } from "react-router-dom";
import { MEMBERS } from "../../constants/constants";
import { cn } from "../../utils/utils";
import {
  IconBox,
  IconDashboard,
  IconFork,
  IconFridge,
  IconLeaf,
  IconShare,
} from "../ui/icons";
import { Avatar } from "../ui/ui-components";

const NAV: {
  id: string;
  path: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  label: string;
}[] = [
  { id: "dashboard", path: "/", Icon: IconDashboard, label: "대시보드" },
  { id: "inventory", path: "/inventory", Icon: IconBox, label: "재고 목록" },
  { id: "fridge", path: "/fridge", Icon: IconFridge, label: "냉장고 맵" },
  { id: "meal", path: "/meal", Icon: IconFork, label: "식단 플래너" },
  { id: "share", path: "/share", Icon: IconShare, label: "공유 관리" },
];

interface Props {
  itemCount: number;
}

export function Sidebar({ itemCount }: Props) {
  const navigate = useNavigate();
  const me = MEMBERS[0];
  const { pathname } = useLocation();
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-white border-r border-stone-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
            <IconLeaf size={18} />
          </div>
          <div>
            <div className="text-base font-black text-stone-800 tracking-tight">
              FreshBox
            </div>
            <div className="text-[10px] text-stone-400 tracking-wider font-medium">
              SMART FRIDGE MANAGER
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1">
        <p className="text-[10px] font-bold text-stone-300 tracking-widest px-2 mb-2 mt-1">
          MENU
        </p>
        {NAV.map(({ id, path, Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all",
                active
                  ? "bg-emerald-50 text-emerald-600 font-bold"
                  : "text-stone-400 hover:bg-stone-50 font-medium",
              )}
            >
              <Icon
                size={17}
                className={active ? "text-emerald-500" : "text-stone-300"}
              />
              {label}
              {path === "/inventory" && (
                <span className="ml-auto bg-stone-100 text-stone-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-stone-100">
        <div className="flex items-center gap-2.5 px-2 py-2 bg-stone-50 rounded-xl">
          <Avatar name={me.name} color={me.color} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-stone-700 truncate">
              {me.name}
            </div>
            <div className="text-[10px] text-stone-400">소유자</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
