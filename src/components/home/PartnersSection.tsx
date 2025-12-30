import tgnLogo from "@/assets/partners/tgn.png";
import battlegearLogo from "@/assets/partners/battlegear.png";
import dollamurLogo from "@/assets/partners/dollamur.png";

const partners = [
  { name: "The Grappling Network", logo: tgnLogo, size: "h-12 md:h-16", url: "https://www.youtube.com/channel/UC5WZywvvzGFcSi2gZsrf-8g" },
  { name: "Dollamur", logo: dollamurLogo, size: "h-12 md:h-16", url: "https://dollamur.com/" },
  { name: "BattleGear", logo: battlegearLogo, size: "h-12 md:h-14", url: "https://www.battlegear247.com/" },
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          Official Partners
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
            >
              <img 
                src={partner.logo} 
                alt={partner.name} 
                className={`${partner.size} w-auto object-contain`}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
