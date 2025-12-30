import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";
const EVENTS_URL = "https://usag.smoothcomp.com/en/federation/362/events";

const Events = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Events
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              Find USA Grappling sanctioned competitions near you.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <a href={EVENTS_URL} target="_blank" rel="noopener noreferrer">
                View All Events on Smoothcomp
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Events Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border shadow-card">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Calendar className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    Sanctioned Events
                  </h3>
                  <p className="text-muted-foreground">
                    All USA Grappling sanctioned events include accident medical insurance 
                    coverage for registered members. Compete with confidence knowing you're protected.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-card">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    Nationwide Coverage
                  </h3>
                  <p className="text-muted-foreground">
                    Find competitions across the country. From local tournaments to 
                    national championships, there's an event for every skill level.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Event Registration
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                All event registration is handled through Smoothcomp. You'll need an active 
                USA Grappling membership to register for sanctioned events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href={EVENTS_URL} target="_blank" rel="noopener noreferrer">
                    Browse Events
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                    Get Membership
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host an Event */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Host a Sanctioned Event
            </h2>
            <p className="text-muted-foreground mb-8">
              Want to host a USA Grappling sanctioned event? Get official status, 
              insurance coverage, and promotional support. Event sanctions are $90 per event.
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <a href="/contact">Contact Us to Get Started</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
