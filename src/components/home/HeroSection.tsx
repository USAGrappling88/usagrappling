import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.png";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";
const ZEFFY_URL = "https://www.zeffy.com/en-US/donation-form/support-team-usa";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={heroBanner} 
          alt="Two grapplers facing off with American flag background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
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
              <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
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
