
import React from "react";
import { format, addDays } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarDayCell } from "./CalendarDayCell";
import { useAppStore } from "@/store/AppContext";
import { getTasksByDate } from "@/store/selectors";

interface CalendarWeekGridProps {
  currentWeek: Date;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onAddTask: (date: Date) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  viewType?: "tasks" | "projects";
  selectedProject?: string;
}

export const CalendarWeekGrid = ({
  currentWeek,
  onDrop,
  onAddTask,
  onDragStart,
  viewType = "tasks",
  selectedProject = "all"
}: CalendarWeekGridProps) => {
  const { state } = useAppStore();

  // Generate the days of the week
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeek, i);
    return {
      date,
      dayName: format(date, 'EEEE', { locale: nl }),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    };
  });

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Calendar day headers */}
      {weekdays.map((day) => (
        <div key={day.date.toISOString()} className="text-center">
          <div className="text-xs font-medium">{day.dayName}</div>
          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full my-1 text-sm ${
            day.isToday ? "bg-primary text-primary-foreground" : ""
          }`}>
            {day.dayNumber}
          </div>
        </div>
      ))}

      {/* Calendar cells */}
      {weekdays.map((day) => {
        let tasks = getTasksByDate(state, day.date);

        // Apply project filtering if needed
        if (selectedProject !== "all") {
          tasks = tasks.filter(task => task.projectId === selectedProject);
        }

        return (
          <CalendarDayCell
            key={`cell-${day.date.toISOString()}`}
            date={day.date}
            isToday={day.isToday}
            tasks={tasks}
            onDrop={onDrop}
            onAddTask={onAddTask}
            onDragStart={onDragStart}
            viewType={viewType}
          />
        );
      })}
    </div>
  );
};
