import { useState, useRef, useEffect } from "react";
import { BellIcon, SearchIcon, PlusIcon } from "@/assets/icons";
import { Avatar } from "@/components/common";

interface HeaderProps {
  title: string;
  urgentCount?: number;
  onAddItem?: () => void;
}

export function Header({ title, urgentCount = 0, onAddItem }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 40,
      }}
    >
      <h1 style={{ fontSize: "18px", fontWeight: 700 }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#f3f4f6",
            paddingLeft: "12px",
            borderRadius: "6px",
            flex: "0 1 200px",
          }}
        >
          <SearchIcon s={16} c="#9ca3af" />
          <input
            type="text"
            placeholder="검색..."
            style={{
              flex: 1,
              border: "none",
              backgroundColor: "transparent",
              padding: "8px 12px",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Notification */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              position: "relative",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            <BellIcon s={18} c="#6b7280" />
            {urgentCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {urgentCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              ref={notifRef}
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                minWidth: "250px",
                marginTop: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                알림
              </div>
              <div style={{ padding: "12px", fontSize: "12px" }}>
                {urgentCount > 0 ? (
                  <div style={{ color: "#6b7280" }}>
                    곧 만료될 식품이 {urgentCount}개 있습니다.
                  </div>
                ) : (
                  <div style={{ color: "#9ca3af" }}>알림이 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={onAddItem}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#059669";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#10b981";
          }}
        >
          <PlusIcon s={16} c="#fff" />
          재료 추가
        </button>

        {/* Avatar */}
        <Avatar name="H" color="#10b981" size={32} />
      </div>
    </header>
  );
}
