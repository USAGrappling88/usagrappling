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
import { CheckCircle2, ChevronRight, ChevronLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STEPS = ["Personal Profile", "Experience & Positions", "Logistics & Payment"];

const POSITIONS = [
  "Front Door",
  "Inspector",
  "Mat Coordinators",
  "Podium",
  "Runner",
  "Security",
  "Referee",
  "Weigh In",
  "Shirts",
  "Scoretables",
  "OTHER",
];

const SHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const TRAVEL = ["Local Only", "Regional", "National/Travel Required"];
const PAYMENT = ["Direct Deposit", "Zelle", "Venmo"];

interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  membershipNumber: string;
  city: string;
  state: string;
  workedWithUSAGBefore: string;
  positions: string[];
  positionOther: string;
  experience: string;
  shirtSize: string;
  travelRadius: string;
  paymentMethod: string;
  payAddress: string;
  payCity: string;
  payState: string;
  payZip: string;
}

const initialFormData: StaffFormData = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  membershipNumber: "",
  city: "",
  state: "",
  workedWithUSAGBefore: "",
  positions: [],
  positionOther: "",
  experience: "",
  shirtSize: "",
  travelRadius: "",
  paymentMethod: "",
  payAddress: "",
  payCity: "",
  payState: "",
  payZip: "",
};

const StaffApplicationForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const updateField = (field: keyof StaffFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePosition = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.includes(value)
        ? prev.positions.filter((v) => v !== value)
        : [...prev.positions, value],
    }));
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dob || !formData.city.trim() || !formData.state.trim()) {
        toast({ title: "Required fields missing", description: "Please fill in all required fields.", variant: "destructive" });
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
        return false;
      }
    }
    if (step === 1) {
      if (!formData.workedWithUSAGBefore || formData.positions.length === 0) {
        toast({ title: "Required fields missing", description: "Please select your experience and positions.", variant: "destructive" });
        return false;
      }
      if (formData.positions.includes("OTHER") && !formData.positionOther.trim()) {
        toast({ title: "Required field", description: "Please specify your other position.", variant: "destructive" });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.shirtSize || !formData.travelRadius || !formData.paymentMethod) {
        toast({ title: "Required fields missing", description: "Please complete all logistics fields.", variant: "destructive" });
        return false;
      }
      if (!formData.payAddress.trim() || !formData.payCity.trim() || !formData.payState.trim() || !formData.payZip.trim()) {
        toast({ title: "Required fields missing", description: "Please fill in paycheck processing information.", variant: "destructive" });
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

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("staff_applications").insert({
        application_type: "staff" as const,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        dob: formData.dob,
        membership_number: formData.membershipNumber.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        worked_with_usag_before: formData.workedWithUSAGBefore === "yes",
        positions: formData.positions.includes("OTHER")
          ? [...formData.positions.filter((p) => p !== "OTHER"), formData.positionOther.trim()]
          : formData.positions,
        experience: formData.experience.trim() || null,
        shirt_size: formData.shirtSize,
        travel_radius: formData.travelRadius,
        payment_method: formData.paymentMethod,
        pay_address: formData.payAddress.trim(),
        pay_city: formData.payCity.trim(),
        pay_state: formData.payState.trim(),
        pay_zip: formData.payZip.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll be in touch shortly." });
    } catch (err) {
      console.error(err);
      toast({ title: "Submission failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
                Thank you for applying to work with USA Grappling tournament operations. We'll review your application and contact you soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="staff-form" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {!isOpen && (
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Users className="h-12 w-12 text-accent mx-auto" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Tournament Operations & Staff
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Interested in working tournament operations? Apply below to join our event staff team.
            </p>
            <Button
              size="lg"
              onClick={handleOpen}
              variant="outline"
              className="mt-4 text-base font-bold tracking-wide px-10 py-6 w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              APPLY FOR STAFF
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {isOpen && (
          <div ref={formRef} className="max-w-2xl mx-auto">
            <Card className="border-border shadow-elevated overflow-hidden">
              <div className="px-6 pt-6 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  {STEPS.map((label, i) => (
                    <span key={label} className={i <= step ? "text-primary" : "text-muted-foreground"}>
                      {label}
                    </span>
                  ))}
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Step 1: Personal Profile */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="staff-fullName">Full Name *</Label>
                      <Input id="staff-fullName" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="John Doe" maxLength={100} />
                    </div>
                    <div>
                      <Label htmlFor="staff-email">Email Address *</Label>
                      <Input id="staff-email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" maxLength={255} />
                    </div>
                    <div>
                      <Label htmlFor="staff-phone">Phone Number *</Label>
                      <Input id="staff-phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="(555) 123-4567" maxLength={20} />
                    </div>
                    <div>
                      <Label htmlFor="staff-dob">Date of Birth *</Label>
                      <Input id="staff-dob" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="staff-membershipNumber">USA Grappling Membership # (Optional)</Label>
                      <Input id="staff-membershipNumber" value={formData.membershipNumber} onChange={(e) => updateField("membershipNumber", e.target.value)} placeholder="e.g. USAG-12345" maxLength={30} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staff-city">City *</Label>
                        <Input id="staff-city" value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="staff-state">State *</Label>
                        <Input id="staff-state" value={formData.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" maxLength={50} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience & Positions */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Have you worked with USA Grappling before? *</Label>
                      <Select value={formData.workedWithUSAGBefore} onValueChange={(v) => updateField("workedWithUSAGBefore", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>What position(s) do you have experience in? * <span className="text-muted-foreground text-xs font-normal">(select all that apply)</span></Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {POSITIONS.map((p) => (
                          <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={formData.positions.includes(p)}
                              onCheckedChange={() => togglePosition(p)}
                            />
                            <span className="text-sm text-foreground">{p}</span>
                          </label>
                        ))}
                      </div>
                      {formData.positions.includes("OTHER") && (
                        <Input
                          className="mt-2"
                          value={formData.positionOther}
                          onChange={(e) => updateField("positionOther", e.target.value)}
                          placeholder="Please specify your position"
                          maxLength={100}
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="staff-experience">Additional Experience / Notes</Label>
                      <Textarea
                        id="staff-experience"
                        value={formData.experience}
                        onChange={(e) => updateField("experience", e.target.value)}
                        placeholder="Briefly describe your relevant event or tournament experience"
                        maxLength={1000}
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Logistics & Payment */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Shirt Size *</Label>
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
                      <Label>Payment Method *</Label>
                      <Select value={formData.paymentMethod} onValueChange={(v) => updateField("paymentMethod", v)}>
                        <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Paycheck Info */}
                    <div className="pt-2 border-t border-border">
                      <p className="font-display font-bold text-foreground text-sm mb-3">Paycheck Processing Information</p>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="staff-payAddress">Address *</Label>
                          <Input id="staff-payAddress" value={formData.payAddress} onChange={(e) => updateField("payAddress", e.target.value)} placeholder="Street address" maxLength={200} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="staff-payCity">City *</Label>
                            <Input id="staff-payCity" value={formData.payCity} onChange={(e) => updateField("payCity", e.target.value)} placeholder="City" maxLength={100} />
                          </div>
                          <div>
                            <Label htmlFor="staff-payState">State *</Label>
                            <Input id="staff-payState" value={formData.payState} onChange={(e) => updateField("payState", e.target.value)} placeholder="State" maxLength={50} />
                          </div>
                          <div>
                            <Label htmlFor="staff-payZip">Zip Code *</Label>
                            <Input id="staff-payZip" value={formData.payZip} onChange={(e) => updateField("payZip", e.target.value)} placeholder="Zip" maxLength={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={handleNext}>
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="font-bold" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
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

export default StaffApplicationForm;
