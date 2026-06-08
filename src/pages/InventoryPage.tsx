import type { FoodItem } from "@/@types";
import { CATEGORIES, CAT_COLORS } from "@/constants/constants";
import { cn, ddayMeta, getDday } from "@/utils/utils";
import { useState, useRef, useEffect } from "react";
import { AddModal, EditModal } from "@/components/modal";
import { useFoodItems, useConsumeItem, useAddItem, useUpdateItem } from "@/hooks/useFoodItems";
import { useAuthStore } from "@/stores/authStore";
import { useFridgeSettings } from "@/hooks/useFridgeSettings";

const COLS = "grid-cols-[80px_1fr_80px_60px_100px_100px_70px_80px]";

export function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const { items } = useFoodItems();
  const consumeMutation = useConsumeItem();
  const addMutation = useAddItem(() => setShowModal(false));
  const updateMutation = useUpdateItem(() => setEditingItem(null));
  const onConsume = (id: string) => consumeMutation.mutate(id);
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "owner" || role === "editor";
  const { data: settings } = useFridgeSettings();
  const hasKimchi = settings?.has_kimchi_fridge ?? false;
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<"" | "냉장" | "냉동" | "김치냉장고">("");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState<"expiry" | "newest" | "oldest" | "alpha">("expiry");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  const SORT_OPTIONS: { value: typeof sort; label: string }[] = [
    { value: "expiry", label: "유통기한 임박순" },
    { value: "newest", label: "최근 추가순" },
    { value: "oldest", label: "오래된순" },
    { value: "alpha", label: "가나다순" },
  ];

  const active = items.filter((i) => !i.consumed);

  let filtered = active;
  if (search) filtered = filtered.filter((i) => i.name.includes(search));
  if (location) filtered = filtered.filter((i) => i.location === location);
  if (category !== "전체") filtered = filtered.filter((i) => i.category === category);

  filtered = [...filtered].sort((a, b) => {
    if (sort === "expiry") return a.expiry.localeCompare(b.expiry);
    if (sort === "newest") return b.bought.localeCompare(a.bought);
    if (sort === "oldest") return a.bought.localeCompare(b.bought);
    return a.name.localeCompare(b.name, "ko");
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Search + Location filter row */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="식품 검색..."
              className="flex-1 border-none bg-transparent text-[13px] text-gray-700 outline-none"
            />
          </div>

          {/* 정렬 */}
          <div ref={sortRef} className="relative shrink-0">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap",
                sort !== "expiry"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
              )}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="4" y1="8" x2="12" y2="8" />
                <line x1="6" y1="12" x2="10" y2="12" />
              </svg>
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-36">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSort(o.value); setSortOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                      sort === o.value
                        ? "font-bold text-emerald-600 bg-emerald-50"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {(["", "냉장", "냉동", ...(hasKimchi ? (["김치냉장고"] as const) : [])] as Array<"" | "냉장" | "냉동" | "김치냉장고">).map((loc) => {
            const label =
              loc === ""
                ? "전체"
                : loc === "냉장"
                  ? "❄️ 냉장"
                  : loc === "냉동"
                    ? "🧊 냉동"
                    : "🥬 김치냉장고";
            return (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={cn(
                  "px-3.5 py-2 rounded-lg border text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors",
                  location === loc
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {["전체", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-colors",
                category === cat
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Desktop Header */}
          <div
            className={`hidden md:grid ${COLS} px-5 py-2.5 bg-gray-50 border-b border-gray-200`}
          >
            {[
              "D-DAY",
              "식품명",
              "위치",
              "구역",
              "구매일",
              "유통기한",
              "수량",
              "",
            ].map((h) => (
              <div
                key={h}
                className="text-[11px] font-bold text-gray-400 tracking-wide"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-[13px]">
              해당하는 식품이 없습니다
            </div>
          ) : (
            filtered.map((item) => {
              const d = getDday(item.expiry);
              const m = ddayMeta(d);

              const catCls =
                CAT_COLORS[item.category] ?? "bg-stone-100 text-stone-500";

              const [catBg, catText] = catCls.split(" ");

              const catBgHex = catBg.includes("red")
                ? "#fee2e2"
                : catBg.includes("green")
                  ? "#dcfce7"
                  : catBg.includes("blue")
                    ? "#dbeafe"
                    : catBg.includes("yellow")
                      ? "#fef9c3"
                      : catBg.includes("purple")
                        ? "#f3e8ff"
                        : catBg.includes("orange")
                          ? "#ffedd5"
                          : catBg.includes("cyan")
                            ? "#cffafe"
                            : "#f3f4f6";

              const catTextHex = catText.includes("red")
                ? "#ef4444"
                : catText.includes("green")
                  ? "#16a34a"
                  : catText.includes("blue")
                    ? "#3b82f6"
                    : catText.includes("yellow")
                      ? "#ca8a04"
                      : catText.includes("purple")
                        ? "#9333ea"
                        : catText.includes("orange")
                          ? "#ea580c"
                          : catText.includes("cyan")
                            ? "#0891b2"
                            : "#6b7280";

              return (
                <div
                  key={item.id}
                  className={`border-b border-gray-100 last:border-0 p-4 md:grid ${COLS} md:px-5 md:py-3 md:items-center`}
                >
                  {/* 모바일 / 태블릿 */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {/* 상단 */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn("text-[14px] font-bold text-stone-900 truncate", canEdit && "cursor-pointer hover:text-emerald-600 transition-colors")}
                          onClick={() => canEdit && setEditingItem(item)}
                        >
                          {item.name}
                        </div>
                        <span
                          className="text-[11px] font-semibold rounded px-1.5 py-0.5 shrink-0"
                          style={{ color: catTextHex, background: catBgHex }}
                        >
                          {item.category}
                        </span>
                      </div>

                      <span
                        className="text-[12px] font-bold rounded-full px-2.5 py-0.5 border whitespace-nowrap shrink-0"
                        style={{
                          color: m.color,
                          background: m.bg,
                          borderColor: m.border,
                        }}
                      >
                        {m.label}
                      </span>
                    </div>

                    {/* 정보 — 2열 */}
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 shrink-0">위치</span>
                        <span className="font-semibold text-emerald-500">
                          {item.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 shrink-0">구역</span>
                        <span className="text-gray-700">
                          {item.zone ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 shrink-0">구매일</span>
                        <span className="text-gray-700">{item.bought}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 shrink-0">유통기한</span>
                        <span className="text-gray-700">{item.expiry}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 shrink-0">수량</span>
                        <span className="font-semibold text-gray-700">
                          {item.quantity}
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* 버튼 */}
                    {canEdit && (
                      <button
                        onClick={() => onConsume?.(item.id)}
                        className="w-full px-3 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-500 text-[12px] font-bold cursor-pointer flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
                      >
                        ✓ 소비
                      </button>
                    )}
                  </div>

                  {/* Desktop */}
                  <>
                    {/* D-DAY */}
                    <div className="hidden md:block">
                      <span
                        className="text-[12px] font-bold rounded-full px-2.5 py-0.5 border"
                        style={{
                          color: m.color,
                          background: m.bg,
                          borderColor: m.border,
                        }}
                      >
                        {m.label}
                      </span>
                    </div>

                    {/* 식품명 */}
                    <div className="hidden md:flex items-center gap-2">
                      <div
                        className={cn("text-[13px] font-bold text-stone-900", canEdit && "cursor-pointer hover:text-emerald-600 transition-colors")}
                        onClick={() => canEdit && setEditingItem(item)}
                      >
                        {item.name}
                      </div>
                      <span
                        className="text-[11px] font-semibold rounded px-1.5 py-0.5 shrink-0"
                        style={{ color: catTextHex, background: catBgHex }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* 위치 */}
                    <div className="hidden md:block text-[13px] font-semibold text-emerald-500">
                      {item.location}
                    </div>

                    {/* 구역 */}
                    <div className="hidden md:block text-[12px] text-gray-500">
                      {item.zone ?? "-"}
                    </div>

                    {/* 구매일 */}
                    <div className="hidden md:block text-[12px] text-gray-500">
                      {item.bought}
                    </div>

                    {/* 유통기한 */}
                    <div className="hidden md:block text-[12px] text-gray-500">
                      {item.expiry}
                    </div>

                    {/* 수량 */}
                    <div className="hidden md:block text-[13px] font-semibold text-gray-700">
                      {item.quantity}
                      {item.unit}
                    </div>

                    {/* 버튼 */}
                    <div className="hidden md:block">
                      {canEdit && (
                        <button
                          onClick={() => onConsume?.(item.id)}
                          className="px-3 py-1 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-500 text-[12px] font-bold cursor-pointer flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                        >
                          ✓ 소비
                        </button>
                      )}
                    </div>
                  </>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdd={(formData: Omit<FoodItem, "id" | "consumed">) =>
            addMutation.mutate(formData)
          }
        />
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(id, formData) => updateMutation.mutate({ id, item: formData })}
        />
      )}
    </>
  );
}
