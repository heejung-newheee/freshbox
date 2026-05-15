import type { Role } from "@/@types";
import { ROLE_META } from "@/constants/constants";
import { cn } from "@/utils/utils";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const ROLES: { role: Extract<Role, "editor" | "viewer">; desc: string }[] = [
  { role: "editor", desc: "재고 추가/수정/삭제, 식단 편집" },
  { role: "viewer", desc: "재고 조회만 가능, 수정 불가" },
];

const ROLE_STYLE: Record<Role, { card: string; badge: string }> = {
  owner: {
    card: "border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
  },
  editor: { card: "border-blue-100", badge: "bg-blue-100 text-blue-700" },
  viewer: { card: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
};

const AVATAR_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function RoleDropdown({
  value,
  onChange,
  disabled,
  badgeCls,
}: {
  value: Extract<Role, "editor" | "viewer">;
  onChange: (r: Extract<Role, "editor" | "viewer">) => void;
  disabled?: boolean;
  badgeCls: string;
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

  return (
    <div ref={ref} className="relative shrink-0 mr-2">
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 pl-3 pr-2.5 py-1 rounded-full text-[12px] font-bold transition-opacity",
          badgeCls,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
      >
        {value === "editor" ? "편집자" : "열람자"}
        <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[80px]">
          {(["editor", "viewer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { onChange(r); setOpen(false); }}
              className={cn(
                "w-full text-left px-3.5 py-2 text-[12px] hover:bg-gray-50 transition-colors whitespace-nowrap",
                value === r ? "font-bold text-emerald-600" : "text-gray-700",
              )}
            >
              {r === "editor" ? "편집자" : "열람자"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Share() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<Extract<Role, "editor" | "viewer">>("editor");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [roleToast, setRoleToast] = useState<{
    msg: string;
    ok: boolean;
  } | null>(null);

  useEffect(() => {
    if (!roleDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!roleDropdownRef.current?.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [roleDropdownOpen]);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "owner" || role === "editor";

  const { data: ownerInfo } = useQuery({
    queryKey: ["fridgeOwner"],
    queryFn: api.getFridgeOwnerInfo,
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["fridgeMembers"],
    queryFn: api.getFridgeMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: ({
      email,
      role,
    }: {
      email: string;
      role: Extract<Role, "editor" | "viewer">;
    }) => api.inviteFridgeMember(email, role),
    onSuccess: (_data, { email }) => {
      queryClient.invalidateQueries({ queryKey: ["fridgeMembers"] });
      setInviteEmail("");
      setInviteError(null);
      setInviteSuccess(`${email} 님을 멤버로 추가했습니다`);
      setTimeout(() => setInviteSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setInviteSuccess(null);
      setInviteError(err.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: api.removeFridgeMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fridgeMembers"] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: Extract<Role, "editor" | "viewer">;
    }) => api.updateMemberRole(id, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["fridgeMembers"] });
      const label = role === "editor" ? "편집자" : "열람자";
      setRoleToast({ msg: `권한을 ${label}로 변경했습니다`, ok: true });
      setTimeout(() => setRoleToast(null), 3000);
    },
    onError: () => {
      setRoleToast({ msg: "권한 변경에 실패했습니다", ok: false });
      setTimeout(() => setRoleToast(null), 3000);
    },
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    if (inviteEmail === user?.email) {
      setInviteError("본인을 초대할 수 없습니다");
      return;
    }
    setInviteError(null);
    inviteMutation.mutate({ email: inviteEmail.trim(), role: selectedRole });
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Invite */}
        {canEdit && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-[15px] font-extrabold text-stone-900 mb-1.5">
              멤버 초대
            </h3>
            <p className="text-[12px] text-gray-400 mb-4">
              이메일로 초대하여 냉장고를 함께 관리하세요
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col md:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="이메일 주소 입력..."
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none text-gray-700 focus:border-emerald-400 transition-colors"
                />
                <div ref={roleDropdownRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white text-gray-700 cursor-pointer outline-none whitespace-nowrap"
                  >
                    {selectedRole === "editor" ? "편집자" : "열람자"}
                    <svg className="w-3 h-3 text-gray-400 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,4 6,8 10,4"/></svg>
                  </button>
                  {roleDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-full">
                      {(["editor", "viewer"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => { setSelectedRole(r); setRoleDropdownOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors",
                            selectedRole === r ? "font-bold text-emerald-600" : "text-gray-700",
                          )}
                        >
                          {r === "editor" ? "편집자" : "열람자"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  className="px-5 py-2.5 bg-emerald-500 text-white border-none rounded-xl text-[13px] font-bold cursor-pointer hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0 whitespace-nowrap"
                >
                  {inviteMutation.isPending ? "초대 중..." : "초대 보내기"}
                </button>
              </div>
              {inviteSuccess && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[12px] text-emerald-700 font-semibold">
                  <span>✓</span>
                  {inviteSuccess}
                </div>
              )}
              {inviteError && (
                <p className="text-[12px] text-red-500 px-1">{inviteError}</p>
              )}
            </div>
          </div>
        )}

        {/* Role guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border border-emerald-100 rounded-2xl px-3 py-3.5 md:px-5 md:py-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold mb-2.5 bg-emerald-100 text-emerald-700">
              소유자
            </span>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              모든 권한 + 멤버 관리, 냉장고 설정
            </p>
          </div>
          {ROLES.map(({ role, desc }) => {
            const meta = ROLE_META[role];
            const s = ROLE_STYLE[role];
            return (
              <div
                key={role}
                className={`bg-white border ${s.card} rounded-2xl px-3 py-3.5 md:px-5 md:py-4`}
              >
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold mb-2.5 ${s.badge}`}
                >
                  {meta.label}
                </span>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Current Members */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-[15px] font-extrabold text-stone-900 mb-4">
            현재 멤버 ({1 + members.length}명)
          </h3>
          <div className="flex flex-col gap-2.5">
            {/* Owner row — always fetched from DB */}
            {ownerInfo && (
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                  style={{
                    background: "#10b98120",
                    border: "2px solid #10b98150",
                    color: "#10b981",
                  }}
                >
                  {ownerInfo.email[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 ml-3 min-w-0">
                  <div className="text-[14px] font-bold text-stone-900 truncate">
                    {ownerInfo.email}
                  </div>
                  {ownerInfo.id === user?.id && (
                    <div className="text-[12px] text-gray-400 mt-0.5">본인</div>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                  소유자
                </span>
              </div>
            )}

            {/* All fridge members */}
            {isLoading ? (
              <div className="py-6 text-center text-[13px] text-gray-400">
                멤버 불러오는 중...
              </div>
            ) : members.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-gray-400">
                초대된 멤버가 없습니다
              </div>
            ) : (
              members.map((member, idx) => {
                const s = ROLE_STYLE[member.role];
                const meta = ROLE_META[member.role];
                const color = AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length];
                const isMe = member.member_id === user?.id;
                return (
                  <div
                    key={member.id}
                    className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                      style={{
                        background: color + "20",
                        border: `2px solid ${color}50`,
                        color,
                      }}
                    >
                      {member.member_email[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 ml-3 min-w-0">
                      <div className="text-[14px] font-bold text-stone-900 truncate">
                        {member.member_email}
                      </div>
                      {isMe && (
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          본인
                        </div>
                      )}
                    </div>
                    {canEdit && !isMe ? (
                      <RoleDropdown
                        value={member.role}
                        onChange={(r) => updateRoleMutation.mutate({ id: member.id, role: r })}
                        disabled={updateRoleMutation.isPending}
                        badgeCls={s.badge}
                      />
                    ) : (
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[12px] font-bold mr-2 shrink-0",
                          s.badge,
                        )}
                      >
                        {meta.label}
                      </span>
                    )}
                    {canEdit && !isMe && (
                      <button
                        onClick={() => removeMutation.mutate(member.id)}
                        disabled={removeMutation.isPending}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white cursor-pointer flex items-center justify-center text-gray-400 text-sm hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-colors shrink-0"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Role change toast */}
      {roleToast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-semibold flex items-center gap-2 transition-all",
            roleToast.ok
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white",
          )}
        >
          <span>{roleToast.ok ? "✓" : "✕"}</span>
          {roleToast.msg}
        </div>
      )}
    </>
  );
}
