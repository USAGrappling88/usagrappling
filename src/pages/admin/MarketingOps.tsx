import { useState, useEffect, useMemo } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ExternalLink, Copy, Loader2, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
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

export const MarketingPanel = () => {
  const [targets, setTargets] = useState<MarketingTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof MarketingTarget>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [updating, setUpdating] = useState<string | null>(null);

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
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (stateFilter !== "all" && t.state !== stateFilter) return false;
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

  const markContacted = async (id: string, name: string) => {
    setUpdating(id);
    const { error } = await opsSupabase.from("marketing_targets").update({ status: "contacted" }).eq("id", id);
    if (error) {
      toast.error(`Update failed: ${error.message}`);
    } else {
      setTargets(prev => prev.map(t => t.id === id ? { ...t, status: "contacted" } : t));
      toast.success(`Marked ${name} as contacted`);
    }
    setUpdating(null);
  };

  const stats = useMemo(() => ({
    total: targets.length,
    gyms: targets.filter(t => t.type === "gym").length,
    groups: targets.filter(t => t.type?.startsWith("facebook")).length,
    instagram: targets.filter(t => t.type === "instagram").length,
    producers: targets.filter(t => t.type === "producer_prospect").length,
    new: targets.filter(t => t.status === "new").length,
    contacted: targets.filter(t => t.status === "contacted").length,
    converted: targets.filter(t => t.status === "converted").length,
  }), [targets]);

  const SortIcon = ({ col }: { col: keyof MarketingTarget }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />) : null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Targets</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.gyms} gyms · {stats.groups} FB · {stats.instagram} IG · {stats.producers} producers
          </p>
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

      {/* Filters */}
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
        <span className="text-sm text-muted-foreground ml-auto">
          Showing {filtered.length} of {targets.length}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow key={t.id}>
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
                    {[t.city, t.state].filter(Boolean).join(", ") || <span className="text-muted-foreground">National</span>}
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
                        <Button size="sm" variant="outline" onClick={() => markContacted(t.id, t.name)} disabled={updating === t.id}>
                          {updating === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Contacted"}
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No targets match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};
