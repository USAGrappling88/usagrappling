import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trophy, CheckCircle } from "lucide-react";

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const YOUTH_SIZES = ["Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL", "Youth 2XL"];

const YOUTH_BELTS = ["White", "Grey", "Yellow", "Orange", "Green"];
const ADULT_BELTS = ["White", "Blue", "Purple", "Brown", "Black"];

const LBS_TO_KG = 0.453592;

const WorldTeamPetition = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ageCategory, setAgeCategory] = useState<"youth" | "adult" | "">("");
  const [weightLbs, setWeightLbs] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [form, setForm] = useState({
    email: "",
    membership_number: "",
    first_name: "",
    last_name: "",
    dob: "",
    sex: "",
    belt_ranking: "",
    notable_accomplishments: "",
    self_fund: false,
    competition_type: "",
    rashguard_size: "",
    short_size: "",
    shirt_size: "",
    hoodie_size: "",
    pants_size: "",
  });

  const weightKg = useMemo(() => {
    const lbs = parseFloat(weightLbs);
    if (isNaN(lbs) || lbs <= 0) return "";
    return (lbs * LBS_TO_KG).toFixed(1);
  }, [weightLbs]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStyle = (style: string) => {
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const beltOptions = ageCategory === "youth" ? YOUTH_BELTS : ageCategory === "adult" ? ADULT_BELTS : [];

  const getSizeOptions = (field: string) => {
    if (ageCategory === "youth") {
      // Youth gets youth sizes + adult sizes
      return { primary: YOUTH_SIZES, secondary: ADULT_SIZES, secondaryLabel: "Adult Sizes" };
    }
    // Adult or rashguard (always shows both for rashguard)
    if (field === "rashguard_size") {
      return { primary: ADULT_SIZES, secondary: YOUTH_SIZES, secondaryLabel: "Youth Sizes" };
    }
    return { primary: ADULT_SIZES, secondary: null, secondaryLabel: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.first_name || !form.last_name || !form.dob || !form.sex || !weightLbs || styles.length === 0 || !form.competition_type || !ageCategory) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const styleValue = styles.join(", ");
    const { error } = await (supabase.from("world_team_petitions" as any).insert({
      email: form.email,
      membership_number: form.membership_number || null,
      first_name: form.first_name,
      last_name: form.last_name,
      dob: form.dob,
      sex: form.sex,
      competition_weight_kg: parseFloat(weightKg),
      belt_ranking: form.belt_ranking || null,
      notable_accomplishments: form.notable_accomplishments || null,
      self_fund: form.self_fund,
      style: styleValue,
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

  const renderSizeSelect = (label: string, field: string) => {
    const { primary, secondary, secondaryLabel } = getSizeOptions(field);
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={(form as any)[field]} onValueChange={(v) => update(field, v)}>
          <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{ageCategory === "youth" ? "Youth Sizes" : "Adult Sizes"}</SelectLabel>
              {primary.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectGroup>
            {secondary && (
              <SelectGroup>
                <SelectLabel>{secondaryLabel}</SelectLabel>
                {secondary.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display">Team USA World Team Petition</CardTitle>
            <CardDescription>Complete this form to petition for a spot on the USA Grappling World Team.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age Category */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground">Petitioner Category *</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={ageCategory === "youth" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      setAgeCategory("youth");
                      update("belt_ranking", "");
                    }}
                  >
                    Youth
                  </Button>
                  <Button
                    type="button"
                    variant={ageCategory === "adult" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      setAgeCategory("adult");
                      update("belt_ranking", "");
                    }}
                  >
                    Adult
                  </Button>
                </div>
              </div>

              {/* Style & Competition */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-semibold text-foreground">Competition Selection</h3>
                <div className="space-y-3">
                  <Label>Style(s) * <span className="text-muted-foreground text-xs">(select one or both)</span></Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={styles.includes("UWW Grappling") ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => toggleStyle("UWW Grappling")}
                    >
                      UWW Grappling
                    </Button>
                    <Button
                      type="button"
                      variant={styles.includes("Sport Jiu-Jitsu") ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => toggleStyle("Sport Jiu-Jitsu")}
                    >
                      Sport Jiu-Jitsu
                    </Button>
                  </div>
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
                    <Label>Competition Weight *</Label>
                    <div className="space-y-1">
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Enter lbs"
                          value={weightLbs}
                          onChange={(e) => setWeightLbs(e.target.value)}
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">lbs</span>
                      </div>
                      {weightKg && (
                        <p className="text-xs text-muted-foreground">= {weightKg} kg</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Belt Ranking {ageCategory ? "" : "(select category first)"}</Label>
                  <Select
                    value={form.belt_ranking}
                    onValueChange={(v) => update("belt_ranking", v)}
                    disabled={!ageCategory}
                  >
                    <SelectTrigger><SelectValue placeholder={ageCategory ? "Select belt" : "Select category first"} /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{ageCategory === "youth" ? "Youth Belts" : "Adult Belts"}</SelectLabel>
                        {beltOptions.map((belt) => (
                          <SelectItem key={belt} value={belt}>{belt}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brief Summary of Notable Wins and Accomplishments</Label>
                  <Textarea value={form.notable_accomplishments} onChange={(e) => update("notable_accomplishments", e.target.value)} rows={4} placeholder="List your competition results and achievements..." />
                </div>
              </div>

              {/* Sizing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Sizing Information
                  {ageCategory && <span className="text-sm font-normal text-muted-foreground ml-2">({ageCategory === "youth" ? "Youth" : "Adult"} petitioner)</span>}
                </h3>
                {!ageCategory && (
                  <p className="text-sm text-muted-foreground">Please select Youth or Adult at the top to see sizing options.</p>
                )}
                {ageCategory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderSizeSelect("Rashguard Size", "rashguard_size")}
                    {renderSizeSelect("Short Size", "short_size")}
                    {renderSizeSelect("Shirt Size", "shirt_size")}
                    {renderSizeSelect("Hoodie Size", "hoodie_size")}
                    {renderSizeSelect("Pants Size", "pants_size")}
                  </div>
                )}
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
