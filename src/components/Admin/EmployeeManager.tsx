import React, { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import type { User, EmployeeRole } from "@/types";
import { EMPLOYEE_ROLES } from "@/types";
import { roleLabels } from "@/lib/labels";
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
  email: string;
  role: EmployeeRole;
  skills: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  role: "monteur",
  skills: "",
};

export default function EmployeeManager() {
  const { state, dispatch } = useAppStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills.join(", "),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Vul minstens naam en email in");
      return;
    }

    const skills = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingUser) {
      dispatch({
        type: "UPDATE_USER",
        payload: {
          id: editingUser.id,
          updates: {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            skills,
          },
        },
      });
      toast.success(`Medewerker "${form.name}" bijgewerkt`);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        skills,
      };
      dispatch({ type: "ADD_USER", payload: newUser });
      toast.success(`Medewerker "${form.name}" toegevoegd`);
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: "DELETE_USER", payload: deleteTarget.id });
    toast.success(`Medewerker "${deleteTarget.name}" verwijderd`);
    setDeleteTarget(null);
  };

  const getAvailabilityIndicator = (user: User) => {
    if (!user.availability) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          Niet ingesteld
        </span>
      );
    }

    const weekdays: (keyof typeof user.availability)[] = [
      "maandag",
      "dinsdag",
      "woensdag",
      "donderdag",
      "vrijdag",
    ];
    const availableDays = weekdays.filter(
      (day) => user.availability![day].available
    ).length;

    if (availableDays === 5) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Volledig beschikbaar
        </span>
      );
    }

    if (availableDays === 0) {
      return (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Niet beschikbaar
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 text-sm text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {availableDays}/5 dagen
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg font-medium">Medewerkerbeheer</h3>

        <Button variant="outline" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Nieuwe Medewerker
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Skills</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Beschikbaarheid
                </TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Geen medewerkers gevonden
                  </TableCell>
                </TableRow>
              ) : (
                state.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {user.skills.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Geen
                          </span>
                        ) : (
                          user.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getAvailabilityIndicator(user)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(user)}
                          aria-label={`${user.name} bewerken`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`${user.name} verwijderen`}
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
              {editingUser ? "Medewerker Bewerken" : "Nieuwe Medewerker"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Pas de gegevens van deze medewerker aan"
                : "Voeg een nieuwe medewerker toe aan het systeem"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emp-name" className="text-right">
                Naam
              </Label>
              <Input
                id="emp-name"
                className="col-span-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="bv. Jan Janssens"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emp-email" className="text-right">
                Email
              </Label>
              <Input
                id="emp-email"
                type="email"
                className="col-span-3"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="bv. jan@moeyersons.be"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emp-role" className="text-right">
                Rol
              </Label>
              <div className="col-span-3">
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm({ ...form, role: value as EmployeeRole })
                  }
                >
                  <SelectTrigger id="emp-role">
                    <SelectValue placeholder="Selecteer een rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emp-skills" className="text-right">
                Skills
              </Label>
              <Input
                id="emp-skills"
                className="col-span-3"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="bv. Lassen, Elektriciteit, Houtbewerking"
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
              {editingUser ? "Opslaan" : "Toevoegen"}
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
            <AlertDialogTitle>Medewerker verwijderen?</AlertDialogTitle>
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
