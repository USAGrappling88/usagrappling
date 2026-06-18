import { useState } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Facebook,
  Instagram,
  Mail,
  Send,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Channel = "fb" | "ig" | "email";

type ResultMap = Record<string, { ok: boolean; detail: string }>;

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
  const [imageUrl, setImageUrl] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<ResultMap | null>(null);

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

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Enter a message"); return; }
    if (channels.size === 0) { toast.error("Select at least one channel"); return; }
    if (channels.has("email") && !emailSubject.trim()) { toast.error("Enter an email subject"); return; }
    if (channels.has("ig") && !imageUrl.trim()) { toast.error("Instagram requires an image URL"); return; }

    setSending(true);
    setResults(null);
    const newResults: ResultMap = {};

    if (channels.has("fb") || channels.has("ig")) {
      let platforms = "fb";
      if (channels.has("fb") && channels.has("ig")) platforms = "both";
      else if (channels.has("ig")) platforms = "ig";

      try {
        const { data, error } = await opsSupabase.functions.invoke("post-to-social", {
          body: { message, platforms, image_url: imageUrl || undefined },
        });

        if (error) {
          if (channels.has("fb")) newResults.facebook = { ok: false, detail: error.message };
          if (channels.has("ig")) newResults.instagram = { ok: false, detail: error.message };
        } else {
          if (data?.results?.facebook) {
            const fb = data.results.facebook;
            newResults.facebook = {
              ok: !!fb.id,
              detail: fb.id ? `Posted (ID: ${fb.id})` : fb.error?.message || "Failed",
            };
          }
          if (data?.results?.instagram) {
            const ig = data.results.instagram;
            newResults.instagram = {
              ok: !!ig.id,
              detail: ig.id ? `Posted (ID: ${ig.id})` : ig.error || "Failed",
            };
          }
        }
      } catch (err) {
        if (channels.has("fb")) newResults.facebook = { ok: false, detail: String(err) };
        if (channels.has("ig")) newResults.instagram = { ok: false, detail: String(err) };
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
          const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#002868;color:#fff;padding:16px;text-align:center;font-weight:bold;">USA Grappling</div>
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
      } catch (err) {
        newResults.email = { ok: false, detail: String(err) };
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
          <ImageIcon className="w-3 h-3" /> Image URL
          {channels.has("ig") && <span className="text-red-500 text-xs ml-1">required for Instagram</span>}
          {!channels.has("ig") && <span className="text-xs text-muted-foreground ml-1">(optional)</span>}
        </label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (publicly accessible image URL)"
          className="mt-1"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={sending || channels.size === 0 || !message.trim()}
        className="w-full"
        size="lg"
      >
        {sending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
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
