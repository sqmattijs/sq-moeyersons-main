
import React from "react";
import type { Task, TaskStatus } from "@/types";
import { useAppStore } from "@/store/AppContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface ProjectTaskListProps {
  tasks: Task[];
  projectId: string;
}

const nextStatusMap: Record<TaskStatus, TaskStatus> = {
  nieuw: "gepland",
  gepland: "bezig",
  bezig: "afgerond",
  afgerond: "nieuw",
};

export default function ProjectTaskList({ tasks, projectId }: ProjectTaskListProps) {
  const { dispatch } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nieuw":
        return "bg-blue-100 text-blue-800";
      case "gepland":
        return "bg-yellow-100 text-yellow-800";
      case "bezig":
        return "bg-orange-100 text-orange-800";
      case "afgerond":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    dispatch({
      type: "UPDATE_TASK",
      payload: { projectId, taskId, updates: { status: newStatus } }
    });
    toast.success(`Taak status aangepast naar ${newStatus}`);
  };

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return null;

    const unitMap: Record<string, string> = {
      "minutes": duration.value === 1 ? "minuut" : "minuten",
      "hours": duration.value === 1 ? "uur" : "uren",
      "days": duration.value === 1 ? "dag" : "dagen"
    };

    return `${duration.value} ${unitMap[duration.unit] || duration.unit}`;
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Geen taken gevonden voor dit project</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{task.title}</h3>
              <div
                className={`px-2 py-1 text-xs rounded-full cursor-pointer ${getStatusColor(task.status)}`}
                onClick={() => {
                  const newStatus = nextStatusMap[task.status] || "nieuw";
                  handleStatusChange(task.id, newStatus);
                }}
              >
                {task.status}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex-1">
                {format(task.startDate, "dd-MM-yyyy")} - {format(task.endDate, "dd-MM-yyyy")}
              </span>
              {task.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.duration)}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
