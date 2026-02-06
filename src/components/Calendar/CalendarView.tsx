
import { useState } from "react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  startOfMonth,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMonths,
  subMonths,
  endOfWeek,
} from "date-fns";
import { nl } from "date-fns/locale";
import { useAppStore } from "@/store/AppContext";
import { CalendarControls } from "./CalendarControls";
import { CalendarWeekGrid } from "./CalendarWeekGrid";
import { UnscheduledTasks } from "./UnscheduledTasks";
import CalendarDayView from "./CalendarDayView";
import CalendarMonthView from "./CalendarMonthView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarView() {
  const { state, dispatch } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [viewType, setViewType] = useState<"tasks" | "projects">("tasks");

  // Navigation handlers per view mode
  const goToPrevious = () => {
    if (viewMode === "day") {
      setCurrentDate(subDays(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setCurrentWeek(startOfWeek(today, { weekStartsOn: 1 }));
    setCurrentMonth(startOfMonth(today));
  };

  // Dynamic title based on view mode
  const getTitle = (): string => {
    if (viewMode === "day") {
      return format(currentDate, "EEEE d MMMM yyyy", { locale: nl });
    }
    if (viewMode === "week") {
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      return `${format(currentWeek, "d MMM", { locale: nl })} – ${format(weekEnd, "d MMM yyyy", { locale: nl })}`;
    }
    return format(currentMonth, "MMMM yyyy", { locale: nl });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    // Find which project owns this task
    const ownerProject = state.projects.find((p) =>
      p.tasks.some((t) => t.id === taskId)
    );

    if (!ownerProject) {
      toast.error("Taak niet gevonden");
      return;
    }

    dispatch({
      type: "MOVE_TASK",
      payload: {
        taskId,
        projectId: ownerProject.id,
        newStartDate: date,
        newEndDate: date,
      },
    });

    toast.success(`Taak verplaatst naar ${format(date, 'dd-MM-yyyy')}`, {
      description: "Succesvol ingepland",
    });
  };

  const handleAddTask = (date: Date) => {
    toast.info(`Nieuwe taak toevoegen voor ${format(date, 'dd-MM-yyyy')}`, {
      description: "Opent normaal gesproken een formulier"
    });
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <CalendarControls
          title={getTitle()}
          viewMode={viewMode}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onToday={goToToday}
          onViewModeChange={setViewMode}
        />

        <div className="flex items-center gap-3">
          <Select value={viewType} onValueChange={(value) => setViewType(value as "tasks" | "projects")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bekijk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tasks">Tonen per taak</SelectItem>
              <SelectItem value="projects">Tonen per project</SelectItem>
            </SelectContent>
          </Select>

          {viewType === "projects" && (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecteer project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle projecten</SelectItem>
                {state.projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="projectSteps">Projectstappen</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          {viewMode === "day" && (
            <CalendarDayView
              currentDate={currentDate}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekGrid
              currentWeek={currentWeek}
              onDrop={handleDrop}
              onAddTask={handleAddTask}
              onDragStart={handleDragStart}
              viewType={viewType}
              selectedProject={selectedProject}
            />
          )}

          {viewMode === "month" && (
            <CalendarMonthView
              currentMonth={currentMonth}
              onDayClick={handleDayClick}
            />
          )}

          {viewType === "tasks" && (
            <UnscheduledTasks
              onDragStart={handleDragStart}
            />
          )}
        </TabsContent>

        <TabsContent value="projectSteps" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Projectstappen</h3>

              <div className="space-y-4">
                {selectedProject === "all" ? (
                  <p>Selecteer een specifiek project om de stappen te bekijken</p>
                ) : (
                  <div>
                    {state.projects
                      .filter(p => p.id === selectedProject)
                      .map(project => (
                        <div key={project.id} className="space-y-3">
                          <h4 className="font-medium">{project.name}</h4>
                          <div className="space-y-2">
                            {project.tasks.map((task, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-md flex justify-between items-center"
                                draggable
                                onDragStart={(e) => handleDragStart(e, task.id)}
                              >
                                <div>
                                  <p className="font-medium">{task.title}</p>
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                </div>
                                <div className={`px-2 py-1 text-xs rounded-full ${
                                  task.status === 'nieuw' ? 'bg-blue-100 text-blue-800' :
                                  task.status === 'gepland' ? 'bg-yellow-100 text-yellow-800' :
                                  task.status === 'bezig' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
