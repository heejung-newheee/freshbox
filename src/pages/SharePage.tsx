import type { Role } from "@/@types";
import { MEMBERS, ROLE_META } from "@/constants/constants";
import { cn } from "@/utils/utils";
import { useState } from "react";

const ROLES: { role: Role; desc: string }[] = [
  { role: "owner", desc: "모든 권한 + 멤버 관리, 냉장고 삭제" },
  { role: "editor", desc: "재고 추가/수정/삭제, 식단 편집" },
  { role: "viewer", desc: "재고 조회만 가능, 수정 불가" },
];

const ROLE_STYLE: Record<Role, { card: string; badge: string; text: string }> = {
  owner: { card: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700", text: "text-emerald-700" },
  editor: { card: "border-blue-100", badge: "bg-blue-100 text-blue-700", text: "text-blue-700" },
  viewer: { card: "border-amber-100", badge: "bg-amber-100 text-amber-700", text: "text-amber-700" },
};

export function Share() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("편집자");

  return (
    <div className="flex flex-col gap-5">
      {/* Invite */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-[15px] font-extrabold text-stone-900 mb-1.5">멤버 초대</h3>
        <p className="text-[12px] text-gray-400 mb-4">
          이메일로 초대 링크를 보내 냉장고를 함께 관리하세요
        </p>
        <div className="flex flex-col gap-2.5">
          <input
            type="email"
            placeholder="이메일 주소 입력..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none text-gray-700 focus:border-emerald-400 transition-colors"
          />
          <div className="flex gap-2.5">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white text-gray-700 cursor-pointer outline-none"
            >
              <option>편집자</option>
              <option>열람자</option>
            </select>
            <button className="flex-1 py-2.5 bg-emerald-500 text-white border-none rounded-xl text-[13px] font-bold cursor-pointer hover:bg-emerald-600 transition-colors">
              초대 보내기
            </button>
          </div>
        </div>
      </div>

      {/* Role guide */}
      <div className="grid grid-cols-3 gap-3.5">
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
        <h3 className="text-[15px] font-extrabold text-stone-900 mb-4">
          현재 멤버 ({MEMBERS.length}명)
        </h3>
        <div className="flex flex-col gap-2.5">
          {MEMBERS.map((member) => {
            const meta = ROLE_META[member.role];
            const s = ROLE_STYLE[member.role];
            return (
              <div
                key={member.id}
                className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-100"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                  style={{
                    background: member.color + "20",
                    border: `2px solid ${member.color}50`,
                    color: member.color,
                  }}
                >
                  {member.name[0]}
                </div>
                {/* Info */}
                <div className="flex-1 ml-3">
                  <div className="text-[14px] font-bold text-stone-900">{member.name}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{member.email}</div>
                </div>
                {/* Role badge */}
                <span className={cn("px-3 py-1 rounded-full text-[12px] font-bold", s.badge, member.role !== "owner" && "mr-2")}>
                  {meta.label}
                </span>
                {/* Remove button */}
                {member.role !== "owner" && (
                  <button className="w-7 h-7 rounded-lg border border-gray-200 bg-white cursor-pointer flex items-center justify-center text-gray-400 text-sm hover:bg-gray-100 transition-colors">
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
