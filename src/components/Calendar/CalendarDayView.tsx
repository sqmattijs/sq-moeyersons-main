import { useAppStore } from "@/store/AppContext";
import { getTasksByDate } from "@/store/selectors";
import { PROJECT_TYPE_COLORS } from "@/lib/labels";
import type { ProjectTypeKey } from "@/types";

interface CalendarDayViewProps {
  currentDate: Date;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 through 18:00

export default function CalendarDayView({ currentDate, onDrop, onDragStart }: CalendarDayViewProps) {
  const { state } = useAppStore();
  const tasks = getTasksByDate(state, currentDate);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  // Distribute tasks evenly across the available hours
  const taskSlots = tasks.map((task, index) => {
    const slotHour = HOURS[index % HOURS.length];
    return { ...task, slotHour };
  });

  // Group tasks by their assigned hour for rendering
  const tasksByHour = new Map<number, typeof taskSlots>();
  for (const task of taskSlots) {
    const existing = tasksByHour.get(task.slotHour) ?? [];
    existing.push(task);
    tasksByHour.set(task.slotHour, existing);
  }

  return (
    <div
      className="border rounded-lg bg-background"
      onDrop={(e) => onDrop(e, currentDate)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {HOURS.map((hour) => {
        const hourTasks = tasksByHour.get(hour) ?? [];
        const label = `${hour.toString().padStart(2, "0")}:00`;

        return (
          <div
            key={hour}
            className="flex border-b last:border-b-0 min-h-[60px]"
          >
            {/* Hour label */}
            <div className="w-20 shrink-0 border-r px-3 py-2 text-sm text-muted-foreground font-medium">
              {label}
            </div>

            {/* Task area */}
            <div className="flex-1 p-1 flex flex-wrap gap-1">
              {hourTasks.map((task) => {
                const color = PROJECT_TYPE_COLORS[task.projectType as ProjectTypeKey] ?? "#6b7280";
                return (
                  <div
                    key={task.id}
                    className="text-white rounded px-2 py-1.5 text-xs cursor-move flex-1 min-w-[140px]"
                    style={{ backgroundColor: color }}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="truncate text-[10px] opacity-80">{task.projectName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Geen taken voor deze dag. Sleep taken hierheen.
        </div>
      )}
    </div>
  );
}
