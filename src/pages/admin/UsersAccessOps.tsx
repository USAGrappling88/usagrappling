import { useEffect, useMemo, useState } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, UserPlus, Trash2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { ModuleName, ModuleLevel } from "@/hooks/useOpsAccess";

type AdminRole = "super_admin" | "admin" | "travel_admin" | "event_staff" | "member";
type AssignmentRole = "ops" | "brackets" | "officials" | "marketing" | "full";

interface AppAdmin {
  email: string;
  display_name: string | null;
  role: AdminRole;
  created_at?: string;
}

interface EventRow {
  id: string;
  name: string;
  event_date: string;
  city: string | null;
  state: string | null;
}

interface Assignment {
  id: string;
  user_id: string;
  event_id: string;
  role: AssignmentRole;
}

interface ModulePermRow {
  id?: string;
  email: string;
  module: ModuleName;
  role: ModuleLevel;
}

const MODULES: { key: ModuleName; label: string }[] = [
  { key: "kanban", label: "Kanban" },
  { key: "event_command", label: "Event Command" },
  { key: "content_review", label: "Content Review" },
  { key: "press", label: "Press" },
  { key: "events", label: "Events" },
  { key: "staff", label: "Staff" },
  { key: "users", label: "Users" },
  { key: "world_team", label: "World Team" },
  { key: "marketing", label: "Marketing" },
  { key: "compose", label: "Compose" },
  { key: "hermes", label: "Hermes" },
  { key: "crm", label: "CRM" },
];

const ASSIGNABLE_ROLES: AdminRole[] = ["admin", "member", "event_staff"];
const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  travel_admin: "Travel Admin",
  member: "Member",
  event_staff: "Event Staff",
};
const ROLE_VARIANT: Record<AdminRole, "default" | "secondary" | "outline" | "destructive"> = {
  super_admin: "destructive",
  admin: "default",
  travel_admin: "secondary",
  member: "secondary",
  event_staff: "outline",
};

const LEVEL_OPTIONS: (ModuleLevel | "none")[] = ["none", "viewer", "editor", "manager"];

function friendlyError(e: unknown, fallback = "Something went wrong") {
  const msg = (e as { message?: string; code?: string })?.message ?? "";
  const code = (e as { code?: string })?.code ?? "";
  if (code === "42501" || /permission|rls|policy/i.test(msg)) {
    return "You don't have access to modify this.";
  }
  return msg || fallback;
}

export const UsersAccessPanel = () => {
  const { user } = useAuth();
  const currentEmail = user?.email?.toLowerCase() ?? null;

  const [admins, setAdmins] = useState<AppAdmin[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [perms, setPerms] = useState<ModulePermRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selected, setSelected] = useState<AppAdmin | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, e, as, mp] = await Promise.all([
        opsSupabase.from("app_admins").select("email, display_name, role, created_at").order("created_at", { ascending: false }),
        opsSupabase.from("events").select("id, name, event_date, city, state").order("event_date", { ascending: true }),
        opsSupabase.from("event_assignments").select("id, user_id, event_id, role"),
        opsSupabase.from("module_permissions").select("id, email, module, role"),
      ]);
      if (a.error) throw a.error;
      if (e.error) throw e.error;
      if (as.error) throw as.error;
      if (mp.error) throw mp.error;
      setAdmins((a.data ?? []) as AppAdmin[]);
      setEvents((e.data ?? []) as EventRow[]);
      setAssignments((as.data ?? []) as Assignment[]);
      setPerms((mp.data ?? []) as ModulePermRow[]);
    } catch (err) {
      toast.error(friendlyError(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const permsByEmail = useMemo(() => {
    const map = new Map<string, ModulePermRow[]>();
    for (const p of perms) {
      const list = map.get(p.email) ?? [];
      list.push(p);
      map.set(p.email, list);
    }
    return map;
  }, [perms]);

  const setRole = async (email: string, role: AdminRole) => {
    try {
      const { error } = await opsSupabase.from("app_admins").update({ role }).eq("email", email);
      if (error) throw error;
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(friendlyError(err, "Failed to update role"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Users &amp; Permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Grant per-module access. Admins get everything; members only see what you grant here.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No users yet. Invite your first teammate.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Effective access</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a) => {
                  const userPerms = permsByEmail.get(a.email) ?? [];
                  const userAssignments = assignments.filter((as) => {
                    // resolve user's assignments via email lookup requires user_id; we render by email only in the sheet
                    return false;
                  });
                  const isSuper = a.role === "super_admin";
                  return (
                    <TableRow key={a.email}>
                      <TableCell className="font-medium">{a.display_name || "—"}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>
                        {isSuper ? (
                          <Badge variant={ROLE_VARIANT[a.role]}>{ROLE_LABEL[a.role]}</Badge>
                        ) : (
                          <Select value={a.role} onValueChange={(v) => setRole(a.email, v as AdminRole)}>
                            <SelectTrigger className="w-36 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.role === "admin" || a.role === "super_admin" || a.role === "travel_admin" ? (
                          <span className="text-xs text-muted-foreground">All sections</span>
                        ) : a.role === "event_staff" ? (
                          <span className="text-xs text-muted-foreground">Event Command (assigned events)</span>
                        ) : userPerms.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No access granted</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {userPerms.map((p) => (
                              <Badge key={p.module} variant="outline" className="text-[10px]">
                                {MODULES.find((m) => m.key === p.module)?.label ?? p.module}: {p.role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelected(a)}>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvited={load} />

      <PermissionsSheet
        admin={selected}
        events={events}
        assignments={assignments}
        perms={perms}
        currentEmail={currentEmail}
        onClose={() => setSelected(null)}
        onChanged={load}
      />
    </div>
  );
};

/* ------------------------- Invite Dialog ------------------------- */

const InviteDialog = ({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onInvited: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("member");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      toast.error("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertErr } = await opsSupabase
        .from("app_admins")
        .insert({ email: clean, display_name: name.trim() || null, role });
      if (insertErr) throw insertErr;

      const { error: otpErr } = await opsSupabase.auth.signInWithOtp({
        email: clean,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      if (otpErr) {
        toast.warning(`User added, but invite email failed: ${otpErr.message}`);
      } else {
        toast.success(`Invite sent to ${clean}`);
      }
      setEmail("");
      setName("");
      setRole("member");
      onOpenChange(false);
      onInvited();
    } catch (err) {
      toast.error(friendlyError(err, "Failed to invite user"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="member">Member — only granted sections</SelectItem>
                <SelectItem value="event_staff">Event Staff — assigned events only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ------------------------- Permissions Sheet ------------------------- */

const ASSIGNMENT_ROLES: AssignmentRole[] = ["ops", "brackets", "officials", "marketing", "full"];

const PermissionsSheet = ({
  admin,
  events,
  assignments,
  perms,
  currentEmail,
  onClose,
  onChanged,
}: {
  admin: AppAdmin | null;
  events: EventRow[];
  assignments: Assignment[];
  perms: ModulePermRow[];
  currentEmail: string | null;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [pendingAssignRole, setPendingAssignRole] = useState<Record<string, AssignmentRole>>({});

  useEffect(() => {
    if (!admin) {
      setUserId(null);
      return;
    }
    setResolving(true);
    opsSupabase
      .rpc("user_id_by_email", { p_email: admin.email })
      .then(({ data, error }) => {
        setUserId(error ? null : ((data as string) ?? null));
        setResolving(false);
      });
  }, [admin?.email]);

  if (!admin) return null;

  const userPerms = perms.filter((p) => p.email === admin.email);
  const permMap: Partial<Record<ModuleName, ModuleLevel>> = {};
  for (const p of userPerms) permMap[p.module] = p.role;

  const userAssignments = userId ? assignments.filter((a) => a.user_id === userId) : [];
  const assignedEventIds = new Set(userAssignments.map((a) => a.event_id));

  const isAllAccess = admin.role === "admin" || admin.role === "super_admin" || admin.role === "travel_admin";
  const showEventCmdAssignments =
    admin.role === "event_staff" || permMap.event_command || isAllAccess;

  const setLevel = async (module: ModuleName, level: ModuleLevel | "none") => {
    setSaving(`mod:${module}`);
    try {
      if (level === "none") {
        const { error } = await opsSupabase
          .from("module_permissions")
          .delete()
          .eq("email", admin.email)
          .eq("module", module);
        if (error) throw error;
      } else {
        const { error } = await opsSupabase
          .from("module_permissions")
          .upsert(
            {
              email: admin.email,
              module,
              role: level,
              granted_by: currentEmail,
            },
            { onConflict: "email,module" },
          );
        if (error) throw error;
      }
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err, "Failed to update permission"));
    } finally {
      setSaving(null);
    }
  };

  const assign = async (eventId: string) => {
    if (!userId) return;
    const role = pendingAssignRole[eventId] ?? "ops";
    setSaving(`ev:${eventId}`);
    try {
      const { error } = await opsSupabase.from("event_assignments").insert({
        user_id: userId,
        event_id: eventId,
        role,
        created_by: currentEmail,
      });
      if (error) throw error;
      toast.success("Assignment added");
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err, "Failed to add assignment"));
    } finally {
      setSaving(null);
    }
  };

  const remove = async (assignmentId: string) => {
    setSaving(`ev:${assignmentId}`);
    try {
      const { error } = await opsSupabase.from("event_assignments").delete().eq("id", assignmentId);
      if (error) throw error;
      toast.success("Assignment removed");
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err, "Failed to remove assignment"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <Sheet open={!!admin} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{admin.display_name || admin.email}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {admin.email} • <Badge variant={ROLE_VARIANT[admin.role]}>{ROLE_LABEL[admin.role]}</Badge>
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {isAllAccess ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              This user has full access to every section. Change their role to "Member" to grant per-module access.
            </div>
          ) : admin.role === "event_staff" ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Event Staff users only see the Event Command tab, scoped to their assigned events below.
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold mb-3">Module access</h3>
              <div className="rounded-md border divide-y">
                {MODULES.map((m) => {
                  const current = permMap[m.key] ?? "none";
                  return (
                    <div key={m.key} className="flex items-center justify-between px-3 py-2">
                      <div className="text-sm font-medium">{m.label}</div>
                      <Select
                        value={current}
                        onValueChange={(v) => setLevel(m.key, v as ModuleLevel | "none")}
                        disabled={saving === `mod:${m.key}`}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVEL_OPTIONS.map((lvl) => (
                            <SelectItem key={lvl} value={lvl} className="capitalize">
                              {lvl}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showEventCmdAssignments && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Event assignments</h3>
              {resolving ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Locating user account…
                </div>
              ) : !userId ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  This user hasn't accepted their invite yet. Assignments will unlock once they sign in.
                </div>
              ) : (
                <>
                  {userAssignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-3">No events assigned.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {userAssignments.map((a) => {
                        const ev = events.find((e) => e.id === a.event_id);
                        return (
                          <div key={a.id} className="flex items-center justify-between rounded border p-2">
                            <div className="text-sm">
                              <div className="font-medium">{ev?.name ?? "Unknown event"}</div>
                              <div className="text-xs text-muted-foreground">
                                {ev?.event_date} · {ev?.city}
                                {ev?.state ? `, ${ev.state}` : ""} · <span className="uppercase">{a.role}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(a.id)}
                              disabled={saving === `ev:${a.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 border rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Add event</div>
                    {events
                      .filter((ev) => !assignedEventIds.has(ev.id))
                      .map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between gap-3 rounded border p-2">
                          <div className="text-sm min-w-0 flex-1">
                            <div className="font-medium truncate">{ev.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ev.event_date} · {ev.city}
                              {ev.state ? `, ${ev.state}` : ""}
                            </div>
                          </div>
                          <Select
                            value={pendingAssignRole[ev.id] ?? "ops"}
                            onValueChange={(v) =>
                              setPendingAssignRole((p) => ({ ...p, [ev.id]: v as AssignmentRole }))
                            }
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNMENT_ROLES.map((r) => (
                                <SelectItem key={r} value={r} className="capitalize">
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => assign(ev.id)} disabled={saving === `ev:${ev.id}`}>
                            {saving === `ev:${ev.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                          </Button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UsersAccessPanel;
