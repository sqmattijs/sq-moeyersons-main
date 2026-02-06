import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  format,
} from "date-fns";
import { nl } from "date-fns/locale";
import { useAppStore } from "@/store/AppContext";
import { getTasksByDate } from "@/store/selectors";
import { PROJECT_TYPE_COLORS } from "@/lib/labels";
import type { ProjectTypeKey } from "@/types";

interface CalendarMonthViewProps {
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

const DAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function CalendarMonthView({ currentMonth, onDayClick }: CalendarMonthViewProps) {
  const { state } = useAppStore();

  // Build the grid: start from Monday of the week containing the 1st, through Sunday of the week containing the last day
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Collect all days in the grid
  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return (
    <div className="border rounded-lg bg-background overflow-hidden">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const tasks = getTasksByDate(state, day);

          // Unique project types present on this day
          const uniqueTypes = [...new Set(tasks.map((t) => t.projectType))];

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={`
                border-b border-r p-2 min-h-[80px] text-left transition-colors
                hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                ${!inCurrentMonth ? "opacity-40" : ""}
                ${today ? "bg-blue-50 dark:bg-blue-950/30" : ""}
              `}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium leading-none ${
                    today
                      ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </span>
                {tasks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {tasks.length} {tasks.length === 1 ? "taak" : "taken"}
                  </span>
                )}
              </div>

              {/* Project type dots */}
              {uniqueTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {uniqueTypes.map((type) => {
                    const color = PROJECT_TYPE_COLORS[type as ProjectTypeKey] ?? "#6b7280";
                    return (
                      <span
                        key={type}
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
