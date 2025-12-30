import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Award, Shield, BookOpen, Users } from "lucide-react";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";

const roles = [
  {
    title: "Coach",
    icon: Users,
    description: "Lead athletes, develop talent, and build champions at any level.",
    features: [
      "Coaching certification courses",
      "Background check included",
      "Liability insurance coverage",
      "Access to coaching resources",
      "Team USA selection pathway",
    ],
  },
  {
    title: "Referee",
    icon: Award,
    description: "Ensure fair competition and uphold the rules of the sport.",
    features: [
      "Referee certification training",
      "Rule book and updates",
      "Event assignment opportunities",
      "Professional development",
      "National event officiating",
    ],
  },
];

const certifications = [
  {
    level: "Level 1",
    title: "Foundation Coach",
    description: "Entry-level certification for new coaches covering safety, basic techniques, and athlete development.",
  },
  {
    level: "Level 2",
    title: "Club Coach",
    description: "Advanced certification for coaches running club programs and preparing athletes for competition.",
  },
  {
    level: "Level 3",
    title: "Elite Coach",
    description: "Professional certification for coaches developing national and international-level athletes.",
  },
];

const CoachesOfficials = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Coaches & Officials
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              Lead the next generation of grapplers. Get certified, get covered, 
              and make an impact in the sport you love.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                Become a Grappling Leader
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Role in Grappling
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you coach athletes or officiate matches, USA Grappling provides 
              the resources and support you need to excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.title} className="border-border shadow-card">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="font-display text-2xl">{role.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground mt-2">{role.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {role.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      asChild 
                      className="w-full mt-6 bg-primary hover:bg-primary/90"
                    >
                      <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                        Get Started
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Coaching Certifications
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Progress through our certification levels to develop your coaching skills 
              and unlock new opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <Card key={cert.level} className="border-border shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" 
                     style={{ opacity: 0.3 + (index * 0.3) }} />
                <CardContent className="p-8">
                  <div className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
                    {cert.level}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {cert.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {cert.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Coverage */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Protected While You Lead
                </h2>
                <p className="text-muted-foreground mb-6">
                  Every Grappling Leader membership includes comprehensive liability coverage, 
                  giving you peace of mind while you focus on developing athletes.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">General liability insurance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">Background check verification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">SafeSport training resources</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl aspect-square flex items-center justify-center">
                <span className="text-primary-foreground/50 font-display">Coach/Official Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Lead?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join our community of coaches and officials making a difference in grappling.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
              Get Your Grappling Leader Membership
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default CoachesOfficials;