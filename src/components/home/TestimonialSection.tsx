import samImage from "@/assets/testimonials/sam-schwartzapfel.png";
import ericImage from "@/assets/testimonials/eric-medina.png";
import kendallImage from "@/assets/testimonials/kendall-reusing.png";
import johnnyImage from "@/assets/testimonials/johnny-morgan.png";
import joeyImage from "@/assets/testimonials/joey-hauss.png";

const testimonials = [
  {
    name: "Eric Medina",
    title: "Head Coach Cal State University Northridge",
    quote: "I'm a JJM black belt and I never have to worry about coverage for my kids or my academy...it's just a smart decision. And now with jiu jitsu growing into a college sport it's an amazing thing to be a part of.",
    image: ericImage,
  },
  {
    name: "Sam Schwartzapfel",
    title: "2x World Team Member - Medalist",
    quote: "Being able to represent your country is the highest honor in all of sports. It's been exciting to be a part of that.",
    image: samImage,
  },
  {
    name: "Johnny Morgan",
    title: "World Team Coach",
    quote: "Grappling, wrestling, and Jiu Jitsu are so much more than sports...they build our character and we're a family.",
    image: johnnyImage,
  },
  {
    name: "Kendall Reusing",
    title: "Sr World Champion",
    quote: "The pride I feel stepping on to the mats and the podium with the flag on my chest and the national anthem playing is something every athlete should aspire to in their career.",
    image: kendallImage,
  },
  {
    name: "Joey Hauss",
    title: "Owner / Head Professor at Lake Arrowhead Jiu Jitsu",
    quote: "As a professor and academy owner, I never have to worry about coverage for my athletes or my academy. USA Grappling makes it simple, reliable, and stress-free. With Jiu Jitsu growing so quickly, having that kind of support behind us is huge — it lets me focus on teaching, building the team, and growing the community.",
    image: joeyImage,
  },
];

export function TestimonialSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-foreground mb-12">
          What Our Community Says
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-primary text-lg">
                    {testimonial.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {testimonial.title}
                  </p>
                </div>
              </div>
              <blockquote className="mt-4 text-foreground/80 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
