
import type { Project } from "@/types";
import { useAppStore } from "@/store/AppContext";

interface GanttSidebarProps {
  projects: Project[];
  selectedProjects: string[];
  onToggleProject: (projectId: string) => void;
}

export default function GanttSidebar({
  projects,
  selectedProjects,
  onToggleProject
}: GanttSidebarProps) {
  const { state } = useAppStore();

  return (
    <div className="w-60 min-w-60 border-r p-2 overflow-y-auto max-h-[70vh]">
      <h3 className="text-lg font-medium mb-2">Projecten</h3>
      <div className="space-y-2">
        {projects.map(project => {
          const config = state.projectTypeConfigs[project.type];
          const color = config?.color ?? "#6b7280";
          const typeName = config?.name ?? project.type;

          return (
            <div
              key={project.id}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                id={`project-${project.id}`}
                checked={selectedProjects.includes(project.id)}
                onChange={() => onToggleProject(project.id)}
                className="rounded text-primary"
              />
              <label
                htmlFor={`project-${project.id}`}
                className="text-sm font-medium cursor-pointer flex-1 truncate"
              >
                {project.name}
              </label>
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
                title={typeName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
