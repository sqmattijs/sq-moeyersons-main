
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl mb-4">Project niet gevonden</h2>
        <Button onClick={() => navigate("/")}>Terug naar dashboard</Button>
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

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
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
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/")}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Terug naar overzicht
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{state.projectTypeConfigs[project.type]?.name ?? project.type}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{project.status}</Badge>
                  <Button variant="outline" size="icon" onClick={openEditDialog}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Project bewerken</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Project verwijderen</span>
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
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm">{project.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Klant</h3>
                  <p className="text-sm">{project.client || "Geen klant"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Deadline</h3>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {project.deadline ? format(new Date(project.deadline), "dd-MM-yyyy") : "Geen deadline"}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Startdatum</h3>
                  <p className="text-sm">{format(project.startDate, "dd-MM-yyyy")}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Einddatum</h3>
                  <p className="text-sm">{format(project.endDate, "dd-MM-yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="tasks">
            <TabsList className="w-full">
              <TabsTrigger value="tasks" className="flex-1">Taken</TabsTrigger>
              <TabsTrigger value="add-task" className="flex-1">Nieuwe Taak</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="pt-4">
              <ProjectTaskList tasks={project.tasks} projectId={project.id} />
            </TabsContent>

            <TabsContent value="add-task" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nieuwe taak toevoegen</CardTitle>
                  <CardDescription>
                    Voeg een manuele taak toe aan dit project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label htmlFor="taskTitle" className="text-sm font-medium mb-1 block">
                        Titel
                      </label>
                      <Input
                        id="taskTitle"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Voer een titel in"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="taskDescription" className="text-sm font-medium mb-1 block">
                        Omschrijving
                      </label>
                      <Textarea
                        id="taskDescription"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Voer een omschrijving in"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        Taak toevoegen
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
    </div>
  );
}
