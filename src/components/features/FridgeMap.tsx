import type { FoodItem, Location, Zone } from "@/@types";
import {
  ZONES_냉장,
  ZONES_냉동,
  ZONES_김치냉장고,
  ZONES_실온,
} from "@/constants/constants";
import { cn, ddayMeta, getDday } from "@/utils/utils";
import { useFridgeSettings } from "@/hooks/useFridgeSettings";
import { useConsumeItem, useMoveItemZone, useUpdateItem } from "@/hooks/useFoodItems";
import { useState } from "react";
import { EditModal } from "@/components/modal";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

// droppable id format: "location:::zone" or "location:::__none" (unzoned)
const toDropId = (location: Location, zone: string) => `${location}:::${zone}`;
const fromDropId = (
  id: string,
): { location: Location; zone: Zone | undefined } => {
  const [location, zone] = id.split(":::");
  return {
    location: location as Location,
    zone: zone === "__none" ? undefined : (zone as Zone),
  };
};

interface FridgeMapProps {
  items: FoodItem[];
}

function ItemActionPopup({
  item,
  onClose,
  onConsume,
  onEdit,
}: {
  item: FoodItem;
  onClose: () => void;
  onConsume: (id: string) => void;
  onEdit: (item: FoodItem) => void;
}) {
  const d = getDday(item.expiry);
  const m = ddayMeta(d);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-5 w-72 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[16px] font-black text-stone-900">{item.name}</div>
            <div className="text-[12px] text-gray-400 mt-0.5">
              {item.location}{item.zone ? ` · ${item.zone}칸` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: m.color, background: m.bg }}
            >
              {d < 0 ? `D+${Math.abs(d)}` : d === 0 ? "D-Day" : `D-${d}`}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => { onConsume(item.id); onClose(); }}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-[14px] font-bold hover:bg-emerald-600 transition-colors"
          >
            소비 완료 ✓
          </button>
          <button
            onClick={() => { onEdit(item); onClose(); }}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[14px] font-semibold hover:bg-gray-200 transition-colors"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemChip({
  item,
  isDragging = false,
}: {
  item: FoodItem;
  isDragging?: boolean;
}) {
  const d = getDday(item.expiry);
  const m = ddayMeta(d);
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-xs border select-none",
        isDragging ? "shadow-lg opacity-90 scale-105" : "",
      )}
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

function DraggableChip({ item, onClick }: { item: FoodItem; onClick: (item: FoodItem) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onClick(item)}
      style={{
        opacity: isDragging ? 0.3 : 1,
        touchAction: "none",
        cursor: "grab",
      }}
    >
      <ItemChip item={item} />
    </div>
  );
}

function DroppableZone({
  dropId,
  label,
  accent,
  items,
  empty,
  onChipClick,
}: {
  dropId: string;
  label: React.ReactNode;
  accent: string;
  items: FoodItem[];
  empty: React.ReactNode;
  onChipClick: (item: FoodItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">{label}</div>
      <div
        ref={setNodeRef}
        className={cn(
          "rounded-xl px-3 py-2.5 min-h-11 flex flex-wrap gap-1.5 items-center transition-colors border",
          isOver
            ? `${accent} border-emerald-300`
            : "bg-gray-50 border-transparent",
        )}
      >
        {items.length === 0 ? (
          <span className="text-xs text-gray-300">{empty}</span>
        ) : (
          items.map((item) => <DraggableChip key={item.id} item={item} onClick={onChipClick} />)
        )}
      </div>
    </div>
  );
}

function FridgeSection({
  title,
  icon,
  iconBg,
  location,
  items,
  zones,
  showZones,
  onChipClick,
}: {
  title: string;
  icon: string;
  iconBg: string;
  location: Location;
  items: FoodItem[];
  zones: readonly string[];
  showZones: boolean;
  onChipClick: (item: FoodItem) => void;
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
          {zones.map((zone) => (
            <DroppableZone
              key={zone}
              dropId={toDropId(location, zone)}
              label={
                <>
                  <div className="w-0.5 h-3.5 bg-emerald-500 rounded-sm" />
                  <span className="text-xs font-bold text-gray-700">
                    {zone}칸
                  </span>
                  <span className="text-[11px] text-gray-400">
                    ({items.filter((i) => i.zone === zone).length})
                  </span>
                </>
              }
              accent="bg-emerald-50"
              items={items.filter((i) => i.zone === zone)}
              empty="비어있음"
              onChipClick={onChipClick}
            />
          ))}
          <DroppableZone
            dropId={toDropId(location, "__none")}
            label={
              <>
                <div className="w-0.5 h-3.5 bg-gray-300 rounded-sm" />
                <span className="text-xs font-bold text-gray-400">
                  구역 미지정
                </span>
                <span className="text-[11px] text-gray-400">
                  ({unzoned.length})
                </span>
              </>
            }
            accent="bg-gray-100"
            items={unzoned}
            empty="여기로 드래그"
            onChipClick={onChipClick}
          />
        </div>
      ) : (
        <DroppableZone
          dropId={toDropId(location, "__none")}
          label={<></>}
          accent="bg-emerald-50"
          items={items}
          empty="비어있음"
          onChipClick={onChipClick}
        />
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

  const moveZone = useMoveItemZone();
  const consume = useConsumeItem();
  const updateItem = useUpdateItem();
  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);
  const [popupItem, setPopupItem] = useState<FoodItem | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 3000, tolerance: 8 },
    }),
  );

  const active = items.filter((i) => !i.consumed);
  const fridgeItems = active.filter((i) => i.location === "냉장");
  const freezerItems = active.filter((i) => i.location === "냉동");
  const kimchiItems = active.filter((i) => i.location === "김치냉장고");
  const roomTempItems = active.filter((i) => i.location === "실온");

  const sectionCount = 2 + (hasKimchi ? 1 : 0) + (hasRoomTemp ? 1 : 0);
  const cols =
    sectionCount >= 4
      ? "grid-cols-1 md:grid-cols-2"
      : sectionCount === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

  function handleDragStart(event: DragStartEvent) {
    const item = active.find((i) => i.id === event.active.id);
    setActiveItem(item ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active: dragActive, over } = event;
    if (!over) return;
    const item = active.find((i) => i.id === dragActive.id);
    if (!item) return;
    const { location, zone } = fromDropId(String(over.id));
    if (location === item.location && zone === item.zone) return;
    moveZone.mutate({ id: item.id, location, zone });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`grid ${cols} gap-5`}>
          <FridgeSection
            title="냉장칸"
            icon="❄️"
            iconBg="bg-blue-50"
            location="냉장"
            items={fridgeItems}
            zones={ZONES_냉장}
            showZones={useZones}
            onChipClick={setPopupItem}
          />
          <FridgeSection
            title="냉동칸"
            icon="🧊"
            iconBg="bg-cyan-50"
            location="냉동"
            items={freezerItems}
            zones={freezerZones}
            showZones={useZones}
            onChipClick={setPopupItem}
          />
          {hasKimchi && (
            <FridgeSection
              title="김치냉장고"
              icon="🥬"
              iconBg="bg-emerald-50"
              location="김치냉장고"
              items={kimchiItems}
              zones={ZONES_김치냉장고}
              showZones={useZones}
              onChipClick={setPopupItem}
            />
          )}
          {hasRoomTemp && (
            <FridgeSection
              title="실온보관"
              icon="🏠"
              iconBg="bg-amber-50"
              location="실온"
              items={roomTempItems}
              zones={ZONES_실온}
              showZones={useZones}
              onChipClick={setPopupItem}
            />
          )}
        </div>
        <DragOverlay>
          {activeItem && <ItemChip item={activeItem} isDragging />}
        </DragOverlay>
      </DndContext>

      {popupItem && (
        <ItemActionPopup
          item={popupItem}
          onClose={() => setPopupItem(null)}
          onConsume={(id) => consume.mutate(id)}
          onEdit={(item) => setEditingItem(item)}
        />
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(id, data) => {
            updateItem.mutate({ id, item: data });
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
}
