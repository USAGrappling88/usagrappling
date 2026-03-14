import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Personal Profile", "Technical Credentials", "Logistics & Sizing"];

const BACKGROUNDS = ["Grappling", "Wrestling", "BJJ", "Judo"];
const CERT_LEVELS = ["State Level", "National Level", "International/UWW"];
const RULESETS = ["UWW Grappling", "NCGA Collegiate", "Submission Only"];
const SMOOTHCOMP = ["Expert", "Intermediate", "Beginner", "No Experience"];
const ROLES = ["Referee", "Pairing/Bracketing Official", "Table Staff", "Weigh-in Official"];
const SHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const TRAVEL = ["Local Only", "Regional", "National/Travel Required"];
const PAYMENT = ["Direct Deposit", "Zelle", "Venmo"];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  city: string;
  state: string;
  primaryBackground: string;
  certLevel: string;
  rulesetExpertise: string[];
  smoothcomp: string;
  experience: string;
  interestedRoles: string[];
  shirtSize: string;
  travelRadius: string;
  paymentSetup: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  membershipNumber: "",
  city: "",
  state: "",
  primaryBackground: "",
  certLevel: "",
  rulesetExpertise: [],
  smoothcomp: "",
  experience: "",
  interestedRoles: [],
  shirtSize: "",
  travelRadius: "",
  paymentSetup: "",
};

const OfficiateApplicationForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: "rulesetExpertise" | "interestedRoles", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.state.trim()) {
        toast({ title: "Required fields missing", description: "Please fill in all required fields.", variant: "destructive" });
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
        return false;
      }
    }
    if (step === 1) {
      if (!formData.primaryBackground || !formData.certLevel || !formData.smoothcomp || formData.rulesetExpertise.length === 0) {
        toast({ title: "Required fields missing", description: "Please complete all credential fields.", variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      if (formData.interestedRoles.length === 0 || !formData.shirtSize || !formData.travelRadius || !formData.paymentSetup) {
        toast({ title: "Required fields missing", description: "Please complete all logistics fields.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    // In production this would POST to an edge function
    console.log("Officiate application submitted:", formData);
    setSubmitted(true);
    toast({ title: "Application submitted!", description: "We'll be in touch shortly." });
  };

  if (submitted) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-border shadow-elevated">
            <CardContent className="py-12 text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Application Received
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thank you for your interest in officiating with USA Grappling. Our team will review your application and reach out within 5–7 business days.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild variant="default" size="lg">
                  <a href="https://www.usagrappling.com/membership" target="_blank" rel="noopener noreferrer">
                    Grappling Leader Membership
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="https://www.usagrappling.com/rules" target="_blank" rel="noopener noreferrer">
                    Official Rules & Regulations
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* CTA Button */}
        {!isOpen && (
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Become a USA Grappling Official
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join our team of certified referees and tournament staff. Apply below to get started.
            </p>
            <Button
              size="lg"
              onClick={handleOpen}
              className="mt-4 text-base font-bold tracking-wide px-10 py-6 w-full sm:w-auto"
            >
              APPLY TO OFFICIATE
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Form */}
        {isOpen && (
          <div ref={formRef} className="max-w-2xl mx-auto">
            <Card className="border-border shadow-elevated overflow-hidden">
              {/* Progress */}
              <div className="px-6 pt-6 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  {STEPS.map((label, i) => (
                    <span
                      key={label}
                      className={i <= step ? "text-primary" : "text-muted-foreground"}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Step 1 */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="John Doe" maxLength={100} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" maxLength={255} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="(555) 123-4567" maxLength={20} />
                    </div>
                    <div>
                      <Label htmlFor="membershipNumber">USA Grappling Membership # (Optional)</Label>
                      <Input id="membershipNumber" value={formData.membershipNumber} onChange={(e) => updateField("membershipNumber", e.target.value)} placeholder="e.g. USAG-12345" maxLength={30} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input id="state" value={formData.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" maxLength={50} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Primary Background *</Label>
                      <Select value={formData.primaryBackground} onValueChange={(v) => updateField("primaryBackground", v)}>
                        <SelectTrigger><SelectValue placeholder="Select background" /></SelectTrigger>
                        <SelectContent>
                          {BACKGROUNDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Official Certification Level *</Label>
                      <Select value={formData.certLevel} onValueChange={(v) => updateField("certLevel", v)}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {CERT_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ruleset Expertise *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {RULESETS.map((r) => (
                          <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={formData.rulesetExpertise.includes(r)}
                              onCheckedChange={() => toggleArrayField("rulesetExpertise", r)}
                            />
                            <span className="text-sm text-foreground">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Smoothcomp Knowledge *</Label>
                      <Select value={formData.smoothcomp} onValueChange={(v) => updateField("smoothcomp", v)}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {SMOOTHCOMP.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => updateField("experience", e.target.value)}
                        placeholder="Briefly list your recent officiating highlights"
                        maxLength={1000}
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Interested Roles *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {ROLES.map((r) => (
                          <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={formData.interestedRoles.includes(r)}
                              onCheckedChange={() => toggleArrayField("interestedRoles", r)}
                            />
                            <span className="text-sm text-foreground">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Official 'Grappling Leader' Shirt Size *</Label>
                      <Select value={formData.shirtSize} onValueChange={(v) => updateField("shirtSize", v)}>
                        <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                        <SelectContent>
                          {SHIRT_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Travel Radius *</Label>
                      <Select value={formData.travelRadius} onValueChange={(v) => updateField("travelRadius", v)}>
                        <SelectTrigger><SelectValue placeholder="Select radius" /></SelectTrigger>
                        <SelectContent>
                          {TRAVEL.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Payment Setup *</Label>
                      <Select value={formData.paymentSetup} onValueChange={(v) => updateField("paymentSetup", v)}>
                        <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={handleNext}>
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="font-bold">
                      Submit Application
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default OfficiateApplicationForm;
