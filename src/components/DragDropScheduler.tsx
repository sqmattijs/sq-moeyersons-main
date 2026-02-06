
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarView from "./Calendar/CalendarView";
import GanttView from "./Gantt/GanttView";
import EmployeeTimeline from "./Planning/EmployeeTimeline";
import EmployeeAvailability from "./Planning/EmployeeAvailability";
import ResourceScheduler from "./Planning/ResourceScheduler";

export default function DragDropScheduler() {
  const [view, setView] = useState<"calendar" | "gantt" | "employees" | "resources">("calendar");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="calendar" value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="employees">Medewerkers</TabsTrigger>
          <TabsTrigger value="resources">Middelen</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <CalendarView />
        </TabsContent>

        <TabsContent value="gantt" className="mt-4">
          <GanttView />
        </TabsContent>

        <TabsContent value="employees" className="mt-4 space-y-8">
          <EmployeeTimeline />
          <EmployeeAvailability />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <ResourceScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
}
