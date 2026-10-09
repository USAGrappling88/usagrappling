import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import OfficiateApplicationForm from "@/components/coaches/OfficiateApplicationForm";
import StaffApplicationForm from "@/components/coaches/StaffApplicationForm";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";
const PAGE_URL = "https://www.usa-grappling.com/coaches-officials";
const OG_IMAGE =
  "https://vtxgnaznsdaakmvkwcka.supabase.co/storage/v1/object/public/press-images/og%2Fcoaches-officials.jpg";
const PAGE_TITLE = "Coaches & Officials Compliance | USA Grappling";
const PAGE_DESCRIPTION =
  "All Coaches & Officials must hold a current Grappling Leaders Card to participate in NCGA or USA Grappling events. Get your card and apply to officiate or staff tournaments.";

const CoachesOfficials = () => {
  return (
    <Layout>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>
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
