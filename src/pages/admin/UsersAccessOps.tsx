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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type AdminRole = "admin" | "travel_admin" | "event_staff";
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
  created_at: string;
}

const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Admin",
  travel_admin: "Travel Admin",
  event_staff: "Event Staff",
};

const ROLE_VARIANT: Record<AdminRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  travel_admin: "secondary",
  event_staff: "outline",
};

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
  const currentEmail = user?.email ?? null;

  const [admins, setAdmins] = useState<AppAdmin[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selected, setSelected] = useState<AppAdmin | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, e, as] = await Promise.all([
        opsSupabase.from("app_admins").select("email, display_name, role, created_at").order("created_at", { ascending: false }),
        opsSupabase.from("events").select("id, name, event_date, city, state").order("event_date", { ascending: true }),
        opsSupabase.from("event_assignments").select("id, user_id, event_id, role, created_at"),
      ]);
      if (a.error) throw a.error;
      if (e.error) throw e.error;
      if (as.error) throw as.error;
      setAdmins((a.data ?? []) as AppAdmin[]);
      setEvents((e.data ?? []) as EventRow[]);
      setAssignments((as.data ?? []) as Assignment[]);
    } catch (err) {
      toast.error(friendlyError(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assignmentCountByEmail = useMemo(() => {
    // Since app_admins is keyed by email and event_assignments by user_id,
    // we can only surface counts for users whose auth.users row exists.
    // Return raw count map by user_id; UI will show 0 when unknown.
    const byUser = new Map<string, number>();
    for (const a of assignments) byUser.set(a.user_id, (byUser.get(a.user_id) ?? 0) + 1);
    return byUser;
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users &amp; Access</h2>
          <p className="text-sm text-muted-foreground">
            Invite admins and assign event staff to specific tournaments.
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
                  <TableHead>Events</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a) => {
                  // best-effort event count: match assignments via any user with same email is not possible from client;
                  // show total when role is event_staff and let panel drill in.
                  const isStaff = a.role === "event_staff";
                  return (
                    <TableRow
                      key={a.email}
                      className={isStaff ? "cursor-pointer hover:bg-muted/40" : ""}
                      onClick={() => isStaff && setSelected(a)}
                    >
                      <TableCell className="font-medium">{a.display_name || "—"}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[a.role]}>{ROLE_LABEL[a.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        {isStaff ? (
                          <span className="text-sm text-muted-foreground">
                            {[...assignmentCountByEmail.values()].length ? "Click to manage" : "Assign →"}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">All events</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={load}
      />

      <AssignmentSheet
        admin={selected}
        events={events}
        assignments={assignments}
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
  const [role, setRole] = useState<AdminRole>("event_staff");
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
      setRole("event_staff");
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
                <SelectItem value="travel_admin">Travel Admin</SelectItem>
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

/* ------------------------- Assignment Sheet ------------------------- */

const ASSIGNMENT_ROLES: AssignmentRole[] = ["ops", "brackets", "officials", "marketing", "full"];

const AssignmentSheet = ({
  admin,
  events,
  assignments,
  currentEmail,
  onClose,
  onChanged,
}: {
  admin: AppAdmin | null;
  events: EventRow[];
  assignments: Assignment[];
  currentEmail: string | null;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [pendingRoles, setPendingRoles] = useState<Record<string, AssignmentRole>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) {
      setUserId(null);
      setPendingRoles({});
      return;
    }
    setResolving(true);
    // Try helper RPC if available; fall back to null (user hasn't signed in yet).
    opsSupabase
      .rpc("user_id_by_email", { p_email: admin.email })
      .then(({ data, error }) => {
        if (error) {
          setUserId(null);
        } else {
          setUserId((data as string) ?? null);
        }
        setResolving(false);
      });
  }, [admin?.email]);

  if (!admin) return null;

  const userAssignments = userId ? assignments.filter((a) => a.user_id === userId) : [];
  const assignedEventIds = new Set(userAssignments.map((a) => a.event_id));

  const assign = async (eventId: string) => {
    if (!userId) return;
    const role = pendingRoles[eventId] ?? "ops";
    setSaving(eventId);
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
    setSaving(assignmentId);
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
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{admin.display_name || admin.email}</SheetTitle>
          <p className="text-sm text-muted-foreground">{admin.email} • Event Staff</p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {resolving ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Locating user account…
            </div>
          ) : !userId ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              This user hasn't accepted their invite yet. Once they sign in for the first time, you'll be able to assign events here.
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">Current assignments</h3>
                {userAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {userAssignments.map((a) => {
                      const ev = events.find((e) => e.id === a.event_id);
                      return (
                        <div key={a.id} className="flex items-center justify-between rounded border p-2">
                          <div className="text-sm">
                            <div className="font-medium">{ev?.name ?? "Unknown event"}</div>
                            <div className="text-xs text-muted-foreground">
                              {ev?.event_date} · {ev?.city}{ev?.state ? `, ${ev.state}` : ""} · <span className="uppercase">{a.role}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(a.id)}
                            disabled={saving === a.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Add events</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {events
                    .filter((ev) => !assignedEventIds.has(ev.id))
                    .map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between rounded border p-2 gap-3">
                        <div className="text-sm min-w-0 flex-1">
                          <div className="font-medium truncate">{ev.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ev.event_date} · {ev.city}{ev.state ? `, ${ev.state}` : ""}
                          </div>
                        </div>
                        <Select
                          value={pendingRoles[ev.id] ?? "ops"}
                          onValueChange={(v) =>
                            setPendingRoles((p) => ({ ...p, [ev.id]: v as AssignmentRole }))
                          }
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNMENT_ROLES.map((r) => (
                              <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => assign(ev.id)}
                          disabled={saving === ev.id}
                        >
                          {saving === ev.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UsersAccessPanel;
