import type { User } from "@supabase/supabase-js";
import { TODAY } from "../constants/constants";

export function getDday(expiry: string): number {
  return Math.ceil((new Date(expiry).getTime() - TODAY.getTime()) / 86400000);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

export function dday(exp: number | string | Date) {
  return Math.ceil((new Date(exp).getTime() - TODAY.getTime()) / 86400000);
}
export function ddayMeta(d: number) {
  if (d < 0)
    return {
      label: `만료`,
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
    };
  if (d === 0)
    return {
      label: `D-Day`,
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
    };
  if (d <= 2)
    return {
      label: `D-${d}`,
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
    };
  if (d <= 7)
    return {
      label: `D-${d}`,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    };
  return {
    label: `D-${d}`,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  };
}

// 프로필 표시 이름: 선택한 항목(이름/닉네임) → 다른 항목 → 이메일 순
export function getDisplayName(user: User | null): string {
  const m = user?.user_metadata ?? {};
  const preferred = m.display_pref === "nickname" ? m.nickname : m.name;
  return preferred || m.nickname || m.name || user?.email || "";
}
