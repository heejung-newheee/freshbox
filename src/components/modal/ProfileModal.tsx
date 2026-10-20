import { useRef, useState } from "react";
import { Avatar } from "@/components/common";
import * as api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { getDisplayName } from "@/utils/utils";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const sectionLabelCls =
  "text-[11px] font-bold text-gray-400 uppercase tracking-wider";
const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-800 bg-gray-50 outline-none focus:border-emerald-400 focus:bg-white transition-colors";
const primaryBtnCls =
  "w-full py-2.5 bg-emerald-500 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const meta = (user?.user_metadata ?? {}) as api.ProfileMeta;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(meta.name ?? "");
  const [nickname, setNickname] = useState(meta.nickname ?? "");
  const [displayPref, setDisplayPref] = useState<"name" | "nickname">(
    meta.display_pref ?? "name",
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // 이름은 가입 시 정해지며, 이름이 없는 기존 계정만 한 번 입력 가능
  const nameLocked = !!meta.name;

  const saveMeta = async (patch: api.ProfileMeta) => {
    const updated = await api.updateMyProfile(patch);
    setUser(updated);
  };

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      await saveMeta({
        ...(nameLocked ? {} : { name: name.trim() }),
        nickname: nickname.trim(),
        display_pref: displayPref,
      });
      setMessage({ ok: true, text: "저장했어요" });
    } catch (e) {
      setMessage({
        ok: false,
        text: (e as Error).message || "저장에 실패했습니다",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage(null);
    if (!file.type.startsWith("image/")) {
      setMessage({ ok: false, text: "이미지 파일만 올릴 수 있어요" });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setMessage({ ok: false, text: "2MB 이하 이미지만 올릴 수 있어요" });
      return;
    }
    setUploading(true);
    try {
      const url = await api.uploadAvatar(file);
      await saveMeta({ avatar_url: url });
    } catch (err) {
      setMessage({
        ok: false,
        text: (err as Error).message || "업로드에 실패했습니다",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setMessage(null);
    setUploading(true);
    try {
      await saveMeta({ avatar_url: "" });
    } catch (err) {
      setMessage({
        ok: false,
        text: (err as Error).message || "삭제에 실패했습니다",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePassword = async () => {
    setPwMessage(null);
    if (password.length < 6) {
      setPwMessage({ ok: false, text: "비밀번호는 6자 이상이어야 합니다" });
      return;
    }
    if (password !== confirm) {
      setPwMessage({ ok: false, text: "비밀번호가 일치하지 않습니다" });
      return;
    }
    setPwSaving(true);
    try {
      await api.changePassword(password);
      setPassword("");
      setConfirm("");
      setPwMessage({ ok: true, text: "비밀번호를 변경했어요" });
    } catch (e) {
      setPwMessage({
        ok: false,
        text: (e as Error).message || "변경에 실패했습니다",
      });
    } finally {
      setPwSaving(false);
    }
  };

  // 저장 전 미리보기
  const preview = getDisplayName(
    user && {
      ...user,
      user_metadata: {
        ...meta,
        name: nameLocked ? meta.name : name.trim(),
        nickname: nickname.trim(),
        display_pref: displayPref,
      },
    },
  );

  return (
    <div data-modal
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-sm shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-extrabold text-stone-900">
            내 프로필
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[16px] transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto">
          {/* 사진 */}
          <div className="flex items-center gap-4">
            <Avatar
              name={preview}
              src={meta.avatar_url || undefined}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-stone-900 truncate">
                {preview}
              </p>
              <p className="text-[12px] text-gray-400 truncate">
                {user?.email}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-[12px] font-semibold text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-50 disabled:opacity-60 transition-colors"
                >
                  {uploading ? "처리 중..." : "사진 변경"}
                </button>
                {meta.avatar_url && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="text-[12px] font-semibold text-gray-500 px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 기본 정보 */}
          <div className="flex flex-col gap-3">
            <p className={sectionLabelCls}>기본 정보</p>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                이름
              </label>
              {nameLocked ? (
                <p className="px-3 py-2.5 text-[14px] text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                  {meta.name}
                </p>
              ) : (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 (저장 후 변경 불가)"
                  className={inputCls}
                />
              )}
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                닉네임
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                화면에 표시할 이름
              </label>
              <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                {(["name", "nickname"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDisplayPref(v)}
                    className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-colors ${
                      displayPref === v
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {v === "name" ? "이름" : "닉네임"}
                  </button>
                ))}
              </div>
            </div>
            {message && (
              <p
                className={`text-[12px] ${message.ok ? "text-emerald-600" : "text-red-500"}`}
              >
                {message.text}
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={primaryBtnCls}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 비밀번호 */}
          <div className="flex flex-col gap-3">
            <p className={sectionLabelCls}>비밀번호 변경</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호 (6자 이상)"
              autoComplete="new-password"
              className={inputCls}
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
              className={inputCls}
            />
            {pwMessage && (
              <p
                className={`text-[12px] ${pwMessage.ok ? "text-emerald-600" : "text-red-500"}`}
              >
                {pwMessage.text}
              </p>
            )}
            <button
              onClick={handlePassword}
              disabled={pwSaving}
              className={primaryBtnCls}
            >
              {pwSaving ? "변경 중..." : "비밀번호 변경"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
