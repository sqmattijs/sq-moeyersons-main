
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/AppContext";
import { projectTypeNames, getDefaultTasksForProjectType } from "@/data/dummyData";
import type { Project, Task, ProjectTypeKey, TaskStatus } from "@/types";

export default function Navbar() {
  const { state, dispatch } = useAppStore();
  const currentUser = state.users[0]; // Default Jan als ingelogde gebruiker

  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectTypeKey>("kastbouw");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    const projectId = Date.now().toString();
    const defaultTasks = getDefaultTasksForProjectType(projectType);
    const now = new Date();

    const tasks: Task[] = defaultTasks.map((task, index) => ({
      id: `${projectId}-${index}`,
      title: task.title!,
      description: task.description!,
      projectId,
      startDate: now,
      endDate: now,
      status: "nieuw" as TaskStatus,
      duration: task.duration,
    }));

    const newProject: Project = {
      id: projectId,
      name: projectName,
      title: projectName,
      description: projectDescription,
      type: projectType,
      tasks,
      client: projectClient || undefined,
      deadline: projectDeadline || undefined,
      status: "nieuw",
      startDate: now,
      endDate: projectDeadline ? new Date(projectDeadline) : now,
    };

    dispatch({ type: "ADD_PROJECT", payload: newProject });

    toast.success(`Project "${projectName}" aangemaakt`, {
      description: `Type: ${projectTypeNames[projectType]} met ${tasks.length} automatisch toegewezen taken`
    });

    setProjectName("");
    setProjectDescription("");
    setProjectClient("");
    setProjectDeadline("");
    setProjectType("kastbouw");
    setDialogOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <img src="/images/moeyersons-logo.png" alt="Moeyersons Logo" className="h-10" />
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground font-medium">BUILDING THE DIFFERENCE ON WHEELS</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground"
            onClick={() => {
              // Dispatch a keyboard event to trigger GlobalSearch's Cmd+K listener
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
          >
            <Search className="h-4 w-4" />
            <span>Zoeken...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                Nieuw Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nieuw project aanmaken</DialogTitle>
                <DialogDescription>
                  Vul de details in voor het nieuwe project. Taken worden automatisch toegewezen op basis van het projecttype.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectName" className="text-right">
                      Projectnaam
                    </Label>
                    <Input
                      id="projectName"
                      className="col-span-3"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      placeholder="Voer een projectnaam in"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectClient" className="text-right">
                      Klant
                    </Label>
                    <Select
                      value={projectClient}
                      onValueChange={(value) => setProjectClient(value)}
                    >
                      <SelectTrigger id="projectClient" className="col-span-3">
                        <SelectValue placeholder="Selecteer een klant (optioneel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.clients.map((client) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectDeadline" className="text-right">
                      Deadline
                    </Label>
                    <Input
                      id="projectDeadline"
                      className="col-span-3"
                      value={projectDeadline}
                      onChange={(e) => setProjectDeadline(e.target.value)}
                      type="date"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectType" className="text-right">
                      Type Project
                    </Label>
                    <Select
                      value={projectType}
                      onValueChange={(value) => setProjectType(value as ProjectTypeKey)}
                    >
                      <SelectTrigger id="projectType" className="col-span-3">
                        <SelectValue placeholder="Selecteer projecttype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kastbouw">Kastopbouw op opleggers en vrachtwagens</SelectItem>
                        <SelectItem value="herstelling">Herstellingen aan trailers, vrachtwagens, etc.</SelectItem>
                        <SelectItem value="spuiterij">Spuiterij opdrachten</SelectItem>
                        <SelectItem value="maatwerk">Maatwerk projecten</SelectItem>
                        <SelectItem value="mobiel">Mobiele werkplaatsen</SelectItem>
                        <SelectItem value="medisch">Medische wagens</SelectItem>
                        <SelectItem value="tv">TV-wagens (OB-materiaal, SNG)</SelectItem>
                        <SelectItem value="leger">Leger & politie gerelateerde projecten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectDescription" className="text-right">
                      Omschrijving
                    </Label>
                    <Textarea
                      id="projectDescription"
                      className="col-span-3"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Gedetailleerde omschrijving van het project"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <div className="text-right pt-2">
                      <Label>Automatische Taken</Label>
                    </div>
                    <div className="col-span-3 p-4 border rounded-md bg-muted/50">
                      <p className="text-sm mb-2">Op basis van het gekozen projecttype worden de volgende taken automatisch aangemaakt:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {getDefaultTasksForProjectType(projectType).map((task, index) => (
                          <li key={index} className="text-sm">{task.title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Project aanmaken</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                  {currentUser?.name.charAt(0)}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>{currentUser?.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>{currentUser?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Rol: {currentUser?.role}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("Instellingen geopend")}>
                Instellingen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Uitgelogd")}>
                Uitloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
