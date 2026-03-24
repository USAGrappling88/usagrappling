import { Button } from "@/components/ui/button";

const MEMBERSHIP_URL = "https://usag.uventex.com/memberships";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to Join Team USA?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl mx-auto">
            Become part of the largest grappling community in the United States. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8"
            >
              <a href={MEMBERSHIP_URL} target="_blank" rel="noopener noreferrer">
                Join Now
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 bg-transparent"
            >
              <a href="/contact">
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}