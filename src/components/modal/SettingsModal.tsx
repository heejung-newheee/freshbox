import { useState } from "react";
import { useFridgeSettings, useUpdateFridgeSettings } from "@/hooks/useFridgeSettings";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        checked ? "bg-emerald-500" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data: settings, isLoading } = useFridgeSettings();
  const update = useUpdateFridgeSettings();
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Partial<{ use_zones: boolean; has_kimchi_fridge: boolean }>>({});

  const current = {
    use_zones: overrides.use_zones ?? settings?.use_zones ?? true,
    has_kimchi_fridge: overrides.has_kimchi_fridge ?? settings?.has_kimchi_fridge ?? false,
  };

  const handleToggle = (key: "use_zones" | "has_kimchi_fridge", value: boolean) => {
    setOverrides((p) => ({ ...p, [key]: value }));
    setError(null);
    update.mutate(
      { [key]: value },
      {
        onError: (e: Error) => {
          console.error("설정 저장 실패:", e);
          setOverrides((p) => ({ ...p, [key]: !value }));
          setError(e.message || "저장에 실패했습니다");
        },
      },
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-extrabold text-stone-900">냉장고 설정</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[16px] transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {isLoading ? (
            <div className="py-4 text-center text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">보관 위치</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-stone-800">김치냉장고 사용</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">재료 추가 시 김치냉장고 선택 가능</p>
                  </div>
                  <Toggle
                    checked={current.has_kimchi_fridge}
                    onChange={(v) => handleToggle("has_kimchi_fridge", v)}
                    disabled={update.isPending}
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">구역 설정</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-stone-800">구역(칸) 세분화</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {current.use_zones
                        ? "상단·중단·하단 등 구역 선택 가능"
                        : "구역 구분 없이 위치만 선택"}
                    </p>
                  </div>
                  <Toggle
                    checked={current.use_zones}
                    onChange={(v) => handleToggle("use_zones", v)}
                    disabled={update.isPending}
                  />
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-red-500 text-center">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
