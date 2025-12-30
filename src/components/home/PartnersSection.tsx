export function PartnersSection() {
  // Partner placeholders - user will upload actual logos
  const partners = [
    { name: "The Grappling Network", placeholder: "TGN" },
    { name: "Dollamur", placeholder: "Dollamur" },
    { name: "BattleGear", placeholder: "BattleGear" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Official Partners
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              {/* Placeholder for partner logo - user will upload */}
              <div className="h-12 md:h-16 flex items-center justify-center px-6 py-3 bg-muted rounded-lg">
                <span className="font-display font-bold text-muted-foreground text-lg">
                  {partner.placeholder}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}