import type { FoodItem } from "@/@types";
import {
  ZONES_냉장,
  ZONES_냉동,
  ZONES_김치냉장고,
  ZONES_실온,
} from "@/constants/constants";
import { ddayMeta, getDday } from "@/utils/utils";
import { useFridgeSettings } from "@/hooks/useFridgeSettings";

interface FridgeMapProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

function ItemChip({ item }: { item: FoodItem }) {
  const d = getDday(item.expiry);
  const m = ddayMeta(d);
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-xs border"
      style={{ borderColor: m.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: m.color }}
      />
      <span className="font-semibold text-gray-700">{item.name}</span>
      <span className="font-bold" style={{ color: m.color }}>
        {d < 0 ? `D+${Math.abs(d)}` : d === 0 ? "D-Day" : `D-${d}`}
      </span>
    </div>
  );
}

function FridgeSection({
  title,
  icon,
  iconBg,
  items,
  zones,
  showZones,
}: {
  title: string;
  icon: string;
  iconBg: string;
  items: FoodItem[];
  zones: readonly string[];
  showZones: boolean;
}) {
  const unzoned = items.filter(
    (i) => !i.zone || !zones.includes(i.zone as string),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-[22px]`}
        >
          {icon}
        </div>
        <div>
          <div className="text-base font-black text-stone-900">{title}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {items.length}개 보관 중
          </div>
        </div>
      </div>

      {showZones ? (
        <div className="flex flex-col gap-3.5">
          {zones.map((zone) => {
            const zoneItems = items.filter((i) => i.zone === zone);
            return (
              <div key={zone}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-0.5 h-3.5 bg-emerald-500 rounded-sm" />
                  <span className="text-xs font-bold text-gray-700">
                    {zone}칸
                  </span>
                  <span className="text-[11px] text-gray-400">
                    ({zoneItems.length})
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-h-11 flex flex-wrap gap-1.5 items-center">
                  {zoneItems.length === 0 ? (
                    <span className="text-xs text-gray-300">비어있음</span>
                  ) : (
                    zoneItems.map((item) => (
                      <ItemChip key={item.id} item={item} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
          {unzoned.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-0.5 h-3.5 bg-gray-300 rounded-sm" />
                <span className="text-xs font-bold text-gray-400">
                  구역 미지정
                </span>
                <span className="text-[11px] text-gray-400">
                  ({unzoned.length})
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-h-11 flex flex-wrap gap-1.5 items-center">
                {unzoned.map((item) => (
                  <ItemChip key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-h-11 flex flex-wrap gap-1.5 items-center">
          {items.length === 0 ? (
            <span className="text-xs text-gray-300">비어있음</span>
          ) : (
            items.map((item) => <ItemChip key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  );
}

export function FridgeMap({ items }: FridgeMapProps) {
  const { data: settings } = useFridgeSettings();
  const useZones = settings?.use_zones ?? false;
  const hasKimchi = settings?.has_kimchi_fridge ?? false;
  const hasRoomTemp = settings?.has_room_temp ?? false;
  const freezerZones =
    (settings?.freezer_horizontal ?? false)
      ? (["좌", "우"] as const)
      : ZONES_냉동;

  const active = items.filter((i) => !i.consumed);
  const fridgeItems = active.filter((i) => i.location === "냉장");
  const freezerItems = active.filter((i) => i.location === "냉동");
  const kimchiItems = active.filter((i) => i.location === "김치냉장고");
  const roomTempItems = active.filter((i) => i.location === "실온");

  const sectionCount = 2 + (hasKimchi ? 1 : 0) + (hasRoomTemp ? 1 : 0);
  const cols =
    sectionCount >= 4
      ? "grid-cols-2"
      : sectionCount === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${cols} gap-5`}>
      <FridgeSection
        title="냉장칸"
        icon="❄️"
        iconBg="bg-blue-50"
        items={fridgeItems}
        zones={ZONES_냉장}
        showZones={useZones}
      />
      <FridgeSection
        title="냉동칸"
        icon="🧊"
        iconBg="bg-cyan-50"
        items={freezerItems}
        zones={freezerZones}
        showZones={useZones}
      />
      {hasKimchi && (
        <FridgeSection
          title="김치냉장고"
          icon="🥬"
          iconBg="bg-emerald-50"
          items={kimchiItems}
          zones={ZONES_김치냉장고}
          showZones={useZones}
        />
      )}
      {hasRoomTemp && (
        <FridgeSection
          title="실온보관"
          icon="🏠"
          iconBg="bg-amber-50"
          items={roomTempItems}
          zones={ZONES_실온}
          showZones={useZones}
        />
      )}
    </div>
  );
}
