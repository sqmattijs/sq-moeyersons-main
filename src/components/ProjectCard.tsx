
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/AppContext";
import type { Project } from "@/types";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { state } = useAppStore();
  const typeConfig = state.projectTypeConfigs[project.type];
  const typeName = typeConfig?.name ?? project.type;
  const typeColor = typeConfig?.color ?? "#6B7280";

  const completedTasks = project.tasks.filter(task => task.status === 'afgerond').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="text-white p-4 rounded-t-lg" style={{ backgroundColor: typeColor }}>
        <CardTitle className="flex justify-between items-start">
          <span className="text-base">{project.name}</span>
          <Badge variant="outline" className="bg-white/20 text-white">
            {typeName}
          </Badge>
        </CardTitle>
        <div className="text-xs opacity-90">
          {format(project.startDate, 'dd/MM/yyyy')} - {format(project.endDate, 'dd/MM/yyyy')}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="text-sm">{project.client}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{project.description}</div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Taken: {completedTasks}/{totalTasks}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{ width: `${progress}%`, backgroundColor: typeColor }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
