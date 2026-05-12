import { CATEGORIES, CAT_HEX, MEMBERS } from "@/constants/constants";
import { ddayMeta, getDday } from "@/utils/utils";
import { useFoodItems, useConsumeItem } from "@/hooks/useFoodItems";

export function Dashboard() {
  const { items } = useFoodItems();
  const consumeMutation = useConsumeItem();
  const onConsume = (id: string) => consumeMutation.mutate(id);
  const active = items.filter((i) => !i.consumed);
  const urgentItems = active.filter(
    (i) => getDday(i.expiry) <= 3 && getDday(i.expiry) >= 0,
  );
  const expiredCount = active.filter((i) => getDday(i.expiry) < 0).length;
  const fridgeCount = active.filter((i) => i.location === "냉장").length;
  const freezerCount = active.filter((i) => i.location === "냉동").length;

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: active.filter((i) => i.category === cat).length,
  })).filter((c) => c.count > 0);
  const maxCat = Math.max(...catCounts.map((c) => c.count), 1);

  const stats = [
    { icon: "🛒", value: active.length, label: "전체 재고", sub: "보관 중인 식품", bg: "bg-green-50" },
    { icon: "⚠️", value: urgentItems.length, label: "임박 (3일 이내)", sub: "빠른 소비 필요", bg: "bg-amber-50" },
    { icon: "❄️", value: fridgeCount, label: "냉장 보관", sub: `${freezerCount}개 냉동`, bg: "bg-blue-50" },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className={`w-[38px] h-[38px] rounded-xl ${s.bg} flex items-center justify-center text-lg mb-3`}>
              {s.icon}
            </div>
            <div className="text-[30px] font-black text-stone-900 leading-none">{s.value}</div>
            <div className="text-[12px] text-gray-700 mt-1.5 font-semibold">{s.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid: urgent + category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent Foods */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold">🔥 임박 식품</h3>
            {urgentItems.length > 0 && (
              <span className="bg-red-100 text-red-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
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
                    <span
                      className="w-2 h-2 rounded-full shrink-0 inline-block"
                      style={{ background: m.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {item.location} · {item.zone ? `${item.zone}칸` : ""} · {item.expiry}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-bold rounded-full px-2 py-0.5 shrink-0 border"
                      style={{ color: m.color, background: m.bg, borderColor: m.border }}
                    >
                      D-{d}
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
                  <div key={cat}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-gray-700">{cat}</span>
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
      </div>

      {/* Shared Members */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-[14px] font-bold mb-3.5">공유 멤버</h3>
        <div className="flex gap-2.5 flex-wrap">
          {MEMBERS.map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: m.color + "20", border: `2px solid ${m.color}50`, color: m.color }}
              >
                {m.name[0]}
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-700">{m.name}</div>
                <div className="text-[10px] text-gray-400">
                  {m.role === "owner" ? "소유자" : m.role === "editor" ? "편집자" : "열람자"}
                </div>
              </div>
            </div>
          ))}
          <div className="w-[46px] h-[46px] rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-lg cursor-pointer self-center hover:border-gray-400 transition-colors">
            +
          </div>
        </div>
      </div>
    </div>
  );
}
