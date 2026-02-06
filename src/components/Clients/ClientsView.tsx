import { useState, useMemo } from "react";
import { useAppStore } from "@/store/AppContext";
import { getProjectsForClient } from "@/store/selectors";
import { clientTypeLabels } from "@/lib/labels";
import type { Client, ClientType } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Mail, Phone, User, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";
import ClientDetail from "./ClientDetail";

type FilterType = "alle" | ClientType;

export default function ClientsView() {
  const { state, dispatch } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("alle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // New client form state
  const [newName, setNewName] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newType, setNewType] = useState<ClientType>("klant");
  const [newNotes, setNewNotes] = useState("");

  const filteredClients = useMemo(() => {
    let clients = state.clients;

    if (filterType !== "alle") {
      clients = clients.filter((c) => c.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    return clients;
  }, [state.clients, filterType, searchQuery]);

  const resetForm = () => {
    setNewName("");
    setNewContactPerson("");
    setNewEmail("");
    setNewPhone("");
    setNewAddress("");
    setNewType("klant");
    setNewNotes("");
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("Voer een naam in voor de klant");
      return;
    }

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      contactPerson: newContactPerson.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      type: newType,
      notes: newNotes.trim(),
    };

    dispatch({ type: "ADD_CLIENT", payload: newClient });

    toast.success(`Klant "${newClient.name}" aangemaakt`, {
      description: `Type: ${clientTypeLabels[newType]}`,
    });

    resetForm();
    setDialogOpen(false);
  };

  // If a client is selected, show the detail view
  if (selectedClientId) {
    return (
      <ClientDetail
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Klantenbeheer</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Klant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nieuwe klant aanmaken</DialogTitle>
              <DialogDescription>
                Vul de gegevens in voor de nieuwe klant of prospect.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientName" className="text-right">
                    Naam *
                  </Label>
                  <Input
                    id="clientName"
                    className="col-span-3"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Bedrijfsnaam"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientContact" className="text-right">
                    Contactpersoon
                  </Label>
                  <Input
                    id="clientContact"
                    className="col-span-3"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="Naam van contactpersoon"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientEmail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="clientEmail"
                    className="col-span-3"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@voorbeeld.be"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientPhone" className="text-right">
                    Telefoon
                  </Label>
                  <Input
                    id="clientPhone"
                    className="col-span-3"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+32 ..."
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientAddress" className="text-right">
                    Adres
                  </Label>
                  <Input
                    id="clientAddress"
                    className="col-span-3"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Straat, nummer, postcode, stad"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientType" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newType}
                    onValueChange={(value) => setNewType(value as ClientType)}
                  >
                    <SelectTrigger id="clientType" className="col-span-3">
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="klant">{clientTypeLabels.klant}</SelectItem>
                      <SelectItem value="prospect">{clientTypeLabels.prospect}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="clientNotes" className="text-right pt-2">
                    Notities
                  </Label>
                  <Textarea
                    id="clientNotes"
                    className="col-span-3"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Extra informatie over de klant"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Klant aanmaken</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam, contactpersoon, email of telefoon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["alle", "klant", "prospect"] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type === "alle" ? "Alle" : clientTypeLabels[type]}
            </Button>
          ))}
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {state.clients.length === 0
              ? "Nog geen klanten toegevoegd. Maak een eerste klant aan."
              : "Geen klanten gevonden voor de huidige zoekopdracht."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              projectCount={getProjectsForClient(state, client.id).length}
              onClick={() => setSelectedClientId(client.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({
  client,
  projectCount,
  onClick,
}: {
  client: Client;
  projectCount: number;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{client.name}</CardTitle>
          <Badge
            variant={client.type === "klant" ? "default" : "secondary"}
            className="shrink-0"
          >
            {clientTypeLabels[client.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {client.contactPerson && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{client.contactPerson}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.notes && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{client.notes}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-sm text-muted-foreground">
          {projectCount} {projectCount === 1 ? "project" : "projecten"}
        </div>
      </CardFooter>
    </Card>
  );
}
