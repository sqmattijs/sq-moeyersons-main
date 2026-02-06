
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function ProjectsView() {
  const { state } = useAppStore();
  const [filterType, setFilterType] = useState<string>("all");
  const navigate = useNavigate();

  const filteredProjects = filterType === "all"
    ? state.projects
    : state.projects.filter(project => project.type === filterType);

  const viewProjectDetails = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Projectenbeheer</h2>

        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter op type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle projecten</SelectItem>
              {Object.values(state.projectTypeConfigs).map((config) => (
                <SelectItem key={config.key} value={config.key}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Badge>{state.projectTypeConfigs[project.type]?.name ?? project.type}</Badge>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users2 className="h-4 w-4 text-muted-foreground" />
                  <span>Klant: {project.client || "Onbekend"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString('nl-BE') : "Geen"}</span>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Taken: ({project.tasks.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tasks.map((task, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {task.title}
                      </Badge>
                    )).slice(0, 3)}
                    {project.tasks.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tasks.length - 3} meer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => viewProjectDetails(project.id)}
              >
                Details bekijken
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
