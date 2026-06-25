import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OfficiateApplicationForm from "@/components/coaches/OfficiateApplicationForm";
import StaffApplicationForm from "@/components/coaches/StaffApplicationForm";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";

const CoachesOfficials = () => {
  return (
    <Layout>
      {/* Referee & Official Application */}
      <OfficiateApplicationForm />

      {/* Tournament Staff Application */}
      <StaffApplicationForm />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Coaches & Officials Compliance
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              All Coaches & Officials must hold a current Grappling Leaders Card to
              participate in NCGA or USA Grappling events.
            </p>
            <Button asChild size="lg">
              <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
                Join Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CoachesOfficials;
