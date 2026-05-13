import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Trash2, Star, Eye, Search, Download } from "lucide-react";

interface Petition {
  id: string;
  email: string;
  membership_number: string | null;
  first_name: string;
  last_name: string;
  dob: string;
  sex: string;
  competition_weight_kg: number;
  belt_ranking: string | null;
  notable_accomplishments: string | null;
  self_fund: boolean;
  style: string;
  competition_type: string;
  rashguard_size: string | null;
  short_size: string | null;
  shirt_size: string | null;
  hoodie_size: string | null;
  pants_size: string | null;
  status: string;
  admin_notes: string | null;
  admin_rating: number | null;
  created_at: string;
}

export const WorldTeamPanel = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "admin_rating">("created_at");
  const [selected, setSelected] = useState<Petition | null>(null);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState("pending");

  const fetchPetitions = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("world_team_petitions" as any).select("*").order(sortBy, { ascending: sortBy === "admin_rating" ? false : true }) as any);
    if (error) {
      toast.error("Failed to load petitions");
    } else {
      setPetitions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPetitions(); }, [sortBy]);

  const openDetail = (p: Petition) => {
    setSelected(p);
    setNotes(p.admin_notes || "");
    setRating(p.admin_rating || 0);
    setStatus(p.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    const { error } = await (supabase.from("world_team_petitions" as any).update({
      admin_notes: notes,
      admin_rating: rating,
      status,
    }).eq("id", selected.id) as any);
    if (error) {
      toast.error("Failed to update petition");
    } else {
      toast.success("Petition updated");
      setSelected(null);
      fetchPetitions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this petition?")) return;
    const { error } = await (supabase.from("world_team_petitions" as any).delete().eq("id", id) as any);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Petition deleted");
      fetchPetitions();
    }
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("No petitions to export");
      return;
    }
    const headers = Object.keys(filtered[0]) as (keyof Petition)[];
    const escape = (val: any) => {
      if (val === null || val === undefined) return "";
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(","),
      ...filtered.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `world-team-petitions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} petitions`);
  };

  const filtered = petitions.filter((p) => {
    const term = search.toLowerCase();
    return `${p.first_name} ${p.last_name} ${p.email} ${p.style}`.toLowerCase().includes(term);
  });

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search petitions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Sort by Date</SelectItem>
            <SelectItem value="admin_rating">Sort by Rating</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No petitions found.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Self Fund</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                  <TableCell>{p.style}</TableCell>
                  <TableCell>{p.competition_type}</TableCell>
                  <TableCell>{p.competition_weight_kg}</TableCell>
                  <TableCell>{p.self_fund ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {p.admin_rating ? (
                      <span className="flex items-center gap-1">{p.admin_rating} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></span>
                    ) : "—"}
                  </TableCell>
                  <TableCell><Badge variant={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(p)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.first_name} {selected?.last_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="font-medium text-muted-foreground">Membership #:</span> {selected.membership_number || "N/A"}</div>
                <div><span className="font-medium text-muted-foreground">DOB:</span> {selected.dob}</div>
                <div><span className="font-medium text-muted-foreground">Sex:</span> {selected.sex}</div>
                <div><span className="font-medium text-muted-foreground">Weight:</span> {selected.competition_weight_kg} kg</div>
                <div><span className="font-medium text-muted-foreground">Belt:</span> {selected.belt_ranking || "N/A"}</div>
                <div><span className="font-medium text-muted-foreground">Style:</span> {selected.style}</div>
                <div><span className="font-medium text-muted-foreground">Type:</span> {selected.competition_type}</div>
                <div><span className="font-medium text-muted-foreground">Self Fund:</span> {selected.self_fund ? "Yes" : "No"}</div>
              </div>
              {selected.notable_accomplishments && (
                <div>
                  <span className="font-medium text-muted-foreground">Accomplishments:</span>
                  <p className="mt-1 whitespace-pre-wrap">{selected.notable_accomplishments}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Rashguard: {selected.rashguard_size || "—"}</div>
                <div>Short: {selected.short_size || "—"}</div>
                <div>Shirt: {selected.shirt_size || "—"}</div>
                <div>Hoodie: {selected.hoodie_size || "—"}</div>
                <div>Pants: {selected.pants_size || "—"}</div>
              </div>

              <hr className="border-border" />

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Rating (1–5)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                        <Star className={`w-5 h-5 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Status</span>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground">Admin Notes</span>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <Button onClick={handleSave} className="w-full">Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
