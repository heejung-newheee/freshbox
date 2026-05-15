import type { Role } from "@/@types";
import { ROLE_META } from "@/constants/constants";
import { cn } from "@/utils/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const ROLES: { role: Extract<Role, "editor" | "viewer">; desc: string }[] = [
  { role: "editor", desc: "재고 추가/수정/삭제, 식단 편집" },
  { role: "viewer", desc: "재고 조회만 가능, 수정 불가" },
];

const ROLE_STYLE: Record<Role, { card: string; badge: string }> = {
  owner: { card: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700" },
  editor: { card: "border-blue-100", badge: "bg-blue-100 text-blue-700" },
  viewer: { card: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
};

const AVATAR_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

export function Share() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Extract<Role, "editor" | "viewer">>("editor");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [roleToast, setRoleToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const canEdit = role === "owner" || role === "editor";

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["fridgeMembers"],
    queryFn: api.getFridgeMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: Extract<Role, "editor" | "viewer"> }) =>
      api.inviteFridgeMember(email, role),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fridgeMembers"] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Extract<Role, "editor" | "viewer"> }) =>
      api.updateMemberRole(id, role),
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
      {canEdit && <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-[15px] font-extrabold text-stone-900 mb-1.5">멤버 초대</h3>
        <p className="text-[12px] text-gray-400 mb-4">
          이메일로 초대하여 냉장고를 함께 관리하세요
        </p>
        <div className="flex flex-col gap-2.5">
          <input
            type="email"
            placeholder="이메일 주소 입력..."
            value={inviteEmail}
            onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none text-gray-700 focus:border-emerald-400 transition-colors"
          />
          <div className="flex gap-2.5">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Extract<Role, "editor" | "viewer">)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white text-gray-700 cursor-pointer outline-none"
            >
              <option value="editor">편집자</option>
              <option value="viewer">열람자</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteEmail.trim()}
              className="flex-1 py-2.5 bg-emerald-500 text-white border-none rounded-xl text-[13px] font-bold cursor-pointer hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
      </div>}

      {/* Role guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Owner */}
        <div className={`bg-white border border-emerald-100 rounded-2xl px-3 py-3.5 md:px-5 md:py-4`}>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold mb-2.5 bg-emerald-100 text-emerald-700">
            소유자
          </span>
          <p className="text-[12px] text-gray-500 leading-relaxed">모든 권한 + 멤버 관리, 냉장고 설정</p>
        </div>
        {ROLES.map(({ role, desc }) => {
          const meta = ROLE_META[role];
          const s = ROLE_STYLE[role];
          return (
            <div key={role} className={`bg-white border ${s.card} rounded-2xl px-3 py-3.5 md:px-5 md:py-4`}>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-bold mb-2.5 ${s.badge}`}>
                {meta.label}
              </span>
              <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Current Members */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* Owner (current user) */}
        <h3 className="text-[15px] font-extrabold text-stone-900 mb-4">
          현재 멤버 ({1 + members.length}명)
        </h3>
        <div className="flex flex-col gap-2.5">
          {/* Owner row */}
          {user && (
            <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                style={{ background: "#10b98120", border: "2px solid #10b98150", color: "#10b981" }}
              >
                {user.email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 ml-3 min-w-0">
                <div className="text-[14px] font-bold text-stone-900 truncate">{user.email}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">본인</div>
              </div>
              <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                소유자
              </span>
            </div>
          )}

          {/* Invited members */}
          {isLoading ? (
            <div className="py-6 text-center text-[13px] text-gray-400">멤버 불러오는 중...</div>
          ) : members.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-gray-400">초대된 멤버가 없습니다</div>
          ) : (
            members.map((member, idx) => {
              const s = ROLE_STYLE[member.role];
              const meta = ROLE_META[member.role];
              const color = AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length];
              return (
                <div
                  key={member.id}
                  className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                    style={{ background: color + "20", border: `2px solid ${color}50`, color }}
                  >
                    {member.member_email[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="text-[14px] font-bold text-stone-900 truncate">
                      {member.member_email}
                    </div>
                  </div>
                  {canEdit ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          id: member.id,
                          role: e.target.value as Extract<Role, "editor" | "viewer">,
                        })
                      }
                      disabled={updateRoleMutation.isPending}
                      className={cn("px-2.5 py-1 rounded-full text-[12px] font-bold mr-2 shrink-0 border-none cursor-pointer outline-none", s.badge)}
                    >
                      <option value="editor">편집자</option>
                      <option value="viewer">열람자</option>
                    </select>
                  ) : (
                    <span className={cn("px-3 py-1 rounded-full text-[12px] font-bold mr-2 shrink-0", s.badge)}>
                      {meta.label}
                    </span>
                  )}
                  {canEdit && (
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
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-semibold flex items-center gap-2 transition-all",
          roleToast.ok
            ? "bg-emerald-500 text-white"
            : "bg-red-500 text-white"
        )}>
          <span>{roleToast.ok ? "✓" : "✕"}</span>
          {roleToast.msg}
        </div>
      )}
    </>
  );
}
