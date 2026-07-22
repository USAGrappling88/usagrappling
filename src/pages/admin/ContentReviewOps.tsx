import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { useAuth } from "@/hooks/useAuth";
import { useOpsAccess } from "@/hooks/useOpsAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Instagram,
  Facebook,
  Mail,
  Globe,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  RefreshCw,
  Trash2,
  ExternalLink,
  Upload,
  X,
  Pencil,
  Send,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";

type QAStatus = "pending" | "passed" | "blocked" | null;
type Status = "draft" | "approved" | "published" | "failed" | "archived";
type Platform =
  | "instagram"
  | "facebook"
  | "facebook_post"
  | "email"
  | "internal"
  | "website";

interface QANote {
  level: "ok" | "warning" | "error";
  message: string;
}

interface PublishResult {
  channel?: string;
  account?: string;
  status?: string;
  url?: string;
  error?: string;
  posted_at?: string;
}

interface ContentItem {
  id: string;
  campaign_type: string | null;
  platform: Platform;
  audience: string | null;
  subject: string | null;
  body: string | null;
  status: Status;
  qa_status: QAStatus;
  qa_notes: QANote[] | null;
  qa_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  channels: string[] | null;
  accounts: string[] | null;
  scheduled_for: string | null;
  posted_at: string | null;
  publish_results: PublishResult[] | null;
  failed_reason: string | null;
  media_url?: string | null;
  media_type?: string | null;
  created_by: string | null;
  created_at: string;
}

const PLATFORM_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  facebook_post: Facebook,
  email: Mail,
  internal: Lock,
  website: Globe,
};

const CHANNELS = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
];

const ACCOUNTS = [
  { key: "usa_grappling", label: "USA Grappling" },
  { key: "grappling_network", label: "The Grappling Network" },
];

const EMPLOYEE_COLOR: Record<string, string> = {
  Strategist: "#534AB7",
  Copywriter: "#0F6E56",
  SDR: "#993C1D",
  "CRO Specialist": "#854F0B",
  "Community Manager": "#993556",
  "SEO Specialist": "#185FA5",
  "Analytics Manager": "#3B6D11",
};

const MAX_UPLOAD = 200 * 1024 * 1024;

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
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

function formatSchedule(iso: string | null) {
  if (!iso) return "Next open slot";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseNotes(raw: QANote[] | null | any): QANote[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as QANote[];
  return [];
}

function convertImageToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error("JPEG conversion failed"));
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

export const ContentReviewPanel = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useOpsAccess(user?.email);

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [cadence, setCadence] = useState<string>(
    "Max 2/day per account · 8 AM–8 PM PT · 3h spacing",
  );
  const [cadenceOpen, setCadenceOpen] = useState(false);
  const [approveFor, setApproveFor] = useState<ContentItem | null>(null);
  const [editFor, setEditFor] = useState<ContentItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [contentRes, settingsRes] = await Promise.all([
      opsSupabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false }),
      opsSupabase.from("automation_settings").select("key, value"),
    ]);

    if (contentRes.error) toast.error("Load failed: " + contentRes.error.message);
    else setItems((contentRes.data as ContentItem[]) ?? []);

    if (!settingsRes.error && settingsRes.data) {
      const map = new Map<string, any>(
        settingsRes.data.map((r: any) => [r.key, r.value]),
      );
      const p = map.get("content_queue_paused");
      setPaused(p === true || p === "true");
      const c = map.get("cadence");
      if (typeof c === "string") setCadence(c);
      else if (c && typeof c === "object" && c.display) setCadence(c.display);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const needsReview = useMemo(
    () => items.filter((i) => i.status === "draft" && i.qa_status === "passed"),
    [items],
  );
  const blocked = useMemo(
    () => items.filter((i) => i.status === "draft" && i.qa_status === "blocked"),
    [items],
  );
  const queued = useMemo(() => items.filter((i) => i.status === "approved"), [items]);
  const published = useMemo(
    () =>
      items
        .filter((i) => i.status === "published")
        .sort(
          (a, b) =>
            new Date(b.posted_at ?? b.created_at).getTime() -
            new Date(a.posted_at ?? a.created_at).getTime(),
        ),
    [items],
  );
  const failed = useMemo(() => items.filter((i) => i.status === "failed"), [items]);

  async function patchRow(id: string, patch: Partial<ContentItem>) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const { error } = await opsSupabase
      .from("content_library")
      .update(patch)
      .eq("id", id);
    if (error) {
      toast.error("Update failed: " + error.message);
      load();
      return false;
    }
    return true;
  }

  async function discard(item: ContentItem) {
    if (!confirm("Discard this draft?")) return;
    if (await patchRow(item.id, { status: "archived" })) toast.success("Discarded");
  }

  async function unqueue(item: ContentItem) {
    if (
      await patchRow(item.id, {
        status: "draft",
        approved_by: null,
        approved_at: null,
      } as any)
    )
      toast.success("Moved back to draft");
  }

  async function retry(item: ContentItem) {
    if (await patchRow(item.id, { status: "approved", failed_reason: null } as any))
      toast.success("Retrying — will publish on next queue run");
  }

  async function togglePaused(next: boolean) {
    setPaused(next);
    const { error } = await opsSupabase
      .from("automation_settings")
      .upsert(
        { key: "content_queue_paused", value: next },
        { onConflict: "key" },
      );
    if (error) {
      toast.error("Failed: " + error.message);
      setPaused(!next);
    } else {
      toast.success(next ? "Queue paused" : "Queue resumed");
    }
  }

  async function saveCadence(text: string) {
    const { error } = await opsSupabase
      .from("automation_settings")
      .upsert({ key: "cadence", value: text }, { onConflict: "key" });
    if (error) return toast.error("Failed: " + error.message);
    setCadence(text);
    setCadenceOpen(false);
    toast.success("Cadence updated");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold">Content Review</h2>
        <p className="text-sm text-muted-foreground">
          Automated QA every 15 min · queue runner publishes approved items every 15 min
          during the posting window · failures email Blair.
        </p>
      </div>

      {/* Automation controls */}
      {isSuperAdmin && (
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={!paused} onCheckedChange={(v) => togglePaused(!v)} />
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {paused ? (
                    <>
                      <Pause className="w-4 h-4 text-destructive" /> Content queue OFF
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-green-600" /> Content queue ON
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Master switch — pauses all automated publishing
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Cadence</div>
                <div className="font-medium">{cadence}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCadenceOpen(true)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {paused && (
        <div className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
          Content queue is PAUSED — approved items will not publish until resumed.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <Column
            title="Needs Review"
            count={needsReview.length}
            icon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
            tint="border-blue-200 bg-blue-50/40"
            empty="No drafts passed QA yet."
          >
            {needsReview.map((i) => (
              <NeedsReviewCard
                key={i.id}
                item={i}
                canApprove={isSuperAdmin}
                onApprove={() => setApproveFor(i)}
                onDiscard={() => discard(i)}
                onEdit={() => setEditFor(i)}
              />
            ))}
          </Column>

          <Column
            title="Blocked by QA"
            count={blocked.length}
            icon={<Ban className="w-4 h-4 text-destructive" />}
            tint="border-red-200 bg-red-50/40"
            empty="Nothing blocked."
          >
            {blocked.map((i) => (
              <BlockedCard
                key={i.id}
                item={i}
                onEdit={() => setEditFor(i)}
                onDiscard={() => discard(i)}
              />
            ))}
          </Column>

          <Column
            title="Queued"
            count={queued.length}
            icon={<Clock className="w-4 h-4 text-amber-600" />}
            tint="border-amber-200 bg-amber-50/40"
            empty="No items scheduled."
          >
            {queued.map((i) => (
              <QueuedCard
                key={i.id}
                item={i}
                canManage={isSuperAdmin}
                onUnqueue={() => unqueue(i)}
              />
            ))}
          </Column>

          <Column
            title="Published"
            count={published.length}
            icon={<Send className="w-4 h-4 text-green-600" />}
            tint="border-green-200 bg-green-50/40"
            empty="Nothing published yet."
          >
            {published.slice(0, 30).map((i) => (
              <PublishedCard key={i.id} item={i} />
            ))}
          </Column>

          <Column
            title="Failed"
            count={failed.length}
            icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
            tint="border-red-200 bg-red-50/40"
            empty="No failures — nice."
          >
            {failed.map((i) => (
              <FailedCard
                key={i.id}
                item={i}
                canRetry={isSuperAdmin}
                onRetry={() => retry(i)}
              />
            ))}
          </Column>
        </div>
      )}

      {approveFor && isSuperAdmin && (
        <ApproveDialog
          item={approveFor}
          userEmail={user?.email ?? ""}
          onClose={() => setApproveFor(null)}
          onDone={() => {
            setApproveFor(null);
            load();
          }}
        />
      )}

      {editFor && (
        <EditDialog
          item={editFor}
          onClose={() => setEditFor(null)}
          onSaved={() => {
            setEditFor(null);
            load();
          }}
        />
      )}

      <CadenceDialog
        open={cadenceOpen}
        initial={cadence}
        onClose={() => setCadenceOpen(false)}
        onSave={saveCadence}
      />
    </div>
  );
};

/* ---------------- columns & cards ---------------- */

function Column({
  title,
  count,
  icon,
  tint,
  empty,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  tint: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border ${tint} p-3 flex flex-col min-h-[300px]`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon} {title}
        </div>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="space-y-2 flex-1">
        {count === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">{empty}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function CardShell({
  item,
  children,
}: {
  item: ContentItem;
  children: React.ReactNode;
}) {
  const Icon = PLATFORM_ICON[item.platform] ?? Globe;
  const color = EMPLOYEE_COLOR[item.created_by ?? ""] || "#666";
  return (
    <Card className="bg-background">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {item.created_by ?? "AI"}
          </span>
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground capitalize">
            {item.platform.replace("_", " ")}
          </span>
        </div>
        <div className="font-semibold text-sm line-clamp-1">
          {item.subject || "(no subject)"}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function NeedsReviewCard({
  item,
  canApprove,
  onApprove,
  onDiscard,
  onEdit,
}: {
  item: ContentItem;
  canApprove: boolean;
  onApprove: () => void;
  onDiscard: () => void;
  onEdit: () => void;
}) {
  const notes = parseNotes(item.qa_notes);
  return (
    <CardShell item={item}>
      <p className="text-xs text-muted-foreground line-clamp-3">{item.body}</p>
      {notes.length > 0 && (
        <ul className="text-[11px] space-y-0.5">
          {notes.map((n, idx) => (
            <li key={idx} className="flex items-start gap-1">
              {n.level === "warning" ? (
                <AlertTriangle className="w-3 h-3 mt-0.5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-600 shrink-0" />
              )}
              <span
                className={
                  n.level === "warning" ? "text-amber-700" : "text-muted-foreground"
                }
              >
                {n.message}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-1 pt-1">
        {canApprove ? (
          <Button
            size="sm"
            className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onApprove}
          >
            Approve
          </Button>
        ) : (
          <span className="text-[11px] text-muted-foreground flex-1">
            Read-only — needs super admin
          </span>
        )}
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onDiscard}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </CardShell>
  );
}

function BlockedCard({
  item,
  onEdit,
  onDiscard,
}: {
  item: ContentItem;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  const notes = parseNotes(item.qa_notes);
  return (
    <CardShell item={item}>
      <ul className="text-[11px] space-y-0.5">
        {notes.map((n, idx) => (
          <li key={idx} className="flex items-start gap-1 text-destructive">
            <span>⛔</span>
            <span>{n.message}</span>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-destructive">⛔ Blocked by QA</li>
        )}
      </ul>
      <div className="flex gap-1 pt-1">
        <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={onEdit}>
          <Pencil className="w-3 h-3 mr-1" /> Edit & re-check
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onDiscard}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="text-[10px] text-muted-foreground">
        Saving clears QA — re-check runs within 15 min.
      </div>
    </CardShell>
  );
}

function QueuedCard({
  item,
  canManage,
  onUnqueue,
}: {
  item: ContentItem;
  canManage: boolean;
  onUnqueue: () => void;
}) {
  return (
    <CardShell item={item}>
      <div className="text-xs space-y-0.5">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" /> {formatSchedule(item.scheduled_for)}
        </div>
        {item.channels?.length ? (
          <div className="text-[11px]">
            <span className="text-muted-foreground">Channels: </span>
            {item.channels.join(", ")}
          </div>
        ) : null}
        {item.accounts?.length ? (
          <div className="text-[11px]">
            <span className="text-muted-foreground">Accounts: </span>
            {item.accounts.join(", ")}
          </div>
        ) : null}
      </div>
      {canManage && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-full"
          onClick={onUnqueue}
        >
          Unqueue
        </Button>
      )}
    </CardShell>
  );
}

function PublishedCard({ item }: { item: ContentItem }) {
  const results = (item.publish_results ?? []) as PublishResult[];
  return (
    <CardShell item={item}>
      <div className="text-[11px] text-muted-foreground">
        Posted {relativeTime(item.posted_at)}
      </div>
      {results.length > 0 && (
        <ul className="space-y-0.5">
          {results.map((r, idx) => (
            <li
              key={idx}
              className="text-[11px] flex items-center justify-between gap-1"
            >
              <span className="capitalize">
                {r.channel}
                {r.account ? ` · ${r.account}` : ""}
              </span>
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-0.5 hover:underline"
                >
                  view <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-green-600">{r.status ?? "ok"}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
}

function FailedCard({
  item,
  canRetry,
  onRetry,
}: {
  item: ContentItem;
  canRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <CardShell item={item}>
      <div className="text-[11px] text-destructive bg-destructive/10 rounded px-2 py-1">
        {item.failed_reason || "Unknown failure"}
      </div>
      {canRetry && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs w-full"
          onClick={onRetry}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Retry
        </Button>
      )}
    </CardShell>
  );
}

/* ---------------- dialogs ---------------- */

function ApproveDialog({
  item,
  userEmail,
  onClose,
  onDone,
}: {
  item: ContentItem;
  userEmail: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [channels, setChannels] = useState<Set<string>>(
    new Set(item.channels?.length ? item.channels : ["facebook", "instagram"]),
  );
  const [accounts, setAccounts] = useState<Set<string>>(
    new Set(item.accounts?.length ? item.accounts : ["usa_grappling"]),
  );
  const [scheduleMode, setScheduleMode] = useState<"asap" | "at">("asap");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>(item.media_url ?? "");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(
    (item.media_type as any) ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const igSelected = channels.has("instagram");
  const needsMedia = igSelected && !mediaUrl;

  const toggle = (
    set: Set<string>,
    key: string,
    setter: (s: Set<string>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };

  async function handleFile(input: File) {
    if (input.size > MAX_UPLOAD) return toast.error("File exceeds 200 MB");
    const isVideo = input.type.startsWith("video/");
    const isImage = input.type.startsWith("image/");
    if (!isVideo && !isImage) return toast.error("Only image/video files");

    let file = input;
    if (isImage && input.type !== "image/jpeg") {
      try {
        file = await convertImageToJpeg(input);
      } catch (e: any) {
        return toast.error("Conversion failed: " + (e?.message ?? e));
      }
    }

    setUploading(true);
    setUploadPct(5);
    const timer = setInterval(
      () => setUploadPct((p) => (p < 90 ? p + 5 : p)),
      300,
    );
    try {
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `social/${Date.now()}-${safe}`;
      const { error } = await opsSupabase.storage
        .from("content-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = opsSupabase.storage.from("content-media").getPublicUrl(path);
      setMediaUrl(data.publicUrl);
      setMediaType(isVideo ? "video" : "image");
      setUploadPct(100);
    } catch (e: any) {
      setUploadPct(0);
      toast.error("Upload failed: " + (e?.message ?? e));
    } finally {
      clearInterval(timer);
      setUploading(false);
    }
  }

  async function confirm() {
    if (channels.size === 0) return toast.error("Pick at least one channel");
    if (accounts.size === 0) return toast.error("Pick at least one account");
    if (needsMedia) return toast.error("Instagram requires media");
    if (scheduleMode === "at" && !scheduledAt)
      return toast.error("Pick a schedule time");

    setSaving(true);
    const patch: any = {
      status: "approved",
      approved_by: userEmail,
      approved_at: new Date().toISOString(),
      channels: Array.from(channels),
      accounts: Array.from(accounts),
      scheduled_for: scheduleMode === "asap" ? null : new Date(scheduledAt).toISOString(),
      media_url: mediaUrl || null,
      media_type: mediaType,
    };
    const { error } = await opsSupabase
      .from("content_library")
      .update(patch)
      .eq("id", item.id);
    setSaving(false);
    if (error) return toast.error("Approve failed: " + error.message);
    toast.success("Approved — queued for publishing");
    onDone();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve & queue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-medium">Channels</label>
            <div className="flex gap-3 mt-1">
              {CHANNELS.map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={channels.has(c.key)}
                    onCheckedChange={() => toggle(channels, c.key, setChannels)}
                  />
                  <c.Icon className="w-4 h-4" /> {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Accounts</label>
            <div className="flex flex-col gap-1 mt-1">
              {ACCOUNTS.map((a) => (
                <label key={a.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={accounts.has(a.key)}
                    onCheckedChange={() => toggle(accounts, a.key, setAccounts)}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">
              Media {igSelected && <span className="text-destructive">*</span>}
            </label>
            <div className="mt-1 space-y-2">
              {mediaUrl ? (
                <div className="relative border rounded p-2">
                  {mediaType === "video" ? (
                    <video src={mediaUrl} controls className="w-full max-h-48 rounded" />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="preview"
                      className="w-full max-h-48 object-contain rounded"
                    />
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      setMediaUrl("");
                      setMediaType(null);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Upload media
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  {uploading && <Progress value={uploadPct} className="h-1" />}
                  <div className="text-[11px] text-muted-foreground">
                    Videos should be under 50 MB — export at 1080p for social.
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Schedule</label>
            <div className="flex gap-3 mt-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={scheduleMode === "asap"}
                  onChange={() => setScheduleMode("asap")}
                />
                Next open slot
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={scheduleMode === "at"}
                  onChange={() => setScheduleMode("at")}
                />
                At…
              </label>
            </div>
            {scheduleMode === "at" && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={saving || uploading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  item,
  onClose,
  onSaved,
}: {
  item: ContentItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [subject, setSubject] = useState(item.subject ?? "");
  const [body, setBody] = useState(item.body ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const patch: any = { subject, body };
    // Editing a blocked draft clears QA so the automated pass re-runs.
    if (item.qa_status === "blocked") {
      patch.qa_status = null;
      patch.qa_notes = null;
    }
    const { error } = await opsSupabase
      .from("content_library")
      .update(patch)
      .eq("id", item.id);
    setSaving(false);
    if (error) return toast.error("Save failed: " + error.message);
    toast.success(
      item.qa_status === "blocked"
        ? "Saved — QA will re-check within 15 min"
        : "Saved",
    );
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit draft</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[240px] font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CadenceDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial, open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit cadence</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          Human-readable summary shown on the tab. Update the enforcement rules in the
          queue runner if the numbers change.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(text)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ContentReviewPanel;
