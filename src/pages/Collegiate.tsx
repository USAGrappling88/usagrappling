import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ncgaBanner from "@/assets/ncga-banner.jpg";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";
const NCGA_URL = "https://www.thencga.org";
const NCGA_VIDEO_URL = "https://www.youtube.com/embed/YOUR_VIDEO_ID";

const Collegiate = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          <img 
            src={ncgaBanner} 
            alt="Collegiate Grappling" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Collegiate Grappling
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                The Future of Collegiate Sports is Here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Launch Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-border shadow-card">
            <CardContent className="p-8 md:p-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
                Official Launch of Collegiate Grappling
              </h2>
              <p className="text-muted-foreground mb-4">
                We're excited to announce the official launch of grappling as a collegiate sport through the{" "}
                <span className="text-primary font-semibold">National Collegiate Grappling Association (NCGA)</span>!{" "}
                This groundbreaking initiative brings structured competition, national rankings, and championship 
                opportunities to student athletes across the country.
              </p>
              <p className="text-muted-foreground">
                Whether you're starting a new club or representing an established team, now is the time to get involved.{" "}
                For more information on participation and registration requirements, visit{" "}
                <a 
                  href={NCGA_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.thencga.org
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              Watch the NCGA Promotional Video
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-elevated">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/H5YS3TzvLbE"
                title="NCGA Promotional Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Get Your School Involved?
            </h2>
            <p className="text-white/80 mb-8">
              Join the growing community of collegiate grappling programs across the nation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                <a href={NCGA_URL} target="_blank" rel="noopener noreferrer">
                  Visit NCGA Website
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                  Join USA Grappling
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Collegiate;