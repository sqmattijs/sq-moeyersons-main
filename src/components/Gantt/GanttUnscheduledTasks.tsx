
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/AppContext";
import { getUnscheduledTasks } from "@/store/selectors";

interface GanttUnscheduledTasksProps {
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export default function GanttUnscheduledTasks({ onDragStart }: GanttUnscheduledTasksProps) {
  const { state } = useAppStore();
  const unscheduledTasks = getUnscheduledTasks(state);

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Niet ingeplande taken</h3>
      {unscheduledTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Geen niet-ingeplande taken.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {unscheduledTasks.map((task) => {
            const color = state.projectTypeConfigs[task.projectType]?.color ?? "#6b7280";

            return (
              <div
                key={task.id}
                className="p-2 rounded text-sm cursor-move border"
                style={{ borderLeftWidth: "4px", borderLeftColor: color }}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
              >
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">{task.projectName}</div>
                {task.duration && (
                  <div className="text-xs text-muted-foreground">
                    {task.duration.value} {task.duration.unit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
