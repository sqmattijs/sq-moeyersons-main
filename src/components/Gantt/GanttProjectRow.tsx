
import type { Project } from "@/types";
import { useAppStore } from "@/store/AppContext";
import { addDays, differenceInDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface GanttProjectRowProps {
  project: Project;
  startDate: Date;
  daysToShow: number;
  dates: Date[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date, projectId: string) => void;
}

export default function GanttProjectRow({
  project,
  startDate,
  daysToShow,
  dates,
  onDragStart,
  onDragOver,
  onDrop
}: GanttProjectRowProps) {
  const { state } = useAppStore();
  const color = state.projectTypeConfigs[project.type]?.color ?? "#6b7280";

  return (
    <div key={project.id}>
      {/* Project header */}
      <div
        className="flex items-center justify-between px-2 py-1 sticky z-10"
        style={{ backgroundColor: color + "1A" }}
      >
        <div className="font-medium text-sm truncate">
          {project.name}
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Plus className="h-3 w-3 mr-1" />
          <span className="text-xs">Taak</span>
        </Button>
      </div>

      {/* Project gantt row */}
      <div className="relative h-16 flex">
        {dates.map(date => (
          <div
            key={`${project.id}-${date.toISOString()}`}
            className="gantt-cell w-20 border-r border-b h-full"
            onDrop={(e) => onDrop(e, date, project.id)}
            onDragOver={onDragOver}
          />
        ))}

        {/* Taken */}
        {project.tasks.map(task => {
          const startOffset = Math.max(
            0,
            differenceInDays(task.startDate, startDate)
          );
          const width = Math.min(
            differenceInDays(task.endDate, task.startDate) + 1,
            daysToShow - startOffset
          );

          // Alleen taken tonen die binnen het bereik vallen
          if (startOffset >= daysToShow || startOffset + width <= 0) {
            return null;
          }

          return (
            <div
              key={task.id}
              className="absolute top-1 h-12 rounded px-1 flex items-center cursor-move text-white text-xs"
              style={{
                left: `${startOffset * 80}px`,
                width: `${width * 80 - 4}px`,
                backgroundColor: color,
              }}
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
            >
              {task.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
