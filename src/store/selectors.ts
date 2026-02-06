import { format } from "date-fns";
import type { AppState, Task, ProjectTypeKey, EmployeeRole } from "@/types";

export function getProjectById(state: AppState, id: string) {
  return state.projects.find((p) => p.id === id);
}

export function getAllTasks(state: AppState): (Task & { projectName: string; projectType: ProjectTypeKey })[] {
  return state.projects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, projectName: p.name, projectType: p.type }))
  );
}

export function getTasksByDate(state: AppState, date: Date): (Task & { projectName: string; projectType: ProjectTypeKey })[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return state.projects.flatMap((p) =>
    p.tasks
      .filter((t) => {
        const start = format(t.startDate, "yyyy-MM-dd");
        const end = format(t.endDate, "yyyy-MM-dd");
        return dateStr >= start && dateStr <= end;
      })
      .map((t) => ({ ...t, projectName: p.name, projectType: p.type }))
  );
}

export function getUnscheduledTasks(state: AppState): (Task & { projectName: string; projectType: ProjectTypeKey })[] {
  return state.projects.flatMap((p) =>
    p.tasks
      .filter((t) => t.status === "nieuw")
      .map((t) => ({ ...t, projectName: p.name, projectType: p.type }))
  );
}

export function getUsersByRole(state: AppState, role: EmployeeRole) {
  return state.users.filter((u) => u.role === role);
}

export function getAvailableUsers(state: AppState, date: Date) {
  const dayNames = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"] as const;
  const dayName = dayNames[date.getDay()];

  return state.users.filter((u) => {
    if (!u.availability) return true;
    return u.availability[dayName]?.available ?? true;
  });
}

export function getReservationsForResource(state: AppState, resourceId: string) {
  return state.reservations.filter((r) => r.resourceId === resourceId);
}

export function getReservationsForDate(state: AppState, date: string) {
  return state.reservations.filter((r) => r.date === date);
}

export function getProjectColor(state: AppState, type: ProjectTypeKey): string {
  return state.projectTypeConfigs[type]?.color ?? "#6b7280";
}

export function getProjectTypeConfig(state: AppState, type: ProjectTypeKey) {
  return state.projectTypeConfigs[type];
}

export function getClientById(state: AppState, id: string) {
  return state.clients.find((c) => c.id === id);
}

export function getProjectsForClient(state: AppState, clientId: string) {
  return state.projects.filter((p) => p.clientId === clientId);
}

export function getTasksForUser(state: AppState, userId: string): (Task & { projectName: string; projectType: ProjectTypeKey })[] {
  return state.projects.flatMap((p) =>
    p.tasks
      .filter((t) => t.assignedTo?.includes(userId))
      .map((t) => ({ ...t, projectName: p.name, projectType: p.type }))
  );
}

type SearchResult = {
  type: "project" | "task" | "user" | "client";
  id: string;
  title: string;
  subtitle: string;
  projectId?: string;
};

export function searchAll(state: AppState, query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const p of state.projects) {
    if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
      results.push({ type: "project", id: p.id, title: p.name, subtitle: state.projectTypeConfigs[p.type]?.name ?? p.type });
    }
    for (const t of p.tasks) {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        results.push({ type: "task", id: t.id, title: t.title, subtitle: p.name, projectId: p.id });
      }
    }
  }

  for (const u of state.users) {
    if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
      results.push({ type: "user", id: u.id, title: u.name, subtitle: u.email });
    }
  }

  for (const c of state.clients) {
    if (c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q)) {
      results.push({ type: "client", id: c.id, title: c.name, subtitle: c.contactPerson });
    }
  }

  return results.slice(0, 20);
}
