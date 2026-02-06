import React, { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import type { Resource, ResourceType } from "@/types";
import { RESOURCE_TYPES } from "@/types";
import { resourceTypeLabels } from "@/lib/labels";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type FormState = {
  name: string;
  type: ResourceType;
  capacity: string;
};

const emptyForm: FormState = {
  name: "",
  type: "werkplaats",
  capacity: "1",
};

export default function ResourceManager() {
  const { state, dispatch } = useAppStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  const openAdd = () => {
    setEditingResource(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: String(resource.capacity),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Vul minstens een naam in");
      return;
    }

    const capacity = parseInt(form.capacity, 10);
    if (isNaN(capacity) || capacity < 1) {
      toast.error("Capaciteit moet een positief getal zijn");
      return;
    }

    if (editingResource) {
      dispatch({
        type: "UPDATE_RESOURCE",
        payload: {
          id: editingResource.id,
          updates: {
            name: form.name.trim(),
            type: form.type,
            capacity,
          },
        },
      });
      toast.success(`Middel "${form.name}" bijgewerkt`);
    } else {
      const newResource: Resource = {
        id: `r-${Date.now()}`,
        name: form.name.trim(),
        type: form.type,
        capacity,
      };
      dispatch({ type: "ADD_RESOURCE", payload: newResource });
      toast.success(`Middel "${form.name}" toegevoegd`);
    }

    setIsDialogOpen(false);
    setEditingResource(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: "DELETE_RESOURCE", payload: deleteTarget.id });
    toast.success(`Middel "${deleteTarget.name}" verwijderd`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg font-medium">Middelenbeheer</h3>

        <Button variant="outline" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Nieuw Middel
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capaciteit</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.resources.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Geen middelen gevonden
                  </TableCell>
                </TableRow>
              ) : (
                state.resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="font-medium">{resource.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {resourceTypeLabels[resource.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.capacity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(resource)}
                          aria-label={`${resource.name} bewerken`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(resource)}
                          aria-label={`${resource.name} verwijderen`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Middel Bewerken" : "Nieuw Middel"}
            </DialogTitle>
            <DialogDescription>
              {editingResource
                ? "Pas de gegevens van dit middel aan"
                : "Voeg een nieuw middel toe aan het systeem"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="res-name" className="text-right">
                Naam
              </Label>
              <Input
                id="res-name"
                className="col-span-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="bv. Spuitcabine A"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="res-type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({ ...form, type: value as ResourceType })
                  }
                >
                  <SelectTrigger id="res-type">
                    <SelectValue placeholder="Selecteer een type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {resourceTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="res-capacity" className="text-right">
                Capaciteit
              </Label>
              <Input
                id="res-capacity"
                type="number"
                min="1"
                className="col-span-3"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                placeholder="bv. 2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Annuleren
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingResource ? "Opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Middel verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{deleteTarget?.name}" wilt verwijderen? Deze
              actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
