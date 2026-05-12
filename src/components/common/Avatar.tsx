interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export function Avatar({ name, color = "#10b981", size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ background: color }}
    >
      {name?.[0]}
    </div>
  );
}
