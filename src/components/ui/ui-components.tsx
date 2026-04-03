import React from "react";
import type { DdayMeta, Role } from "../../@types/types";
import { ROLE_META } from "../../constants/constants";
import { cn } from "../../utils/utils";

// ── Avatar ──────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}
export function Avatar({ name, color, size = "md" }: AvatarProps) {
  const sz = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }[size];
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2",
        sz,
      )}
      style={{ background: color + "20", borderColor: color + "50", color }}
    >
      {name[0]}
    </div>
  );
}

// ── DdayBadge ───────────────────────────────────────────────────
interface DdayBadgeProps {
  meta: DdayMeta;
}
export function DdayBadge({ meta }: DdayBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap",
        meta.textColor,
        meta.bgColor,
        meta.borderColor,
      )}
    >
      {meta.label}
    </span>
  );
}

// ── RoleBadge ───────────────────────────────────────────────────
export function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

// ── Card ────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}
export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl",
        variant === "default" && "border border-stone-100 shadow-sm",
        variant === "elevated" && "shadow-md border border-stone-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── SectionTitle ────────────────────────────────────────────────
interface SectionTitleProps {
  children: React.ReactNode;
  action?: React.ReactNode;
}
export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-stone-800 tracking-tight">
        {children}
      </h3>
      {action}
    </div>
  );
}

// ── StatCard ────────────────────────────────────────────────────
interface StatCardProps {
  emoji: string;
  label: string;
  value: number;
  accentClass: string;
  bgClass: string;
}
export function StatCard({
  emoji,
  label,
  value,
  accentClass,
  bgClass,
}: StatCardProps) {
  return (
    <Card className="p-4">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3",
          bgClass,
        )}
      >
        {emoji}
      </div>
      <div
        className={cn(
          "text-3xl font-black leading-none tracking-tighter",
          accentClass,
        )}
      >
        {value}
      </div>
      <div className="text-xs text-stone-400 mt-1.5 font-medium">{label}</div>
    </Card>
  );
}

// ── FilterPill ──────────────────────────────────────────────────
interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
export function FilterPill({ active, onClick, children }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 border",
        active
          ? "bg-emerald-500 text-white border-emerald-500"
          : "bg-white text-stone-500 border-stone-200 hover:border-emerald-300",
      )}
    >
      {children}
    </button>
  );
}

// ── PrimaryButton ───────────────────────────────────────────────
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}
export function PrimaryButton({
  children,
  onClick,
  className,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-sm font-bold shadow-emerald-200 shadow-md hover:shadow-lg transition-all active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── GhostButton ─────────────────────────────────────────────────
interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
export function GhostButton({
  children,
  onClick,
  className,
}: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 text-xs font-semibold hover:bg-stone-100 transition-all active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── FormInput ───────────────────────────────────────────────────
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export function FormInput({ label, ...props }: FormInputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 bg-stone-50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
      />
    </div>
  );
}

// ── FormSelect ──────────────────────────────────────────────────
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}
export function FormSelect({ label, children, ...props }: FormSelectProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1.5">
        {label}
      </label>
      <select
        {...props}
        className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 bg-stone-50 outline-none focus:border-emerald-400 appearance-none"
      >
        {children}
      </select>
    </div>
  );
}
