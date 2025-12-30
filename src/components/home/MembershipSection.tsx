import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";

const memberships = [
  {
    title: "Youth Membership",
    price: "$66",
    period: "/year",
    description: "For athletes under 18",
    features: [
      "Accident medical insurance",
      "Compete at sanctioned events",
      "Team USA eligibility",
      "Member discounts",
    ],
    popular: false,
  },
  {
    title: "Adult Membership",
    price: "$66",
    period: "/year",
    description: "For athletes 18 and older",
    features: [
      "Accident medical insurance",
      "Compete at sanctioned events",
      "Team USA eligibility",
      "Member discounts",
    ],
    popular: true,
  },
  {
    title: "Grappling Leader",
    price: "$66",
    period: "/year",
    description: "For coaches and officials",
    features: [
      "Coaching certification",
      "Official training resources",
      "Background check included",
      "Liability coverage",
    ],
    popular: false,
  },
  {
    title: "Academy Charter",
    price: "$115",
    period: "/year",
    description: "For gyms and academies",
    features: [
      "Academy listing",
      "Event hosting rights",
      "Group member discounts",
      "Promotional materials",
    ],
    popular: false,
  },
  {
    title: "Event Sanction",
    price: "$90",
    period: "/event",
    description: "For event organizers",
    features: [
      "Official event status",
      "Insurance coverage",
      "Ranking points",
      "USAG promotion",
    ],
    popular: false,
  },
];

export function MembershipSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Membership Options
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the membership that fits your role in the grappling community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {memberships.map((membership) => (
            <Card 
              key={membership.title}
              className="relative border border-border shadow-card hover:shadow-elevated transition-shadow duration-300 flex flex-col"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-display text-lg font-bold text-foreground">
                  {membership.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{membership.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-display font-bold text-foreground">{membership.price}</span>
                  <span className="text-muted-foreground text-sm">{membership.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-3 mb-6 flex-1">
                  {membership.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  className="w-full bg-primary hover:bg-primary/90 mt-auto"
                >
                  <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                    Get Started
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}