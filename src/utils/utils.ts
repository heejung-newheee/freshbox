import type { DdayMeta } from "../@types/types";
import { TODAY } from "../constants/constants";

export function getDday(expiry: string): number {
  return Math.ceil((new Date(expiry).getTime() - TODAY.getTime()) / 86400000);
}

export function getDdayMeta(d: number): DdayMeta {
  if (d < 0)
    return {
      label: "만료",
      textColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  if (d === 0)
    return {
      label: "D-Day",
      textColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  if (d <= 2)
    return {
      label: `D-${d}`,
      textColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  if (d <= 7)
    return {
      label: `D-${d}`,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    };
  return {
    label: `D-${d}`,
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  };
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
