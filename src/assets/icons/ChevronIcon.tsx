export function ChevronIcon({ s = 14, c = "currentColor", dir = "right" }) {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="2"
      strokeLinecap="round"
      style={{ transform: `rotate(${r}deg)` }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
