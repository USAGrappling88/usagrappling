import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink } from "lucide-react";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";
const YOUTH_ADULT_URL = "https://usag.uventex.com/events/event/337467";

const membershipTypes = [
  {
    title: "Athlete Membership",
    price: "$66",
    period: "/year",
    description: "For competitors of all ages and skill levels.",
    features: [
      "Accident medical insurance at sanctioned events",
      "Eligibility for Team USA selection",
      "Member discounts on events and merchandise",
      "Access to the USA Grappling community",
      "Competition ranking and results tracking",
    ],
    cta: "Join as Athlete",
    popular: true,
    url: YOUTH_ADULT_URL,
  },
  {
    title: "Grappling Leader",
    price: "$66",
    period: "/year",
    description: "For coaches and officials.",
    features: [
      "Liability insurance coverage",
      "Background check verification",
      "SafeSport training access",
      "Coach/referee certification pathways",
      "Event officiating opportunities",
    ],
    cta: "Join as Leader",
    popular: false,
    url: MEMBERSHIP_URL,
  },
  {
    title: "Academy Charter",
    price: "$115",
    period: "/year",
    description: "For gyms and training facilities.",
    features: [
      "Official USA Grappling affiliation",
      "Academy listing and promotion",
      "Event hosting support",
      "Member recruitment tools",
      "USA Grappling branding rights",
    ],
    cta: "Charter Your Academy",
    popular: false,
    url: MEMBERSHIP_URL,
  },
  {
    title: "Event Sanction",
    price: "$90",
    period: "/event",
    description: "For event organizers.",
    features: [
      "Official sanctioned event status",
      "Insurance coverage for participants",
      "Event calendar listing",
      "Promotional support",
      "Results and ranking integration",
    ],
    cta: "Sanction Your Event",
    popular: false,
  },
];

const Membership = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Membership
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl">
              Join the USA Grappling community and get access to sanctioned events, 
              insurance coverage, and Team USA opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Types */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {membershipTypes.map((type) => (
              <Card 
                key={type.title} 
                className={`border-border shadow-card relative ${type.popular ? 'ring-2 ring-accent' : ''}`}
              >
                {type.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="font-display text-xl">{type.title}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{type.price}</span>
                    <span className="text-muted-foreground">{type.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className={`w-full ${type.popular ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : 'bg-primary hover:bg-primary/90'}`}
                  >
                    <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
                      {type.cta}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Join USA Grappling?
            </h2>
            <p className="text-muted-foreground mb-8">
              Your membership supports the growth of grappling in the United States 
              while providing you with valuable benefits and protections.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
                Join Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Membership;
