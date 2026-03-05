
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdminView from "@/components/Admin/AdminView";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container py-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Terug naar overzicht
        </Button>
        <AdminView />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          © 2025 Moeyersons - Building the difference on wheels
        </div>
      </footer>
    </div>
  );
};

export default Admin;
