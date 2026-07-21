import { useEffect, useMemo, useState } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useOpsAccess } from "@/hooks/useOpsAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  Users as UsersIcon,
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  UserPlus,
  Trash2,
  AlertCircle,
  Plus,
  Pencil,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type EventStatus = "active" | "inactive" | "cancelled" | "pending";
const EVENT_STYLES = [
  "Sport Jiu Jitsu",
  "Wrestling",
  "Catch",
  "Grappling",
  "College",
  "College-Catch",
  "TBD",
];
const OBLIGATIONS = ["Production", "Admin"];

const MAT_COLORS = [
  { label: "Blue", value: "#3a80f0" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#e8404a" },
  { label: "Black", value: "#111827" },
];

const LEGACY_ASSIGNEES = ["Me", "Staff", "Design"];

type AssignmentRole = "ops" | "brackets" | "officials" | "marketing" | "full";
const ASSIGNMENT_ROLES: AssignmentRole[] = ["ops", "brackets", "officials", "marketing", "full"];

interface EventRow {
  id: string;
  name: string;
  event_date: string;
  end_date: string | null;
  city: string | null;
  state: string | null;
  style: string | null;
  obligation: string | null;
  notes: string | null;
  status?: string | null;
  expected_competitors?: number | null;
  mats?: number | null;
  color?: string | null;
}
interface TaskRow {
  id: string;
  event_id: string;
  name: string;
  assignee: string | null;
  assigned_user_id?: string | null;
  assigned_member_id?: string | null;
  due_date: string | null;
  done: boolean;
  phase: string | null;
  phase_order: number | null;
}
interface AssignmentRow {
  id: string;
  event_id: string;
  user_id: string;
  role: AssignmentRole;
}
interface AdminRow {
  email: string;
  display_name: string | null;
  role: string;
}
interface MemberRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDay = (dateStr: string) => {
  const d = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysBetween = (dateStr: string | null) => {
  if (!dateStr) return null;
  return Math.round((parseDay(dateStr).getTime() - startOfToday().getTime()) / 86_400_000);
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (dateStr: string) => {
  const d = parseDay(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
const formatEventDates = (start: string, end: string | null | undefined) => {
  if (!end || end === start) return fmtDate(start);
  const s = parseDay(start);
  const e = parseDay(end);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()}\u2013${e.getDate()}, ${s.getFullYear()}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()} \u2013 ${MONTHS[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${fmtDate(start)} \u2013 ${fmtDate(end)}`;
};

const eventCountdown = (ev: EventRow): { label: string; live: boolean; past: boolean } => {
  const startDays = daysBetween(ev.event_date);
  const endDays = daysBetween(ev.end_date ?? ev.event_date);
  if (startDays === null) return { label: "", live: false, past: false };
  if (startDays > 0) return { label: `In ${startDays} day${startDays === 1 ? "" : "s"}`, live: false, past: false };
  if (endDays !== null && endDays < 0) {
    return { label: `${Math.abs(endDays)} day${Math.abs(endDays) === 1 ? "" : "s"} ago`, live: false, past: true };
  }
  // in range (today >= start and today <= end)
  const totalDays = endDays !== null ? endDays - startDays + 1 : 1;
  const currentDay = 1 - startDays; // startDays <= 0
  if (totalDays > 1) return { label: `LIVE \u2014 Day ${currentDay} of ${totalDays}`, live: true, past: false };
  return { label: "Today", live: true, past: false };
};

const rangesOverlap = (aStart: string, aEnd: string | null | undefined, bStart: string, bEnd: string | null | undefined) => {
  const as = parseDay(aStart).getTime();
  const ae = parseDay(aEnd ?? aStart).getTime();
  const bs = parseDay(bStart).getTime();
  const be = parseDay(bEnd ?? bStart).getTime();
  return as <= be && bs <= ae;
};

const taskUrgency = (t: TaskRow) => {
  if (t.done) return { color: "bg-green-500/10 text-green-700 border-green-500/30", label: "Done" };
  const d = daysBetween(t.due_date);
  if (d === null) return { color: "bg-muted text-muted-foreground border-border", label: "No date" };
  if (d < 0) return { color: "bg-red-500/10 text-red-700 border-red-500/30", label: `${Math.abs(d)}d overdue` };
  if (d <= 7) return { color: "bg-orange-500/10 text-orange-700 border-orange-500/30", label: `Due in ${d}d` };
  if (d <= 14) return { color: "bg-yellow-500/10 text-yellow-800 border-yellow-500/30", label: `Due in ${d}d` };
  if (d <= 30) return { color: "bg-blue-500/10 text-blue-700 border-blue-500/30", label: `Due in ${d}d` };
  return { color: "bg-muted text-muted-foreground border-border", label: `Due in ${d}d` };
};

const obligationBadge = (o: string | null) => {
  const lower = (o ?? "").toLowerCase();
  if (lower.includes("prod")) return <Badge className="bg-red-600 hover:bg-red-600 text-white">Production</Badge>;
  if (lower.includes("admin")) return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Admin</Badge>;
  return o ? <Badge variant="outline">{o}</Badge> : null;
};

export const EventCommandPanel = () => {
  const { user, isAdmin: mainIsAdmin, opsConnected } = useAuth();
  const { role: opsRole } = useOpsAccess(user?.email);
  const isAdmin = mainIsAdmin || opsRole === "admin" || opsRole === "travel_admin" || opsRole === "super_admin";
  const isSuperAdmin = opsRole === "super_admin";

  const [events, setEvents] = useState<EventRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ev, tk, asg, ad, mb] = await Promise.all([
        opsSupabase.from("events").select("*").order("event_date", { ascending: true }),
        opsSupabase.from("event_tasks").select("*"),
        isAdmin
          ? opsSupabase.from("event_assignments").select("id, event_id, user_id, role")
          : Promise.resolve({ data: [], error: null } as any),
        isAdmin
          ? opsSupabase.from("app_admins").select("email, display_name, role")
          : Promise.resolve({ data: [], error: null } as any),
        isAdmin
          ? opsSupabase.from("members").select("id, first_name, last_name, email, phone").order("last_name", { ascending: true })
          : Promise.resolve({ data: [], error: null } as any),
      ]);
      if (ev.error) throw ev.error;
      if (tk.error) throw tk.error;
      setEvents((ev.data ?? []) as EventRow[]);
      setTasks((tk.data ?? []) as TaskRow[]);
      setAssignments(((asg as any).data ?? []) as AssignmentRow[]);
      setAdmins(((ad as any).data ?? []) as AdminRow[]);
      setMembers(((mb as any).data ?? []) as MemberRow[]);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load event command data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, opsConnected]);

  const toggleTask = async (task: TaskRow) => {
    // optimistic
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    const { error } = await opsSupabase
      .from("event_tasks")
      .update({ done: !task.done })
      .eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
      toast.error(error.message);
    }
  };

  const updateTaskAssignee = async (
    task: TaskRow,
    patch: { assignee: string | null; assigned_user_id: string | null; assigned_member_id: string | null }
  ) => {
    const prev = { assignee: task.assignee, assigned_user_id: task.assigned_user_id ?? null, assigned_member_id: task.assigned_member_id ?? null };
    setTasks((cur) => cur.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    const { error } = await opsSupabase.from("event_tasks").update(patch).eq("id", task.id);
    if (error) {
      setTasks((cur) => cur.map((t) => (t.id === task.id ? { ...t, ...prev } : t)));
      toast.error(error.message);
    }
  };

  const createMember = async (input: { first_name: string; last_name: string; email: string; phone: string }) => {
    const payload = {
      first_name: input.first_name.trim() || null,
      last_name: input.last_name.trim() || null,
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
    };
    const { data, error } = await opsSupabase.from("members").insert(payload).select("id, first_name, last_name, email, phone").single();
    if (error) throw error;
    const row = data as MemberRow;
    setMembers((cur) => [...cur, row].sort((a, b) => (a.last_name ?? "").localeCompare(b.last_name ?? "")));
    return row;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) : null;

  const openAdd = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };
  const openEdit = (ev: EventRow) => {
    setEditingEvent(ev);
    setFormOpen(true);
  };

  const updateEventStatus = async (ev: EventRow, status: EventStatus) => {
    const { error } = await opsSupabase.from("events").update({ status }).eq("id", ev.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Event marked ${status}`);
    load();
  };

  const deleteEvent = async (ev: EventRow) => {
    if (!confirm(`Delete "${ev.name}"? All tasks and assignments will be removed.`)) return;
    const { error } = await opsSupabase.from("events").delete().eq("id", ev.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event deleted");
    setSelectedEventId(null);
    load();
  };

  const approveEvent = async (ev: EventRow) => {
    const { error } = await opsSupabase.from("events").update({ status: "active" }).eq("id", ev.id);
    if (error) {
      toast.error(error.message || "You don't have permission to approve events");
      return;
    }
    toast.success(`"${ev.name}" approved`);
    load();
  };

  const content = selectedEvent ? (
    <EventDetail
      event={selectedEvent}
      allTasks={tasks.filter((t) => t.event_id === selectedEvent.id)}
      assignments={assignments.filter((a) => a.event_id === selectedEvent.id)}
      admins={admins}
      members={members}
      isAdmin={isAdmin}
      currentEmail={user?.email ?? null}
      onBack={() => setSelectedEventId(null)}
      onToggleTask={toggleTask}
      onAssigneeChange={updateTaskAssignee}
      onCreateMember={createMember}
      onReload={load}
      onEdit={() => openEdit(selectedEvent)}
      onDelete={() => deleteEvent(selectedEvent)}
      onStatusChange={(s) => updateEventStatus(selectedEvent, s)}
    />
  ) : (
    <Overview
      events={events}
      tasks={tasks}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
      onOpenEvent={setSelectedEventId}
      onAddEvent={openAdd}
      onApproveEvent={approveEvent}
    />
  );

  return (
    <>
      {content}
      {isAdmin && (
        <EventFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          event={editingEvent}
          onSaved={load}
        />
      )}
    </>
  );
};

/* ------------------- Overview ------------------- */

const Overview = ({
  events: allEvents,
  tasks,
  isAdmin,
  isSuperAdmin,
  onOpenEvent,
  onAddEvent,
  onApproveEvent,
}: {
  events: EventRow[];
  tasks: TaskRow[];
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  onOpenEvent: (id: string) => void;
  onAddEvent?: () => void;
  onApproveEvent?: (ev: EventRow) => void;
}) => {
  const [showArchive, setShowArchive] = useState(false);
  const activeEvents = useMemo(
    () => allEvents.filter((e) => (e.status ?? "active") === "active"),
    [allEvents]
  );
  const pendingEvents = useMemo(
    () => allEvents.filter((e) => e.status === "pending"),
    [allEvents]
  );
  const archivedEvents = useMemo(
    () => allEvents.filter((e) => e.status === "inactive" || e.status === "cancelled"),
    [allEvents]
  );
  const events = activeEvents;
  const activeEventIds = useMemo(() => new Set(activeEvents.map((e) => e.id)), [activeEvents]);
  const activeTasks = useMemo(
    () => tasks.filter((t) => activeEventIds.has(t.event_id)),
    [tasks, activeEventIds]
  );
  const stats = useMemo(() => {
    const now = startOfToday();
    const weekOut = new Date(now.getTime() + 7 * 86_400_000);
    let overdue = 0,
      dueWeek = 0,
      done = 0;
    for (const t of activeTasks) {
      if (t.done) {
        done++;
        continue;
      }
      if (!t.due_date) continue;
      const d = new Date(t.due_date + (t.due_date.length === 10 ? "T00:00:00" : ""));
      if (d < now) overdue++;
      else if (d <= weekOut) dueWeek++;
    }
    // overlapping-range conflicts
    const conflictMap = new Map<string, EventRow[]>();
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];
        if (rangesOverlap(a.event_date, a.end_date, b.event_date, b.end_date)) {
          const key = [a.id, b.id].sort().join("|");
          const existing = conflictMap.get(key) ?? [a, b];
          conflictMap.set(key, existing);
        }
      }
    }
    // merge overlapping clusters: build union-find-lite by grouping any events that share overlaps
    const clusters: EventRow[][] = [];
    const seen = new Set<string>();
    for (const e of events) {
      if (seen.has(e.id)) continue;
      const cluster: EventRow[] = [e];
      seen.add(e.id);
      let grew = true;
      while (grew) {
        grew = false;
        for (const other of events) {
          if (seen.has(other.id)) continue;
          if (cluster.some((c) => rangesOverlap(c.event_date, c.end_date, other.event_date, other.end_date))) {
            cluster.push(other);
            seen.add(other.id);
            grew = true;
          }
        }
      }
      if (cluster.length > 1) clusters.push(cluster);
    }
    return {
      total: events.length,
      overdue,
      dueWeek,
      done,
      conflicts: clusters.length,
      conflictClusters: clusters,
    };
  }, [events, activeTasks]);

  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const urgent = useMemo(() => {
    return activeTasks
      .filter((t) => !t.done && t.due_date && eventById.has(t.event_id))
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
      .slice(0, 15);
  }, [activeTasks, eventById]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-2">
        <div>
          {!isAdmin && (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-800">
              You're viewing events assigned to you.
            </div>
          )}
        </div>
        {isAdmin && onAddEvent && (
          <Button onClick={onAddEvent} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<CalendarIcon className="w-4 h-4" />} label="Total Events" value={stats.total} />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Overdue Tasks" value={stats.overdue} tone="red" />
        <StatCard icon={<CalendarClock className="w-4 h-4" />} label="Due This Week" value={stats.dueWeek} tone="orange" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" value={stats.done} tone="green" />
        <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Same-Day Conflicts" value={stats.conflicts} tone="red" />
      </div>

      {/* Conflicts banner */}
      {stats.conflictClusters.length > 0 && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" /> Overlapping event conflicts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.conflictClusters.map((list, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold mr-2">Overlap:</span>
                <span className="inline-flex flex-wrap gap-2">
                  {list.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onOpenEvent(e.id)}
                      className="rounded-full border border-red-500/40 bg-white px-2 py-0.5 text-xs hover:bg-red-500/10"
                    >
                      {e.name} <span className="text-muted-foreground">({formatEventDates(e.event_date, e.end_date)})</span>
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Urgent list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> Urgent — Needs Action Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          {urgent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing urgent. Great job.</p>
          ) : (
            <div className="divide-y">
              {urgent.map((t) => {
                const u = taskUrgency(t);
                const ev = eventById.get(t.event_id);
                return (
                  <button
                    key={t.id}
                    onClick={() => ev && onOpenEvent(ev.id)}
                    className="w-full flex items-center justify-between py-2 text-left hover:bg-muted/40 px-2 rounded"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{ev?.name ?? "—"}</div>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-1 rounded border ${u.color}`}>{u.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event grid */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Events</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events visible.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => {
              const eTasks = tasks.filter((t) => t.event_id === e.id);
              const total = eTasks.length;
              const doneCt = eTasks.filter((t) => t.done).length;
              const pct = total ? Math.round((doneCt / total) * 100) : 0;
              const now = startOfToday();
              const weekOut = new Date(now.getTime() + 7 * 86_400_000);
              const overdueCt = eTasks.filter((t) => {
                if (t.done || !t.due_date) return false;
                return new Date(t.due_date) < now;
              }).length;
              const weekCt = eTasks.filter((t) => {
                if (t.done || !t.due_date) return false;
                const d = new Date(t.due_date);
                return d >= now && d <= weekOut;
              }).length;
              const countdown = eventCountdown(e);
              return (
                <Card
                  key={e.id}
                  className="cursor-pointer hover:border-primary/50 transition"
                  onClick={() => onOpenEvent(e.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{e.name}</CardTitle>
                      {obligationBadge(e.obligation)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {formatEventDates(e.event_date, e.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {e.city}{e.state ? `, ${e.state}` : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs">
                      {countdown.live ? (
                        <Badge className="bg-green-600 hover:bg-green-600 text-white">{countdown.label}</Badge>
                      ) : (
                        <span className={countdown.past ? "text-muted-foreground" : ""}>{countdown.label}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{doneCt}/{total} tasks</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {overdueCt > 0 && (
                        <Badge className="bg-red-600 hover:bg-red-600 text-white">{overdueCt} overdue</Badge>
                      )}
                      {weekCt > 0 && (
                        <Badge className="bg-orange-500 hover:bg-orange-500 text-white">{weekCt} this week</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending approval */}
      {pendingEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Pending Approval ({pendingEvents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEvents.map((e) => {
              const countdown = eventCountdown(e);
              return (
                <Card
                  key={e.id}
                  className="cursor-pointer border-2 border-dashed border-amber-500/50 bg-amber-500/5 opacity-90 hover:opacity-100 transition"
                  onClick={() => onOpenEvent(e.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-muted-foreground">{e.name}</CardTitle>
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white">TENTATIVE</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {formatEventDates(e.event_date, e.end_date)}
                      </span>
                      {e.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.city}{e.state ? `, ${e.state}` : ""}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">{countdown.label}</div>
                    <div onClick={(ev) => ev.stopPropagation()}>
                      {isSuperAdmin && onApproveEvent ? (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => onApproveEvent(e)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      ) : (
                        <div className="text-xs text-muted-foreground italic text-center py-1">
                          Awaiting approval
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Archive */}
      {archivedEvents.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchive((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {showArchive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Archive className="w-4 h-4" /> Archive ({archivedEvents.length})
          </button>
          {showArchive && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {archivedEvents.map((e) => (
                <Card
                  key={e.id}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                  onClick={() => onOpenEvent(e.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm">{e.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">{e.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatEventDates(e.event_date, e.end_date)} · {e.city}{e.state ? `, ${e.state}` : ""}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "red" | "orange" | "green";
}) => {
  const toneClass =
    tone === "red"
      ? "text-red-700"
      : tone === "orange"
      ? "text-orange-700"
      : tone === "green"
      ? "text-green-700"
      : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon} {label}
        </div>
        <div className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
};

/* ------------------- Event Detail ------------------- */

type Filter = "all" | "overdue" | "week" | "incomplete" | "done";

const EventDetail = ({
  event,
  allTasks,
  assignments,
  admins,
  members,
  isAdmin,
  currentEmail,
  onBack,
  onToggleTask,
  onAssigneeChange,
  onCreateMember,
  onReload,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  event: EventRow;
  allTasks: TaskRow[];
  assignments: AssignmentRow[];
  admins: AdminRow[];
  members: MemberRow[];
  isAdmin: boolean;
  currentEmail: string | null;
  onBack: () => void;
  onToggleTask: (t: TaskRow) => void;
  onAssigneeChange: (
    t: TaskRow,
    patch: { assignee: string | null; assigned_user_id: string | null; assigned_member_id: string | null }
  ) => void | Promise<void>;
  onCreateMember: (input: { first_name: string; last_name: string; email: string; phone: string }) => Promise<MemberRow>;
  onReload: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (s: EventStatus) => void;
}) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [groupBy, setGroupBy] = useState<"phase" | "assignee">("phase");
  const [userIdToAdmin, setUserIdToAdmin] = useState<Record<string, AdminRow>>({});

  // Resolve which admins correspond to this event's assignment user_ids.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, AdminRow> = {};
      await Promise.all(
        assignments.map(async (a) => {
          for (const ad of admins) {
            const { data } = await opsSupabase.rpc("user_id_by_email", { p_email: ad.email });
            if (data === a.user_id) {
              map[a.user_id] = ad;
              break;
            }
          }
        })
      );
      if (!cancelled) setUserIdToAdmin(map);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments.length, admins.length]);

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const teamMemberAdmins = useMemo(
    () => assignments.map((a) => userIdToAdmin[a.user_id]).filter(Boolean) as AdminRow[],
    [assignments, userIdToAdmin]
  );
  const emailToUserId = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [uid, ad] of Object.entries(userIdToAdmin)) m[ad.email.toLowerCase()] = uid;
    return m;
  }, [userIdToAdmin]);

  const memberDisplayName = (m: MemberRow) =>
    `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.email || m.phone || "Unnamed contact";

  const assigneeDisplay = (t: TaskRow): { label: string; isContact: boolean } => {
    if (t.assigned_member_id) {
      const m = memberById.get(t.assigned_member_id);
      return { label: m ? memberDisplayName(m) : (t.assignee ?? "Contact"), isContact: true };
    }
    if (t.assignee) return { label: t.assignee, isContact: false };
    return { label: "Unassigned", isContact: false };
  };

  const filteredTasks = useMemo(() => {
    const now = startOfToday();
    const weekOut = new Date(now.getTime() + 7 * 86_400_000);
    return allTasks.filter((t) => {
      if (filter === "done") return t.done;
      if (filter === "incomplete") return !t.done;
      if (filter === "overdue")
        return !t.done && t.due_date && new Date(t.due_date) < now;
      if (filter === "week") {
        if (t.done || !t.due_date) return false;
        const d = new Date(t.due_date);
        return d >= now && d <= weekOut;
      }
      return true;
    });
  }, [allTasks, filter]);

  const grouped = useMemo(() => {
    if (groupBy === "assignee") {
      const g = new Map<string, TaskRow[]>();
      filteredTasks.forEach((t) => {
        const key = assigneeDisplay(t).label;
        const arr = g.get(key) ?? [];
        arr.push(t);
        g.set(key, arr);
      });
      return [...g.entries()]
        .sort((a, b) => (a[0] === "Unassigned" ? 1 : b[0] === "Unassigned" ? -1 : a[0].localeCompare(b[0])))
        .map(([k, tasks]) => [k, { order: 0, tasks }] as [string, { order: number; tasks: TaskRow[] }]);
    }
    const g = new Map<string, { order: number; tasks: TaskRow[] }>();
    filteredTasks.forEach((t) => {
      const key = t.phase ?? "General";
      const entry = g.get(key) ?? { order: t.phase_order ?? 999, tasks: [] };
      entry.tasks.push(t);
      if (t.phase_order != null && t.phase_order < entry.order) entry.order = t.phase_order;
      g.set(key, entry);
    });
    return [...g.entries()].sort((a, b) => a[1].order - b[1].order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTasks, groupBy, memberById]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event Command
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {formatEventDates(event.event_date, event.end_date)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.city}{event.state ? `, ${event.state}` : ""}</span>
                {event.style && <span>Style: {event.style}</span>}
                {(() => {
                  const c = eventCountdown(event);
                  if (!c.label) return null;
                  return c.live ? (
                    <Badge className="bg-green-600 hover:bg-green-600 text-white">{c.label}</Badge>
                  ) : (
                    <span className={c.past ? "" : "font-medium text-foreground"}>{c.label}</span>
                  );
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {obligationBadge(event.obligation)}
              {isAdmin && onStatusChange && (
                <Select
                  value={(event.status as EventStatus) ?? "active"}
                  onValueChange={(v) => onStatusChange(v as EventStatus)}
                >
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {isAdmin && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
              {isAdmin && onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {event.notes && (
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
            {event.notes}
          </CardContent>
        )}
      </Card>

      {/* Filters + grouping */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "overdue", "week", "incomplete", "done"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "week" ? "This Week" : f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Group by</Label>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "phase" | "assignee")}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="phase">Phase</SelectItem>
              <SelectItem value="assignee">Assigned to</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks */}
      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks match this filter.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([header, { tasks }]) => (
            <Card key={header}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">{header}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {tasks.map((t) => {
                  const u = taskUrgency(t);
                  const display = assigneeDisplay(t);
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-1.5">
                      <Checkbox checked={t.done} onCheckedChange={() => onToggleTask(t)} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                          {t.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.due_date ? `Due ${t.due_date}` : "No due date"}
                        </div>
                      </div>
                      {isAdmin ? (
                        <AssigneePicker
                          task={t}
                          teamAdmins={teamMemberAdmins}
                          allAdmins={admins}
                          members={members}
                          emailToUserId={emailToUserId}
                          onSelect={onAssigneeChange}
                          onCreateMember={onCreateMember}
                          display={display}
                        />
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full border bg-muted text-foreground shrink-0 max-w-[160px] truncate">
                          {display.label}
                          {display.isContact && <span className="ml-1 text-[10px] text-muted-foreground">(contact)</span>}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded border shrink-0 ${u.color}`}>{u.label}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team (admin only) */}
      {isAdmin && (
        <TeamSection
          event={event}
          assignments={assignments}
          admins={admins}
          currentEmail={currentEmail}
          onChanged={onReload}
        />
      )}
    </div>
  );
};

/* ------------------- Assignee Picker ------------------- */

const AssigneePicker = ({
  task,
  teamAdmins,
  allAdmins,
  members,
  emailToUserId,
  onSelect,
  onCreateMember,
  display,
}: {
  task: TaskRow;
  teamAdmins: AdminRow[];
  allAdmins: AdminRow[];
  members: MemberRow[];
  emailToUserId: Record<string, string>;
  onSelect: (
    t: TaskRow,
    patch: { assignee: string | null; assigned_user_id: string | null; assigned_member_id: string | null }
  ) => void | Promise<void>;
  onCreateMember: (input: { first_name: string; last_name: string; email: string; phone: string }) => Promise<MemberRow>;
  display: { label: string; isContact: boolean };
}) => {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newMember, setNewMember] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [creating, setCreating] = useState(false);

  const memberName = (m: MemberRow) =>
    `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.email || m.phone || "Unnamed contact";

  const selectAdmin = (ad: AdminRow) => {
    const uid = emailToUserId[ad.email.toLowerCase()] ?? null;
    onSelect(task, {
      assignee: ad.display_name || ad.email,
      assigned_user_id: uid,
      assigned_member_id: null,
    });
    setOpen(false);
  };

  const selectMember = (m: MemberRow) => {
    onSelect(task, {
      assignee: memberName(m),
      assigned_user_id: null,
      assigned_member_id: m.id,
    });
    setOpen(false);
  };

  const selectLegacy = (label: string) => {
    onSelect(task, { assignee: label, assigned_user_id: null, assigned_member_id: null });
    setOpen(false);
  };

  const clearAssignee = () => {
    onSelect(task, { assignee: null, assigned_user_id: null, assigned_member_id: null });
    setOpen(false);
  };

  const submitNewMember = async () => {
    if (!newMember.first_name.trim() && !newMember.last_name.trim() && !newMember.email.trim()) {
      toast.error("Enter a name");
      return;
    }
    if (!newMember.email.trim() && !newMember.phone.trim()) {
      toast.error("Email or phone is required");
      return;
    }
    setCreating(true);
    try {
      const created = await onCreateMember(newMember);
      selectMember(created);
      setNewMember({ first_name: "", last_name: "", email: "", phone: "" });
      setShowNew(false);
      toast.success("Contact created");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create contact");
    } finally {
      setCreating(false);
    }
  };

  const teamEmailSet = new Set(teamAdmins.map((a) => a.email.toLowerCase()));
  const otherAdmins = allAdmins.filter((a) => !teamEmailSet.has(a.email.toLowerCase()));

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setShowNew(false);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted shrink-0 max-w-[180px] truncate flex items-center gap-1"
          title={display.label}
        >
          <span className="truncate">{display.label}</span>
          {display.isContact && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase">contact</Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        {showNew ? (
          <div className="p-3 space-y-2">
            <div className="text-xs font-semibold">New contact</div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="First name"
                value={newMember.first_name}
                onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
              />
              <Input
                placeholder="Last name"
                value={newMember.last_name}
                onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
            <p className="text-[11px] text-muted-foreground">Email or phone required.</p>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setShowNew(false)} disabled={creating}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitNewMember} disabled={creating}>
                {creating && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Create & assign
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Search people or contacts…" />
            <CommandList className="max-h-72">
              <CommandEmpty>No matches.</CommandEmpty>
              {teamAdmins.length > 0 && (
                <CommandGroup heading="Team on this event">
                  {teamAdmins.map((ad) => (
                    <CommandItem
                      key={`team-${ad.email}`}
                      value={`team ${ad.display_name ?? ""} ${ad.email}`}
                      onSelect={() => selectAdmin(ad)}
                    >
                      {ad.display_name || ad.email}
                      <span className="ml-auto text-[10px] text-muted-foreground">{ad.role}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {otherAdmins.length > 0 && (
                <CommandGroup heading="Admins">
                  {otherAdmins.map((ad) => (
                    <CommandItem
                      key={`admin-${ad.email}`}
                      value={`admin ${ad.display_name ?? ""} ${ad.email}`}
                      onSelect={() => selectAdmin(ad)}
                    >
                      {ad.display_name || ad.email}
                      <span className="ml-auto text-[10px] text-muted-foreground">{ad.role}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup heading="Quick labels">
                {LEGACY_ASSIGNEES.map((l) => (
                  <CommandItem key={`legacy-${l}`} value={`label ${l}`} onSelect={() => selectLegacy(l)}>
                    {l}
                  </CommandItem>
                ))}
              </CommandGroup>
              {members.length > 0 && (
                <CommandGroup heading="CRM contacts">
                  {members.slice(0, 200).map((m) => (
                    <CommandItem
                      key={`member-${m.id}`}
                      value={`contact ${memberName(m)} ${m.email ?? ""} ${m.phone ?? ""}`}
                      onSelect={() => selectMember(m)}
                    >
                      <span className="truncate">{memberName(m)}</span>
                      {m.email && <span className="ml-auto text-[10px] text-muted-foreground truncate">{m.email}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem value="__new_contact" onSelect={() => setShowNew(true)}>
                  <Plus className="w-3 h-3 mr-2" /> New contact
                </CommandItem>
                {(task.assignee || task.assigned_user_id || task.assigned_member_id) && (
                  <CommandItem value="__clear" onSelect={clearAssignee}>
                    Clear assignee
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};


/* ------------------- Team Section ------------------- */

const TeamSection = ({
  event,
  assignments,
  admins,
  currentEmail,
  onChanged,
}: {
  event: EventRow;
  assignments: AssignmentRow[];
  admins: AdminRow[];
  currentEmail: string | null;
  onChanged: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignmentRole>("ops");
  const [adding, setAdding] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, AdminRow | undefined>>({});

  // Resolve emails for user_ids by matching against admins list via RPC when needed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, AdminRow | undefined> = {};
      await Promise.all(
        assignments.map(async (a) => {
          // Try to find admin whose auth id resolves to a.user_id
          for (const ad of admins) {
            const { data } = await opsSupabase.rpc("user_id_by_email", { p_email: ad.email });
            if (data === a.user_id) {
              map[a.user_id] = ad;
              break;
            }
          }
        })
      );
      if (!cancelled) setUserEmails(map);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments.length, admins.length]);

  const addMember = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      toast.error("Enter an email");
      return;
    }
    setAdding(true);
    try {
      const { data: uid, error: rpcErr } = await opsSupabase.rpc("user_id_by_email", { p_email: clean });
      if (rpcErr) throw rpcErr;
      if (!uid) {
        toast.error("This person hasn't accepted their invite yet — invite them first in Users & Access.");
        return;
      }
      const { error } = await opsSupabase.from("event_assignments").insert({
        user_id: uid as string,
        event_id: event.id,
        role,
        created_by: currentEmail,
      });
      if (error) throw error;
      toast.success("Team member added");
      setEmail("");
      setRole("ops");
      onChanged();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async (id: string) => {
    const { error } = await opsSupabase.from("event_assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed");
    onChanged();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <UsersIcon className="w-4 h-4" /> Team on this event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members yet.</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const person = userEmails[a.user_id];
              return (
                <div key={a.id} className="flex items-center justify-between rounded border p-2">
                  <div className="text-sm">
                    <div className="font-medium">{person?.display_name || person?.email || a.user_id}</div>
                    <div className="text-xs text-muted-foreground uppercase">{a.role}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMember(a.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t pt-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Add team member</Label>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={role} onValueChange={(v) => setRole(v as AssignmentRole)}>
              <SelectTrigger className="md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addMember} disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The person must be invited via Users &amp; Access first and have signed in at least once.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/* ------------------- Event Form Dialog ------------------- */

const EventFormDialog = ({
  open,
  onOpenChange,
  event,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: EventRow | null;
  onSaved: () => void;
}) => {
  const isEdit = !!event;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    event_date: "",
    end_date: "",
    city: "",
    state: "",
    style: "TBD",
    obligation: "Production",
    expected_competitors: "",
    mats: "",
    notes: "",
    color: "",
    tentative: false,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: event?.name ?? "",
        event_date: event?.event_date ?? "",
        end_date: event?.end_date ?? "",
        city: event?.city ?? "",
        state: event?.state ?? "",
        style: event?.style ?? "TBD",
        obligation: event?.obligation ?? "Production",
        expected_competitors: event?.expected_competitors?.toString() ?? "",
        mats: event?.mats?.toString() ?? "",
        notes: event?.notes ?? "",
        color: event?.color ?? "",
        tentative: event?.status === "pending",
      });
    }
  }, [open, event]);

  const submit = async () => {
    if (!form.name.trim() || !form.event_date) {
      toast.error("Name and date are required");
      return;
    }
    if (form.end_date && form.end_date < form.event_date) {
      toast.error("End date must be on or after the start date");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        event_date: form.event_date,
        end_date: form.end_date || null,
        city: form.city || null,
        state: form.state || null,
        style: form.style || null,
        obligation: form.obligation || null,
        notes: form.notes || null,
        color: form.color || null,
        expected_competitors: form.expected_competitors ? Number(form.expected_competitors) : null,
        mats: form.mats ? Number(form.mats) : null,
      };
      if (isEdit && event) {
        // Only touch status if the tentative toggle flipped its meaning.
        const currentPending = event.status === "pending";
        if (currentPending && !form.tentative) payload.status = "active";
        else if (!currentPending && form.tentative && event.status !== "inactive" && event.status !== "cancelled") payload.status = "pending";
        const { error } = await opsSupabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
        toast.success("Event updated — task due dates recalculated server-side");
      } else {
        payload.status = form.tentative ? "pending" : "active";
        const { error } = await opsSupabase.from("events").insert(payload);
        if (error) throw error;
        toast.success(form.tentative ? "Event saved as tentative — pending approval" : "Event created — tasks generated automatically");
      }
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Add Event"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label>End date <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                type="date"
                value={form.end_date}
                min={form.event_date || undefined}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Obligation</Label>
            <Select value={form.obligation} onValueChange={(v) => setForm({ ...form, obligation: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OBLIGATIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Style</Label>
            <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Expected Competitors</Label>
              <Input
                type="number"
                value={form.expected_competitors}
                onChange={(e) => setForm({ ...form, expected_competitors: e.target.value })}
              />
            </div>
            <div>
              <Label>Mats</Label>
              <Input
                type="number"
                value={form.mats}
                onChange={(e) => setForm({ ...form, mats: e.target.value })}
              />
            </div>
            <div>
              <Label>Mat color</Label>
              <div className="flex items-center gap-2 mt-2">
                {MAT_COLORS.map((c) => {
                  const selected = (form.color || "").toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-7 h-7 rounded-full border-2 transition ${selected ? "border-foreground ring-2 ring-ring/40" : "border-border"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          {isEdit && (
            <p className="text-xs text-muted-foreground">
              Changing the event date will automatically recompute every task's due date.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isEdit ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventCommandPanel;
