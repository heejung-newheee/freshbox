import type { FoodItem, Category, Location, Zone } from "@/@types";
import { CATEGORIES } from "@/constants/constants";
import { XIcon } from "@/assets/icons";
import { useState, useRef, useEffect } from "react";
import { useFridgeSettings } from "@/hooks/useFridgeSettings";

interface EditModalProps {
  item: FoodItem;
  onClose: () => void;
  onSave: (id: string, item: Omit<FoodItem, "id" | "consumed">) => void;
}

interface FormState {
  name: string;
  category: Category;
  location: Location;
  zone: Zone;
  bought: string;
  expiry: string;
  quantity: number;
  unit: string;
}

const LOCATIONS: Location[] = ["냉장", "냉동", "김치냉장고"];
const ZONES_BASE: Record<Location, Zone[]> = {
  냉장: ["상단", "중단", "하단", "야채", "도어"],
  냉동: ["상단", "중단", "하단"],
  김치냉장고: ["상단", "하단"],
};

const chevron = (
  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,4 6,8 10,4" />
  </svg>
);

function DropdownField<T extends string>({
  label, value, options, onChange, display,
}: {
  label: string; value: T; options: T[]; onChange: (v: T) => void; display?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const labelCls = "block text-[12px] font-semibold text-gray-600 mb-1.5";
  const fieldCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-800 bg-gray-50 outline-none";

  return (
    <div ref={ref} className="relative">
      <label className={labelCls}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${fieldCls} flex items-center justify-between cursor-pointer`}
      >
        <span>{display ? display(value) : value}</span>
        {chevron}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden w-full">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${
                value === opt ? "font-bold text-emerald-600" : "text-gray-700"
              }`}
            >
              {display ? display(opt) : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<FormState>({
    name: item.name,
    category: item.category,
    location: item.location,
    zone: item.zone ?? "상단",
    bought: item.bought,
    expiry: item.expiry,
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "개",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleLocationChange = (loc: Location) => {
    setForm((p) => ({ ...p, location: loc, zone: ZONES[loc][0] }));
  };

  const handleSave = () => {
    if (!form.name) {
      alert("식품명은 필수입니다");
      return;
    }
    onSave(item.id, {
      name: form.name,
      category: form.category,
      location: form.location,
      zone: form.zone,
      bought: form.bought,
      expiry: form.expiry,
      quantity: form.quantity,
      unit: form.unit,
    });
    onClose();
  };

  const { data: settings } = useFridgeSettings();
  const useZones = settings?.use_zones ?? false;
  const availableLocations = LOCATIONS.filter(
    (l) => l !== "김치냉장고" || (settings?.has_kimchi_fridge ?? false),
  );
  const ZONES: Record<Location, Zone[]> = {
    ...ZONES_BASE,
    냉동: (settings?.freezer_horizontal ?? false) ? ["좌", "우"] : ["상단", "중단", "하단"],
  };

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-800 bg-gray-50 outline-none font-[inherit] box-border";
  const labelCls = "block text-[12px] font-semibold text-gray-600 mb-1.5";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-7 w-[440px] max-w-[92vw] shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-base font-bold text-gray-800">재료 수정</div>
            <div className="text-[12px] text-gray-400 mt-1">식품 정보를 수정하세요</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-gray-200 bg-gray-50 cursor-pointer flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
          >
            <XIcon s={14} c="#6b7280" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className={labelCls}>식품명 *</label>
            <input
              type="text"
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <DropdownField
            label="카테고리"
            value={form.category}
            options={CATEGORIES as unknown as Category[]}
            onChange={(v) => set("category", v)}
          />

          <div className={`grid gap-3 ${useZones ? "grid-cols-2" : "grid-cols-1"}`}>
            <DropdownField
              label="보관 위치"
              value={form.location}
              options={availableLocations}
              onChange={handleLocationChange}
            />
            {useZones && (
              <DropdownField
                label="구역"
                value={form.zone}
                options={ZONES[form.location]}
                onChange={(v) => set("zone", v)}
                display={(z) => z + "칸"}
              />
            )}
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: "80px 1fr" }}>
            <div>
              <label className={labelCls}>수량</label>
              <input
                type="number"
                className={inputCls}
                min="1"
                value={form.quantity}
                onChange={(e) => set("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className={labelCls}>단위</label>
              <input
                type="text"
                className={inputCls}
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>구매일</label>
              <input
                type="date"
                className={inputCls}
                value={form.bought}
                onChange={(e) => set("bought", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>유통기한 *</label>
              <input
                type="date"
                className={inputCls}
                value={form.expiry}
                onChange={(e) => set("expiry", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-gray-200 bg-gray-50 cursor-pointer text-[13px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-[1.5] py-2.5 rounded-md border-none bg-emerald-500 cursor-pointer text-[13px] font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            수정 저장
          </button>
        </div>
      </div>
    </div>
  );
}
