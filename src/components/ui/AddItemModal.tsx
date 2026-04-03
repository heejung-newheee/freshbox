import { useState } from "react";
import type { FoodItem, Location, Category } from "../../@types/types";
import { ZONES_냉장, ZONES_냉동, CATEGORIES } from "../../constants/constants";
import { FormInput, FormSelect, PrimaryButton } from "./ui-components";
import { IconX } from "../ui/icons";

interface Props {
  onClose: () => void;
  onAdd: (item: Omit<FoodItem, "id" | "consumed">) => void;
  isMobile: boolean;
}

export function AddItemModal({ onClose, onAdd, isMobile }: Props) {
  const [form, setForm] = useState({
    name: "",
    cat: "채소" as Category,
    loc: "냉장" as Location,
    zone: "중단",
    bought: "2026-03-03",
    expiry: "",
    qty: 1,
    unit: "개",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const zones = form.loc === "냉장" ? ZONES_냉장 : ZONES_냉동;

  const handleAdd = () => {
    if (!form.name || !form.expiry) return;
    onAdd({ ...form, zone: form.zone as FoodItem["zone"] });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full md:w-[440px] md:max-w-full rounded-t-3xl md:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* drag handle (mobile only) */}
        {isMobile && (
          <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />
        )}

        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-stone-800">새 재료 추가</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              냉장고에 보관할 식품을 등록하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
          >
            <IconX size={13} />
          </button>
        </div>

        <div className="grid gap-3">
          <FormInput
            label="식품명 *"
            placeholder="예: 브로콜리"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="카테고리"
              value={form.cat}
              onChange={(e) => set("cat", e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </FormSelect>
            <FormSelect
              label="보관 위치"
              value={form.loc}
              onChange={(e) => set("loc", e.target.value as Location)}
            >
              <option>냉장</option>
              <option>냉동</option>
            </FormSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="구역"
              value={form.zone}
              onChange={(e) => set("zone", e.target.value)}
            >
              {zones.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </FormSelect>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                수량
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) => set("qty", Number(e.target.value))}
                  className="w-16 px-2 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 bg-stone-50 outline-none focus:border-emerald-400 text-center"
                />
                <input
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  placeholder="개"
                  className="flex-1 px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 bg-stone-50 outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="구매일"
              type="date"
              value={form.bought}
              onChange={(e) => set("bought", e.target.value)}
            />
            <FormInput
              label="유통기한 *"
              type="date"
              value={form.expiry}
              onChange={(e) => set("expiry", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-sm font-semibold hover:bg-stone-100 transition-colors"
          >
            취소
          </button>
          <PrimaryButton
            onClick={handleAdd}
            className="flex-[2] justify-center py-3"
          >
            추가하기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
