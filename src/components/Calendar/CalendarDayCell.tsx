
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/AppContext";
import type { Task, ProjectTypeKey } from "@/types";

type CalendarTask = Task & { projectName: string; projectType: ProjectTypeKey };

interface CalendarDayCellProps {
  date: Date;
  isToday: boolean;
  tasks: CalendarTask[];
  onDrop: (e: React.DragEvent, date: Date) => void;
  onAddTask: (date: Date) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  viewType?: "tasks" | "projects";
}

export const CalendarDayCell = ({
  date,
  isToday,
  tasks,
  onDrop,
  onAddTask,
  onDragStart,
  viewType = "tasks"
}: CalendarDayCellProps) => {
  const { state } = useAppStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div
      className={`calendar-cell border rounded-md h-[150px] p-1 overflow-y-auto ${isToday ? "bg-blue-50" : ""}`}
      onDrop={(e) => onDrop(e, date)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex justify-end mb-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={() => onAddTask(date)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-1">
          {tasks.map(task => {
            const color = state.projectTypeConfigs[task.projectType]?.color ?? "#6b7280";
            return (
              <div
                key={task.id}
                className="text-white p-1 rounded text-xs cursor-move"
                style={{ backgroundColor: color }}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="truncate text-[10px]">{task.projectName}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
          Sleep taken hier
        </div>
      )}
    </div>
  );
};
