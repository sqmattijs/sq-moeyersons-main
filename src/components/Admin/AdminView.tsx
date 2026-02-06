
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectTypesManager from "./ProjectTypesManager";
import TasksManager from "./TasksManager";
import EmployeeManager from "./EmployeeManager";
import ResourceManager from "./ResourceManager";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<"project-types" | "tasks" | "users" | "resources">("project-types");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Administratie</h2>
      </div>

      <Tabs
        defaultValue="project-types"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="project-types">Project Types</TabsTrigger>
          <TabsTrigger value="tasks">Taken</TabsTrigger>
          <TabsTrigger value="users">Medewerkers</TabsTrigger>
          <TabsTrigger value="resources">Middelen</TabsTrigger>
        </TabsList>

        <TabsContent value="project-types">
          <ProjectTypesManager />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksManager />
        </TabsContent>

        <TabsContent value="users">
          <EmployeeManager />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
