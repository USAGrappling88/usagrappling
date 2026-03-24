import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Globe, Award } from "lucide-react";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We pursue excellence in everything we do, from athlete development to event organization.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We build and nurture a supportive community of grapplers, coaches, and fans across the nation.",
  },
  {
    icon: Globe,
    title: "Representation",
    description: "We represent the United States on the world stage, sending our best athletes to international competition.",
  },
  {
    icon: Award,
    title: "Integrity",
    description: "We uphold the highest standards of sportsmanship, fair play, and ethical conduct.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About USA Grappling
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl">
              The national governing body for grappling in the United States.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              USA Grappling is dedicated to developing and promoting the sport of grappling 
              in the United States. We provide sanctioned competitions, support athlete development 
              at all levels, and represent American grapplers on the international stage.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-border shadow-card text-center">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              What We Do
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <p>
                USA Grappling sanctions competitions across the country, providing athletes with 
                safe, well-organized events to test their skills. Our sanctioned events include 
                accident medical insurance coverage for all registered members.
              </p>
              <p>
                We develop and certify coaches and officials, ensuring that our sport has the 
                leadership it needs to grow. Our certification programs include background checks, 
                SafeSport training, and comprehensive education.
              </p>
              <p>
                We select and support Team USA athletes who represent our country at world 
                championships and international competitions. Our athletes compete at the highest 
                levels of grappling worldwide.
              </p>
              <p>
                We support collegiate grappling programs through the National Collegiate Grappling 
                Association (NCGA), helping to grow the sport at the university level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Join the USA Grappling Community
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Become a member and be part of the national grappling movement.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
              Become a Member
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
