import { useState, useMemo } from "react";
import { startOfWeek, addDays, addWeeks, subWeeks, format, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useAppStore } from "@/store/AppContext";
import { getTasksByDate } from "@/store/selectors";
import { roleLabels } from "@/lib/labels";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WeeklyAvailability } from "@/types";

const OVERLOAD_THRESHOLD = 3;

const WEEKDAY_KEYS: (keyof WeeklyAvailability)[] = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
];

export default function EmployeeAvailability() {
  const { state } = useAppStore();
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () =>
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Monday through Friday
  const weekdays = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(currentWeek, i)),
    [currentWeek]
  );

  const today = new Date();

  // Pre-compute tasks by date for the work week
  const tasksByDate = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getTasksByDate>>();
    for (const day of weekdays) {
      map.set(format(day, "yyyy-MM-dd"), getTasksByDate(state, day));
    }
    return map;
  }, [state, weekdays]);

  const getTaskCountForUser = (userId: string, day: Date): number => {
    const key = format(day, "yyyy-MM-dd");
    const dayTasks = tasksByDate.get(key) ?? [];
    return dayTasks.filter((t) => t.assignedTo?.includes(userId)).length;
  };

  const isAvailable = (
    user: (typeof state.users)[number],
    dayKey: keyof WeeklyAvailability
  ): boolean => {
    if (!user.availability) return false;
    return user.availability[dayKey]?.available ?? false;
  };

  type CellStatus = "available" | "unavailable" | "overloaded";

  const getCellStatus = (
    user: (typeof state.users)[number],
    dayIndex: number,
    day: Date
  ): CellStatus => {
    const dayKey = WEEKDAY_KEYS[dayIndex];
    const available = isAvailable(user, dayKey);

    if (!available) return "unavailable";

    const taskCount = getTaskCountForUser(user.id, day);
    if (taskCount >= OVERLOAD_THRESHOLD) return "overloaded";

    return "available";
  };

  const statusStyles: Record<CellStatus, string> = {
    available: "bg-green-50 dark:bg-green-950/30",
    unavailable: "bg-red-50 dark:bg-red-950/30",
    overloaded: "bg-amber-50 dark:bg-amber-950/30",
  };

  const statusIconColor: Record<CellStatus, string> = {
    available: "text-green-600 dark:text-green-400",
    unavailable: "text-red-600 dark:text-red-400",
    overloaded: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Beschikbaarheid</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Vorige week
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Vandaag
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            Volgende week
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card p-3 text-left text-sm font-medium text-muted-foreground min-w-[180px]">
                    Medewerker
                  </th>
                  {weekdays.map((day, i) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <th
                        key={day.toISOString()}
                        className={`p-3 text-center text-sm font-medium min-w-[140px] ${
                          isToday
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div>
                          {format(day, "EEEE", { locale: nl })}
                        </div>
                        <div className="text-xs">
                          {format(day, "d MMM", { locale: nl })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {state.users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Geen medewerkers gevonden
                    </td>
                  </tr>
                )}
                {state.users.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="sticky left-0 z-10 bg-card p-3">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {roleLabels[user.role]}
                      </div>
                    </td>
                    {weekdays.map((day, dayIndex) => {
                      const status = getCellStatus(user, dayIndex, day);
                      const taskCount = getTaskCountForUser(user.id, day);
                      const isToday = isSameDay(day, today);

                      return (
                        <td
                          key={day.toISOString()}
                          className={`p-3 text-center transition-colors ${statusStyles[status]} ${
                            isToday ? "ring-1 ring-inset ring-primary/20" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {status === "unavailable" ? (
                              <X
                                className={`h-4 w-4 ${statusIconColor[status]}`}
                              />
                            ) : (
                              <Check
                                className={`h-4 w-4 ${statusIconColor[status]}`}
                              />
                            )}
                            {taskCount > 0 && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  status === "overloaded"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                    : ""
                                }`}
                              >
                                {taskCount} {taskCount === 1 ? "taak" : "taken"}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-800" />
          <span>Beschikbaar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-red-200 dark:bg-red-800" />
          <span>Niet beschikbaar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-amber-200 dark:bg-amber-800" />
          <span>Overbelast ({OVERLOAD_THRESHOLD}+ taken)</span>
        </div>
      </div>
    </div>
  );
}
