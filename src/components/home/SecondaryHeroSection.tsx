import heroBanner2 from "@/assets/hero-2.png";

export function SecondaryHeroSection() {
  return (
    <section className="w-full">
      {/* Tagline */}
      <div className="py-8 md:py-12 bg-background text-center">
        <p className="font-display text-xl md:text-2xl lg:text-3xl italic text-foreground">
          "Your mat. Your teammates. Your country. One membership."
        </p>
      </div>
      
      {/* Banner Image */}
      <img 
        src={heroBanner2} 
        alt="USA Grappling - Representing USA" 
        className="w-full h-auto"
      />
    </section>
  );
}
