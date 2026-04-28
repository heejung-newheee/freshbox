import { useState } from "react";
import type { Role } from "@/@types";
import { MEMBERS, ROLE_META } from "@/constants/constants";

const ROLES: { role: Role; desc: string }[] = [
  { role: "owner", desc: "모든 권한 + 멤버 관리, 냉장고 삭제" },
  { role: "editor", desc: "재고 추가/수정/삭제, 식단 편집" },
  { role: "viewer", desc: "재고 조회만 가능, 수정 불가" },
];

const ROLE_BORDER: Record<Role, string> = {
  owner: "#d1fae5",
  editor: "#dbeafe",
  viewer: "#fef3c7",
};

export function Share() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("편집자");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Invite */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1c1917", marginBottom: 6 }}>멤버 초대</h3>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
          이메일로 초대 링크를 보내 냉장고를 함께 관리하세요
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            placeholder="이메일 주소 입력..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", color: "#374151" }}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#fff", color: "#374151", cursor: "pointer" }}
          >
            <option>편집자</option>
            <option>열람자</option>
          </select>
          <button
            style={{ padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            초대 보내기
          </button>
        </div>
      </div>

      {/* Role guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {ROLES.map(({ role, desc }) => {
          const meta = ROLE_META[role];
          return (
            <div
              key={role}
              style={{ background: "#fff", border: `1px solid ${ROLE_BORDER[role]}`, borderRadius: 14, padding: "18px 20px" }}
            >
              <span style={{
                display: "inline-block", padding: "3px 10px", borderRadius: 20,
                fontSize: 12, fontWeight: 700, marginBottom: 10,
                background: role === "owner" ? "#d1fae5" : role === "editor" ? "#dbeafe" : "#fef3c7",
                color: role === "owner" ? "#059669" : role === "editor" ? "#2563eb" : "#b45309",
              }}>
                {meta.label}
              </span>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Current Members */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1c1917", marginBottom: 16 }}>
          현재 멤버 ({MEMBERS.length}명)
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MEMBERS.map((member) => {
            const meta = ROLE_META[member.role];
            return (
              <div
                key={member.id}
                style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}
              >
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: member.color + "20", border: `2px solid ${member.color}50`, color: member.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {member.name[0]}
                </div>
                {/* Info */}
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{member.email}</div>
                </div>
                {/* Role badge */}
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: member.role === "owner" ? "#d1fae5" : member.role === "editor" ? "#dbeafe" : "#fef3c7",
                  color: member.role === "owner" ? "#059669" : member.role === "editor" ? "#2563eb" : "#b45309",
                  marginRight: member.role !== "owner" ? 8 : 0,
                }}>
                  {meta.label}
                </span>
                {/* Remove button */}
                {member.role !== "owner" && (
                  <button style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
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
