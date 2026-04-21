"use client";

import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Header } from "@/components/Header";
import { ActivityBar } from "@/components/ActivityBar";
import { Sidebar } from "@/components/Sidebar";
import { StudioWorkspace } from "@/components/StudioWorkspace";
import { CommandPalette } from "@/components/CommandPalette";
import { TemplateModal } from "@/components/TemplateModal";
import { ExportModal } from "@/components/ExportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { TourOverlay } from "@/components/TourOverlay";
import { ProjectsModal } from "@/components/ProjectsModal";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import type { Project } from "@/lib/types";

export function StudioChrome() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  const openNewProject = useCallback(() => {
    setEditingProject(null);
    setProjectsOpen(false);
    setProjectFormOpen(true);
  }, []);

  const openEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setProjectsOpen(false);
    setProjectFormOpen(true);
  }, []);

  const handleProjectFormDone = useCallback(() => {
    setEditingProject(null);
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden text-[#E5E7EB]">
      <Header
        onExport={() => setExportOpen(true)}
        onProjects={() => setProjectsOpen(true)}
      />
      <div className="flex min-h-0 min-w-0 flex-1">
        <div className="hidden md:flex">
          <ActivityBar />
        </div>
        <div className="hidden md:flex">
          <Sidebar
            onSettings={() => setSettingsOpen(true)}
            onTemplates={() => setTemplatesOpen(true)}
            onExport={() => setExportOpen(true)}
            onProjects={() => setProjectsOpen(true)}
          />
        </div>
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
      <ProjectsModal
        open={projectsOpen}
        onOpenChange={setProjectsOpen}
        onNewProject={openNewProject}
        onEditProject={openEditProject}
      />
      <ProjectFormModal
        open={projectFormOpen}
        onOpenChange={setProjectFormOpen}
        editProject={editingProject}
        onDone={handleProjectFormDone}
      />
      <TourOverlay />
    </div>
  );
}
