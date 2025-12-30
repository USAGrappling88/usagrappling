import { Quote } from "lucide-react";

export function TestimonialSection() {
  return (
    <section className="py-20 bg-usa-light-blue">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground/50 font-display text-lg">Team Photo</span>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent rounded-xl -z-10" />
            </div>

            {/* Testimonial */}
            <div>
              <Quote className="w-12 h-12 text-accent mb-6" />
              <blockquote className="text-xl md:text-2xl font-display text-foreground leading-relaxed mb-6">
                "USA Grappling has been instrumental in growing the sport across the country. 
                The organization provides world-class support for athletes at every level, 
                from beginners to world champions."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">JM</span>
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">Johnny Morgan</div>
                  <div className="text-muted-foreground text-sm">World Team Coach</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}