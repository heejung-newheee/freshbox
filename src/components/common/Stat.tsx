interface StatProps {
  icon: string;
  value: number | string;
  label: string;
  sublabel?: string;
}

export function Stat({ icon, value, label, sublabel }: StatProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
