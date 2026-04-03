import { useState } from "react";
import { Avatar } from "@/components/common";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  avatar: string;
  color: string;
}

const ROLES = [
  {
    role: "소유자",
    description: "모든 권한 + 멤버 관리, 냉장고 설정",
  },
  {
    role: "편집자",
    description: "재료 추가/수정/삭제, 식단 편집",
  },
  {
    role: "열람자",
    description: "재료 조회 기능, 수정 불가",
  },
];

const MEMBERS: Member[] = [
  {
    id: 1,
    name: "heejung",
    email: "heejung@email.com",
    role: "owner",
    avatar: "H",
    color: "#10b981",
  },
  {
    id: 2,
    name: "지민",
    email: "jimin@email.com",
    role: "editor",
    avatar: "지",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "수현",
    email: "suhyun@email.com",
    role: "viewer",
    avatar: "수",
    color: "#f59e0b",
  },
];

export function Share() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("편집자");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Invite Section */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
          멤버 초대
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
          이메일로 초대 링크를 보내 냉장고를 함께 관리하세요
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="email"
            placeholder="초대할 주소 입력..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "13px",
              backgroundColor: "#fff",
            }}
          >
            <option>편집자</option>
            <option>열람자</option>
          </select>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            초대 보내기
          </button>
        </div>
      </div>

      {/* Roles Description */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {ROLES.map((r) => (
          <div
            key={r.role}
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              {r.role}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              {r.description}
            </div>
          </div>
        ))}
      </div>

      {/* Current Members */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
          현재 멤버 (3명)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {MEMBERS.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar name={member.avatar} color={member.color} size={32} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {member.email}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    backgroundColor:
                      member.role === "owner"
                        ? "#dcfce7"
                        : member.role === "editor"
                          ? "#dbeafe"
                          : "#fef3c7",
                    color:
                      member.role === "owner"
                        ? "#10b981"
                        : member.role === "editor"
                          ? "#3b82f6"
                          : "#b45309",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {member.role === "owner"
                    ? "소유자"
                    : member.role === "editor"
                      ? "편집자"
                      : "열람자"}
                </span>

                {member.role !== "owner" && (
                  <button
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    제거
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
