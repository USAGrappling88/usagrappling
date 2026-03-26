import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trophy, CheckCircle } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const YOUTH_SIZES = ["Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL", "Youth 2XL"];
const ALL_RASHGUARD_SIZES = [...YOUTH_SIZES, ...SIZES];

const WorldTeamPetition = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    membership_number: "",
    first_name: "",
    last_name: "",
    dob: "",
    sex: "",
    competition_weight_kg: "",
    belt_ranking: "",
    notable_accomplishments: "",
    self_fund: false,
    style: "",
    competition_type: "",
    rashguard_size: "",
    short_size: "",
    shirt_size: "",
    hoodie_size: "",
    pants_size: "",
  });

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.first_name || !form.last_name || !form.dob || !form.sex || !form.competition_weight_kg || !form.style || !form.competition_type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await (supabase.from("world_team_petitions" as any).insert({
      email: form.email,
      membership_number: form.membership_number || null,
      first_name: form.first_name,
      last_name: form.last_name,
      dob: form.dob,
      sex: form.sex,
      competition_weight_kg: parseFloat(form.competition_weight_kg),
      belt_ranking: form.belt_ranking || null,
      notable_accomplishments: form.notable_accomplishments || null,
      self_fund: form.self_fund,
      style: form.style,
      competition_type: form.competition_type,
      rashguard_size: form.rashguard_size || null,
      short_size: form.short_size || null,
      shirt_size: form.shirt_size || null,
      hoodie_size: form.hoodie_size || null,
      pants_size: form.pants_size || null,
    }) as any);
    setLoading(false);
    if (error) {
      toast.error("Failed to submit petition. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      toast.success("Petition submitted successfully!");
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Petition Received!</h1>
          <p className="text-muted-foreground">Thank you for your interest in Team USA Grappling World Team. We will review your petition and follow up.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display">Team USA Grappling World Team Petition</CardTitle>
            <CardDescription>Complete this form to petition for a spot on the Team USA Grappling World Team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Style & Competition */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground">Competition Selection</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Style *</Label>
                    <Select value={form.style} onValueChange={(v) => update("style", v)}>
                      <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UWW Grappling">UWW Grappling</SelectItem>
                        <SelectItem value="Sport Jiu-Jitsu">Sport Jiu-Jitsu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Competition Type *</Label>
                    <Select value={form.competition_type} onValueChange={(v) => update("competition_type", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gi">Gi</SelectItem>
                        <SelectItem value="Nogi">Nogi</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="self_fund"
                    checked={form.self_fund}
                    onCheckedChange={(checked) => update("self_fund", !!checked)}
                  />
                  <Label htmlFor="self_fund" className="text-sm cursor-pointer">
                    I will self-fund if I do not make the sponsored competition team
                  </Label>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>USAG Membership #</Label>
                  <Input value={form.membership_number} onChange={(e) => update("membership_number", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex *</Label>
                    <Select value={form.sex} onValueChange={(v) => update("sex", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Competition Weight (kg) *</Label>
                    <Input type="number" step="0.1" value={form.competition_weight_kg} onChange={(e) => update("competition_weight_kg", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Belt Ranking (if applicable)</Label>
                  <Input value={form.belt_ranking} onChange={(e) => update("belt_ranking", e.target.value)} placeholder="e.g. Purple Belt" />
                </div>
                <div className="space-y-2">
                  <Label>Brief Summary of Notable Wins and Accomplishments</Label>
                  <Textarea value={form.notable_accomplishments} onChange={(e) => update("notable_accomplishments", e.target.value)} rows={4} placeholder="List your competition results and achievements..." />
                </div>
              </div>

              {/* Sizing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Sizing Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rashguard Size (Youth & Adult XS–2XL)</Label>
                    <Select value={form.rashguard_size} onValueChange={(v) => update("rashguard_size", v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {ALL_RASHGUARD_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Short Size</Label>
                    <Select value={form.short_size} onValueChange={(v) => update("short_size", v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shirt Size</Label>
                    <Select value={form.shirt_size} onValueChange={(v) => update("shirt_size", v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hoodie Size</Label>
                    <Select value={form.hoodie_size} onValueChange={(v) => update("hoodie_size", v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pants Size</Label>
                    <Select value={form.pants_size} onValueChange={(v) => update("pants_size", v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Petition"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WorldTeamPetition;
