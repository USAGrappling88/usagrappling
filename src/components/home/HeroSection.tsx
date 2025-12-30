import { Button } from "@/components/ui/button";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";
const ZEFFY_URL = "https://www.zeffy.com/en-US/donation-form/68fac6bd-7c3e-40d6-b540-4f22b1c1f3fd";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background placeholder - user will upload image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Train. Compete.{" "}
            <span className="text-usa-gold">Represent.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Join the USA Grappling community and become part of the largest grappling organization in the United States. 
            Get covered, compete nationwide, and represent Team USA on the world stage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8 py-6"
            >
              <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                Join USA Grappling
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-6 bg-transparent"
            >
              <a href={ZEFFY_URL} target="_blank" rel="noopener noreferrer">
                Donate to Team USA
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-usa-gold">50K+</div>
              <div className="text-white/70 text-sm mt-1">Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-usa-gold">500+</div>
              <div className="text-white/70 text-sm mt-1">Events/Year</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-usa-gold">50</div>
              <div className="text-white/70 text-sm mt-1">States</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}