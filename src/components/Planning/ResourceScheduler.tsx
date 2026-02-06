import { useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import { useAppStore } from "@/store/AppContext";
import { resourceTypeLabels, PROJECT_TYPE_COLORS } from "@/lib/labels";
import type { Resource, ResourceReservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

export default function ResourceScheduler() {
  const { state, dispatch } = useAppStore();

  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Create reservation dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formProjectId, setFormProjectId] = useState("");
  const [formTaskId, setFormTaskId] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("17:00");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeek, i));

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () =>
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getReservationsForCell = (resourceId: string, day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return state.reservations.filter(
      (r) => r.resourceId === resourceId && r.date === dateStr
    );
  };

  const openCreateDialog = (resource: Resource, day: Date) => {
    setSelectedResource(resource);
    setSelectedDate(day);
    setFormProjectId("");
    setFormTaskId("");
    setFormStartTime("08:00");
    setFormEndTime("17:00");
    setCreateDialogOpen(true);
  };

  const selectedProject = state.projects.find((p) => p.id === formProjectId);
  const availableTasks = selectedProject?.tasks ?? [];

  const handleCreateReservation = () => {
    if (!selectedResource || !selectedDate || !formProjectId || !formTaskId) {
      toast.error("Vul alle velden in.");
      return;
    }

    if (formStartTime >= formEndTime) {
      toast.error("Eindtijd moet na starttijd liggen.");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Conflict detection
    const existingReservations = state.reservations.filter(
      (r) => r.resourceId === selectedResource.id && r.date === dateStr
    );
    const hasConflict = existingReservations.some((r) =>
      hasTimeOverlap(formStartTime, formEndTime, r.startTime, r.endTime)
    );

    if (hasConflict) {
      toast.warning("Opgelet: er is een tijdsoverlap met een bestaande reservering.", {
        description: "De reservering wordt toch aangemaakt.",
      });
    }

    const reservation: ResourceReservation = {
      id: `res-${Date.now()}`,
      resourceId: selectedResource.id,
      taskId: formTaskId,
      projectId: formProjectId,
      date: dateStr,
      startTime: formStartTime,
      endTime: formEndTime,
    };

    dispatch({ type: "ADD_RESERVATION", payload: reservation });
    toast.success("Reservering aangemaakt.");
    setCreateDialogOpen(false);
  };

  const openDeleteDialog = (reservationId: string) => {
    setReservationToDelete(reservationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReservation = () => {
    if (!reservationToDelete) return;
    dispatch({ type: "DELETE_RESERVATION", payload: reservationToDelete });
    toast.success("Reservering verwijderd.");
    setDeleteDialogOpen(false);
    setReservationToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Resourceplanning</CardTitle>
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
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left bg-muted min-w-[180px]">
                  Resource
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`border p-2 text-center bg-muted min-w-[160px] ${
                      isSameDay(day, new Date())
                        ? "bg-primary/10 font-bold"
                        : ""
                    }`}
                  >
                    <div>{format(day, "EEEE", { locale: nl })}</div>
                    <div className="text-sm font-normal text-muted-foreground">
                      {format(day, "d MMM", { locale: nl })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="border p-2 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{resource.name}</span>
                        <Badge variant="secondary">
                          {resourceTypeLabels[resource.type]}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Capaciteit: {resource.capacity}
                      </span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const cellReservations = getReservationsForCell(
                      resource.id,
                      day
                    );
                    return (
                      <td
                        key={day.toISOString()}
                        className={`border p-1 align-top min-h-[80px] ${
                          isSameDay(day, new Date()) ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="space-y-1 min-h-[60px]">
                          {cellReservations.map((reservation) => {
                            const project = state.projects.find(
                              (p) => p.id === reservation.projectId
                            );
                            const color = project
                              ? PROJECT_TYPE_COLORS[project.type]
                              : "#6b7280";

                            return (
                              <button
                                key={reservation.id}
                                type="button"
                                onClick={() => openDeleteDialog(reservation.id)}
                                className="w-full rounded px-2 py-1 text-xs text-left text-white cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: color }}
                                title={`${project?.name ?? "Onbekend project"} - Klik om te verwijderen`}
                              >
                                <div className="font-medium truncate">
                                  {project?.name ?? "Onbekend project"}
                                </div>
                                <div className="opacity-90">
                                  {reservation.startTime} - {reservation.endTime}
                                </div>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => openCreateDialog(resource, day)}
                            className="w-full flex items-center justify-center gap-1 rounded border border-dashed border-muted-foreground/30 p-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Toevoegen
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {state.resources.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-8 text-center text-muted-foreground"
                  >
                    Geen resources gevonden. Voeg resources toe via het admin-paneel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Create Reservation Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe reservering</DialogTitle>
            <DialogDescription>
              {selectedResource && selectedDate && (
                <>
                  {selectedResource.name} &mdash;{" "}
                  {format(selectedDate, "EEEE d MMMM yyyy", { locale: nl })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-select">Project</Label>
              <Select
                value={formProjectId}
                onValueChange={(value) => {
                  setFormProjectId(value);
                  setFormTaskId("");
                }}
              >
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Selecteer een project" />
                </SelectTrigger>
                <SelectContent>
                  {state.projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-select">Taak</Label>
              <Select
                value={formTaskId}
                onValueChange={setFormTaskId}
                disabled={!formProjectId}
              >
                <SelectTrigger id="task-select">
                  <SelectValue
                    placeholder={
                      formProjectId
                        ? "Selecteer een taak"
                        : "Kies eerst een project"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Starttijd</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Eindtijd</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Annuleren
            </Button>
            <Button onClick={handleCreateReservation}>Reserveren</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reservering verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze reservering wilt verwijderen? Dit kan niet
              ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReservationToDelete(null)}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReservation}>
              <Trash2 className="h-4 w-4 mr-1" />
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
