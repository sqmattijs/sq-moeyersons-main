
import { useAppStore } from "@/store/AppContext";
import { getTasksForUser } from "@/store/selectors";
import { roleLabels } from "@/lib/labels";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function EmployeesView() {
  const { state } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Medewerkerbeheer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.users.map((user) => {
          const userTasks = getTasksForUser(state, user.id);
          const activeTasks = userTasks.filter(t => t.status !== "afgerond");
          const uniqueProjectIds = new Set(userTasks.map(t => t.projectId));

          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Rol:</span>
                    <Badge variant="outline" className="w-fit">{roleLabels[user.role]}</Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Specialiteiten:</span>
                    <div className="flex flex-wrap gap-1">
                      {(user.skills || ["Algemeen"]).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  {uniqueProjectIds.size} actieve projecten • {activeTasks.length} openstaande taken
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
