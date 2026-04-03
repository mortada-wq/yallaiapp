"use client";

import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StudioWorkspace } from "@/components/StudioWorkspace";
import { CommandPalette } from "@/components/CommandPalette";
import { TemplateModal } from "@/components/TemplateModal";
import { ExportModal } from "@/components/ExportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { TourOverlay } from "@/components/TourOverlay";

export function StudioChrome() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleCommand = useCallback(() => setCommandOpen((v) => !v), []);

  useHotkeys(
    ["meta+k", "ctrl+k"],
    (e) => {
      e.preventDefault();
      toggleCommand();
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"] },
    [toggleCommand],
  );

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden text-[#E5E7EB]">
      <Header
        onCommandPalette={() => setCommandOpen(true)}
        onTemplates={() => setTemplatesOpen(true)}
        onExport={() => setExportOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />
      <div className="flex min-h-0 min-w-0 flex-1">
        <Sidebar />
        <StudioWorkspace />
      </div>
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onTemplates={() => setTemplatesOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onExport={() => setExportOpen(true)}
      />
      <TemplateModal open={templatesOpen} onOpenChange={setTemplatesOpen} />
      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TourOverlay />
    </div>
  );
}
