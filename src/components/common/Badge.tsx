interface BadgeProps {
  label: string;
  variant?: "default" | "danger" | "warning" | "success";
}

const variants = {
  default: { bg: "#e5e7eb", text: "#374151" },
  danger: { bg: "#fee2e2", text: "#dc2626" },
  warning: { bg: "#fef3c7", text: "#b45309" },
  success: { bg: "#dcfce7", text: "#16a34a" },
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  const { bg, text } = variants[variant];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "4px",
        backgroundColor: bg,
        color: text,
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
