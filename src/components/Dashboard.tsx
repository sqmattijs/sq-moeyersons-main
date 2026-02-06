import { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/AppContext";
import ProjectCard from "./ProjectCard";
import { PROJECT_TYPE_KEYS, TASK_STATUSES } from "@/types";
import type { ProjectTypeKey, TaskStatus } from "@/types";
import {
  projectTypeLabels,
  taskStatusLabels,
  PROJECT_TYPE_COLORS,
} from "@/lib/labels";

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  nieuw: "#3B82F6",
  gepland: "#F59E0B",
  bezig: "#F97316",
  afgerond: "#10B981",
};

export default function Dashboard() {
  const { state } = useAppStore();
  const { projects, users } = state;

  // --- Stats ---
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "lopend").length;
  const newProjects = projects.filter((p) => p.status === "nieuw").length;
  const availableUsers = users.length;

  // --- Recent projects (max 5) ---
  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
        .slice(0, 5),
    [projects]
  );

  // --- Pie chart: tasks per status ---
  const tasksByStatus = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      nieuw: 0,
      gepland: 0,
      bezig: 0,
      afgerond: 0,
    };
    for (const project of projects) {
      for (const task of project.tasks) {
        counts[task.status]++;
      }
    }
    return TASK_STATUSES.map((status) => ({
      name: taskStatusLabels[status],
      value: counts[status],
      status,
    }));
  }, [projects]);

  // --- Bar chart: projects per type ---
  const projectsByType = useMemo(() => {
    const counts: Record<ProjectTypeKey, number> = {} as Record<
      ProjectTypeKey,
      number
    >;
    for (const key of PROJECT_TYPE_KEYS) {
      counts[key] = 0;
    }
    for (const project of projects) {
      counts[project.type]++;
    }
    return PROJECT_TYPE_KEYS.map((key) => ({
      name: projectTypeLabels[key],
      count: counts[key],
      color: PROJECT_TYPE_COLORS[key],
      key,
    }));
  }, [projects]);

  // --- Progress bars: active projects ---
  const activeProjectProgress = useMemo(() => {
    return projects
      .filter((p) => p.status !== "afgerond")
      .map((p) => {
        const total = p.tasks.length;
        const completed = p.tasks.filter(
          (t) => t.status === "afgerond"
        ).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          id: p.id,
          name: p.name,
          typeLabel: projectTypeLabels[p.type],
          color: PROJECT_TYPE_COLORS[p.type],
          progress,
          completed,
          total,
        };
      });
  }, [projects]);

  // --- Upcoming deadlines ---
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return projects
      .filter((p) => p.deadline && p.status !== "afgerond")
      .map((p) => {
        const deadlineDate = new Date(p.deadline!);
        const daysRemaining = differenceInDays(deadlineDate, today);
        return {
          id: p.id,
          name: p.name,
          deadline: deadlineDate,
          daysRemaining,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totaal Projecten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lopende Projecten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nieuwe Projecten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newProjects}</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Beschikbare Medewerkers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row: 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart: tasks per status */}
        <Card>
          <CardHeader>
            <CardTitle>Taken per status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ""
                  }
                >
                  {tasksByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={TASK_STATUS_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart: projects per type */}
        <Card>
          <CardHeader>
            <CardTitle>Projecten per type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectsByType}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Projecten" radius={[4, 4, 0, 0]}>
                  {projectsByType.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project progress - full width */}
      <Card>
        <CardHeader>
          <CardTitle>Projectvoortgang</CardTitle>
        </CardHeader>
        <CardContent>
          {activeProjectProgress.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Geen actieve projecten.
            </p>
          ) : (
            <div className="space-y-4">
              {activeProjectProgress.map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{project.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {project.typeLabel}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {project.completed}/{project.total} taken ({project.progress}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming deadlines - full width */}
      <Card>
        <CardHeader>
          <CardTitle>Aankomende deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Geen aankomende deadlines.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((item) => {
                let colorClass = "text-green-600";
                if (item.daysRemaining < 7) {
                  colorClass = "text-red-600";
                } else if (item.daysRemaining < 14) {
                  colorClass = "text-amber-600";
                }

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {format(item.deadline, "dd-MM-yyyy")}
                      </span>
                      <span className={`font-medium ${colorClass}`}>
                        {item.daysRemaining < 0
                          ? `${Math.abs(item.daysRemaining)} dagen te laat`
                          : item.daysRemaining === 0
                          ? "Vandaag"
                          : `${item.daysRemaining} dagen`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projecten Overzicht (existing tabs) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Projecten Overzicht</h2>

        <Tabs defaultValue="recent">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="recent">Recente Projecten</TabsTrigger>
              <TabsTrigger value="active">Actieve Projecten</TabsTrigger>
              <TabsTrigger value="all">Alle Projecten</TabsTrigger>
            </TabsList>

            <Button size="sm">Projecten Beheren</Button>
          </div>

          <TabsContent
            value="recent"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </TabsContent>

          <TabsContent
            value="active"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects
              .filter((p) => p.status === "lopend")
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </TabsContent>

          <TabsContent
            value="all"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
