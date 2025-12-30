import { Shield, Heart, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Shield,
    title: "You're Covered",
    description: "Accident medical insurance for all sanctioned events. Train and compete with confidence knowing you're protected.",
  },
  {
    icon: Heart,
    title: "Peace of Mind",
    description: "Liability coverage for event organizers and coaches. Focus on the sport while we handle the protection.",
  },
  {
    icon: Globe,
    title: "Represent Team USA",
    description: "Compete for a spot on the World Championship team. Represent your country on the international stage.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Join USA Grappling?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Membership unlocks benefits that protect you, support your journey, and open doors to elite competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={benefit.title} 
                className="border-none shadow-card hover:shadow-elevated transition-shadow duration-300 bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quote Banner */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <blockquote className="font-display text-xl md:text-2xl font-medium italic">
            "Your mat. Your teammates. Your country. One membership."
          </blockquote>
        </div>
      </div>
    </section>
  );
}