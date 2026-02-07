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
  Trash2,
  Archive,
  Share2,
  Twitter,
  Linkedin,
  Instagram,
  AlertTriangle,
  Pencil,
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
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox";

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
  twitter_post: string | null;
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

const WIRE_OUTLETS = [
  { id: "prlog", name: "PRLog" },
  { id: "issuewire", name: "IssueWire" },
  { id: "onlineprmedia", name: "OnlinePRMedia" },
  { id: "prnewswire", name: "PR Newswire" },
  { id: "businesswire", name: "Business Wire" },
];

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

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prToDelete, setPrToDelete] = useState<PressRelease | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Archive dialog state
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [prToArchive, setPrToArchive] = useState<PressRelease | null>(null);

  // Distribution dialog state
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [prToDistribute, setPrToDistribute] = useState<PressRelease | null>(null);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);

  // Social distribution dialog state
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [prForSocial, setPrForSocial] = useState<PressRelease | null>(null);
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<string[]>([]);
  const [isPostingToTwitter, setIsPostingToTwitter] = useState(false);
  const [isPostingToInstagram, setIsPostingToInstagram] = useState(false);

  // Edit social captions state
  const [editSocialOpen, setEditSocialOpen] = useState(false);
  const [prToEdit, setPrToEdit] = useState<PressRelease | null>(null);
  const [editedCaptions, setEditedCaptions] = useState({
    twitter_post: "",
    linkedin_post: "",
    instagram_caption: "",
  });

  // All hooks MUST be called before any conditional returns
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
    enabled: !!user && isAdmin,
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_releases")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      setDeleteDialogOpen(false);
      setPrToDelete(null);
      setDeleteConfirmText("");
      toast.success("Press release deleted permanently!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_releases")
        .update({ status: "archived" as PressReleaseStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      setArchiveDialogOpen(false);
      setPrToArchive(null);
      toast.success("Press release archived!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive: ${error.message}`);
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
    mutationFn: async ({ id, outlets }: { id: string; outlets: string[] }) => {
      const { data: current } = await supabase
        .from("press_releases")
        .select("approval_note")
        .eq("id", id)
        .single();

      const timestamp = new Date().toISOString();
      const outletNames = outlets.map(o => WIRE_OUTLETS.find(w => w.id === o)?.name || o).join(", ");
      const newNote = current?.approval_note
        ? `${current.approval_note}\nSubmitted to ${outletNames}: ${timestamp}`
        : `Submitted to ${outletNames}: ${timestamp}`;

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
      setDistributionDialogOpen(false);
      setPrToDistribute(null);
      setSelectedOutlets([]);
      toast.success("Marked as submitted to selected outlets!");
    },
  });

  const updateCaptionsMutation = useMutation({
    mutationFn: async ({ id, captions }: { id: string; captions: typeof editedCaptions }) => {
      const { error } = await supabase
        .from("press_releases")
        .update({
          twitter_post: captions.twitter_post,
          linkedin_post: captions.linkedin_post,
          instagram_caption: captions.instagram_caption,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      setEditSocialOpen(false);
      setPrToEdit(null);
      toast.success("Social captions updated!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update captions: ${error.message}`);
    },
  });

  const postToTwitterMutation = useMutation({
    mutationFn: async ({ id, customText }: { id: string; customText?: string }) => {
      const { data, error } = await supabase.functions.invoke("post-to-twitter", {
        body: { pressReleaseId: id, customText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Posted to Twitter!", {
        action: data?.tweetUrl ? {
          label: "View Tweet",
          onClick: () => window.open(data.tweetUrl, "_blank"),
        } : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to post to Twitter: ${error.message}`);
    },
  });

  const postToInstagramMutation = useMutation({
    mutationFn: async ({ id, customCaption, imageUrl }: { id: string; customCaption?: string; imageUrl: string }) => {
      const { data, error } = await supabase.functions.invoke("post-to-instagram", {
        body: { pressReleaseId: id, customCaption, imageUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-releases"] });
      toast.success("Posted to Instagram!", {
        action: data?.postUrl ? {
          label: "View Post",
          onClick: () => window.open(data.postUrl, "_blank"),
        } : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to post to Instagram: ${error.message}`);
    },
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const openDeleteDialog = (pr: PressRelease) => {
    setPrToDelete(pr);
    setDeleteConfirmText("");
    setDeleteDialogOpen(true);
  };

  const openArchiveDialog = (pr: PressRelease) => {
    setPrToArchive(pr);
    setArchiveDialogOpen(true);
  };

  const openDistributionDialog = (pr: PressRelease) => {
    setPrToDistribute(pr);
    setSelectedOutlets([]);
    setDistributionDialogOpen(true);
  };

  const openSocialDialog = (pr: PressRelease) => {
    setPrForSocial(pr);
    setSelectedSocialPlatforms([]);
    setSocialDialogOpen(true);
  };

  const openEditSocialDialog = (pr: PressRelease) => {
    setPrToEdit(pr);
    setEditedCaptions({
      twitter_post: pr.twitter_post || "",
      linkedin_post: pr.linkedin_post || "",
      instagram_caption: pr.instagram_caption || "",
    });
    setEditSocialOpen(true);
  };

  const handlePostToTwitter = async (pr: PressRelease, customText?: string) => {
    postToTwitterMutation.mutate({ id: pr.id, customText });
  };

  const handlePostToInstagram = async (pr: PressRelease, customCaption?: string) => {
    if (!pr.og_image_url) {
      toast.error("Instagram requires an image. Please add an OG image first.");
      return;
    }
    postToInstagramMutation.mutate({ id: pr.id, customCaption, imageUrl: pr.og_image_url });
  };

  const handleOutletToggle = (outletId: string) => {
    setSelectedOutlets(prev => 
      prev.includes(outletId) 
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId]
    );
  };

  const handleSocialPlatformToggle = (platform: string) => {
    setSelectedSocialPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const stats = {
    total: pressReleases?.length || 0,
    draft: pressReleases?.filter((p) => p.status === "draft").length || 0,
    ready: pressReleases?.filter((p) => p.status === "ready_for_review").length || 0,
    approved: pressReleases?.filter((p) => p.status === "approved").length || 0,
    published: pressReleases?.filter((p) => p.status === "published").length || 0,
    archived: pressReleases?.filter((p) => p.status === "archived").length || 0,
  };

  // Conditional returns AFTER all hooks
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
    return null;
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

  const canDelete = prToDelete && deleteConfirmText === prToDelete.title;

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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Archived
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <p className="text-2xl font-bold text-gray-400">{stats.archived}</p>
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
                        <div className="flex justify-end gap-2 flex-wrap">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDistributionDialog(pr)}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Distribute
                            </Button>
                          )}

                          {pr.status === "published" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSocialDialog(pr)}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Social
                            </Button>
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

                          {pr.status !== "archived" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openArchiveDialog(pr)}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(pr)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Delete Press Release
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the press release from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                To confirm, type the title of the press release:
              </p>
              <p className="font-medium text-sm bg-muted p-2 rounded break-all">
                {prToDelete?.title}
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type the title to confirm"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => prToDelete && deleteMutation.mutate(prToDelete.id)}
                disabled={!canDelete || deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Confirmation Dialog */}
        <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive Press Release
              </DialogTitle>
              <DialogDescription>
                Archiving will hide this press release from the public site. You can still view it in the admin panel.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">{prToArchive?.title}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => prToArchive && archiveMutation.mutate(prToArchive.id)}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="w-4 h-4 mr-2" />
                )}
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Distribution Dialog */}
        <Dialog open={distributionDialogOpen} onOpenChange={setDistributionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Distribute to Wire Services
              </DialogTitle>
              <DialogDescription>
                Select the outlets you've submitted this press release to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="font-medium text-sm">{prToDistribute?.title}</p>
              <div className="space-y-3">
                {WIRE_OUTLETS.map((outlet) => (
                  <div key={outlet.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={outlet.id}
                      checked={selectedOutlets.includes(outlet.id)}
                      onCheckedChange={() => handleOutletToggle(outlet.id)}
                    />
                    <label
                      htmlFor={outlet.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {outlet.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDistributionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => prToDistribute && markSubmittedMutation.mutate({ id: prToDistribute.id, outlets: selectedOutlets })}
                disabled={selectedOutlets.length === 0 || markSubmittedMutation.isPending}
              >
                {markSubmittedMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Mark as Submitted ({selectedOutlets.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Social Distribution Dialog */}
        <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Social Media Distribution
              </DialogTitle>
              <DialogDescription>
                Preview and distribute content to social media platforms.
              </DialogDescription>
            </DialogHeader>
            {prForSocial && (
              <div className="space-y-6 py-4">
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      openEditSocialDialog(prForSocial);
                      setSocialDialogOpen(false);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Captions
                  </Button>
                </div>
                <Tabs defaultValue="twitter" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="twitter" className="space-y-4 mt-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold">USA</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">USA Grappling</span>
                            <span className="text-muted-foreground text-xs">@USAGrappling</span>
                          </div>
                          <p className="text-sm mt-2 whitespace-pre-wrap">
                            {prForSocial.twitter_post || prForSocial.wire_summary || prForSocial.summary || "No content available"}
                          </p>
                          {prForSocial.og_image_url && (
                            <img
                              src={prForSocial.og_image_url}
                              alt="Preview"
                              className="mt-3 rounded-lg max-h-48 object-cover w-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => copyToClipboard(
                          prForSocial.twitter_post || `${prForSocial.wire_summary || prForSocial.summary || ""}\n\n🔗 Read more: https://usagrappling.lovable.app/news/${prForSocial.slug}`,
                          "Twitter post"
                        )}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handlePostToTwitter(prForSocial)}
                        disabled={postToTwitterMutation.isPending}
                      >
                        {postToTwitterMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Twitter className="w-4 h-4 mr-2" />
                        )}
                        Post to X
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="linkedin" className="space-y-4 mt-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold">USA</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-sm">USA Grappling</span>
                          <p className="text-xs text-muted-foreground">National Governing Body</p>
                          <p className="text-sm mt-3 whitespace-pre-wrap">
                            {prForSocial.linkedin_post || prForSocial.summary || "No LinkedIn post generated"}
                          </p>
                          {prForSocial.og_image_url && (
                            <img
                              src={prForSocial.og_image_url}
                              alt="Preview"
                              className="mt-3 rounded-lg max-h-48 object-cover w-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => copyToClipboard(prForSocial.linkedin_post || prForSocial.summary || "", "LinkedIn post")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button disabled className="flex-1">
                        <Linkedin className="w-4 h-4 mr-2" />
                        Post to LinkedIn (Coming Soon)
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="instagram" className="space-y-4 mt-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="max-w-sm mx-auto">
                        {prForSocial.og_image_url ? (
                          <img
                            src={prForSocial.og_image_url}
                            alt="Preview"
                            className="rounded-lg aspect-square object-cover w-full"
                          />
                        ) : (
                          <div className="aspect-square bg-background rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="mt-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {prForSocial.instagram_caption || "No Instagram caption generated"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => copyToClipboard(prForSocial.instagram_caption || "", "Instagram caption")}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Caption
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handlePostToInstagram(prForSocial)}
                        disabled={postToInstagramMutation.isPending || !prForSocial.og_image_url}
                      >
                        {postToInstagramMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Instagram className="w-4 h-4 mr-2" />
                        )}
                        {prForSocial.og_image_url ? "Post to Instagram" : "No Image Available"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSocialDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Social Captions Dialog */}
        <Dialog open={editSocialOpen} onOpenChange={setEditSocialOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Social Captions
              </DialogTitle>
              <DialogDescription>
                Edit the social media captions for this press release.
              </DialogDescription>
            </DialogHeader>
            {prToEdit && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="twitter_post" className="flex items-center gap-2 mb-2">
                    <Twitter className="w-4 h-4" />
                    Twitter/X Post
                  </Label>
                  <Textarea
                    id="twitter_post"
                    value={editedCaptions.twitter_post}
                    onChange={(e) => setEditedCaptions({ ...editedCaptions, twitter_post: e.target.value })}
                    placeholder="Enter Twitter/X post content..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {editedCaptions.twitter_post.length}/280 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="linkedin_post" className="flex items-center gap-2 mb-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Post
                  </Label>
                  <Textarea
                    id="linkedin_post"
                    value={editedCaptions.linkedin_post}
                    onChange={(e) => setEditedCaptions({ ...editedCaptions, linkedin_post: e.target.value })}
                    placeholder="Enter LinkedIn post content..."
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_caption" className="flex items-center gap-2 mb-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Caption
                  </Label>
                  <Textarea
                    id="instagram_caption"
                    value={editedCaptions.instagram_caption}
                    onChange={(e) => setEditedCaptions({ ...editedCaptions, instagram_caption: e.target.value })}
                    placeholder="Enter Instagram caption..."
                    rows={5}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditSocialOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => prToEdit && updateCaptionsMutation.mutate({ id: prToEdit.id, captions: editedCaptions })}
                disabled={updateCaptionsMutation.isPending}
              >
                {updateCaptionsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Save Captions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
