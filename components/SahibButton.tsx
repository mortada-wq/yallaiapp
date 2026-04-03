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
        "rounded-xl border border-[rgba(58,138,175,0.55)] bg-[#252526] transition-all duration-300 ease-in-out",
        "hover:border-[rgba(58,138,175,0.8)] hover:shadow-sahib-ring disabled:pointer-events-none disabled:opacity-45 disabled:hover:shadow-none",
        className,
      )}
      {...rest}
    >
      <span className="flex min-h-10 items-center justify-center px-5 py-2 text-sm font-semibold text-[#E5E7EB]">
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
        "rounded-xl border border-[rgba(58,138,175,0.5)] bg-transparent px-4 py-2 text-sm text-[#E5E7EB]",
        "transition-all duration-300 ease-in-out",
        "hover:bg-[rgba(58,138,175,0.1)] hover:shadow-[0_0_16px_rgba(58,138,175,0.2)]",
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
        "rounded-xl border border-[rgba(58,138,175,0.4)] bg-transparent p-2 text-[#E5E7EB]",
        "transition-all duration-300 ease-in-out hover:bg-[rgba(58,138,175,0.12)]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
