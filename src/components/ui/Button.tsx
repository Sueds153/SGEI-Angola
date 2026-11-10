"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "dark" | "accent";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: "full" | "lg";
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-ink-900 text-white hover:bg-black shadow-sm",
  secondary: "bg-white text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
  danger: "bg-danger-500 text-white hover:bg-danger-600",
  outline: "border border-ink-300 bg-transparent text-ink-900 hover:bg-ink-50",
  dark: "bg-black text-white hover:bg-ink-900",
  accent: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px] rounded-full gap-1.5",
  md: "h-11 px-6 text-[15px] rounded-full gap-2",
  lg: "h-13 px-8 py-3.5 text-[15px] md:text-base rounded-full gap-2",
  icon: "h-10 w-10 rounded-full gap-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth,
    className,
    children,
    disabled,
    rounded = "full",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none",
        variantStyles[variant],
        sizeStyles[size],
        rounded === "lg" && "!rounded-xl",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
