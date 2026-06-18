import { useState, useEffect, useMemo } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ExternalLink, Copy, Loader2, ChevronUp, ChevronDown, RefreshCw,
  Download, CheckSquare, Square, Send, ListChecks,
} from "lucide-react";
import { toast } from "sonner";

interface MarketingTarget {
  id: string;
  name: string;
  type: string;
  platform: string | null;
  url: string | null;
  handle: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  member_count: number | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  gym: "🥋", facebook_group: "👥", facebook_page: "📄",
  instagram: "📸", tiktok: "🎵", producer_prospect: "🏟", email_contact: "📧",
};

const TYPE_LABELS: Record<string, string> = {
  gym: "Gym", facebook_group: "FB Group", facebook_page: "FB Page",
  instagram: "Instagram", tiktok: "TikTok", producer_prospect: "Producer", email_contact: "Email",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  contacted: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  responded: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  converted: "bg-green-100 text-green-700 hover:bg-green-100",
  not_interested: "bg-red-100 text-red-600 hover:bg-red-100",
};

const CONTENT_TEMPLATES = [
  {
    id: "event_promo",
    label: "Event Promotion",
    text: "Hey! USA Grappling is hosting an upcoming event in your area. We'd love to have your athletes compete. Check out the details and registration at usagrappling.com — happy to answer any questions!",
  },
  {
    id: "membership",
    label: "USAG/AAU Membership",
    text: "Hi! Did you know USA Grappling / AAU memberships include $1M liability insurance, competition access, and athlete benefits? We'd love to partner with your gym. Reach out and let's connect!",
  },
  {
    id: "producer",
    label: "Event Producer Inquiry",
    text: "Hi! USA Grappling is expanding our event network and looking for experienced local producers to host events in their region. Given your facility, I think you'd be a great fit. Can we set up a quick call?",
  },
  {
    id: "general",
    label: "General Introduction",
    text: "Hey! I'm Blair with USA Grappling — we're the national governing body for sport jiu jitsu and grappling events. Would love to connect and explore ways to work together!",
  },
];

export const MarketingPanel = () => {
  const [targets, setTargets] = useState<MarketingTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof MarketingTarget>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Queue mode
  const [mode, setMode] = useState<"list" | "queue">("list");
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueTargets, setQueueTargets] = useState<MarketingTarget[]>([]);

  // Bulk contact dialog
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactChannel, setContactChannel] = useState("dm");
  const [contactTemplate, setContactTemplate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTargets = async () => {
    setLoading(true);
    const { data, error } = await opsSupabase
      .from("marketing_targets")
      .select("*")
      .order("name");
    if (error) toast.error(`Failed to load: ${error.message}`);
    setTargets((data as MarketingTarget[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTargets(); }, []);

  const states = useMemo(() => {
    return [...new Set(targets.map(t => t.state).filter(Boolean))].sort() as string[];
  }, [targets]);

  const filtered = useMemo(() => {
    return targets
      .filter(t => {
        const matchSearch = !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          (t.handle && t.handle.toLowerCase().includes(search.toLowerCase()));
        if (!matchSearch) return false;
        if (stateFilter !== "all" && t.state !== stateFilter && t.region !== stateFilter) return false;
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const av = (a[sortKey] ?? "") as any;
        const bv = (b[sortKey] ?? "") as any;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [targets, search, stateFilter, typeFilter, statusFilter, sortKey, sortDir]);

  const handleSort = (key: keyof MarketingTarget) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(t => t.id)));
    }
  };

  const applyTemplate = (templateId: string) => {
    const tpl = CONTENT_TEMPLATES.find(t => t.id === templateId);
    if (tpl) { setContactMessage(tpl.text); setContactTemplate(templateId); }
  };

  const handleBulkContact = async () => {
    if (!contactMessage.trim()) { toast.error("Enter a message"); return; }
    setSubmitting(true);
    const ids = [...selected];
    const now = new Date().toISOString();

    await opsSupabase
      .from("marketing_targets")
      .update({ status: "contacted" })
      .in("id", ids);

    const logs = ids.map(id => ({
      target_id: id,
      channel: contactChannel,
      message_sent: contactMessage,
      contacted_at: now,
      status: "sent",
    }));
    await opsSupabase.from("outreach_log").insert(logs);

    setTargets(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: "contacted" } : t));
    setSelected(new Set());
    setShowContactDialog(false);
    setContactMessage("");
    setContactTemplate("");
    toast.success(`Logged outreach for ${ids.length} target${ids.length > 1 ? "s" : ""}`);
    setSubmitting(false);
  };

  const exportCSV = () => {
    const rows = filtered;
    const headers = ["Name", "Type", "Platform", "Handle", "City", "State", "Region", "Members", "Status", "Email", "Phone", "Contact", "URL", "Notes"];
    const csv = [
      headers.join(","),
      ...rows.map(t => [
        `"${t.name.replace(/"/g, "'")}"`,
        t.type || "",
        t.platform || "",
        t.handle || "",
        t.city || "",
        t.state || "",
        t.region || "",
        t.member_count || "",
        t.status,
        t.email || "",
        t.phone || "",
        t.contact_name || "",
        t.url || "",
        `"${(t.notes || "").replace(/"/g, "'")}"`,
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `usag_marketing_targets_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} targets`);
  };

  const startQueue = () => {
    const uncontacted = filtered.filter(t => t.status === "new");
    if (uncontacted.length === 0) { toast.info("No new targets in current filter"); return; }
    setQueueTargets(uncontacted);
    setQueueIndex(0);
    setContactMessage(CONTENT_TEMPLATES[0].text);
    setContactTemplate(CONTENT_TEMPLATES[0].id);
    setMode("queue");
  };

  const logQueueTarget = async (target: MarketingTarget) => {
    if (!contactMessage.trim()) { toast.error("Enter a message first"); return; }
    setSubmitting(true);
    await opsSupabase.from("marketing_targets").update({ status: "contacted" }).eq("id", target.id);
    await opsSupabase.from("outreach_log").insert({
      target_id: target.id,
      channel: contactChannel,
      message_sent: contactMessage,
      contacted_at: new Date().toISOString(),
      status: "sent",
    });
    setTargets(prev => prev.map(t => t.id === target.id ? { ...t, status: "contacted" } : t));
    toast.success(`Logged: ${target.name}`);
    if (queueIndex + 1 >= queueTargets.length) {
      toast.success("Queue complete!");
      setMode("list");
    } else {
      setQueueIndex(i => i + 1);
    }
    setSubmitting(false);
  };

  const skipQueue = () => {
    if (queueIndex + 1 >= queueTargets.length) { setMode("list"); return; }
    setQueueIndex(i => i + 1);
  };

  const stats = useMemo(() => ({
    total: targets.length,
    new: targets.filter(t => t.status === "new").length,
    contacted: targets.filter(t => t.status === "contacted").length,
    converted: targets.filter(t => t.status === "converted").length,
  }), [targets]);

  const SortIcon = ({ col }: { col: keyof MarketingTarget }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null;

  if (loading) return (
    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
  );

  // ── QUEUE MODE ──────────────────────────────────────────────────────────────
  if (mode === "queue") {
    const target = queueTargets[queueIndex];
    const progress = `${queueIndex + 1} / ${queueTargets.length}`;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Outreach Queue — {progress}</h3>
          <Button size="sm" variant="ghost" onClick={() => setMode("list")}>Exit Queue</Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold">
                <span>{TYPE_ICONS[target.type] || "•"}</span>
                <span>{target.name}</span>
              </div>
              {(target.city || target.state) && (
                <p className="text-sm text-muted-foreground">
                  {[target.city, target.state].filter(Boolean).join(", ")}
                </p>
              )}
              {target.member_count && (
                <p className="text-sm text-muted-foreground">
                  {target.member_count.toLocaleString()} followers/members
                </p>
              )}
              {target.url && (
                <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {target.notes && <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{target.notes}</p>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <div className="flex gap-2 flex-wrap">
                {CONTENT_TEMPLATES.map(tpl => (
                  <Button
                    key={tpl.id}
                    size="sm"
                    variant={contactTemplate === tpl.id ? "default" : "outline"}
                    onClick={() => applyTemplate(tpl.id)}
                    className="text-xs"
                  >
                    {tpl.label}
                  </Button>
                ))}
              </div>
              <Textarea
                value={contactMessage}
                onChange={e => setContactMessage(e.target.value)}
                rows={4}
                placeholder="Message you sent / will send..."
                className="text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={contactChannel} onValueChange={setContactChannel}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dm">DM</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => logQueueTarget(target)} disabled={submitting} className="flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Log &amp; Next
              </Button>
              <Button variant="ghost" onClick={skipQueue}>Skip</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── LIST MODE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Targets</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-3xl font-bold text-gray-600">{stats.new}</p>
          <p className="text-sm text-muted-foreground">Not Yet Contacted</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-3xl font-bold text-blue-600">{stats.contacted}</p>
          <p className="text-sm text-muted-foreground">Contacted</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
          <p className="text-sm text-muted-foreground">Converted</p>
        </CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-48"
        />
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gym">🥋 Gym</SelectItem>
            <SelectItem value="facebook_group">👥 FB Group</SelectItem>
            <SelectItem value="facebook_page">📄 FB Page</SelectItem>
            <SelectItem value="instagram">📸 Instagram</SelectItem>
            <SelectItem value="tiktok">🎵 TikTok</SelectItem>
            <SelectItem value="producer_prospect">🏟 Producer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchTargets}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={startQueue}>
            <ListChecks className="w-4 h-4 mr-2" /> Outreach Queue
          </Button>
          {selected.size > 0 && (
            <Button size="sm" onClick={() => setShowContactDialog(true)}>
              <Send className="w-4 h-4 mr-2" /> Log Outreach ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <button onClick={toggleAll} className="flex items-center">
                  {selected.size === filtered.length && filtered.length > 0
                    ? <CheckSquare className="w-4 h-4 text-primary" />
                    : <Square className="w-4 h-4 text-muted-foreground" />}
                </button>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name <SortIcon col="name" /></TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("city")}>Location <SortIcon col="city" /></TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("member_count")}>Followers <SortIcon col="member_count" /></TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Status <SortIcon col="status" /></TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id} className={selected.has(t.id) ? "bg-blue-50/50" : ""}>
                <TableCell>
                  <button onClick={() => toggleSelect(t.id)} className="flex items-center">
                    {selected.has(t.id)
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <Square className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </TableCell>
                <TableCell>
                  {t.url ? (
                    <a href={t.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {t.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span>{t.name}</span>}
                  {t.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.notes}</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {TYPE_ICONS[t.type] || "•"} {TYPE_LABELS[t.type] || t.type}
                </TableCell>
                <TableCell className="text-sm">
                  {[t.city, t.state].filter(Boolean).join(", ") || <span className="text-muted-foreground">{t.region || "National"}</span>}
                </TableCell>
                <TableCell>{t.member_count ? t.member_count.toLocaleString() : "—"}</TableCell>
                <TableCell>
                  <Badge className={STATUS_STYLES[t.status] || ""} variant="secondary">
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {t.status === "new" && (
                      <Button size="sm" variant="outline" onClick={() => { setSelected(new Set([t.id])); setShowContactDialog(true); }}>
                        Contacted
                      </Button>
                    )}
                    {t.url && (
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(t.url!); toast.success("URL copied"); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No targets match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-4 py-2 border-t text-xs text-muted-foreground bg-muted/30 flex justify-between">
          <span>Showing {filtered.length} of {targets.length}</span>
          {selected.size > 0 && <span>{selected.size} selected</span>}
        </div>
      </Card>

      {/* Bulk Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Outreach — {selected.size} target{selected.size > 1 ? "s" : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {CONTENT_TEMPLATES.map(tpl => (
                <Button
                  key={tpl.id}
                  size="sm"
                  variant={contactTemplate === tpl.id ? "default" : "outline"}
                  onClick={() => applyTemplate(tpl.id)}
                  className="text-xs"
                >
                  {tpl.label}
                </Button>
              ))}
            </div>
            <Textarea
              value={contactMessage}
              onChange={e => setContactMessage(e.target.value)}
              rows={5}
              placeholder="Paste or type the message you sent..."
            />
            <Select value={contactChannel} onValueChange={setContactChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dm">DM (Instagram / Facebook)</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone / Text</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="comment">Comment / Post</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowContactDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkContact} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Log Outreach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingPanel;
