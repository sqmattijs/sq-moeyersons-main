import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/AppContext";
import { searchAll } from "@/store/selectors";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { FileText, CheckSquare, Users, Building2 } from "lucide-react";

const GROUP_CONFIG = {
  project: { label: "Projecten", icon: FileText },
  task: { label: "Taken", icon: CheckSquare },
  user: { label: "Medewerkers", icon: Users },
  client: { label: "Klanten", icon: Building2 },
} as const;

type ResultType = keyof typeof GROUP_CONFIG;

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { state } = useAppStore();

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => searchAll(state, query), [state, query]);

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Partial<Record<ResultType, typeof results>> = {};
    for (const result of results) {
      const key = result.type as ResultType;
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(result);
    }
    return groups;
  }, [results]);

  const groupKeys = Object.keys(grouped) as ResultType[];

  const handleSelect = (type: ResultType, id: string, projectId?: string) => {
    setOpen(false);
    setQuery("");

    switch (type) {
      case "project":
        navigate(`/project/${id}`);
        break;
      case "task":
        if (projectId) {
          navigate(`/project/${projectId}`);
        }
        break;
      case "user":
      case "client":
        // No dedicated route -- just close the dialog
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Zoeken..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Geen resultaten gevonden</CommandEmpty>
        {groupKeys.map((type, index) => {
          const config = GROUP_CONFIG[type];
          const items = grouped[type]!;
          const Icon = config.icon;

          return (
            <div key={type}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={config.label}>
                {items.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => handleSelect(type, item.id, item.projectId)}
                  >
                    <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
