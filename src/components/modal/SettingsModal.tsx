import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFridgeSettings,
  useUpdateFridgeSettings,
} from "@/hooks/useFridgeSettings";
import { Toggle } from "@/components/common";
import { usePushSetting } from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/authStore";

function LayoutPicker({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const opts = [
    { label: "상·중·하단", v: false },
    { label: "좌·우", v: true },
  ];
  return (
    <div
      className={`flex gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {opts.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all cursor-pointer ${
            value === o.v
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data: settings, isLoading } = useFridgeSettings();
  const push = usePushSetting();
  const { user, role, signOut } = useAuthStore();
  const navigate = useNavigate();
  const update = useUpdateFridgeSettings();
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<
    Partial<{
      use_zones: boolean;
      has_kimchi_fridge: boolean;
      has_room_temp: boolean;
      freezer_horizontal: boolean;
    }>
  >({});

  const current = {
    use_zones: overrides.use_zones ?? settings?.use_zones ?? false,
    has_kimchi_fridge:
      overrides.has_kimchi_fridge ?? settings?.has_kimchi_fridge ?? false,
    has_room_temp: overrides.has_room_temp ?? settings?.has_room_temp ?? false,
    freezer_horizontal:
      overrides.freezer_horizontal ?? settings?.freezer_horizontal ?? false,
  };

  const handleToggle = (
    key:
      | "use_zones"
      | "has_kimchi_fridge"
      | "has_room_temp"
      | "freezer_horizontal",
    value: boolean,
  ) => {
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-extrabold text-stone-900">
            설정
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[16px] transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {/* 계정 */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              계정
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-stone-800 truncate">
                {user?.email}
              </p>
              <button
                onClick={handleSignOut}
                className="shrink-0 text-[12px] font-semibold text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 알림 */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              알림
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-stone-800">
                  푸시 알림 받기
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {push.supported
                    ? "매일 아침 유통기한 임박 식품 알림"
                    : "이 브라우저는 푸시 알림을 지원하지 않아요"}
                </p>
              </div>
              {push.loading ? (
                <div className="w-11 h-6 shrink-0" />
              ) : (
                <Toggle
                  checked={push.enabled}
                  onChange={push.toggle}
                  disabled={!push.supported || push.pending}
                />
              )}
            </div>
          </div>

          {role === "owner" && (isLoading ? (
            <div className="py-4 text-center text-[13px] text-gray-400">
              불러오는 중...
            </div>
          ) : (
            <>
              <div className="h-px bg-gray-100" />

              <div className="flex flex-col gap-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  보관 위치
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-stone-800">
                      김치냉장고 사용
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      재료 추가 시 김치냉장고 선택 가능
                    </p>
                  </div>
                  <Toggle
                    checked={current.has_kimchi_fridge}
                    onChange={(v) => handleToggle("has_kimchi_fridge", v)}
                    disabled={update.isPending}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-stone-800">
                      실온 보관 사용
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      상온 보관 식품 위치 선택 가능
                    </p>
                  </div>
                  <Toggle
                    checked={current.has_room_temp}
                    onChange={(v) => handleToggle("has_room_temp", v)}
                    disabled={update.isPending}
                  />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col gap-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  구역 설정
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-stone-800">
                      구역(칸) 세분화
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {current.use_zones
                        ? "구역 선택 가능"
                        : "구역 구분 없이 위치만 선택"}
                    </p>
                  </div>
                  <Toggle
                    checked={current.use_zones}
                    onChange={(v) => handleToggle("use_zones", v)}
                    disabled={update.isPending}
                  />
                </div>

                {current.use_zones && (
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-stone-800">
                      냉동칸 구역 방향
                    </p>
                    <LayoutPicker
                      value={current.freezer_horizontal}
                      onChange={(v) => handleToggle("freezer_horizontal", v)}
                      disabled={update.isPending}
                    />
                  </div>
                )}
              </div>

              {error && (
                <p className="text-[12px] text-red-500 text-center">{error}</p>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
