import { CATEGORIES, CAT_HEX } from "@/constants/constants";
import { useConsumeItem, useFoodItems } from "@/hooks/useFoodItems";
import * as api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { ddayMeta, getDday } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMealNotes, useUpdateMealNotes } from "@/hooks/useMealNotes";
import {
  useShoppingItems,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from "@/hooks/useShoppingItems";
import { useState } from "react";

const AVATAR_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

export function Dashboard() {
  const { items } = useFoodItems();
  const consumeMutation = useConsumeItem();
  const onConsume = (id: string) => consumeMutation.mutate(id);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: members = [] } = useQuery({
    queryKey: ["fridgeMembers"],
    queryFn: api.getFridgeMembers,
  });
  const { data: notes = "" } = useMealNotes();
  const updateNotes = useUpdateMealNotes();
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const notesValue = notesDraft ?? notes;
  const handleNotesSave = () => {
    if (notesDraft !== null) { updateNotes.mutate(notesDraft); setNotesDraft(null); }
  };

  const { data: shopping = [] } = useShoppingItems();
  const addShoppingItem = useAddShoppingItem();
  const toggleShoppingItem = useToggleShoppingItem();
  const deleteShoppingItem = useDeleteShoppingItem();
  const [newShoppingName, setNewShoppingName] = useState("");
  const active = items.filter((i) => !i.consumed);
  const urgentItems = active
    .filter((i) => getDday(i.expiry) >= 0 && getDday(i.expiry) <= 3)
    .sort((a, b) => getDday(a.expiry) - getDday(b.expiry));
  const expiredItems = active
    .filter((i) => getDday(i.expiry) < 0)
    .sort((a, b) => getDday(a.expiry) - getDday(b.expiry));
  const expiredCount = expiredItems.length;

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: active.filter((i) => i.category === cat).length,
  })).filter((c) => c.count > 0);
  const maxCat = Math.max(...catCounts.map((c) => c.count), 1);

  const stats = [
    { icon: "🛒", value: active.length, label: "전체 재고", sub: "보관 중인 식품", bg: "bg-green-50" },
    { icon: "⚠️", value: urgentItems.length, label: "임박 (3일 이내)", sub: "빠른 소비 필요", bg: "bg-amber-50" },
    { icon: "🗑️", value: expiredCount, label: "유통 만료", sub: "폐기 필요", bg: "bg-red-50" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Alert Banner */}
      {urgentItems.length > 0 && (
        <div className="px-4 py-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5">
          <span className="text-lg">⚠️</span>
          <span className="text-[13px] text-amber-800">
            <strong>유통기한 임박 알림</strong>{" "}
            {urgentItems.slice(0, 3).map((i) => i.name).join(", ")} 등 {urgentItems.length}개 식품을 먼저 소비하세요.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-3.5 md:p-5 flex md:block items-center gap-3">
            <div className={`w-9 h-9 md:w-[38px] md:h-[38px] rounded-xl ${s.bg} flex items-center justify-center text-base md:text-lg md:mb-3 shrink-0`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[22px] md:text-[30px] font-black text-stone-900 leading-none">{s.value}</div>
              <div className="text-[11px] md:text-[12px] text-gray-700 mt-1 font-semibold truncate">{s.label}</div>
              <div className="text-[10px] md:text-[11px] text-gray-400 mt-0.5 hidden md:block">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: urgent + expired */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent Foods */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold">🔥 임박 식품</h3>
            {urgentItems.length > 0 && (
              <span className="bg-amber-100 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {urgentItems.length}개
              </span>
            )}
          </div>
          {urgentItems.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">
              임박한 식품이 없습니다 🎉
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {urgentItems.slice(0, 5).map((item) => {
                const d = getDday(item.expiry);
                const m = ddayMeta(d);
                return (
                  <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: m.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {item.location} · {item.zone ? `${item.zone}칸` : ""} · {item.expiry}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold rounded-full px-2 py-0.5 shrink-0 border" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
                      {m.label}
                    </span>
                    <button
                      onClick={() => onConsume?.(item.id)}
                      className="w-7 h-7 rounded-lg border border-emerald-100 bg-emerald-50 flex items-center justify-center cursor-pointer shrink-0 hover:bg-emerald-100 transition-colors"
                    >
                      <span className="text-emerald-500 font-black text-[13px]">✓</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expired Foods */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold">🗑️ 만료 식품</h3>
            {expiredItems.length > 0 && (
              <span className="bg-red-100 text-red-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {expiredItems.length}개
              </span>
            )}
          </div>
          {expiredItems.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">
              만료된 식품이 없습니다 ✅
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {expiredItems.slice(0, 5).map((item) => {
                const d = getDday(item.expiry);
                const m = ddayMeta(d);
                return (
                  <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ background: m.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {item.location} · {item.zone ? `${item.zone}칸` : ""} · {item.expiry}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold rounded-full px-2 py-0.5 shrink-0 border" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
                      {Math.abs(d)}일 초과
                    </span>
                    <button
                      onClick={() => onConsume?.(item.id)}
                      className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 flex items-center justify-center cursor-pointer shrink-0 hover:bg-red-100 transition-colors"
                    >
                      <span className="text-red-400 font-black text-[13px]">✕</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Shopping + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 장보기 목록 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[14px] font-bold">🛒 장보기 목록</h3>
            {shopping.filter((s) => !s.checked).length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                {shopping.filter((s) => !s.checked).length}개 남음
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {shopping.length === 0 ? (
              <p className="text-[12px] text-gray-300 py-2">항목이 없습니다</p>
            ) : shopping.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50 group">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleShoppingItem.mutate({ id: item.id, checked: !item.checked })}
                  className="w-4 h-4 accent-emerald-500 shrink-0 cursor-pointer"
                />
                <span className={`text-[13px] flex-1 ${item.checked ? "line-through text-gray-300" : "text-gray-700"}`}>
                  {item.name}
                </span>
                <button
                  onClick={() => deleteShoppingItem.mutate(item.id)}
                  className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-[16px] leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <input
              value={newShoppingName}
              onChange={(e) => setNewShoppingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && newShoppingName.trim()) {
                  addShoppingItem.mutate({ name: newShoppingName.trim(), qty: "" });
                  setNewShoppingName("");
                }
              }}
              placeholder="항목 추가..."
              className="flex-1 text-[12px] border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              onClick={() => {
                if (!newShoppingName.trim()) return;
                addShoppingItem.mutate({ name: newShoppingName.trim(), qty: "" });
                setNewShoppingName("");
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-lg transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
          <h3 className="text-[14px] font-bold mb-3.5">📝 메모</h3>
          <div className="relative flex-1">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={handleNotesSave}
              placeholder="메모를 입력하세요..."
              className="w-full resize-none text-[13px] text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 min-h-36 leading-relaxed block"
            />
            {updateNotes.isPending && (
              <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 pointer-events-none">
                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-emerald-400 font-medium">저장 중</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-[14px] font-bold mb-4">카테고리 현황</h3>
          {catCounts.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">식품이 없습니다</div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {catCounts.map(({ cat, count }) => {
                const hex = CAT_HEX[cat] ?? "#94a3b8";
                const pct = Math.round((count / maxCat) * 100);
                return (
                  <div key={cat} onClick={() => navigate("/inventory")} className="cursor-pointer group">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-gray-700 group-hover:text-stone-900">{cat}</span>
                      <span className="text-[13px] font-bold" style={{ color: hex }}>{count}개</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-300"
                        style={{ width: `${pct}%`, background: hex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Shared Members */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-[14px] font-bold mb-3.5">공유 멤버</h3>
        <div className="flex gap-2.5 flex-wrap items-center">
          {/* 소유자 (본인) */}
          {user && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <div
                className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: "#10b98120", border: "2px solid #10b98150", color: "#10b981" }}
              >
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-700 max-w-28 truncate">{user.email}</div>
                <div className="text-[10px] text-gray-400">소유자</div>
              </div>
            </div>
          )}
          {/* 초대된 멤버 */}
          {members.map((m, idx) => {
            const color = AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length];
            const roleLabel = m.role === "editor" ? "편집자" : "열람자";
            return (
              <div key={m.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <div
                  className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{ background: color + "20", border: `2px solid ${color}50`, color }}
                >
                  {m.member_email[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-[12px] font-bold text-gray-700 max-w-28 truncate">{m.member_email}</div>
                  <div className="text-[10px] text-gray-400">{roleLabel}</div>
                </div>
              </div>
            );
          })}
          {/* 멤버 추가 버튼 */}
          <button
            onClick={() => navigate("/share")}
            className="w-11.5 h-11.5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-lg cursor-pointer hover:border-emerald-400 hover:text-emerald-400 transition-colors bg-transparent"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
