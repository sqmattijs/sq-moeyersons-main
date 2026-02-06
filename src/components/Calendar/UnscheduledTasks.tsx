
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/AppContext";
import { getUnscheduledTasks } from "@/store/selectors";

interface UnscheduledTasksProps {
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const UnscheduledTasks = ({
  onDragStart
}: UnscheduledTasksProps) => {
  const { state } = useAppStore();
  const unscheduledTasks = getUnscheduledTasks(state);

  // Group tasks by project
  const groupedByProject = unscheduledTasks.reduce<
    Record<string, { projectName: string; tasks: typeof unscheduledTasks }>
  >((acc, task) => {
    const key = task.projectId;
    if (!acc[key]) {
      acc[key] = { projectName: task.projectName, tasks: [] };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

  const projectGroups = Object.entries(groupedByProject);

  return (
    <Card className="p-4 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Niet ingeplande taken</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nieuwe Taak
        </Button>
      </div>

      {projectGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Geen niet-ingeplande taken</p>
      ) : (
        <div className="space-y-4">
          {projectGroups.map(([projectId, group]) => (
            <div key={projectId}>
              <h4 className="text-sm font-medium mb-2">{group.projectName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.tasks.map((task) => {
                  const color = state.projectTypeConfigs[task.projectType]?.color ?? "#6b7280";
                  return (
                    <div
                      key={task.id}
                      className="p-2 rounded text-sm cursor-move text-white"
                      style={{ backgroundColor: color }}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                    >
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs opacity-80">
                        {task.duration
                          ? `${task.duration.value} ${task.duration.unit}`
                          : "Geen duur ingesteld"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
