import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Plus,
  RefreshCw,
  Eye,
  Loader2,
  Upload,
  Image as ImageIcon,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PressReleaseStatus = "draft" | "ready_for_review" | "approved" | "published" | "archived";
type DistributionStatus = "not_started" | "prepared" | "approved_to_submit" | "submitted_manual" | "submitted_auto" | "published_on_wires";

interface PressRelease {
  id: string;
  title: string;
  slug: string;
  status: PressReleaseStatus;
  distribution_status: DistributionStatus;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
  summary: string | null;
  body_html: string | null;
  category: string | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image_url: string | null;
  robots_index: boolean | null;
  approval_note: string | null;
  one_click_approve: boolean | null;
  utm_campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  linkedin_post: string | null;
  instagram_caption: string | null;
  pitch_email: string | null;
  wire_summary: string | null;
  wire_title: string | null;
  wire_keywords: string | null;
}

const statusColors: Record<PressReleaseStatus, string> = {
  draft: "bg-gray-500",
  ready_for_review: "bg-yellow-500",
  approved: "bg-blue-500",
  published: "bg-green-500",
  archived: "bg-gray-400",
};

const distributionColors: Record<DistributionStatus, string> = {
  not_started: "bg-gray-400",
  prepared: "bg-yellow-500",
  approved_to_submit: "bg-blue-500",
  submitted_manual: "bg-purple-500",
  submitted_auto: "bg-indigo-500",
  published_on_wires: "bg-green-500",
};

const PressOps = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PressRelease | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPR, setNewPR] = useState({
    title: "",
    summary: "",
    body_html: "",
    category: "",
    og_image_url: "",
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show access denied if not admin
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-destructive/10 rounded-full">
              <ShieldAlert className="w-12 h-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges to access this page. Contact an administrator to request access.
          </p>
          <Button variant="outline" onClick={() => signOut().then(() => navigate('/'))}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Layout>
    );
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `press-releases/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('press-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('press-images')
        .getPublicUrl(filePath);

      setNewPR({ ...newPR, og_image_url: data.publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const { data: pressReleases, isLoading } = useQuery({
    queryKey: ["admin-press-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PressRelease[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (pr: typeof newPR) => {
      const slug = pr.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 80);

      const { data, error } = await supabase
        .from("press_releases")
        .insert({
          title: pr.title,
          slug,
          summary: pr.summary || null,
          body_html: pr.body_html || null,
          category: pr.category || null,
          og_image_url: pr.og_image_url || null,
          status: "draft" as PressReleaseStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      setIsCreateOpen(false);
      setNewPR({ title: "", summary: "", body_html: "", category: "", og_image_url: "" });
      toast.success("Press release created!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      additionalFields,
    }: {
      id: string;
      status: PressReleaseStatus;
      additionalFields?: Partial<PressRelease>;
    }) => {
      const updateData: Record<string, unknown> = { status, ...additionalFields };

      // If moving to ready_for_review, trigger content generation
      if (status === "ready_for_review") {
        const { error: funcError } = await supabase.functions.invoke(
          "generate-press-content",
          { body: { pressReleaseId: id } }
        );
        if (funcError) {
          console.error("Content generation error:", funcError);
        }
      }

      const { error } = await supabase
        .from("press_releases")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Status updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const timestamp = new Date().toISOString();
      const { data: current } = await supabase
        .from("press_releases")
        .select("approval_note")
        .eq("id", id)
        .single();

      const newNote = current?.approval_note
        ? `${current.approval_note}\nApproved: ${timestamp}`
        : `Approved: ${timestamp}`;

      const { error } = await supabase
        .from("press_releases")
        .update({
          status: "approved" as PressReleaseStatus,
          one_click_approve: true,
          distribution_status: "approved_to_submit" as DistributionStatus,
          approval_note: newNote,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Approved for distribution!");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_releases")
        .update({
          status: "published" as PressReleaseStatus,
          publish_date: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Published!");
    },
  });

  const markSubmittedMutation = useMutation({
    mutationFn: async ({ id, service }: { id: string; service: string }) => {
      const { data: current } = await supabase
        .from("press_releases")
        .select("approval_note")
        .eq("id", id)
        .single();

      const timestamp = new Date().toISOString();
      const newNote = current?.approval_note
        ? `${current.approval_note}\nSubmitted to ${service}: ${timestamp}`
        : `Submitted to ${service}: ${timestamp}`;

      const { error } = await supabase
        .from("press_releases")
        .update({
          distribution_status: "submitted_manual" as DistributionStatus,
          approval_note: newNote,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Marked as submitted!");
    },
  });

  const copyWirePack = (pr: PressRelease) => {
    const wirePack = `WIRE TITLE: ${pr.wire_title || pr.title}

WIRE SUMMARY: ${pr.wire_summary || pr.summary || ""}

KEYWORDS: ${pr.wire_keywords || ""}

---

LINKEDIN POST:
${pr.linkedin_post || ""}

---

INSTAGRAM CAPTION:
${pr.instagram_caption || ""}

---

PITCH EMAIL:
${pr.pitch_email || ""}

---

CANONICAL URL: ${pr.canonical_url || `https://www.usa-grappling.com/news/${pr.slug}`}
`;

    navigator.clipboard.writeText(wirePack);
    toast.success("Wire pack copied to clipboard!");
  };

  const stats = {
    total: pressReleases?.length || 0,
    draft: pressReleases?.filter((p) => p.status === "draft").length || 0,
    ready: pressReleases?.filter((p) => p.status === "ready_for_review").length || 0,
    approved: pressReleases?.filter((p) => p.status === "approved").length || 0,
    published: pressReleases?.filter((p) => p.status === "published").length || 0,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Press Operations</h1>
            <p className="text-muted-foreground">
              Manage press releases, approvals, and distribution
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => signOut().then(() => navigate('/'))}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Press Release
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Press Release</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newPR.title}
                    onChange={(e) => setNewPR({ ...newPR, title: e.target.value })}
                    placeholder="Press release title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newPR.category}
                    onChange={(e) => setNewPR({ ...newPR, category: e.target.value })}
                    placeholder="e.g., Competition, Announcement, Partnership"
                  />
                </div>
                <div>
                  <Label htmlFor="og_image">Featured Image</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="og_image"
                        value={newPR.og_image_url}
                        onChange={(e) => setNewPR({ ...newPR, og_image_url: e.target.value })}
                        placeholder="https://... or upload below"
                        className="flex-1"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {newPR.og_image_url && (
                      <div className="relative rounded-md overflow-hidden border bg-muted">
                        <img 
                          src={newPR.og_image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={newPR.summary}
                    onChange={(e) => setNewPR({ ...newPR, summary: e.target.value })}
                    placeholder="Brief summary of the press release"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="body">Body (HTML)</Label>
                  <Textarea
                    id="body"
                    value={newPR.body_html}
                    onChange={(e) => setNewPR({ ...newPR, body_html: e.target.value })}
                    placeholder="<p>Full press release content...</p>"
                    rows={8}
                  />
                </div>
                <Button
                  onClick={() => createMutation.mutate(newPR)}
                  disabled={!newPR.title || createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Press Release
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ready for Review
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold text-yellow-500">{stats.ready}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold text-blue-500">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold text-green-500">{stats.published}</p>
            </CardContent>
          </Card>
        </div>

        {/* Press Releases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Press Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Distribution</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pressReleases?.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {pr.title}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[pr.status]}>
                          {pr.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={distributionColors[pr.distribution_status]}>
                          {pr.distribution_status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(pr.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {pr.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: pr.id,
                                  status: "ready_for_review",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Generate
                            </Button>
                          )}

                          {pr.status === "ready_for_review" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => approveMutation.mutate(pr.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}

                          {pr.status === "approved" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => publishMutation.mutate(pr.id)}
                              disabled={publishMutation.isPending}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          )}

                          {pr.distribution_status === "approved_to_submit" && (
                            <Select
                              onValueChange={(service) =>
                                markSubmittedMutation.mutate({ id: pr.id, service })
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Mark Submitted" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PRLog">PRLog</SelectItem>
                                <SelectItem value="IssueWire">IssueWire</SelectItem>
                                <SelectItem value="OnlinePRMedia">OnlinePRMedia</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyWirePack(pr)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPR(pr)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {pr.status === "published" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`/news/${pr.slug}`, "_blank")
                              }
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selectedPR} onOpenChange={() => setSelectedPR(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPR?.title}</DialogTitle>
            </DialogHeader>
            {selectedPR && (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="wire">Wire</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label>Summary</Label>
                    <p className="text-muted-foreground">
                      {selectedPR.summary || "No summary"}
                    </p>
                  </div>
                  <div>
                    <Label>Body</Label>
                    <div
                      className="prose prose-sm max-w-none mt-2 p-4 bg-muted rounded-lg"
                      dangerouslySetInnerHTML={{
                        __html: selectedPR.body_html || "<p>No content</p>",
                      }}
                    />
                  </div>
                  <div>
                    <Label>Approval Notes</Label>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {selectedPR.approval_note || "No notes"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4">
                  <div>
                    <Label>LinkedIn Post</Label>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {selectedPR.linkedin_post || "Not generated"}
                    </pre>
                  </div>
                  <div>
                    <Label>Instagram Caption</Label>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {selectedPR.instagram_caption || "Not generated"}
                    </pre>
                  </div>
                  <div>
                    <Label>Pitch Email</Label>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {selectedPR.pitch_email || "Not generated"}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="wire" className="space-y-4">
                  <div>
                    <Label>Wire Title</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.wire_title || "Not generated"}
                    </p>
                  </div>
                  <div>
                    <Label>Wire Summary</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.wire_summary || "Not generated"}
                    </p>
                  </div>
                  <div>
                    <Label>Wire Keywords</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.wire_keywords || "Not generated"}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label>Meta Title</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.meta_title || "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.meta_description || "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label>Canonical URL</Label>
                    <p className="bg-muted p-4 rounded-lg">
                      {selectedPR.canonical_url || "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label>OG Image</Label>
                    {selectedPR.og_image_url ? (
                      <img
                        src={selectedPR.og_image_url}
                        alt="OG"
                        className="max-w-md rounded-lg mt-2"
                      />
                    ) : (
                      <p className="text-muted-foreground">Not set</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PressOps;
