
import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/AppContext";
import { getDefaultTasksForProjectType } from "@/data/dummyData";
import type { ProjectTypeKey } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

type TaskUsage = {
  taskTitle: string;
  projectTypes: string[];
  projects: string[];
  duration?: {
    value: number;
    unit: string;
  };
};

export default function TasksManager() {
  const { state } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("60");
  const [newTaskDurationType, setNewTaskDurationType] = useState("minutes");
  const [selectedProjectType, setSelectedProjectType] = useState<string | null>(null);
  const [localAddedTasks, setLocalAddedTasks] = useState<TaskUsage[]>([]);

  // Collect all tasks across all project types and calculate their usage
  const tasks = useMemo(() => {
    const taskMap = new Map<string, TaskUsage>();

    // Collect tasks from project type templates
    Object.values(state.projectTypeConfigs).forEach(config => {
      const templateTasks = getDefaultTasksForProjectType(config.key);
      templateTasks.forEach(task => {
        if (!taskMap.has(task.title!)) {
          taskMap.set(task.title!, {
            taskTitle: task.title!,
            projectTypes: [config.key],
            projects: [],
            duration: task.duration || { value: 60, unit: "minutes" },
          });
        } else {
          const existing = taskMap.get(task.title!)!;
          if (!existing.projectTypes.includes(config.key)) {
            existing.projectTypes.push(config.key);
          }
        }
      });
    });

    // Collect tasks from actual projects
    state.projects.forEach(project => {
      project.tasks.forEach(task => {
        if (taskMap.has(task.title)) {
          const existing = taskMap.get(task.title)!;
          if (!existing.projects.includes(project.title)) {
            existing.projects.push(project.title);
          }
        } else {
          taskMap.set(task.title, {
            taskTitle: task.title,
            projectTypes: [],
            projects: [project.title],
            duration: task.duration || { value: 60, unit: "minutes" },
          });
        }
      });
    });

    return [...Array.from(taskMap.values()), ...localAddedTasks];
  }, [state.projectTypeConfigs, state.projects, localAddedTasks]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDescription.trim() || !newTaskDuration.trim() || !selectedProjectType) {
      toast.error("Vul alle velden in");
      return;
    }

    const config = state.projectTypeConfigs[selectedProjectType as ProjectTypeKey];
    toast.success(`Taak "${newTaskTitle}" toegevoegd aan ${config?.name ?? selectedProjectType}`);

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDuration("60");
    setNewTaskDurationType("minutes");
    setSelectedProjectType(null);
    setIsAddTaskDialogOpen(false);

    // Add to local list
    const newTask: TaskUsage = {
      taskTitle: newTaskTitle,
      projectTypes: [selectedProjectType],
      projects: [],
      duration: {
        value: parseInt(newTaskDuration),
        unit: newTaskDurationType
      }
    };

    setLocalAddedTasks(prev => [...prev, newTask]);
  };

  const filteredTasks = tasks.filter(task =>
    task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return "Niet ingesteld";

    return `${duration.value} ${duration.unit === "minutes" ? "minuten" :
      duration.unit === "hours" ? "uren" : "dagen"}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg font-medium">Takenbeheer</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Zoeken op taak naam..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddTaskDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nieuwe Taak
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Taak Naam</TableHead>
                <TableHead className="hidden md:table-cell">Geschatte Duur</TableHead>
                <TableHead className="hidden md:table-cell">Project Types</TableHead>
                <TableHead className="hidden lg:table-cell">Gebruikt in Projecten</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Geen taken gevonden
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{task.taskTitle}</div>
                      <div className="md:hidden mt-1">
                        <Badge variant="outline">{formatDuration(task.duration)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{formatDuration(task.duration)}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {task.projectTypes.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Geen</span>
                        ) : (
                          task.projectTypes.map((typeKey, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {state.projectTypeConfigs[typeKey as ProjectTypeKey]?.name ?? typeKey}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {task.projects.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Niet gebruikt</span>
                        ) : (
                          <>
                            {task.projects.slice(0, 2).map((project, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {project}
                              </Badge>
                            ))}
                            {task.projects.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.projects.length - 2} meer
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nieuwe Taak Toevoegen</DialogTitle>
            <DialogDescription>
              Voeg een nieuwe standaard taak toe aan een project type
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="projectType" className="text-right text-sm">
                Project Type
              </label>
              <div className="col-span-3">
                <Select value={selectedProjectType || ""} onValueChange={setSelectedProjectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(state.projectTypeConfigs).map((config) => (
                      <SelectItem key={config.key} value={config.key}>{config.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="taskTitle" className="text-right text-sm">
                Taak Naam
              </label>
              <Input
                id="taskTitle"
                className="col-span-3"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="bv. Opmetingen uitvoeren"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="taskDescription" className="text-right text-sm">
                Beschrijving
              </label>
              <Input
                id="taskDescription"
                className="col-span-3"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="bv. Exacte afmetingen bepalen"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">
                Geschatte Duur
              </label>
              <div className="col-span-3 flex gap-2">
                <Input
                  type="number"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="w-20"
                  min="1"
                />

                <Select value={newTaskDurationType} onValueChange={setNewTaskDurationType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Eenheid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minuten</SelectItem>
                    <SelectItem value="hours">Uren</SelectItem>
                    <SelectItem value="days">Dagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" onClick={handleAddTask}>
              Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
