import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
          <Card className="max-w-4xl mx-auto border-border shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/30 p-8 flex justify-center">
                <div className="bg-card rounded-lg shadow-lg p-4 max-w-md w-full">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-primary/10 p-3 rounded-full mb-2">
                      <span className="text-primary text-2xl">🛡️</span>
                    </div>
                    <h3 className="font-display font-bold text-foreground">Run a Background Check</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">First Name</span>
                      <span className="flex-1 border-b border-border"></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Last Name</span>
                      <span className="flex-1 border-b border-border"></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email</span>
                      <span className="flex-1 border-b border-border"></span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <span className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-medium">
                      Generate Report
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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