import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOpsAccess } from "@/hooks/useOpsAccess";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, ShieldAlert, FileText, Calendar, Users, UserCog, Trophy, Megaphone, MessageSquare, LayoutDashboard, PenSquare, ClipboardCheck, KeyRound, Command } from "lucide-react";
import { PressPanel } from "./PressOps";
import { EventPanel } from "./EventOps";
import { StaffPanel } from "./StaffOps";
import { UserManagementPanel } from "./UserManagement";
import { WorldTeamPanel } from "./WorldTeamOps";
import { MarketingPanel } from "./MarketingOps";
import { HermesPanel } from "./HermesOps";
import { KanbanPanel } from "./KanbanOps";
import { ComposePanel } from "./ComposeOps";
import { ContentReviewPanel } from "./ContentReviewOps";
import { UsersAccessPanel } from "./UsersAccessOps";
import { EventCommandPanel } from "./EventCommandOps";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, isLoading: authLoading, signOut } = useAuth();
  const { role: opsRole, displayName: opsName, loading: opsLoading } = useOpsAccess(user?.email);
  const [activeTab, setActiveTab] = useState("kanban");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") setActiveTab(detail);
    };
    window.addEventListener("admin:navigate-tab", handler);
    return () => window.removeEventListener("admin:navigate-tab", handler);
  }, []);

  if (authLoading || opsLoading) {
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

  // Event Staff: scoped experience — no site-admin required.
  if (opsRole === "event_staff") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-display font-bold text-foreground">Event Staff</h1>
            <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
          <EventCommandPanel />
          {opsName ? <p className="text-xs text-muted-foreground mt-4">Signed in as {opsName}</p> : null}
        </div>
      </Layout>
    );
  }

  if (!isAdmin && opsRole !== "admin" && opsRole !== "travel_admin") {
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

  const canManageAccess = isSuperAdmin || opsRole === "admin";

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
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="event-command" className="flex items-center gap-2">
              <Command className="w-4 h-4" /> Event Command
            </TabsTrigger>
            <TabsTrigger value="content-review" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" /> Content Review
            </TabsTrigger>
            <TabsTrigger value="press" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Press
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Events
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Staff
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog className="w-4 h-4" /> Users
              </TabsTrigger>
            )}
            {canManageAccess && (
              <TabsTrigger value="access" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Users &amp; Access
              </TabsTrigger>
            )}
            <TabsTrigger value="world-team" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" /> World Team
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Marketing
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <PenSquare className="w-4 h-4" /> Compose
            </TabsTrigger>
            <TabsTrigger value="hermes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Hermes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban"><KanbanPanel /></TabsContent>
          <TabsContent value="content-review"><ContentReviewPanel /></TabsContent>
          <TabsContent value="press"><PressPanel /></TabsContent>
          <TabsContent value="events"><EventPanel /></TabsContent>
          <TabsContent value="staff"><StaffPanel /></TabsContent>
          {isSuperAdmin && <TabsContent value="users"><UserManagementPanel /></TabsContent>}
          {canManageAccess && <TabsContent value="access"><UsersAccessPanel /></TabsContent>}
          <TabsContent value="world-team"><WorldTeamPanel /></TabsContent>
          <TabsContent value="marketing"><MarketingPanel /></TabsContent>
          <TabsContent value="compose"><ComposePanel /></TabsContent>
          <TabsContent value="hermes"><HermesPanel /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
