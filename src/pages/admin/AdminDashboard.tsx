import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOpsAccess, type ModuleName } from "@/hooks/useOpsAccess";
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
import { OpsConnectionBanner } from "@/components/admin/OpsConnectionBanner";

type TabDef = {
  value: string;
  module: ModuleName | null; // null = always visible to full admins
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  panel: React.ReactNode;
  superOnly?: boolean;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, isLoading: authLoading, signOut } = useAuth();
  const { role: opsRole, displayName: opsName, loading: opsLoading, isSuperAdmin: opsSuper, isFullAdmin, canView } = useOpsAccess(user?.email);
  const [activeTab, setActiveTab] = useState<string>("kanban");

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

  // Event Staff: scoped experience.
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
          <OpsConnectionBanner />
          {opsName ? <p className="text-xs text-muted-foreground mt-4">Signed in as {opsName}</p> : null}
        </div>
      </Layout>
    );
  }

  const hasSuper = isSuperAdmin || opsSuper;
  const hasFullAdmin = isAdmin || isFullAdmin;

  const allTabs: TabDef[] = [
    { value: "kanban", module: "kanban", label: "Kanban", icon: LayoutDashboard, panel: <KanbanPanel /> },
    { value: "event-command", module: "event_command", label: "Event Command", icon: Command, panel: <EventCommandPanel /> },
    { value: "content-review", module: "content_review", label: "Content Review", icon: ClipboardCheck, panel: <ContentReviewPanel /> },
    { value: "press", module: "press", label: "Press", icon: FileText, panel: <PressPanel /> },
    { value: "events", module: "events", label: "Events", icon: Calendar, panel: <EventPanel /> },
    { value: "staff", module: "staff", label: "Staff", icon: Users, panel: <StaffPanel /> },
    { value: "users", module: "users", label: "Users", icon: UserCog, panel: <UserManagementPanel />, superOnly: true },
    { value: "access", module: null, label: "Users & Access", icon: KeyRound, panel: <UsersAccessPanel />, superOnly: true },
    { value: "world-team", module: "world_team", label: "World Team", icon: Trophy, panel: <WorldTeamPanel /> },
    { value: "marketing", module: "marketing", label: "Marketing", icon: Megaphone, panel: <MarketingPanel /> },
    { value: "compose", module: "compose", label: "Compose", icon: PenSquare, panel: <ComposePanel /> },
    { value: "hermes", module: "hermes", label: "Hermes", icon: MessageSquare, panel: <HermesPanel /> },
  ];

  const visibleTabs = allTabs.filter((t) => {
    if (t.superOnly) return hasSuper;
    if (hasFullAdmin) return true;
    return t.module ? canView(t.module) : false;
  });

  if (visibleTabs.length === 0) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to view any admin sections.</p>
          <Button variant="outline" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </Layout>
    );
  }

  const effectiveTab = visibleTabs.find((t) => t.value === activeTab) ? activeTab : visibleTabs[0].value;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <Tabs value={effectiveTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            {visibleTabs.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {visibleTabs.map((t) => (
            <TabsContent key={t.value} value={t.value}>{t.panel}</TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
