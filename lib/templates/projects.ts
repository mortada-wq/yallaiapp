import type { EditorFile } from "@/lib/types";
import { blankProject } from "@/lib/templates/defaults";
import { reactAppTemplate } from "@/lib/templates/react-app";
import { landingPageTemplate } from "@/lib/templates/landing-page";
import { dashboardTemplate } from "@/lib/templates/dashboard";
import { portfolioTemplate } from "@/lib/templates/portfolio";

export type TemplateId = "blank" | "react-app" | "landing" | "dashboard" | "portfolio";

export function loadTemplate(id: TemplateId): EditorFile[] {
  switch (id) {
    case "blank":
      return blankProject();
    case "react-app":
      return reactAppTemplate();
    case "landing":
      return landingPageTemplate();
    case "dashboard":
      return dashboardTemplate();
    case "portfolio":
      return portfolioTemplate();
    default: {
      const _: never = id;
      return _;
    }
  }
}
