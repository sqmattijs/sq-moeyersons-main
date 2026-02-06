import { addDays, format } from "date-fns";
import type {
  AppState,
  Project,
  Task,
  User,
  Client,
  Resource,
  ResourceReservation,
  ProjectTypeKey,
  ProjectTypeConfig,
  TaskTemplate,
  TaskStatus,
  WeeklyAvailability,
} from "@/types";

// Re-export types for backward compatibility during migration
export type { Project, Task, User } from "@/types";

// Project type names (kept for backward compatibility)
export const projectTypeNames: Record<ProjectTypeKey, string> = {
  kastbouw: "Kastopbouw",
  herstelling: "Herstelling",
  spuiterij: "Spuiterij",
  maatwerk: "Maatwerk",
  mobiel: "Mobiele werkplaats",
  medisch: "Medische wagen",
  tv: "TV-wagen",
  leger: "Leger & Politie",
};

// Default weekly availability (Mon-Fri 08:00-17:00)
const defaultAvailability: WeeklyAvailability = {
  maandag: { available: true, startTime: "08:00", endTime: "17:00" },
  dinsdag: { available: true, startTime: "08:00", endTime: "17:00" },
  woensdag: { available: true, startTime: "08:00", endTime: "17:00" },
  donderdag: { available: true, startTime: "08:00", endTime: "17:00" },
  vrijdag: { available: true, startTime: "08:00", endTime: "17:00" },
  zaterdag: { available: false },
  zondag: { available: false },
};

// Seed users
const users: User[] = [
  {
    id: "1",
    name: "Jan Vermeulen",
    email: "jan.vermeulen@moeyersons.be",
    role: "planner",
    skills: ["Planning", "Kastbouw", "Projectbeheer"],
    availability: defaultAvailability,
  },
  {
    id: "2",
    name: "Luc Peeters",
    email: "luc.peeters@moeyersons.be",
    role: "monteur",
    skills: ["Elektriciteit", "Kastbouw", "Herstelling"],
    availability: defaultAvailability,
  },
  {
    id: "3",
    name: "Marie Janssens",
    email: "marie.janssens@moeyersons.be",
    role: "administratief",
    skills: ["Administratie", "Klantencontact"],
    availability: {
      ...defaultAvailability,
      woensdag: { available: false },
    },
  },
  {
    id: "4",
    name: "Steven Maertens",
    email: "steven.maertens@moeyersons.be",
    role: "monteur",
    skills: ["Spuiterij", "Afwerking"],
    availability: defaultAvailability,
  },
  {
    id: "5",
    name: "Els De Smet",
    email: "els.desmet@moeyersons.be",
    role: "monteur",
    skills: ["Ontwerp", "Technische tekeningen", "Maatwerk"],
    availability: {
      ...defaultAvailability,
      vrijdag: { available: true, startTime: "08:00", endTime: "12:00" },
    },
  },
];

// Seed clients
const clients: Client[] = [
  {
    id: "c1",
    name: "Delhaize Group",
    contactPerson: "Marc Van den Berg",
    email: "marc.vandenberg@delhaize.be",
    phone: "+32 2 412 21 11",
    address: "Brusselsesteenweg 347, 1730 Asse",
    notes: "Grote klant - meerdere koelwagens per jaar",
    type: "klant",
  },
  {
    id: "c2",
    name: "Bpost",
    contactPerson: "Sofie Claes",
    email: "sofie.claes@bpost.be",
    phone: "+32 2 201 23 45",
    address: "Muntcentrum, 1000 Brussel",
    notes: "Herstellingscontract voor vloot bestelwagens",
    type: "klant",
  },
  {
    id: "c3",
    name: "Transuniverse Forwarding",
    contactPerson: "Peter Willems",
    email: "peter.willems@transuniverse.be",
    phone: "+32 9 321 45 67",
    address: "Transportzone 8, 9052 Zwijnaarde",
    notes: "",
    type: "klant",
  },
  {
    id: "c4",
    name: "Infrabel",
    contactPerson: "Anne Dubois",
    email: "anne.dubois@infrabel.be",
    phone: "+32 2 525 22 11",
    address: "Fonsnylaan 48, 1060 Brussel",
    notes: "Mobiele werkplaatsen voor spooronderhoud",
    type: "klant",
  },
  {
    id: "c5",
    name: "VRT",
    contactPerson: "Thomas De Ridder",
    email: "thomas.deridder@vrt.be",
    phone: "+32 2 741 31 11",
    address: "Auguste Reyerslaan 52, 1043 Brussel",
    notes: "TV-wagen projecten - strikte technische eisen",
    type: "prospect",
  },
];

// Seed resources
const resources: Resource[] = [
  { id: "r1", name: "Spuitcabine 1", type: "spuiterij", capacity: 1 },
  { id: "r2", name: "Spuitcabine 2", type: "spuiterij", capacity: 1 },
  { id: "r3", name: "Werkplaats A", type: "werkplaats", capacity: 3 },
  { id: "r4", name: "Werkplaats B", type: "werkplaats", capacity: 2 },
  { id: "r5", name: "Herstellingshal", type: "herstellingen", capacity: 4 },
  { id: "r6", name: "Magazijn Centraal", type: "magazijn", capacity: 1 },
];

// Seed reservations
const reservations: ResourceReservation[] = [
  {
    id: "res1",
    resourceId: "r1",
    taskId: "3-0",
    projectId: "3",
    date: addDays(new Date(), 1).toISOString().slice(0, 10),
    startTime: "08:00",
    endTime: "17:00",
  },
  {
    id: "res2",
    resourceId: "r3",
    taskId: "1-2",
    projectId: "1",
    date: addDays(new Date(), 2).toISOString().slice(0, 10),
    startTime: "08:00",
    endTime: "12:00",
  },
];

// Function to generate default tasks for each project type
export function getDefaultTasksForProjectType(projectType: string): Partial<Task>[] {
  const addDurationToTasks = (tasks: Partial<Task>[], baseMinutes: number = 60) => {
    return tasks.map((task, index) => ({
      ...task,
      duration: {
        value: baseMinutes + index * 15,
        unit: "minutes" as const,
      },
    }));
  };

  let tasks: Partial<Task>[] = [];

  switch (projectType) {
    case "kastbouw":
      tasks = [
        { title: "Opmetingen uitvoeren", description: "Exacte afmetingen van de opbouw bepalen" },
        { title: "Materialen bestellen", description: "Nodige materialen voor kastbouw bestellen" },
        { title: "Basisconstructie", description: "Basisstructuur van de opbouw opbouwen" },
        { title: "Isolatie en beplating", description: "Isolatie en beplating installeren" },
        { title: "Elektriciteit", description: "Elektrische bedrading en systemen installeren" },
        { title: "Afwerking", description: "Afwerkingsdetails en finalisatie" },
        { title: "Kwaliteitscontrole", description: "Eindcontrole van de opbouw" },
      ];
      return addDurationToTasks(tasks, 60);

    case "herstelling":
      tasks = [
        { title: "Schadevaststelling", description: "Omvang van de schade bepalen" },
        { title: "Offerte maken", description: "Kostenraming en werkplanning maken" },
        { title: "Onderdelen bestellen", description: "Benodigde onderdelen bestellen" },
        { title: "Herstelling uitvoeren", description: "Uitvoeren van de herstellingswerken" },
        { title: "Testen", description: "Werking testen na de herstellingen" },
      ];
      return addDurationToTasks(tasks, 45);

    case "spuiterij":
      tasks = [
        { title: "Voorbereiding oppervlak", description: "Schuren en voorbereiden van het oppervlak" },
        { title: "Maskeren", description: "Afplakken en beschermen van onderdelen" },
        { title: "Primer aanbrengen", description: "Aanbrengen van de primer laag" },
        { title: "Basislak spuiten", description: "Aanbrengen van de basislak" },
        { title: "Vernis spuiten", description: "Aanbrengen van de vernislaag" },
        { title: "Droging", description: "Droogtijd respecteren" },
        { title: "Polijsten", description: "Oppervlak polijsten" },
      ];
      return addDurationToTasks(tasks, 90);

    case "maatwerk":
      tasks = [
        { title: "Klantvergadering", description: "Wensen en eisen bespreken met de klant" },
        { title: "Ontwerp maken", description: "Technische tekeningen maken" },
        { title: "Materiaalonderzoek", description: "Geschikte materialen selecteren" },
        { title: "Prototype", description: "Prototype maken en testen" },
        { title: "Productie", description: "Maatwerk produceren" },
        { title: "Afwerking", description: "Finishing touches aanbrengen" },
        { title: "Klantaflevering", description: "Eindresultaat presenteren aan klant" },
      ];
      return addDurationToTasks(tasks, 120);

    case "mobiel":
      tasks = [
        { title: "Ontwerp mobiele werkplaats", description: "Layout van de mobiele werkplaats ontwerpen" },
        { title: "Basisinstallatie", description: "Installeren van basiscomponenten" },
        { title: "Elektriciteit en verlichting", description: "Elektrisch systeem installeren" },
        { title: "Gereedschapsmontage", description: "Gereedschappen en werkbanken installeren" },
        { title: "Opbergsystemen", description: "Opbergsystemen en kasten installeren" },
        { title: "Testen", description: "Functionaliteit testen" },
      ];
      return addDurationToTasks(tasks, 240);

    case "medisch":
      tasks = [
        { title: "Specificaties bepalen", description: "Medische eisen en specificaties bepalen" },
        { title: "Ruimte-indeling", description: "Layout van de medische ruimte ontwerpen" },
        { title: "Elektrische systemen", description: "Speciale medische elektriciteitssystemen installeren" },
        { title: "Medische apparatuur", description: "Montage van medische apparatuur" },
        { title: "Sterilisatie-eisen", description: "Installatie van sterilisatie-apparatuur" },
        { title: "Certificering", description: "Verkrijgen van nodige medische certificeringen" },
      ];
      return addDurationToTasks(tasks, 180);

    case "tv":
      tasks = [
        { title: "Technische vereisten", description: "Broadcast vereisten bepalen" },
        { title: "Kabelgoten", description: "Installatie van kabelgoten en routing" },
        { title: "Electronica installatie", description: "Montage van broadcast apparatuur" },
        { title: "Controlekamer", description: "Inrichting van de controlekamer" },
        { title: "Signaaltesten", description: "Testen van broadcast signalen" },
        { title: "Akoestiek", description: "Akoestische behandelingen uitvoeren" },
      ];
      return addDurationToTasks(tasks, 300);

    case "leger":
      tasks = [
        { title: "Bepalen veiligheidseisen", description: "Veiligheids- en tactische vereisten bepalen" },
        { title: "Speciale materialen", description: "Bestellen van speciale high-security materialen" },
        { title: "Gepantserde componenten", description: "Installatie van gepantserde componenten" },
        { title: "Communicatiesystemen", description: "Installatie van militaire communicatiesystemen" },
        { title: "Terreintest", description: "Testen onder diverse terreinomstandigheden" },
        { title: "Veiligheidskeuring", description: "Veiligheidskeuring door specialisten" },
      ];
      return addDurationToTasks(tasks, 480);

    default:
      tasks = [
        { title: "Projectplanning", description: "Project plannen en voorbereiden" },
        { title: "Uitvoering", description: "Uitvoeren van de werkzaamheden" },
        { title: "Afronding", description: "Project afronden en evalueren" },
      ];
      return addDurationToTasks(tasks, 60);
  }
}

// Build project type configs
function buildProjectTypeConfigs(): Record<ProjectTypeKey, ProjectTypeConfig> {
  const colors: Record<ProjectTypeKey, string> = {
    kastbouw: "#3B82F6",
    herstelling: "#EF4444",
    spuiterij: "#F59E0B",
    maatwerk: "#10B981",
    mobiel: "#8B5CF6",
    medisch: "#EC4899",
    tv: "#6366F1",
    leger: "#065F46",
  };

  const keys: ProjectTypeKey[] = ["kastbouw", "herstelling", "spuiterij", "maatwerk", "mobiel", "medisch", "tv", "leger"];

  const configs = {} as Record<ProjectTypeKey, ProjectTypeConfig>;
  for (const key of keys) {
    const templates = getDefaultTasksForProjectType(key).map((t) => ({
      title: t.title!,
      description: t.description!,
      duration: t.duration,
    }));
    configs[key] = {
      key,
      name: projectTypeNames[key],
      color: colors[key],
      taskTemplates: templates,
    };
  }
  return configs;
}

// Create sample projects
const projects: Project[] = [
  {
    id: "1",
    name: "Koelwagen voor Delhaize",
    title: "Koelwagen voor Delhaize",
    description: "Kastopbouw met koelsysteem voor Delhaize distributiecentrum in Ninove",
    type: "kastbouw",
    clientId: "c1",
    client: "Delhaize Group",
    deadline: "2025-07-15",
    status: "lopend",
    startDate: new Date(2025, 4, 10),
    endDate: new Date(2025, 6, 15),
    tasks: getDefaultTasksForProjectType("kastbouw").map((task, index) => ({
      id: `1-${index}`,
      title: task.title!,
      description: task.description!,
      projectId: "1",
      startDate: addDays(new Date(), index * 3),
      endDate: addDays(new Date(), index * 3 + 2),
      status: (index === 0 ? "afgerond" : index === 1 ? "bezig" : "gepland") as TaskStatus,
      duration: task.duration,
      assignedTo: index < 3 ? ["2"] : undefined,
    })),
  },
  {
    id: "2",
    name: "Herstelling Bestelwagen Bpost",
    title: "Herstelling Bestelwagen Bpost",
    description: "Reparatie van beschadigde laadruimte van Bpost bestelwagen",
    type: "herstelling",
    clientId: "c2",
    client: "Bpost",
    deadline: "2025-06-02",
    status: "lopend",
    startDate: new Date(2025, 4, 15),
    endDate: new Date(2025, 5, 2),
    tasks: getDefaultTasksForProjectType("herstelling").map((task, index) => ({
      id: `2-${index}`,
      title: task.title!,
      description: task.description!,
      projectId: "2",
      startDate: addDays(new Date(), index + 1),
      endDate: addDays(new Date(), index + 2),
      status: (index === 0 ? "afgerond" : index === 1 ? "bezig" : "nieuw") as TaskStatus,
      duration: task.duration,
      assignedTo: index < 2 ? ["4"] : undefined,
    })),
  },
  {
    id: "3",
    name: "Spuiterij Oplegger Transuniverse",
    title: "Spuiterij Oplegger Transuniverse",
    description: "Volledig opnieuw spuiten van Transuniverse oplegger in bedrijfskleuren",
    type: "spuiterij",
    clientId: "c3",
    client: "Transuniverse Forwarding",
    deadline: "2025-06-20",
    status: "nieuw",
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 20),
    tasks: getDefaultTasksForProjectType("spuiterij").map((task, index) => ({
      id: `3-${index}`,
      title: task.title!,
      description: task.description!,
      projectId: "3",
      startDate: addDays(new Date(), index * 2),
      endDate: addDays(new Date(), index * 2 + 1),
      status: "nieuw" as TaskStatus,
      duration: task.duration,
    })),
  },
  {
    id: "4",
    name: "Mobiele Werkplaats Infrabel",
    title: "Mobiele Werkplaats Infrabel",
    description: "Creatie van een mobiele werkplaats voor Infrabel spooronderhoud",
    type: "mobiel",
    clientId: "c4",
    client: "Infrabel",
    deadline: "2025-08-30",
    status: "nieuw",
    startDate: new Date(2025, 6, 15),
    endDate: new Date(2025, 7, 30),
    tasks: getDefaultTasksForProjectType("mobiel").map((task, index) => ({
      id: `4-${index}`,
      title: task.title!,
      description: task.description!,
      projectId: "4",
      startDate: addDays(new Date(), index * 4),
      endDate: addDays(new Date(), index * 4 + 3),
      status: "nieuw" as TaskStatus,
      duration: task.duration,
    })),
  },
  {
    id: "5",
    name: "TV-wagen VRT Nieuwsdienst",
    title: "TV-wagen VRT Nieuwsdienst",
    description: "Ombouw van bestelwagen tot mobiele nieuwsstudio voor VRT",
    type: "tv",
    clientId: "c5",
    client: "VRT",
    deadline: "2025-09-15",
    status: "nieuw",
    startDate: new Date(2025, 7, 1),
    endDate: new Date(2025, 8, 15),
    tasks: getDefaultTasksForProjectType("tv").map((task, index) => ({
      id: `5-${index}`,
      title: task.title!,
      description: task.description!,
      projectId: "5",
      startDate: addDays(new Date(), index * 5),
      endDate: addDays(new Date(), index * 5 + 4),
      status: "nieuw" as TaskStatus,
      duration: task.duration,
    })),
  },
];

// Export initial state for the AppContext
export const initialState: AppState = {
  projects,
  users,
  clients,
  resources,
  reservations,
  projectTypeConfigs: buildProjectTypeConfigs(),
};

// Backward-compatible exports (used by components not yet migrated)
export { users, projects };

export function getTasksByDate(date: Date): Task[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return projects.flatMap((project) =>
    project.tasks.filter((task) => {
      const taskStart = format(task.startDate, "yyyy-MM-dd");
      const taskEnd = format(task.endDate, "yyyy-MM-dd");
      return dateStr >= taskStart && dateStr <= taskEnd;
    })
  );
}

export function getProjectById(projectId: string): Project | undefined {
  return projects.find((project) => project.id === projectId);
}
