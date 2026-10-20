import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Button·Input 공통 사이즈 (높이 / 좌우 여백 / 글자 크기)
export type FieldSize = "sm" | "md" | "lg";

export const fieldSizes: Record<FieldSize, string> = {
  sm: "h-8 px-3 text-[12px]", // 32px
  md: "h-9.5 px-3.5 text-[13px]", // 38px (기본)
  lg: "h-11 px-4 text-[14px]", // 44px
};

// 입력 필드 스타일. 커스텀 드롭다운 트리거처럼 input 이 아닌 요소에도 사용
export const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white disabled:opacity-60";

// className 충돌 시 뒤에 오는 값 우선
export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
