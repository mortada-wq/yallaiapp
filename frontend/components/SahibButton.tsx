"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SahibPrimaryButton({
  className,
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type={type}
      className={cn(
        "sahib-glass rounded-xl transition-all duration-300 ease-in-out",
        "hover:shadow-sahib-ring disabled:pointer-events-none disabled:opacity-45 disabled:hover:shadow-none",
        className,
      )}
      {...rest}
    >
      <span className="flex min-h-10 items-center justify-center px-5 py-2 text-sm font-semibold text-white">
        {children}
      </span>
    </button>
  );
}

export function SahibSecondaryButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "sahib-glass rounded-xl px-4 py-2 text-sm text-white transition-all duration-300 ease-in-out",
        "hover:shadow-[0_0_16px_rgba(58,138,175,0.2)]",
        "disabled:opacity-45",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SahibIconButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "sahib-glass rounded-xl p-2 text-white transition-all duration-300 ease-in-out",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
