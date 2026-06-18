import { useState, useEffect } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2, RefreshCw, Download, CheckSquare, Square,
  Send, ExternalLink, X,
  Megaphone, Mail, CheckCircle,
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
  notes: string | null;
  email: string | null;
  phone: string | null;
  contact_name: string | null;
}

const TYPE_ICONS: Record<string, string> = {
  gym: "🥋",
  facebook_group: "👥",
  facebook_page: "📄",
  instagram: "📸",
  tiktok: "🎵",
  producer_prospect: "🏟",
  email_contact: "📧",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  responded: "bg-yellow-100 text-yellow-700",
  converted: "bg-green-100 text-green-700",
  not_interested: "bg-red-100 text-red-700",
};

const TEMPLATES = [
  {
    id: "event_promo",
    label: "Event Promo",
    subject: "USA Grappling — Upcoming Event in Your Area",
    text: "Hey! USA Grappling is hosting an upcoming event and we'd love to have your athletes compete. We're the national governing body for sport jiu jitsu and grappling, running SJJIF-sanctioned events nationwide.\n\nCheck out registration at usagrappling.com — happy to answer any questions!",
  },
  {
    id: "membership",
    label: "USAG/AAU Membership",
    subject: "USAG / AAU Membership Benefits for Your Gym",
    text: "Hi! USA Grappling / AAU memberships include $1M liability insurance, access to sanctioned competitions, and exclusive athlete benefits — all under one national umbrella.\n\nWe'd love to partner with your gym. Learn more at usagrappling.com or reply here and let's connect!",
  },
  {
    id: "japan_qualifier",
    label: "Japan Qualifier",
    subject: "Win a Sponsored Trip to Japan — USA Grappling Youth Qualifier",
    text: "Attention youth athletes and coaches! USA Grappling is hosting the Japan Open Qualifier for U11–U17 divisions.\n\nWin your division = Team USA selection + sponsored trip to compete in Japan.\nGi only · SJJIF Rules · Register at usagrappling.com",
  },
  {
    id: "producer",
    label: "Event Producer",
    subject: "Event Hosting Opportunity — USA Grappling",
    text: "Hi! USA Grappling is expanding our national event network and looking for experienced producers to host events in their region.\n\nGiven your facility and experience, I think you'd be a great fit. Can we set up a quick call to discuss the partnership?",
  },
];

type AppMode = "list" | "campaign" | "queue";

export const MarketingOps = () => {
  const [targets, setTargets] = useState<MarketingTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<AppMode>("list");

  // Campaign state
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignTemplate, setCampaignTemplate] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("dm");
  const [sending, setSending] = useState(false);
  const [emailResults, setEmailResults] = useState<{ sent: number; failed: number } | null>(null);
  const [socialQueue, setSocialQueue] = useState<MarketingTarget[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueDone, setQueueDone] = useState(false);

  const fetchTargets = async () => {
    setLoading(true);
    const { data } = await opsSupabase.from("marketing_targets").select("*").order("name");
    setTargets((data as MarketingTarget[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTargets(); }, []);

  const filtered = targets.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchState = filterState === "all" || t.state === filterState || t.region === filterState;
    const matchType = filterType === "all" || t.type === filterType;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchState && matchType && matchStatus;
  });

  const regions = [...new Set(targets.map(t => t.region).filter(Boolean))].sort() as string[];
  const states = [...new Set(targets.map(t => t.state).filter(Boolean))].sort() as string[];

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id)));
  };

  const applyTemplate = (tplId: string) => {
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (tpl) { setCampaignMessage(tpl.text); setCampaignSubject(tpl.subject); setCampaignTemplate(tplId); }
  };

  const selectedTargets = targets.filter(t => selected.has(t.id));
  const emailTargets = selectedTargets.filter(t => t.email);
  const socialTargets = selectedTargets.filter(t => !t.email && t.url);

  const startCampaign = () => {
    if (selected.size === 0) { toast.error("Select at least one target"); return; }
    if (TEMPLATES.length > 0 && !campaignMessage) applyTemplate(TEMPLATES[0].id);
    setMode("campaign");
    setEmailResults(null);
    setSocialQueue([]);
    setQueueIndex(0);
    setQueueDone(false);
  };

  const launchCampaign = async () => {
    if (!campaignMessage.trim()) { toast.error("Write a message first"); return; }
    setSending(true);

    if (emailTargets.length > 0) {
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="white-space:pre-wrap;line-height:1.5;color:#222;">${campaignMessage.replace(/\n/g, "<br/>")}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;color:#888;">USA Grappling · usagrappling.com</p>
      </div>`;

      try {
        const { data } = await opsSupabase.functions.invoke("send-email", {
          body: {
            to: emailTargets.map(t => t.email),
            subject: campaignSubject || "Message from USA Grappling",
            html,
            from_name: "USA Grappling",
          },
        });
        setEmailResults({ sent: data?.sent || emailTargets.length, failed: data?.failed || 0 });

        const now = new Date().toISOString();
        await opsSupabase.from("outreach_log").insert(
          emailTargets.map(t => ({
            target_id: t.id,
            channel: "email",
            message_sent: campaignMessage,
            contacted_at: now,
            status: "sent",
          }))
        );
        await opsSupabase.from("marketing_targets")
          .update({ status: "contacted" })
          .in("id", emailTargets.map(t => t.id));
        setTargets(prev => prev.map(t => emailTargets.find(e => e.id === t.id) ? { ...t, status: "contacted" } : t));
      } catch (err) {
        setEmailResults({ sent: 0, failed: emailTargets.length });
      }
    }

    if (socialTargets.length > 0) {
      setSocialQueue(socialTargets);
      setQueueIndex(0);
      setMode("queue");
    } else {
      toast.success("Campaign sent!");
      setSelected(new Set());
      setMode("list");
    }

    setSending(false);
  };

  const logAndAdvance = async (target: MarketingTarget) => {
    await opsSupabase.from("marketing_targets").update({ status: "contacted" }).eq("id", target.id);
    await opsSupabase.from("outreach_log").insert({
      target_id: target.id,
      channel: campaignChannel,
      message_sent: campaignMessage,
      contacted_at: new Date().toISOString(),
      status: "sent",
    });
    setTargets(prev => prev.map(t => t.id === target.id ? { ...t, status: "contacted" } : t));
    toast.success(`Logged: ${target.name}`);
    if (queueIndex + 1 >= socialQueue.length) {
      setQueueDone(true);
    } else {
      setQueueIndex(i => i + 1);
    }
  };

  const exportCSV = () => {
    const headers = ["Name","Type","City","State","Region","Members","Status","Email","URL","Notes"];
    const csv = [
      headers.join(","),
      ...filtered.map(t => [
        `"${t.name}"`, t.type||"", t.city||"", t.state||"", t.region||"",
        t.member_count||"", t.status, t.email||"", t.url||"",
        `"${(t.notes||"").replace(/"/g,"'")}"`
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `usag_targets_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const stats = {
    total: targets.length,
    new: targets.filter(t => t.status === "new").length,
    contacted: targets.filter(t => t.status === "contacted").length,
    converted: targets.filter(t => t.status === "converted").length,
  };

  // ── QUEUE MODE ──────────────────────────────────────────────────────────────
  if (mode === "queue") {
    if (queueDone) {
      return (
        <div className="text-center py-12 space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Campaign Complete!</h2>
          {emailResults && (
            <p className="text-muted-foreground">Emails sent: {emailResults.sent} · Failed: {emailResults.failed}</p>
          )}
          <p className="text-muted-foreground">Social outreach logged: {socialQueue.length}</p>
          <Button onClick={() => { setMode("list"); setSelected(new Set()); }}>Back to List</Button>
        </div>
      );
    }

    const target = socialQueue[queueIndex];
    const progress = `${queueIndex + 1} / ${socialQueue.length}`;

    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Manual Outreach Queue</h2>
            <p className="text-sm text-muted-foreground">{progress} accounts · Open link, paste message, log it</p>
          </div>
          <Button variant="ghost" onClick={() => setMode("list")}><X className="w-4 h-4 mr-1" /> Exit</Button>
        </div>

        {emailResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Emails sent to {emailResults.sent} recipients. Now working through social accounts.
          </div>
        )}

        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((queueIndex+1)/socialQueue.length)*100}%` }} />
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold">{TYPE_ICONS[target.type] || "•"} {target.name}</h3>
              {(target.city || target.state) && (
                <p className="text-sm text-muted-foreground">{[target.city, target.state].filter(Boolean).join(", ")}</p>
              )}
              {target.member_count && (
                <p className="text-sm text-muted-foreground">{target.member_count.toLocaleString()} members/followers</p>
              )}
              {target.notes && <p className="text-xs text-muted-foreground mt-1">{target.notes}</p>}
            </div>
            {target.url && (
              <a href={target.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3 mr-1" /> Open</Button>
              </a>
            )}
          </div>

          <pre className="whitespace-pre-wrap text-sm bg-muted/40 rounded p-3 border">{campaignMessage}</pre>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={campaignChannel} onValueChange={setCampaignChannel}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dm">DM</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => logAndAdvance(target)}>
              <CheckCircle className="w-4 h-4 mr-1" /> Done — Log &amp; Next
            </Button>
            <Button variant="ghost" onClick={() => queueIndex + 1 >= socialQueue.length ? setQueueDone(true) : setQueueIndex(i => i + 1)}>
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── CAMPAIGN COMPOSE MODE ──────────────────────────────────────────────────
  if (mode === "campaign") {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Megaphone className="w-5 h-5" /> Campaign</h2>
            <p className="text-sm text-muted-foreground">
              {selected.size} targets selected ·{" "}
              {emailTargets.length > 0 && <span>{emailTargets.length} email{emailTargets.length > 1 ? "s" : ""} </span>}
              {socialTargets.length > 0 && <span>+ {socialTargets.length} manual outreach</span>}
            </p>
          </div>
          <Button variant="ghost" onClick={() => setMode("list")}><X className="w-4 h-4 mr-1" /> Cancel</Button>
        </div>

        <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {selectedTargets.map(t => (
              <span key={t.id} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                {TYPE_ICONS[t.type] || "•"} {t.name}
                {t.email && <Mail className="w-3 h-3 text-green-600" />}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Template</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {TEMPLATES.map(tpl => (
              <Button
                key={tpl.id}
                size="sm"
                variant={campaignTemplate === tpl.id ? "default" : "outline"}
                onClick={() => applyTemplate(tpl.id)}
                className="text-xs"
              >
                {tpl.label}
              </Button>
            ))}
          </div>
        </div>

        {emailTargets.length > 0 && (
          <div>
            <label className="text-sm font-medium">Email Subject</label>
            <Input
              value={campaignSubject}
              onChange={e => setCampaignSubject(e.target.value)}
              placeholder="Subject line for email recipients..."
              className="mt-1"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={campaignMessage}
            onChange={e => setCampaignMessage(e.target.value)}
            rows={7}
            placeholder="Write your message..."
            className="mt-1"
          />
        </div>

        <Button onClick={launchCampaign} disabled={sending || !campaignMessage.trim()} className="w-full" size="lg">
          {sending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            : <><Send className="w-4 h-4 mr-2" />
                Launch —
                {emailTargets.length > 0 && ` Send ${emailTargets.length} email${emailTargets.length > 1 ? "s" : ""}`}
                {socialTargets.length > 0 && ` + ${socialTargets.length} manual`}
              </>
          }
        </Button>
      </div>
    );
  }

  // ── LIST MODE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Targets", value: stats.total, color: "" },
          { label: "Not Contacted", value: stats.new, color: "text-blue-600" },
          { label: "Contacted", value: stats.contacted, color: "text-yellow-600" },
          { label: "Converted", value: stats.converted, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="border rounded-lg p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-44" />
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Regions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gym">Gym</SelectItem>
            <SelectItem value="facebook_group">FB Group</SelectItem>
            <SelectItem value="facebook_page">FB Page</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="producer_prospect">Producer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={fetchTargets}><RefreshCw className="w-3 h-3 mr-1" />Refresh</Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="w-3 h-3 mr-1" />CSV</Button>
          {selected.size > 0 && (
            <Button size="sm" onClick={startCampaign} className="bg-primary text-primary-foreground">
              <Megaphone className="w-3 h-3 mr-1" /> Campaign ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-2 text-left">
                  <button onClick={toggleAll}>
                    {selected.size === filtered.length && filtered.length > 0
                      ? <CheckSquare className="w-4 h-4 text-primary" />
                      : <Square className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </th>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Location</th>
                <th className="px-3 py-2 text-left font-medium">Reach</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className={`border-t ${i % 2 ? "bg-muted/20" : ""} ${selected.has(t.id) ? "bg-blue-50" : ""}`}>
                  <td className="px-3 py-2">
                    <button onClick={() => toggleSelect(t.id)}>
                      {selected.has(t.id)
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{t.name}</div>
                    {t.email && <div className="text-xs text-green-600 flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" /> {t.email}</div>}
                    {t.notes && <div className="text-xs text-muted-foreground truncate max-w-xs">{t.notes}</div>}
                  </td>
                  <td className="px-3 py-2">{TYPE_ICONS[t.type] || "•"} {t.type?.replace(/_/g," ")}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {t.region === "National" || !t.city ? t.region || "—" : `${t.city}, ${t.state}`}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {t.member_count ? t.member_count.toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status] || "bg-gray-100"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {t.url && (
                      <a href={t.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 px-2"><ExternalLink className="w-3 h-3" /></Button>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t text-xs text-muted-foreground bg-muted/30">
            Showing {filtered.length} of {targets.length}
            {selected.size > 0 && ` · ${selected.size} selected`}
          </div>
        </div>
      )}
    </div>
  );
};

export const MarketingPanel = MarketingOps;
export default MarketingOps;
