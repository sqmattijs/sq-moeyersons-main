
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, Pencil, Plus, Trash2, Users2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ProjectTaskList from "./ProjectTaskList";
import { projectTypeLabels } from "@/lib/labels";
import { PROJECT_TYPE_KEYS } from "@/types";
import type { Task, ProjectTypeKey } from "@/types";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const project = state.projects.find(p => p.id === id);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<ProjectTypeKey>("kastbouw");
  const [editClient, setEditClient] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  // Add task dialog state
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container py-6">
          <div className="p-8 text-center">
            <h2 className="text-xl mb-4">Project niet gevonden</h2>
            <Button onClick={() => navigate("/")}>Terug naar dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      toast.error("Voer een titel in voor de taak");
      return;
    }

    const newTask: Task = {
      id: `${project.id}-task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      projectId: project.id,
      startDate: new Date(),
      endDate: new Date(),
      status: "nieuw"
    };

    dispatch({
      type: "ADD_TASK",
      payload: { projectId: project.id, task: newTask }
    });

    toast.success(`Taak "${newTaskTitle}" toegevoegd aan project ${project.title}`);

    setNewTaskTitle("");
    setNewTaskDescription("");
    setAddTaskOpen(false);
  };

  const openEditDialog = () => {
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditType(project.type);
    setEditClient(project.client || "");
    setEditDeadline(project.deadline || "");
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTitle.trim()) {
      toast.error("Voer een projectnaam in");
      return;
    }

    dispatch({
      type: "UPDATE_PROJECT",
      payload: {
        id: project.id,
        updates: {
          name: editTitle,
          title: editTitle,
          description: editDescription,
          type: editType,
          client: editClient,
          deadline: editDeadline || undefined,
        },
      },
    });

    toast.success(`Project "${editTitle}" bijgewerkt`);
    setEditOpen(false);
  };

  const handleDelete = () => {
    dispatch({ type: "DELETE_PROJECT", payload: project.id });
    toast.success(`Project "${project.title}" verwijderd`);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container py-6">
        <div className="space-y-6">
          {/* Header row: back button + actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Terug naar overzicht
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openEditDialog}>
                <Pencil className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Verwijderen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Project verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je "{project.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt. Alle taken binnen dit project worden ook verwijderd.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Verwijderen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Content grid: 2/3 info + 1/3 sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: project info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {state.projectTypeConfigs[project.type]?.name ?? project.type}
                      </Badge>
                      <Badge>{project.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">{project.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Users2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Klant</p>
                        <p className="text-sm">{project.client || "Geen klant"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm">
                          {project.deadline ? format(new Date(project.deadline), "dd-MM-yyyy") : "Geen deadline"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Startdatum</p>
                        <p className="text-sm">{format(project.startDate, "dd-MM-yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Einddatum</p>
                        <p className="text-sm">{format(project.endDate, "dd-MM-yyyy")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: tasks */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">
                      Taken ({project.tasks.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAddTaskOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Toevoegen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProjectTaskList tasks={project.tasks} projectId={project.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          © 2025 Moeyersons - Building the difference on wheels
        </div>
      </footer>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project bewerken</DialogTitle>
            <DialogDescription>Pas de gegevens van dit project aan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Naam</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Projectnaam"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Omschrijving</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Omschrijving"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editType">Type</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as ProjectTypeKey)}>
                <SelectTrigger id="editType">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {projectTypeLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editClient">Klant</Label>
              <Input
                id="editClient"
                value={editClient}
                onChange={(e) => setEditClient(e.target.value)}
                placeholder="Klantnaam"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDeadline">Deadline</Label>
              <Input
                id="editDeadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Annuleren
              </Button>
              <Button type="submit">Opslaan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe taak toevoegen</DialogTitle>
            <DialogDescription>
              Voeg een manuele taak toe aan dit project
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Titel</Label>
              <Input
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Voer een titel in"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Omschrijving</Label>
              <Textarea
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Voer een omschrijving in"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)}>
                Annuleren
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Taak toevoegen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
