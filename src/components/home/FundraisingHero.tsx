import { Button } from "@/components/ui/button";
import heroBg from "@/assets/aiden-coach.png.asset.json";

const GIVEBUTTER_URL = "https://givebutter.com/fund-training-equipment-for-aspiring-athletes-ml9p94";

const destinations = [
  {
    flag: "🇰🇿",
    country: "Kazakhstan",
    event: "UWW World Championship",
  },
  {
    flag: "🇯🇵",
    country: "Japan",
    event: "SJJIF Gi World Championship",
  },
];

export function FundraisingHero() {
  return (
    <section
      className="relative w-full py-15 md:py-24 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Navy overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(27, 58, 107, 0.82)" }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-[#C8920A] mb-4">
            USA GRAPPLING • 501(c)(3) NONPROFIT
          </p>

          <h2 className="font-display text-4xl md:text-5xl lg:text-[56px] xl:text-6xl font-bold text-white mb-5 leading-[1.1]">
            They Earned Their Spot. Help Us Get Them There.
          </h2>

          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto">
            Our athletes qualified for Team USA and are headed to the World Championships in Kazakhstan and Japan. Every dollar gets them there.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
            {destinations.map((destination) => (
              <div
                key={destination.country}
                className="flex items-center gap-3 bg-white/5 border border-white/25 backdrop-blur-sm rounded-lg px-5 py-3 w-full md:w-auto shadow-lg"
              >
                <span className="text-3xl" aria-hidden="true">
                  {destination.flag}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-white text-sm md:text-base">
                    {destination.country}
                  </p>
                  <p className="text-white/70 text-xs md:text-sm">
                    {destination.event}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="font-bold text-lg md:text-xl px-10 py-7 h-auto border-0 shadow-xl hover:brightness-110 transition"
            style={{ backgroundColor: "#C8920A", color: "#FFFFFF" }}
          >
            <a
              href={GIVEBUTTER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Support Team USA →
            </a>
          </Button>

          <p className="text-sm text-white/70 mt-5">
            Tax-deductible donation • All funds go directly to athlete costs
          </p>
        </div>
      </div>
    </section>
  );
}
