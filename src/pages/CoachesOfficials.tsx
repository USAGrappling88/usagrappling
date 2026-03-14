import { Layout } from "@/components/layout/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import safecoachScreenshot from "@/assets/safecoach-screenshot.png";
import OfficiateApplicationForm from "@/components/coaches/OfficiateApplicationForm";

const SAFECOACH_SIGNUP_URL = "https://app.safecoachbackgroundchecks.com/signup/org/USAGRAPPLING";
const SAFECOACH_LOGIN_URL = "https://app.safecoachbackgroundchecks.com";

const CoachesOfficials = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Coaches & Officials Compliance
            </h1>
            <p className="text-muted-foreground text-lg">
              All coaches and officials must complete a background check through SafeCoach prior to 
              participation in NCGA or USA Grappling events.
            </p>
          </div>
        </div>
      </section>

      {/* SafeCoach Screenshot Section */}
      <section className="pb-12 md:pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <img 
              src={safecoachScreenshot} 
              alt="SafeCoach Background Check Interface" 
              className="w-full rounded-lg shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
              Steps to Complete Your Background Check
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-display font-bold text-foreground mb-2">
                  <span className="text-primary">Step 1:</span>
                </h3>
                <p className="text-muted-foreground mb-2">Click this link:</p>
                <a 
                  href={SAFECOACH_SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {SAFECOACH_SIGNUP_URL}
                </a>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-display font-bold text-foreground mb-2">
                  <span className="text-primary">Step 2:</span>
                </h3>
                <p className="text-muted-foreground mb-4">Fill out all required information.</p>
                <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r">
                  <p className="text-foreground">
                    <span className="font-semibold">Important:</span> When signing up, make sure to enter{" "}
                    <span className="font-bold text-primary">"USAGRAPPLING"</span> in the Organization Code box.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-display font-bold text-foreground mb-2">
                  <span className="text-primary">Step 3:</span>
                </h3>
                <p className="text-muted-foreground">
                  Check your inbox (or spam) for the email verification link. Once verified, your account will be active.
                </p>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="font-display font-bold text-foreground mb-2">
                  <span className="text-primary">Step 4:</span>
                </h3>
                <p className="text-muted-foreground mb-2">
                  Log in to{" "}
                  <a 
                    href={SAFECOACH_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    app.safecoachbackgroundchecks.com
                  </a>
                  {" "}and complete the{" "}
                  <span className="underline">required information</span>.
                </p>
                <p className="text-muted-foreground">
                  Your Social Security Number and Date of Birth are required to process the background check.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Alert */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-display font-bold">Compliance Requirement</AlertTitle>
              <AlertDescription className="text-destructive-foreground/80">
                All background checks must be completed and cleared prior to coaching or officiating at any NCGA or USA Grappling sanctioned event.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CoachesOfficials;