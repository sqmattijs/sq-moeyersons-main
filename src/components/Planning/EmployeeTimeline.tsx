import { useState, useMemo } from "react";
import { startOfWeek, addDays, addWeeks, subWeeks, format, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useAppStore } from "@/store/AppContext";
import { getTasksByDate } from "@/store/selectors";
import { PROJECT_TYPE_COLORS } from "@/lib/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectTypeKey } from "@/types";

const WEEK_DAYS = 7;

export default function EmployeeTimeline() {
  const { state, dispatch } = useAppStore();
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () =>
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = useMemo(
    () => Array.from({ length: WEEK_DAYS }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );

  const today = new Date();

  const monteurs = useMemo(
    () => state.users.filter((u) => u.role === "monteur"),
    [state.users]
  );

  // Pre-compute tasks by date for the whole week
  const tasksByDate = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getTasksByDate>>();
    for (const day of days) {
      map.set(format(day, "yyyy-MM-dd"), getTasksByDate(state, day));
    }
    return map;
  }, [state, days]);

  // Unassigned tasks grouped by project
  const unassignedByProject = useMemo(() => {
    const grouped = new Map<
      string,
      { projectName: string; projectType: ProjectTypeKey; tasks: { id: string; title: string; projectId: string }[] }
    >();

    for (const project of state.projects) {
      const unassigned = project.tasks.filter(
        (t) => !t.assignedTo || t.assignedTo.length === 0
      );
      if (unassigned.length > 0) {
        grouped.set(project.id, {
          projectName: project.name,
          projectType: project.type,
          tasks: unassigned.map((t) => ({
            id: t.id,
            title: t.title,
            projectId: project.id,
          })),
        });
      }
    }
    return grouped;
  }, [state.projects]);

  const getTasksForUserOnDay = (userId: string, day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const dayTasks = tasksByDate.get(key) ?? [];
    return dayTasks.filter((t) => t.assignedTo?.includes(userId));
  };

  // Drag handlers for sidebar tasks
  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    projectId: string
  ) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("projectId", projectId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Drop handler for timeline cells
  const handleDrop = (e: React.DragEvent, userId: string, day: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-primary/5", "ring-2", "ring-primary/30");

    const taskId = e.dataTransfer.getData("taskId");
    const projectId = e.dataTransfer.getData("projectId");

    if (!taskId || !projectId) return;

    dispatch({
      type: "MOVE_TASK",
      payload: {
        taskId,
        projectId,
        newStartDate: day,
        newEndDate: day,
      },
    });

    dispatch({
      type: "ASSIGN_TASK",
      payload: {
        taskId,
        projectId,
        userIds: [userId],
      },
    });

    const user = state.users.find((u) => u.id === userId);
    toast.success(
      `Taak toegewezen aan ${user?.name ?? "medewerker"}`,
      { description: format(day, "EEEE d MMMM", { locale: nl }) }
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-primary/5", "ring-2", "ring-primary/30");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-primary/5", "ring-2", "ring-primary/30");
  };

  return (
    <div className="flex gap-4">
      {/* Main timeline */}
      <div className="flex-1 space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Medewerker Planning</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Vorige week
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Vandaag
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              Volgende week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 z-10 bg-card p-3 text-left text-sm font-medium text-muted-foreground min-w-[160px]">
                      Medewerker
                    </th>
                    {days.map((day) => {
                      const isToday = isSameDay(day, today);
                      return (
                        <th
                          key={day.toISOString()}
                          className={`p-3 text-center text-sm font-medium min-w-[140px] ${
                            isToday
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div>{format(day, "EEEE", { locale: nl })}</div>
                          <div className="text-xs">
                            {format(day, "d MMM", { locale: nl })}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {monteurs.length === 0 && (
                    <tr>
                      <td
                        colSpan={WEEK_DAYS + 1}
                        className="p-8 text-center text-muted-foreground"
                      >
                        Geen monteurs gevonden
                      </td>
                    </tr>
                  )}
                  {monteurs.map((user) => (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="sticky left-0 z-10 bg-card p-3 font-medium text-sm">
                        {user.name}
                      </td>
                      {days.map((day) => {
                        const tasks = getTasksForUserOnDay(user.id, day);
                        const isToday = isSameDay(day, today);
                        return (
                          <td
                            key={day.toISOString()}
                            className={`p-2 align-top transition-colors ${
                              isToday ? "bg-primary/5" : ""
                            }`}
                            onDrop={(e) => handleDrop(e, user.id, day)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                          >
                            <div className="min-h-[48px] space-y-1">
                              {tasks.map((task) => (
                                <Badge
                                  key={task.id}
                                  variant="secondary"
                                  className="block w-full text-xs text-left truncate cursor-default"
                                  style={{
                                    backgroundColor: `${PROJECT_TYPE_COLORS[task.projectType]}20`,
                                    color: PROJECT_TYPE_COLORS[task.projectType],
                                    borderColor: `${PROJECT_TYPE_COLORS[task.projectType]}40`,
                                    borderWidth: 1,
                                  }}
                                  title={`${task.title} - ${task.projectName}`}
                                >
                                  {task.title}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned tasks sidebar */}
      <div className="w-72 shrink-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Niet-toegewezen taken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {unassignedByProject.size === 0 && (
              <p className="text-sm text-muted-foreground">
                Alle taken zijn toegewezen
              </p>
            )}
            {Array.from(unassignedByProject.entries()).map(
              ([projectId, group]) => (
                <div key={projectId}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          PROJECT_TYPE_COLORS[group.projectType],
                      }}
                    />
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {group.projectName}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, task.id, task.projectId)
                        }
                        className="flex items-center gap-2 p-2 rounded-md border text-sm cursor-grab active:cursor-grabbing hover:bg-accent transition-colors"
                      >
                        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
