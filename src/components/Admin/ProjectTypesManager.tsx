
import React, { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import { getDefaultTasksForProjectType } from "@/data/dummyData";
import type { ProjectTypeKey } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Link } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ProjectTypesManager() {
  const { state, dispatch } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeKey, setNewTypeKey] = useState("");
  // Local tasks state for the editing form (synced from store on edit open, dispatched on save)
  const [tasks, setTasks] = useState<{[key: string]: any[]}>(() => {
    const initialTasks: {[key: string]: any[]} = {};
    Object.values(state.projectTypeConfigs).forEach(config => {
      initialTasks[config.key] = config.taskTemplates.map(t => ({
        title: t.title,
        description: t.description,
        duration: t.duration,
        dependencies: t.dependencies || [],
      }));
    });
    return initialTasks;
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDuration, setTaskDuration] = useState("60");
  const [taskDurationType, setTaskDurationType] = useState("minutes");
  const [taskDependencyId, setTaskDependencyId] = useState<string | null>(null);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  const handleAddProjectType = () => {
    if (!newTypeKey.trim() || !newTypeName.trim()) {
      toast.error("Vul alle velden in");
      return;
    }

    const key = newTypeKey as ProjectTypeKey;

    // Dispatch the update to the store
    dispatch({
      type: "UPDATE_PROJECT_TYPE_CONFIG",
      payload: {
        key,
        config: {
          key,
          name: newTypeName,
          taskTemplates: (tasks[newTypeKey] || []).map((t: any) => ({
            title: t.title,
            description: t.description,
            duration: t.duration,
            dependencies: t.dependencies,
          })),
        },
      },
    });

    // Initialize empty tasks array for new project type
    if (!editingType) {
      setTasks(prev => ({
        ...prev,
        [newTypeKey]: []
      }));
    }

    toast.success(`Project type "${newTypeName}" succesvol ${editingType ? 'bijgewerkt' : 'toegevoegd'}`);
    setIsDialogOpen(false);
    setNewTypeName("");
    setNewTypeKey("");
    setEditingType(null);
  };

  const handleEditProjectType = (key: string) => {
    setEditingType(key);
    const config = state.projectTypeConfigs[key as ProjectTypeKey];
    setNewTypeName(config?.name ?? key);
    setNewTypeKey(key);
    // Sync local tasks from store
    if (config) {
      setTasks(prev => ({
        ...prev,
        [key]: config.taskTemplates.map(t => ({
          title: t.title,
          description: t.description,
          duration: t.duration,
          dependencies: t.dependencies || [],
        })),
      }));
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingType(null);
    setNewTypeName("");
    setNewTypeKey("");
  };

  const handleAddTask = () => {
    if (!taskTitle.trim() || !taskDescription.trim() || !taskDuration.trim()) {
      toast.error("Vul alle velden in");
      return;
    }

    const duration = {
      value: parseInt(taskDuration),
      unit: taskDurationType
    };

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      duration: duration,
      dependencies: [] // Add empty dependencies array
    };

    if (editingType) {
      setTasks(prev => ({
        ...prev,
        [editingType]: [...prev[editingType], newTask]
      }));

      const config = state.projectTypeConfigs[editingType as ProjectTypeKey];
      toast.success(`Taak "${taskTitle}" toegevoegd aan ${config?.name ?? editingType}`);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDuration("60");
      setTaskDurationType("minutes");
      setIsTaskModalOpen(false);
    }
  };

  const handleRemoveTask = (typeKey: string, taskIndex: number) => {
    // Remove the task
    const updatedTasks = tasks[typeKey].filter((_, index) => index !== taskIndex);

    // Remove any dependencies pointing to the removed task
    const cleanedTasks = updatedTasks.map(task => {
      if (task.dependencies) {
        return {
          ...task,
          dependencies: task.dependencies.filter((depIndex: number) =>
            depIndex !== taskIndex && (depIndex < taskIndex || depIndex > taskIndex)
          ).map((depIndex: number) =>
            depIndex > taskIndex ? depIndex - 1 : depIndex
          )
        };
      }
      return task;
    });

    setTasks(prev => ({
      ...prev,
      [typeKey]: cleanedTasks
    }));
    toast.success("Taak verwijderd");
  };

  const moveTask = (typeKey: string, fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tasks[typeKey].length) return;

    const tasksList = [...tasks[typeKey]];
    const [removed] = tasksList.splice(fromIndex, 1);
    tasksList.splice(toIndex, 0, removed);

    // Update all dependency references
    const updatedTasks = tasksList.map(task => {
      if (!task.dependencies) return task;

      // Adjust dependencies based on the move
      const updatedDeps = task.dependencies.map((depIndex: number) => {
        if (depIndex === fromIndex) return toIndex;
        if (fromIndex < depIndex && depIndex <= toIndex) return depIndex - 1;
        if (toIndex <= depIndex && depIndex < fromIndex) return depIndex + 1;
        return depIndex;
      });

      return {
        ...task,
        dependencies: updatedDeps
      };
    });

    setTasks(prev => ({
      ...prev,
      [typeKey]: updatedTasks
    }));
    toast.success("Taakvolgorde aangepast");
  };

  const openDependencyModal = (taskIndex: number) => {
    setSelectedTaskIndex(taskIndex);
    setIsDependencyModalOpen(true);
  };

  const handleAddDependency = () => {
    if (selectedTaskIndex === null || !taskDependencyId || parseInt(taskDependencyId) === selectedTaskIndex) {
      toast.error("Selecteer een geldige afhankelijkheid");
      return;
    }

    const dependencyIndex = parseInt(taskDependencyId);

    if (editingType) {
      const updatedTasks = [...tasks[editingType]];

      // Initialize dependencies array if it doesn't exist
      if (!updatedTasks[selectedTaskIndex].dependencies) {
        updatedTasks[selectedTaskIndex].dependencies = [];
      }

      // Check if dependency already exists
      if (updatedTasks[selectedTaskIndex].dependencies.includes(dependencyIndex)) {
        toast.error("Deze afhankelijkheid bestaat al");
        return;
      }

      // Add the dependency
      updatedTasks[selectedTaskIndex].dependencies.push(dependencyIndex);

      setTasks(prev => ({
        ...prev,
        [editingType]: updatedTasks
      }));

      toast.success("Afhankelijkheid toegevoegd");
      setTaskDependencyId(null);
      setIsDependencyModalOpen(false);
    }
  };

  const removeDependency = (taskIndex: number, dependencyIndex: number) => {
    if (!editingType) return;

    const updatedTasks = [...tasks[editingType]];
    updatedTasks[taskIndex].dependencies = updatedTasks[taskIndex].dependencies.filter(
      (depIndex: number) => depIndex !== dependencyIndex
    );

    setTasks(prev => ({
      ...prev,
      [editingType]: updatedTasks
    }));

    toast.success("Afhankelijkheid verwijderd");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Types</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Project Type Bewerken" : "Nieuw Project Type"}
              </DialogTitle>
              <DialogDescription>
                {editingType ?
                  "Bewerk de details van dit project type" :
                  "Voeg een nieuw project type toe met standaard taken"
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="typeKey" className="text-right text-sm">
                  Type Sleutel
                </label>
                <Input
                  id="typeKey"
                  className="col-span-3"
                  value={newTypeKey}
                  onChange={(e) => setNewTypeKey(e.target.value)}
                  placeholder="bv. medisch"
                  disabled={!!editingType}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="typeName" className="text-right text-sm">
                  Type Naam
                </label>
                <Input
                  id="typeName"
                  className="col-span-3"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="bv. Medische wagen"
                />
              </div>

              {editingType && (
                <div className="grid grid-cols-4 items-start gap-4 mt-4">
                  <div className="text-right text-sm pt-2">
                    Standaard Taken
                  </div>
                  <div className="col-span-3 border rounded-md p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Taken voor dit project type</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsTaskModalOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Taak toevoegen
                      </Button>
                    </div>

                    {tasks[editingType]?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Volgorde</TableHead>
                            <TableHead>Taak</TableHead>
                            <TableHead>Duur</TableHead>
                            <TableHead>Afhankelijkheden</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks[editingType].map((task, index) => (
                            <TableRow key={index}>
                              <TableCell className="w-20">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveTask(editingType, index, index - 1)}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveTask(editingType, index, index + 1)}
                                    disabled={index === tasks[editingType].length - 1}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-xs text-muted-foreground">{task.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {task.duration ? (
                                  <Badge variant="outline">
                                    {task.duration.value} {task.duration.unit}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Niet ingesteld</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {task.dependencies?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {task.dependencies.map((depIndex: number) => (
                                        <Badge
                                          key={depIndex}
                                          variant="secondary"
                                          className="flex items-center gap-1"
                                        >
                                          <span className="max-w-[100px] truncate">
                                            {tasks[editingType][depIndex]?.title || `Taak ${depIndex + 1}`}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1"
                                            onClick={() => removeDependency(index, depIndex)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Geen</span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => openDependencyModal(index)}
                                  >
                                    <Link className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveTask(editingType, index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Geen taken toegevoegd
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button type="button" onClick={handleAddProjectType}>
                {editingType ? "Opslaan" : "Toevoegen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Add Dialog */}
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Taak Toevoegen</DialogTitle>
              <DialogDescription>
                Voeg een standaard taak toe aan dit project type
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="taskTitle" className="text-right text-sm">
                  Taak Naam
                </label>
                <Input
                  id="taskTitle"
                  className="col-span-3"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
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
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
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
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-20"
                    min="1"
                  />

                  <Select value={taskDurationType} onValueChange={setTaskDurationType}>
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
              <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                Annuleren
              </Button>
              <Button type="button" onClick={handleAddTask}>
                Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dependency Dialog */}
        <Dialog open={isDependencyModalOpen} onOpenChange={setIsDependencyModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Taak Afhankelijkheid Toevoegen</DialogTitle>
              <DialogDescription>
                Selecteer een taak die eerst moet worden afgerond
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="dependency" className="text-right text-sm">
                  Afhankelijke Taak
                </label>
                <div className="col-span-3">
                  <Select value={taskDependencyId || ""} onValueChange={setTaskDependencyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een taak" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingType && tasks[editingType]
                        .filter((_, index) => index !== selectedTaskIndex)
                        .map((task, index) => {
                          const actualIndex = index >= (selectedTaskIndex || 0) ? index + 1 : index;
                          return (
                            <SelectItem key={actualIndex} value={actualIndex.toString()}>
                              {task.title}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDependencyModalOpen(false)}>
                Annuleren
              </Button>
              <Button type="button" onClick={handleAddDependency}>
                Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Object.values(state.projectTypeConfigs).map((config) => (
              <div key={config.key} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">{config.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Code: {config.key} • {config.taskTemplates?.length || 0} standaard taken
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditProjectType(config.key)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  <span className="text-xs">Bewerken</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
