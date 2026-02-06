import { useState } from "react";
import { useAppStore } from "@/store/AppContext";
import { getClientById, getProjectsForClient } from "@/store/selectors";
import { clientTypeLabels, projectTypeLabels, projectStatusLabels } from "@/lib/labels";
import type { Client, ClientType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ChevronLeft, Pencil, Trash2, Mail, Phone, MapPin, User, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

export default function ClientDetail({ clientId, onBack }: ClientDetailProps) {
  const { state, dispatch } = useAppStore();
  const navigate = useNavigate();
  const client = getClientById(state, clientId);
  const linkedProjects = getProjectsForClient(state, clientId);

  const [isEditing, setIsEditing] = useState(false);

  // Edit form state -- initialized from client when entering edit mode
  const [editName, setEditName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editType, setEditType] = useState<ClientType>("klant");
  const [editNotes, setEditNotes] = useState("");

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl mb-4">Klant niet gevonden</h2>
        <Button onClick={onBack}>Terug naar overzicht</Button>
      </div>
    );
  }

  const startEditing = () => {
    setEditName(client.name);
    setEditContactPerson(client.contactPerson);
    setEditEmail(client.email);
    setEditPhone(client.phone);
    setEditAddress(client.address);
    setEditType(client.type);
    setEditNotes(client.notes);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error("Naam is verplicht");
      return;
    }

    const updates: Partial<Client> = {
      name: editName.trim(),
      contactPerson: editContactPerson.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      type: editType,
      notes: editNotes.trim(),
    };

    dispatch({
      type: "UPDATE_CLIENT",
      payload: { id: clientId, updates },
    });

    toast.success(`Klant "${editName.trim()}" bijgewerkt`);
    setIsEditing(false);
  };

  const handleDelete = () => {
    const clientName = client.name;
    dispatch({ type: "DELETE_CLIENT", payload: clientId });
    toast.success(`Klant "${clientName}" verwijderd`);
    onBack();
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "nieuw":
        return "secondary";
      case "lopend":
        return "default";
      case "afgerond":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Terug naar overzicht
        </Button>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={startEditing}>
              <Pencil className="h-4 w-4 mr-2" />
              Bewerken
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijderen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Klant verwijderen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Weet je zeker dat je "{client.name}" wilt verwijderen? Dit kan
                  niet ongedaan worden gemaakt.
                  {linkedProjects.length > 0 && (
                    <>
                      {" "}
                      Er {linkedProjects.length === 1 ? "is" : "zijn"}{" "}
                      {linkedProjects.length}{" "}
                      {linkedProjects.length === 1 ? "project" : "projecten"}{" "}
                      gekoppeld aan deze klant.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-2xl">
                  {isEditing ? "Klant bewerken" : client.name}
                </CardTitle>
                {!isEditing && (
                  <Badge
                    variant={client.type === "klant" ? "default" : "secondary"}
                  >
                    {clientTypeLabels[client.type]}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editName" className="text-right">
                        Naam *
                      </Label>
                      <Input
                        id="editName"
                        className="col-span-3"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editContact" className="text-right">
                        Contactpersoon
                      </Label>
                      <Input
                        id="editContact"
                        className="col-span-3"
                        value={editContactPerson}
                        onChange={(e) => setEditContactPerson(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editEmail" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="editEmail"
                        className="col-span-3"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editPhone" className="text-right">
                        Telefoon
                      </Label>
                      <Input
                        id="editPhone"
                        className="col-span-3"
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editAddress" className="text-right">
                        Adres
                      </Label>
                      <Input
                        id="editAddress"
                        className="col-span-3"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editType" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={editType}
                        onValueChange={(value) =>
                          setEditType(value as ClientType)
                        }
                      >
                        <SelectTrigger id="editType" className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="klant">
                            {clientTypeLabels.klant}
                          </SelectItem>
                          <SelectItem value="prospect">
                            {clientTypeLabels.prospect}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="editNotes" className="text-right pt-2">
                        Notities
                      </Label>
                      <Textarea
                        id="editNotes"
                        className="col-span-3"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={cancelEditing}>
                      Annuleren
                    </Button>
                    <Button onClick={handleSave}>Opslaan</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.contactPerson && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contactpersoon</p>
                        <p className="text-sm">{client.contactPerson}</p>
                      </div>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{client.email}</p>
                      </div>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefoon</p>
                        <p className="text-sm">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Adres</p>
                        <p className="text-sm">{client.address}</p>
                      </div>
                    </div>
                  )}

                  {!client.contactPerson && !client.email && !client.phone && !client.address && (
                    <p className="text-sm text-muted-foreground">
                      Geen contactgegevens ingevuld.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes section (read-only view, editable in edit mode above) */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notities</CardTitle>
              </CardHeader>
              <CardContent>
                {client.notes ? (
                  <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Geen notities. Klik op "Bewerken" om notities toe te voegen.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Linked projects sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">
                  Gekoppelde projecten ({linkedProjects.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {linkedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Geen projecten gekoppeld aan deze klant.
                </p>
              ) : (
                <div className="space-y-3">
                  {linkedProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm leading-tight">
                            {project.name}
                          </p>
                          <Badge
                            variant={statusVariant(project.status)}
                            className="shrink-0 text-xs"
                          >
                            {projectStatusLabels[project.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {projectTypeLabels[project.type]}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
