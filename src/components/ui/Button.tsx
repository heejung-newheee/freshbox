import type { ButtonHTMLAttributes } from "react";
import { fieldSizes, cx, type FieldSize } from "./formStyles";

type Variant =
  | "primary"
  | "soft"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-600",
  soft: "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100",
  secondary:
    "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100",
  outline:
    "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  danger: "bg-transparent text-red-500 hover:bg-red-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: FieldSize;
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        fieldSizes[size],
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
