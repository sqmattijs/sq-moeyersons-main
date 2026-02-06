
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import DragDropScheduler from "@/components/DragDropScheduler";
import ProjectsView from "@/components/Projects/ProjectsView";
import ClientsView from "@/components/Clients/ClientsView";
import EmployeesView from "@/components/Employees/EmployeesView";
import AdminView from "@/components/Admin/AdminView";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "planning" | "projects" | "clients" | "employees" | "admin">("dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container py-6">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <TabsList className="grid w-full grid-cols-6 md:w-auto md:inline-flex">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="projects">Projecten</TabsTrigger>
              <TabsTrigger value="clients">Klanten</TabsTrigger>
              <TabsTrigger value="employees">Medewerkers</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hidden sm:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Beheer
            </Button>
          </div>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="planning">
            <DragDropScheduler />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsView />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsView />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeesView />
          </TabsContent>

          <TabsContent value="admin">
            <AdminView />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          © 2025 Moeyersons - Building the difference on wheels
        </div>
      </footer>
    </div>
  );
};

export default Index;
