import type { FoodItem, Category, Location, Zone } from "@/@types";
import { CATEGORIES } from "@/constants/constants";
import { XIcon } from "@/assets/icons";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/services/api";
import { useFridgeSettings } from "@/hooks/useFridgeSettings";

interface AddModalProps {
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, "id" | "consumed">) => void;
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
  label,
  value,
  options,
  onChange,
  display,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  display?: (v: T) => string;
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

export function AddModal({ onClose, onAdd }: AddModalProps) {
  const today = new Date();
  const defaultExpiry = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState<FormState>({
    name: "",
    category: "채소/과일",
    location: "냉장",
    zone: "상단",
    bought: today.toISOString().split("T")[0],
    expiry: defaultExpiry,
    quantity: 1,
    unit: "개",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleLocationChange = (loc: Location) => {
    setForm((p) => ({ ...p, location: loc, zone: ZONES[loc][0] }));
  };

  const handleAdd = () => {
    if (!form.name) {
      alert("식품명은 필수입니다");
      return;
    }
    onAdd({
      name: form.name,
      category: form.category,
      location: form.location,
      zone: form.zone,
      bought: form.bought,
      expiry: form.expiry,
      quantity: form.quantity,
      unit: form.unit,
    });
    setForm({
      name: "",
      category: "채소/과일",
      location: "냉장",
      zone: "상단",
      bought: new Date().toISOString().split("T")[0],
      expiry: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate(),
      )
        .toISOString()
        .split("T")[0],
      quantity: 1,
      unit: "개",
    });
    onClose();
  };

  const { data: frequent = [] } = useQuery({
    queryKey: ["frequentItems"],
    queryFn: api.getFrequentItems,
  });

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
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-base font-bold text-gray-800">
              새 재료 추가
            </div>
            <div className="text-[12px] text-gray-400 mt-1">
              냉장고에 보관할 식품을 등록하세요
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-gray-200 bg-gray-50 cursor-pointer flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
          >
            <XIcon s={14} c="#6b7280" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3.5">
          {/* 식품명 */}
          <div>
            <label className={labelCls}>식품명 *</label>
            <input
              type="text"
              className={inputCls}
              placeholder="예: 브로콜리"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
            {frequent.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {frequent.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, name: item.name, category: item.category as Category, location: item.location as Location, zone: item.zone as Zone }))}
                    className="px-2.5 py-1 rounded-full text-[12px] bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 카테고리 */}
          <DropdownField
            label="카테고리"
            value={form.category}
            options={CATEGORIES as unknown as Category[]}
            onChange={(v) => set("category", v)}
          />

          {/* 보관 위치 & 구역 */}
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

          {/* 수량 & 단위 */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "80px 1fr" }}
          >
            <div>
              <label className={labelCls}>수량</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={inputCls}
                value={form.quantity === 0 ? "" : form.quantity}
                onChange={(e) => {
                  const n = parseInt(e.target.value.replace(/\D/g, ""));
                  set("quantity", isNaN(n) ? 0 : n);
                }}
                onBlur={() => { if (!form.quantity) set("quantity", 1); }}
              />
            </div>
            <div>
              <label className={labelCls}>단위</label>
              <input
                type="text"
                className={inputCls}
                placeholder="개"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
          </div>

          {/* 구매일 & 유통기한 */}
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

        {/* Actions */}
        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-gray-200 bg-gray-50 cursor-pointer text-[13px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAdd}
            className="flex-[1.5] py-2.5 rounded-md border-none bg-emerald-500 cursor-pointer text-[13px] font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            재료 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
