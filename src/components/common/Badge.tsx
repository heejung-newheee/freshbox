interface BadgeProps {
  label: string;
  variant?: "default" | "danger" | "warning" | "success";
}

const variants = {
  default: "bg-gray-200 text-gray-700",
  danger: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-600",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
}
