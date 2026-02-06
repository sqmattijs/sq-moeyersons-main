import type { EmployeeRole, ResourceType, TaskStatus, ProjectStatus, ProjectTypeKey } from "@/types";

export const roleLabels: Record<EmployeeRole, string> = {
  planner: "Planner",
  monteur: "Monteur",
  magazijn: "Magazijnier",
  administratief: "Administratief",
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  spuiterij: "Spuitcabine",
  werkplaats: "Werkplaats",
  herstellingen: "Herstellingshal",
  magazijn: "Magazijn",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  nieuw: "Nieuw",
  gepland: "Gepland",
  bezig: "Bezig",
  afgerond: "Afgerond",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  nieuw: "Nieuw",
  lopend: "Lopend",
  afgerond: "Afgerond",
};

export const projectTypeLabels: Record<ProjectTypeKey, string> = {
  kastbouw: "Kastopbouw",
  herstelling: "Herstelling",
  spuiterij: "Spuiterij",
  maatwerk: "Maatwerk",
  mobiel: "Mobiele werkplaats",
  medisch: "Medische wagen",
  tv: "TV-wagen",
  leger: "Leger & Politie",
};

export const clientTypeLabels = {
  klant: "Klant",
  prospect: "Prospect",
} as const;

export const PROJECT_TYPE_COLORS: Record<ProjectTypeKey, string> = {
  kastbouw: "#3B82F6",
  herstelling: "#EF4444",
  spuiterij: "#F59E0B",
  maatwerk: "#10B981",
  mobiel: "#8B5CF6",
  medisch: "#EC4899",
  tv: "#6366F1",
  leger: "#065F46",
};
