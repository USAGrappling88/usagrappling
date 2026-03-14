import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Star, Search, Filter, Trash2, Eye } from "lucide-react";

interface Application {
  id: string;
  application_type: "officiate" | "staff";
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  dob: string;
  membership_number: string | null;
  city: string;
  state: string;
  primary_background: string | null;
  certifications: string[] | null;
  certification_other: string | null;
  ruleset_expertise: string[] | null;
  smoothcomp: string | null;
  experience: string | null;
  worked_with_usag_before: boolean | null;
  positions: string[] | null;
  interested_roles: string[] | null;
  shirt_size: string | null;
  travel_radius: string | null;
  payment_method: string | null;
  pay_address: string | null;
  pay_city: string | null;
  pay_state: string | null;
  pay_zip: string | null;
  admin_grade: number | null;
  admin_notes: string | null;
  status: string;
}

const StaffOps = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (isAdmin) fetchApplications();
  }, [isAdmin]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading applications", description: error.message, variant: "destructive" });
    } else {
      setApplications((data as Application[]) || []);
    }
    setLoading(false);
  };

  const updateGrade = async (id: string, grade: number) => {
    const { error } = await supabase
      .from("staff_applications")
      .update({ admin_grade: grade })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, admin_grade: grade } : a)));
      if (selectedApp?.id === id) setSelectedApp((prev) => prev ? { ...prev, admin_grade: grade } : null);
      toast({ title: "Grade updated" });
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("staff_applications")
      .update({ admin_notes: notes })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, admin_notes: notes } : a)));
      toast({ title: "Notes saved" });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("staff_applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (selectedApp?.id === id) setSelectedApp((prev) => prev ? { ...prev, status } : null);
      toast({ title: "Status updated" });
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const { error } = await supabase.from("staff_applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setDetailOpen(false);
      toast({ title: "Application deleted" });
    }
  };

  if (authLoading) return <Layout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div></Layout>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  // Apply filters
  let filtered = [...applications];
  if (typeFilter !== "all") filtered = filtered.filter((a) => a.application_type === typeFilter);
  if (stateFilter) filtered = filtered.filter((a) => a.state.toLowerCase().includes(stateFilter.toLowerCase()));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((a) =>
      a.full_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      (a.positions || []).some((p) => p.toLowerCase().includes(q)) ||
      (a.interested_roles || []).some((r) => r.toLowerCase().includes(q))
    );
  }
  if (sortBy === "grade_high") filtered.sort((a, b) => (b.admin_grade || 0) - (a.admin_grade || 0));
  else if (sortBy === "grade_low") filtered.sort((a, b) => (a.admin_grade || 0) - (b.admin_grade || 0));
  else if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const getJobTypes = (app: Application): string => {
    if (app.application_type === "officiate") return (app.interested_roles || []).join(", ") || "Officiate";
    return (app.positions || []).join(", ") || "Staff";
  };

  return (
    <Layout>
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Staff & Official Applications</h1>
            <Badge variant="secondary" className="text-sm">{filtered.length} applications</Badge>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search name, email, position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="officiate">Officials / Referees</SelectItem>
                    <SelectItem value="staff">Tournament Staff</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by state..."
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="grade_high">Highest Grade</SelectItem>
                    <SelectItem value="grade_low">Lowest Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          {loading ? (
            <p className="text-center text-muted-foreground py-10">Loading applications...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No applications found.</p>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Job / Position</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app) => (
                      <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedApp(app); setDetailOpen(true); }}>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={app.application_type === "officiate" ? "default" : "secondary"}>
                            {app.application_type === "officiate" ? "Official" : "Staff"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {getJobTypes(app)}
                        </TableCell>
                        <TableCell className="text-sm">{app.city}, {app.state}</TableCell>
                        <TableCell>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((g) => (
                              <button
                                key={g}
                                onClick={(e) => { e.stopPropagation(); updateGrade(app.id, g); }}
                                className="p-0"
                              >
                                <Star className={`h-4 w-4 ${g <= (app.admin_grade || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={app.status === "pending" ? "outline" : app.status === "approved" ? "default" : "secondary"}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setDetailOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteApplication(app.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selectedApp.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status & Grade Controls */}
                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={selectedApp.status} onValueChange={(v) => updateStatus(selectedApp.id, v)}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-0.5 items-center">
                    <span className="text-sm text-muted-foreground mr-1">Grade:</span>
                    {[1, 2, 3, 4, 5].map((g) => (
                      <button key={g} onClick={() => updateGrade(selectedApp.id, g)}>
                        <Star className={`h-5 w-5 ${g <= (selectedApp.admin_grade || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal */}
                <Card>
                  <CardHeader className="py-3"><CardTitle className="text-sm">Personal Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-sm pb-4">
                    <div><span className="text-muted-foreground">Email:</span> {selectedApp.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {selectedApp.phone}</div>
                    <div><span className="text-muted-foreground">DOB:</span> {selectedApp.dob}</div>
                    <div><span className="text-muted-foreground">Location:</span> {selectedApp.city}, {selectedApp.state}</div>
                    <div><span className="text-muted-foreground">Type:</span> {selectedApp.application_type}</div>
                    {selectedApp.membership_number && <div><span className="text-muted-foreground">Membership #:</span> {selectedApp.membership_number}</div>}
                  </CardContent>
                </Card>

                {/* Credentials / Positions */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">
                      {selectedApp.application_type === "officiate" ? "Credentials" : "Experience & Positions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2 pb-4">
                    {selectedApp.application_type === "officiate" ? (
                      <>
                        {selectedApp.primary_background && <div><span className="text-muted-foreground">Background:</span> {selectedApp.primary_background}</div>}
                        {selectedApp.certifications && selectedApp.certifications.length > 0 && (
                          <div><span className="text-muted-foreground">Certifications:</span> {selectedApp.certifications.join(", ")}{selectedApp.certification_other ? ` (${selectedApp.certification_other})` : ""}</div>
                        )}
                        {selectedApp.ruleset_expertise && selectedApp.ruleset_expertise.length > 0 && (
                          <div><span className="text-muted-foreground">Rulesets:</span> {selectedApp.ruleset_expertise.join(", ")}</div>
                        )}
                        {selectedApp.smoothcomp && <div><span className="text-muted-foreground">Smoothcomp:</span> {selectedApp.smoothcomp}</div>}
                        {selectedApp.interested_roles && selectedApp.interested_roles.length > 0 && (
                          <div><span className="text-muted-foreground">Roles:</span> {selectedApp.interested_roles.join(", ")}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div><span className="text-muted-foreground">Worked with USAG before:</span> {selectedApp.worked_with_usag_before ? "Yes" : "No"}</div>
                        {selectedApp.positions && selectedApp.positions.length > 0 && (
                          <div><span className="text-muted-foreground">Positions:</span> {selectedApp.positions.join(", ")}</div>
                        )}
                      </>
                    )}
                    {selectedApp.experience && <div><span className="text-muted-foreground">Experience:</span> {selectedApp.experience}</div>}
                  </CardContent>
                </Card>

                {/* Logistics */}
                <Card>
                  <CardHeader className="py-3"><CardTitle className="text-sm">Logistics & Payment</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2 text-sm pb-4">
                    {selectedApp.shirt_size && <div><span className="text-muted-foreground">Shirt:</span> {selectedApp.shirt_size}</div>}
                    {selectedApp.travel_radius && <div><span className="text-muted-foreground">Travel:</span> {selectedApp.travel_radius}</div>}
                    {selectedApp.payment_method && <div><span className="text-muted-foreground">Payment:</span> {selectedApp.payment_method}</div>}
                    {selectedApp.pay_address && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Pay Address:</span> {selectedApp.pay_address}, {selectedApp.pay_city}, {selectedApp.pay_state} {selectedApp.pay_zip}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Admin Notes */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Admin Notes</label>
                  <Textarea
                    defaultValue={selectedApp.admin_notes || ""}
                    placeholder="Add notes about this applicant..."
                    rows={3}
                    onBlur={(e) => updateNotes(selectedApp.id, e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StaffOps;
