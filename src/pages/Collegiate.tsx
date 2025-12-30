import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Trophy, Target } from "lucide-react";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";

const programs = [
  {
    icon: GraduationCap,
    title: "NCAA Wrestling Programs",
    description: "Partner with established wrestling programs to add grappling as a complementary training method.",
  },
  {
    icon: Users,
    title: "Club Sports Teams",
    description: "Start or join a collegiate grappling club at your university with USA Grappling support.",
  },
  {
    icon: Trophy,
    title: "Collegiate Nationals",
    description: "Compete at the annual Collegiate Nationals tournament and represent your school.",
  },
  {
    icon: Target,
    title: "Scholarship Opportunities",
    description: "Connect with programs offering grappling-specific scholarships and athletic opportunities.",
  },
];

const Collegiate = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Collegiate Grappling Programs
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              Bringing world-class grappling to universities across America. 
              Train, compete, and represent your school on the national stage.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                Join as a Student Athlete
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Program Opportunities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Multiple pathways for colleges and students to get involved with competitive grappling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <Card key={program.title} className="border-border shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-3">
                      {program.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {program.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Start a Program at Your School
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-display font-bold text-xl">
                  1
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Register Your Club</h3>
                <p className="text-muted-foreground text-sm">
                  Work with your student activities office to register as an official club sport.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-display font-bold text-xl">
                  2
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Affiliate with USAG</h3>
                <p className="text-muted-foreground text-sm">
                  Apply for USA Grappling affiliation to access insurance, events, and resources.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-display font-bold text-xl">
                  3
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">Start Competing</h3>
                <p className="text-muted-foreground text-sm">
                  Register for collegiate events and begin your journey to Collegiate Nationals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Bring Grappling to Your Campus?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Contact us to learn more about starting or growing a collegiate grappling program.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            <a href="/contact">Get in Touch</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Collegiate;