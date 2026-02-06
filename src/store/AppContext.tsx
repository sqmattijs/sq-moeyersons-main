import React, { createContext, useContext, useReducer } from "react";
import type { AppState, Project, Task, User, Client, Resource, ResourceReservation, ProjectTypeConfig, ProjectTypeKey, TaskStatus } from "@/types";
import { initialState } from "@/data/dummyData";

// Action types
type Action =
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: { id: string; updates: Partial<Project> } }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "ADD_TASK"; payload: { projectId: string; task: Task } }
  | { type: "UPDATE_TASK"; payload: { projectId: string; taskId: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: { projectId: string; taskId: string } }
  | { type: "MOVE_TASK"; payload: { taskId: string; projectId: string; newStartDate: Date; newEndDate: Date } }
  | { type: "ASSIGN_TASK"; payload: { projectId: string; taskId: string; userIds: string[] } }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: { id: string; updates: Partial<User> } }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_CLIENT"; payload: Client }
  | { type: "UPDATE_CLIENT"; payload: { id: string; updates: Partial<Client> } }
  | { type: "DELETE_CLIENT"; payload: string }
  | { type: "ADD_RESOURCE"; payload: Resource }
  | { type: "UPDATE_RESOURCE"; payload: { id: string; updates: Partial<Resource> } }
  | { type: "DELETE_RESOURCE"; payload: string }
  | { type: "ADD_RESERVATION"; payload: ResourceReservation }
  | { type: "DELETE_RESERVATION"; payload: string }
  | { type: "UPDATE_PROJECT_TYPE_CONFIG"; payload: { key: ProjectTypeKey; config: Partial<ProjectTypeConfig> } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // Projects
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    // Tasks
    case "ADD_TASK":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? { ...p, tasks: [...p.tasks, action.payload.task] }
            : p
        ),
      };

    case "UPDATE_TASK":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t
                ),
              }
            : p
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? { ...p, tasks: p.tasks.filter((t) => t.id !== action.payload.taskId) }
            : p
        ),
      };

    case "MOVE_TASK": {
      const { taskId, projectId, newStartDate, newEndDate } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => ({
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId
              ? { ...t, startDate: newStartDate, endDate: newEndDate, status: (t.status === "nieuw" ? "gepland" : t.status) as TaskStatus }
              : t
          ),
        })),
      };
    }

    case "ASSIGN_TASK":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === action.payload.taskId
                    ? { ...t, assignedTo: action.payload.userIds }
                    : t
                ),
              }
            : p
        ),
      };

    // Users
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? { ...u, ...action.payload.updates } : u
        ),
      };

    case "DELETE_USER":
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };

    // Clients
    case "ADD_CLIENT":
      return { ...state, clients: [...state.clients, action.payload] };

    case "UPDATE_CLIENT":
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    case "DELETE_CLIENT":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.payload) };

    // Resources
    case "ADD_RESOURCE":
      return { ...state, resources: [...state.resources, action.payload] };

    case "UPDATE_RESOURCE":
      return {
        ...state,
        resources: state.resources.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };

    case "DELETE_RESOURCE":
      return { ...state, resources: state.resources.filter((r) => r.id !== action.payload) };

    // Reservations
    case "ADD_RESERVATION":
      return { ...state, reservations: [...state.reservations, action.payload] };

    case "DELETE_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.filter((r) => r.id !== action.payload),
      };

    // Project Type Configs
    case "UPDATE_PROJECT_TYPE_CONFIG":
      return {
        ...state,
        projectTypeConfigs: {
          ...state.projectTypeConfigs,
          [action.payload.key]: {
            ...state.projectTypeConfigs[action.payload.key],
            ...action.payload.config,
          },
        },
      };

    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
