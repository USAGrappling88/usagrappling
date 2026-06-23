import { useState, useEffect, useMemo } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Loader2,
  Instagram,
  Facebook,
  Mail,
  Globe,
  Lock,
  Search,
  CheckCircle2,
  Archive,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type Status = "draft" | "approved" | "archived";
type Platform =
  | "instagram"
  | "facebook"
  | "facebook_post"
  | "email"
  | "internal"
  | "website";

interface ContentItem {
  id: string;
  campaign_type: string | null;
  platform: Platform;
  audience: string | null;
  subject: string | null;
  body: string | null;
  status: Status;
  created_by: string | null;
  created_at: string;
}

const EMPLOYEES = [
  { key: "all", label: "All", color: "" },
  { key: "Strategist", label: "Strategist", color: "#534AB7" },
  { key: "Copywriter", label: "Copywriter", color: "#0F6E56" },
  { key: "SDR", label: "SDR", color: "#993C1D" },
  { key: "CRO Specialist", label: "CRO", color: "#854F0B" },
  { key: "Community Manager", label: "Community", color: "#993556" },
  { key: "SEO Specialist", label: "SEO", color: "#185FA5" },
  { key: "Analytics Manager", label: "Analytics", color: "#3B6D11" },
];

const EMPLOYEE_COLOR: Record<string, string> = EMPLOYEES.reduce(
  (acc, e) => ({ ...acc, [e.key]: e.color }),
  {},
);

const STATUSES: { key: Status; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "approved", label: "Approved" },
  { key: "archived", label: "Archived" },
];

const PLATFORM_ICON: Record<Platform, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  facebook_post: Facebook,
  email: Mail,
  internal: Lock,
  website: Globe,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function statusBadgeClass(s: Status) {
  if (s === "approved") return "bg-green-100 text-green-800 border-green-200";
  if (s === "archived") return "bg-muted text-muted-foreground";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function charLimit(platform: Platform): number | null {
  if (platform === "instagram") return 2200;
  if (platform === "facebook" || platform === "facebook_post") return 63000;
  return null;
}

export const ContentReviewPanel = ({
  onSendToCompose,
}: {
  onSendToCompose?: (item: ContentItem) => void;
} = {}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<Status>("draft");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await opsSupabase
      .from("content_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load content: " + error.message);
    } else {
      setItems((data as ContentItem[]) ?? []);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (i.status !== statusFilter) return false;
      if (employeeFilter !== "all" && i.created_by !== employeeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${i.subject ?? ""} ${i.body ?? ""} ${i.audience ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, statusFilter, employeeFilter, search]);

  function openCard(item: ContentItem) {
    setSelected(item);
    setEditSubject(item.subject ?? "");
    setEditBody(item.body ?? "");
  }

  function closeDrawer() {
    setSelected(null);
  }

  const dirty =
    !!selected &&
    (editSubject !== (selected.subject ?? "") || editBody !== (selected.body ?? ""));

  async function updateRow(id: string, patch: Partial<ContentItem>) {
    // optimistic
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (selected?.id === id) setSelected({ ...selected, ...patch } as ContentItem);
    const { error } = await opsSupabase.from("content_library").update(patch).eq("id", id);
    if (error) {
      toast.error("Update failed: " + error.message);
      void load();
      return false;
    }
    return true;
  }

  async function handleApprove() {
    if (!selected) return;
    setSaving(true);
    const patch: Partial<ContentItem> = { status: "approved" };
    if (dirty) {
      patch.subject = editSubject;
      patch.body = editBody;
    }
    const ok = await updateRow(selected.id, patch);
    setSaving(false);
    if (ok) {
      toast.success("Approved — ready to post in Compose tab");
      closeDrawer();
    }
  }

  async function handleArchive() {
    if (!selected) return;
    setSaving(true);
    const ok = await updateRow(selected.id, { status: "archived" });
    setSaving(false);
    if (ok) {
      toast.success("Archived");
      closeDrawer();
    }
  }

  async function handleSave() {
    if (!selected || !dirty) return;
    setSaving(true);
    const ok = await updateRow(selected.id, { subject: editSubject, body: editBody });
    setSaving(false);
    if (ok) toast.success("Saved");
  }

  function handleSendToCompose() {
    if (!selected) return;
    if (onSendToCompose) {
      onSendToCompose({ ...selected, subject: editSubject, body: editBody });
    } else {
      try {
        sessionStorage.setItem(
          "compose:prefill",
          JSON.stringify({
            subject: editSubject,
            body: editBody,
            platform: selected.platform,
          }),
        );
      } catch {}
      window.dispatchEvent(
        new CustomEvent("admin:navigate-tab", { detail: "compose" }),
      );
      toast.success("Sent to Compose tab");
    }
    closeDrawer();
  }

  const limit = selected ? charLimit(selected.platform) : null;
  const isInternal = selected?.platform === "internal";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-display font-bold">Content Review</h2>
        <p className="text-sm text-muted-foreground">
          Drafts from your 7 AI marketing employees. Edit, approve, and ship.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EMPLOYEES.map((e) => {
            const active = employeeFilter === e.key;
            return (
              <button
                key={e.key}
                onClick={() => setEmployeeFilter(e.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  active
                    ? "text-white border-transparent"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                style={active && e.color ? { backgroundColor: e.color } : undefined}
              >
                {e.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                  statusFilter === s.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject or body…"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {statusFilter === "draft"
              ? "No draft content from the team yet. The employees run at 6:30 AM daily and save their work here."
              : `No ${statusFilter} content matches your filters.`}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const Icon = PLATFORM_ICON[item.platform] ?? Globe;
            const color = EMPLOYEE_COLOR[item.created_by ?? ""] || "#666";
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => openCard(item)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {item.created_by ?? "Unknown"}
                      </span>
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground capitalize truncate">
                        {item.platform.replace("_", " ")}
                      </span>
                    </div>
                    <Badge variant="outline" className={statusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold truncate">{item.subject || "(no subject)"}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.body || "(empty)"}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{relativeTime(item.created_at)}</span>
                    <span className="text-primary">read more →</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && closeDrawer()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
        >
          {selected && (
            <>
              <SheetHeader className="px-6 py-4 border-b">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        EMPLOYEE_COLOR[selected.created_by ?? ""] || "#666",
                    }}
                  >
                    {selected.created_by ?? "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {selected.platform.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {relativeTime(selected.created_at)}
                  </span>
                  <Badge variant="outline" className={statusBadgeClass(selected.status)}>
                    {selected.status}
                  </Badge>
                </div>
                <SheetTitle className="sr-only">Edit content</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Subject
                  </label>
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="mt-1 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Body
                  </label>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="mt-1 min-h-[300px] font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{editBody.length} characters</span>
                    {limit && (
                      <span className={editBody.length > limit ? "text-destructive" : ""}>
                        limit: {limit.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {selected.audience && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Audience:</span> {selected.audience}
                  </div>
                )}
                {selected.campaign_type && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Campaign:</span>{" "}
                    {selected.campaign_type.replace("_", " ")}
                  </div>
                )}
              </div>

              <div className="border-t px-6 py-4 flex flex-wrap gap-2 justify-end">
                {dirty && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="min-h-[48px] sm:min-h-0 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save edits
                  </Button>
                )}
                {selected.status === "approved" && !isInternal && (
                  <Button
                    variant="outline"
                    onClick={handleSendToCompose}
                    className="min-h-[48px] sm:min-h-0"
                  >
                    <Send className="w-4 h-4 mr-2" /> Send to Compose
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleArchive}
                  disabled={saving}
                  className="min-h-[48px] sm:min-h-0"
                >
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </Button>
                {selected.status !== "approved" && (
                  <Button
                    onClick={handleApprove}
                    disabled={saving}
                    className="min-h-[48px] sm:min-h-0 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContentReviewPanel;
