export const PROJECT_TYPE_KEYS = [
  "kastbouw",
  "herstelling",
  "spuiterij",
  "maatwerk",
  "mobiel",
  "medisch",
  "tv",
  "leger",
] as const;

export type ProjectTypeKey = (typeof PROJECT_TYPE_KEYS)[number];

export const TASK_STATUSES = ["nieuw", "gepland", "bezig", "afgerond"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PROJECT_STATUSES = ["nieuw", "lopend", "afgerond"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EMPLOYEE_ROLES = ["planner", "monteur", "magazijn", "administratief"] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const RESOURCE_TYPES = ["spuiterij", "werkplaats", "herstellingen", "magazijn"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const CLIENT_TYPES = ["klant", "prospect"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export type DayAvailability = {
  available: boolean;
  startTime?: string; // "08:00"
  endTime?: string;   // "17:00"
};

export type WeeklyAvailability = {
  maandag: DayAvailability;
  dinsdag: DayAvailability;
  woensdag: DayAvailability;
  donderdag: DayAvailability;
  vrijdag: DayAvailability;
  zaterdag: DayAvailability;
  zondag: DayAvailability;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  skills: string[];
  availability?: WeeklyAvailability;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  duration?: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
  assignedTo?: string[];
  dependsOn?: string[];
  resourceType?: ResourceType;
};

export type Project = {
  id: string;
  name: string;
  title: string;
  description: string;
  type: ProjectTypeKey;
  tasks: Task[];
  clientId?: string;
  client?: string;
  deadline?: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
};

export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  type: ClientType;
};

export type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
};

export type ResourceReservation = {
  id: string;
  resourceId: string;
  taskId: string;
  projectId: string;
  date: string; // yyyy-MM-dd
  startTime: string;
  endTime: string;
};

export type TaskTemplate = {
  title: string;
  description: string;
  duration?: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
  dependencies?: number[]; // indices of dependent templates
};

export type ProjectTypeConfig = {
  key: ProjectTypeKey;
  name: string;
  color: string;
  taskTemplates: TaskTemplate[];
};

export type AppState = {
  projects: Project[];
  users: User[];
  clients: Client[];
  resources: Resource[];
  reservations: ResourceReservation[];
  projectTypeConfigs: Record<ProjectTypeKey, ProjectTypeConfig>;
};
