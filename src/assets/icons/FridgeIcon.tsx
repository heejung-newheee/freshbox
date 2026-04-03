export function FridgeIcon({ s = 18, c = "currentColor" }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M4 10h16" />
      <path d="M9 6v2" />
      <path d="M9 14v4" />
    </svg>
  );
}
