"use client";

import { LayoutGrid, Search, Settings, Share2 } from "lucide-react";
import { SahibLogo } from "@/components/SahibLogo";
import { SahibIconButton, SahibSecondaryButton } from "@/components/SahibButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onCommandPalette: () => void;
  onTemplates: () => void;
  onExport: () => void;
  onSettings: () => void;
};

export function Header({
  onCommandPalette,
  onTemplates,
  onExport,
  onSettings,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-[60px] shrink-0 items-center justify-between border-b px-4 backdrop-blur-md lg:px-6",
        "border-[#3c3c3c] bg-[#252526] shadow-sahib-glow",
      )}
    >
      <div className="flex min-w-0 items-center">
        <SahibLogo />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <SahibSecondaryButton
          type="button"
          onClick={onCommandPalette}
          className="hidden h-9 items-center gap-1 px-2 py-0 text-xs sm:inline-flex"
        >
          <Search className="h-3.5 w-3.5" />
          ⌘K
        </SahibSecondaryButton>
        <SahibSecondaryButton
          type="button"
          onClick={onTemplates}
          className="inline-flex h-9 items-center gap-1 px-2 py-0 text-xs"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </SahibSecondaryButton>
        <SahibIconButton type="button" onClick={onExport} aria-label="Share">
          <Share2 className="h-4 w-4" />
        </SahibIconButton>
        <ThemeToggle />
        <SahibIconButton type="button" onClick={onSettings} aria-label="Settings">
          <Settings className="h-4 w-4" />
        </SahibIconButton>
      </div>
    </header>
  );
}
