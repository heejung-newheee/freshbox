interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
}

export function Avatar({ name, color = "#10b981", size = 30 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size / 2,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {name?.[0]}
    </div>
  );
}
