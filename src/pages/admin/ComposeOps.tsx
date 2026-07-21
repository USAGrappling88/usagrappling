import { useState, useRef } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Facebook,
  Instagram,
  Mail,
  Send,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Channel = "fb" | "ig" | "email";
type MediaType = "image" | "video";

type ResultMap = Record<string, { ok: boolean; detail: string }>;

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB
const ACCEPTED = "image/jpeg,image/png,image/jpg,video/mp4,video/quicktime";

const TEMPLATES = [
  {
    id: "event_promo",
    label: "Event Promo",
    text: "🥋 USA Grappling is hosting an upcoming event! Register now at usagrappling.com and compete at the highest level of sport jiu jitsu and grappling. Limited spots available — don't miss your chance to represent!",
  },
  {
    id: "membership",
    label: "USAG/AAU Membership",
    text: "🏆 Did you know a USA Grappling / AAU membership includes $1M liability insurance, access to sanctioned competitions, and exclusive athlete benefits? Join the national community today at usagrappling.com/membership",
  },
  {
    id: "japan_qualifier",
    label: "Japan Qualifier",
    text: "🇯🇵 Attention youth grapplers (U11–U17)! USA Grappling is hosting the Japan Open Qualifier. Win your division and earn a sponsored trip to compete in Japan as part of Team USA! SJJIF Rules · Gi only. Register at usagrappling.com",
  },
  {
    id: "general",
    label: "General Update",
    text: "Stay connected with USA Grappling — the national governing body for sport jiu jitsu, grappling, and catch wrestling. Follow us for event updates, results, and athlete news.",
  },
];

export const ComposePanel = () => {
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["fb"]));
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<ResultMap | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleChannel = (ch: Channel) => {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const applyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (tpl) setMessage(tpl.text);
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error("File exceeds 200 MB limit");
      return;
    }
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Only jpg/png images and mp4/mov videos are supported");
      return;
    }

    setUploading(true);
    setUploadPct(5);
    const timer = setInterval(() => {
      setUploadPct((p) => (p < 90 ? p + Math.max(1, Math.round((90 - p) / 10)) : p));
    }, 300);

    try {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `social/${Date.now()}-${safeName}`;
      const { error: upErr } = await opsSupabase.storage
        .from("content-media")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

      if (upErr) throw upErr;

      const { data: pub } = opsSupabase.storage.from("content-media").getPublicUrl(path);
      setMediaUrl(pub.publicUrl);
      setMediaType(isVideo ? "video" : "image");
      setUploadPct(100);
      toast.success("Media uploaded");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || err}`);
      setUploadPct(0);
    } finally {
      clearInterval(timer);
      setUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaUrl("");
    setMediaType(null);
    setUploadPct(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUrlPaste = (url: string) => {
    setMediaUrl(url);
    if (!url) { setMediaType(null); return; }
    const isVideo = /\.(mp4|mov|m4v|webm)(\?|$)/i.test(url);
    setMediaType(isVideo ? "video" : "image");
  };

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Enter a message"); return; }
    if (channels.size === 0) { toast.error("Select at least one channel"); return; }
    if (channels.has("email") && !emailSubject.trim()) { toast.error("Enter an email subject"); return; }
    if (channels.has("ig") && !mediaUrl.trim()) { toast.error("Instagram requires an image or video"); return; }

    setSending(true);
    setResults(null);
    const newResults: ResultMap = {};

    const igIsVideo = mediaType === "video";

    if (channels.has("fb") || channels.has("ig")) {
      let platforms = "fb";
      if (channels.has("fb") && channels.has("ig")) platforms = "both";
      else if (channels.has("ig")) platforms = "ig";

      try {
        const { data, error } = await opsSupabase.functions.invoke("post-to-social", {
          body: {
            message,
            platforms,
            media_url: mediaUrl || undefined,
            media_type: mediaUrl ? mediaType : undefined,
            // legacy field for backward-compat
            image_url: mediaUrl && mediaType === "image" ? mediaUrl : undefined,
          },
        });

        if (error) {
          if (channels.has("fb")) newResults.facebook = { ok: false, detail: error.message };
          if (channels.has("ig")) newResults.instagram = { ok: false, detail: error.message };
        } else {
          if (data?.results?.facebook) {
            const fb = data.results.facebook;
            newResults.facebook = {
              ok: !!(fb.id || fb.post_id),
              detail: fb.id || fb.post_id ? `Posted (ID: ${fb.id || fb.post_id})` : fb.error?.message || fb.error || "Failed",
            };
          }
          if (data?.results?.instagram) {
            const ig = data.results.instagram;
            newResults.instagram = {
              ok: !!ig.id,
              detail: ig.id
                ? `Posted${igIsVideo ? " as Reel" : ""} (ID: ${ig.id})`
                : ig.error?.message || ig.error || "Failed",
            };
          }
        }
      } catch (err: any) {
        if (channels.has("fb")) newResults.facebook = { ok: false, detail: err?.message || String(err) };
        if (channels.has("ig")) newResults.instagram = { ok: false, detail: err?.message || String(err) };
      }
    }

    if (channels.has("email")) {
      try {
        const { data: emailTargets } = await opsSupabase
          .from("marketing_targets")
          .select("email, name")
          .not("email", "is", null)
          .neq("status", "not_interested");

        const emails = (emailTargets || [])
          .map((t: { email: string | null }) => t.email)
          .filter((e): e is string => !!e);

        if (emails.length === 0) {
          newResults.email = { ok: false, detail: "No targets with email addresses found" };
        } else {
          const safe = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
          const mediaBlock = mediaUrl && mediaType === "image"
            ? `<div style="padding:0 20px;"><img src="${mediaUrl}" style="max-width:100%;border-radius:6px;" /></div>`
            : "";
          const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#002868;color:#fff;padding:16px;text-align:center;font-weight:bold;">USA Grappling</div>
            ${mediaBlock}
            <div style="padding:20px;color:#111;line-height:1.5;">${safe}</div>
            <div style="padding:12px;font-size:12px;color:#666;text-align:center;border-top:1px solid #eee;">
              USA Grappling · usagrappling.com
            </div>
          </div>`;

          const { data, error } = await opsSupabase.functions.invoke("send-email", {
            body: { to: emails, subject: emailSubject, html, from_name: "USA Grappling" },
          });

          if (error) {
            newResults.email = { ok: false, detail: error.message };
          } else {
            newResults.email = {
              ok: true,
              detail: `Sent to ${data?.sent || emails.length} recipients`,
            };
          }
        }
      } catch (err: any) {
        newResults.email = { ok: false, detail: err?.message || String(err) };
      }
    }

    const successChannels = Object.entries(newResults)
      .filter(([, r]) => r.ok)
      .map(([ch]) => ch);

    if (successChannels.length > 0) {
      await opsSupabase.from("outreach_log").insert({
        channel: successChannels.join("+"),
        message_sent: message,
        contacted_at: new Date().toISOString(),
        status: "sent",
        notes: "Broadcast via Compose tab",
      });
    }

    setResults(newResults);
    setSending(false);

    const allOk = Object.values(newResults).every((r) => r.ok);
    if (allOk) toast.success("All posts sent successfully!");
    else toast.warning("Some channels had issues — check results below");
  };

  const channelConfig: { id: Channel; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "fb", label: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "bg-blue-600" },
    { id: "ig", label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "bg-pink-600" },
    { id: "email", label: "Email Blast", icon: <Mail className="w-4 h-4" />, color: "bg-green-600" },
  ];

  const igPostingVideo = channels.has("ig") && mediaType === "video" && sending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Compose</h2>
        <p className="text-sm text-muted-foreground">
          Post to USAG social accounts or send email blast to all targets with email addresses.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {channelConfig.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => toggleChannel(ch.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
              channels.has(ch.id)
                ? `${ch.color} text-white border-transparent`
                : "bg-background text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {ch.icon}
            {ch.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium">Templates</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {TEMPLATES.map((tpl) => (
            <Button
              key={tpl.id}
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(tpl.id)}
              className="text-xs"
            >
              {tpl.label}
            </Button>
          ))}
        </div>
      </div>

      {channels.has("email") && (
        <div>
          <label className="text-sm font-medium">Email Subject</label>
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="e.g. USA Grappling Event — Register Now"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Message</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Write your post or select a template above..."
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">{message.length} characters</p>
      </div>

      <div>
        <label className="text-sm font-medium flex items-center gap-1">
          Media
          {channels.has("ig") && <span className="text-red-500 text-xs ml-1">required for Instagram</span>}
          {!channels.has("ig") && <span className="text-xs text-muted-foreground ml-1">(optional)</span>}
        </label>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {!mediaUrl && !uploading && (
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-foreground/40 hover:bg-muted/40 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <div className="text-sm font-medium">Upload media</div>
              <div className="text-xs text-muted-foreground">JPG, PNG, MP4, or MOV · up to 200 MB</div>
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              or paste URL
            </button>
            {showUrlInput && (
              <Input
                value={mediaUrl}
                onChange={(e) => handleUrlPaste(e.target.value)}
                placeholder="https://... (publicly accessible media URL)"
              />
            )}
          </div>
        )}

        {uploading && (
          <div className="mt-2 space-y-2">
            <Progress value={uploadPct} />
            <p className="text-xs text-muted-foreground">Uploading… {uploadPct}%</p>
          </div>
        )}

        {mediaUrl && !uploading && (
          <div className="mt-2 space-y-2">
            <div className="relative rounded-lg overflow-hidden border border-border bg-muted/40">
              {mediaType === "video" ? (
                <video src={mediaUrl} controls className="w-full max-h-80 bg-black" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full max-h-80 object-contain" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1"
                aria-label="Remove media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground break-all">
              {mediaType === "video" ? "🎬 Video" : "🖼️ Image"} · {mediaUrl}
            </p>
          </div>
        )}
      </div>

      {channels.has("ig") && mediaType === "video" && (
        <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded p-3">
          ℹ️ Instagram videos post as <strong>Reels</strong> and can take up to ~2 minutes to process.
          The publish step will wait for Instagram to finish encoding before returning.
          Facebook video posts are immediate.
        </div>
      )}

      <Button
        onClick={handleSend}
        disabled={sending || uploading || channels.size === 0 || !message.trim()}
        className="w-full"
        size="lg"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {igPostingVideo ? "Publishing… video is processing on Instagram" : "Sending..."}
          </>
        ) : (
          <><Send className="w-4 h-4 mr-2" /> Send to {[...channels].map(c => c === "fb" ? "Facebook" : c === "ig" ? "Instagram" : "Email").join(" + ")}</>
        )}
      </Button>

      {results && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Send Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(results).map(([channel, result]) => (
              <div key={channel} className="flex items-start gap-2 text-sm">
                {result.ok
                  ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                <div>
                  <span className="font-medium capitalize">{channel}:</span>{" "}
                  <span className={result.ok ? "text-green-700" : "text-red-600"}>{result.detail}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComposePanel;
