import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, ShieldAlert, FileText, Calendar, Users, UserCog, Trophy } from "lucide-react";
import { PressPanel } from "./PressOps";
import { EventPanel } from "./EventOps";
import { StaffPanel } from "./StaffOps";
import { UserManagementPanel } from "./UserManagement";
import { WorldTeamPanel } from "./WorldTeamOps";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("press");

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate("/auth?redirect=/admin");
    return null;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin privileges required.</p>
          <Button variant="outline" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="press" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Press
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Staff
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="press"><PressPanel /></TabsContent>
          <TabsContent value="events"><EventPanel /></TabsContent>
          <TabsContent value="staff"><StaffPanel /></TabsContent>
          <TabsContent value="users"><UserManagementPanel /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
