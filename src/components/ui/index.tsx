"use client";

import { cn } from "@/lib/utils";
import type {
  HTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import {
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";

// ===== Badge =====
export function Badge({
  color = "default",
  children,
  className,
}: {
  color?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  children: ReactNode;
  className?: string;
}) {
  const colors: Record<string, string> = {
    default: "bg-ink-100 text-ink-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    primary: "bg-primary-50 text-primary-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

// ===== Input =====
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
});

// ===== Textarea =====
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-2 min-h-[100px]",
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

// ===== Select =====
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink-900 transition focus:outline-none focus:ring-2 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:14px] bg-[right_16px_center] bg-no-repeat pr-10",
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-ink-200 focus:border-ink-900 focus:ring-ink-900/10",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

// ===== Alert =====
export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const variants: Record<
    string,
    { bg: string; border: string; text: string; icon: LucideIcon }
  > = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: Info,
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: XCircle,
    },
  };
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 flex gap-3",
        v.bg,
        v.border,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", v.text)} />
      <div className="flex-1 text-sm">
        {title && <p className={cn("font-semibold", v.text)}>{title}</p>}
        {children && (
          <div className={cn("text-ink-700", title && "mt-0.5")}>{children}</div>
        )}
      </div>
    </div>
  );
}

// ===== Card =====
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white ring-1 ring-ink-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ===== Skeleton =====
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

// ===== Divider =====
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-ink-200", className)} />;
}

// ===== Empty state =====
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      {Icon && <Icon className="h-10 w-10 text-ink-400 mb-3" />}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-500 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ===== Container =====
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)}
    >
      {children}
    </div>
  );
}
