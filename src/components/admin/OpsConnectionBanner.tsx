import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { opsSupabase } from "@/lib/opsSupabase";

interface Props {
  onReconnected?: () => void;
}

export const OpsConnectionBanner = ({ onReconnected }: Props) => {
  const { opsConnected, opsError, reconnectOps, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  if (opsConnected) return null;

  const sendReset = async () => {
    const email = user?.email;
    if (!email) {
      toast.error("Not signed in");
      return;
    }
    setSendingReset(true);
    const { error } = await opsSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?ops=1`,
    });
    setSendingReset(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Password reset email sent to ${email}`);
  };

  const submit = async () => {
    if (!password) {
      toast.error("Enter your ops password");
      return;
    }
    setSubmitting(true);
    const { error } = await reconnectOps(password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Ops database connected");
    setPassword("");
    setOpen(false);
    onReconnected?.();
  };

  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm">
        <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
        <div className="flex-1 text-red-800">
          <div className="font-semibold">Ops database not connected — task data unavailable</div>
          {opsError && (
            <div className="text-xs text-red-700/80 mt-0.5">Error: {opsError}</div>
          )}
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
          Connect
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Connect ops database</DialogTitle>
            <DialogDescription>
              Enter the ops-project password for {user?.email ?? "your account"} to enable task data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={sendReset}
            disabled={sendingReset}
            className="text-xs text-primary hover:underline text-left disabled:opacity-60"
          >
            {sendingReset ? "Sending reset email…" : "Forgot ops password?"}
          </button>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
