import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";

// FAQ data organized by category - user will provide actual content
const faqCategories = [
  {
    title: "Membership",
    faqs: [
      {
        question: "What does a USA Grappling membership include?",
        answer: "Your membership includes accident medical insurance at all sanctioned events, eligibility to compete for Team USA at world championships, member discounts, and access to the entire USA Grappling community and events nationwide.",
      },
      {
        question: "How much does a membership cost?",
        answer: "Youth and Adult memberships are $66/year. Grappling Leader (coach/official) memberships are $66/year. Academy Charters are $115/year, and Event Sanctions are $90/event.",
      },
      {
        question: "How do I renew my membership?",
        answer: "Log in to your Smoothcomp account and navigate to your membership section to renew. You'll receive email reminders before your membership expires.",
      },
      {
        question: "Can I get a refund on my membership?",
        answer: "Memberships are non-refundable once processed. If you have special circumstances, please contact us to discuss your situation.",
      },
    ],
  },
  {
    title: "Competition",
    faqs: [
      {
        question: "How do I register for events?",
        answer: "All event registration is handled through Smoothcomp. Once you have an active USA Grappling membership, you can browse and register for sanctioned events across the country.",
      },
      {
        question: "What age groups can compete?",
        answer: "USA Grappling welcomes athletes of all ages. We have youth divisions starting from age 4 and adult divisions with no upper age limit. Masters divisions are available for competitors 30 and older.",
      },
      {
        question: "What grappling styles are included?",
        answer: "USA Grappling sanctions events in No-Gi submission grappling, Gi grappling/BJJ, and other grappling formats. Check individual event listings for specific rulesets.",
      },
      {
        question: "How do I qualify for Team USA?",
        answer: "Team USA selection is based on performance at designated qualifier events and national championships. Active membership is required, and you must be a US citizen or meet residency requirements.",
      },
    ],
  },
  {
    title: "Insurance & Coverage",
    faqs: [
      {
        question: "What insurance coverage do I get as a member?",
        answer: "Members receive accident medical insurance that covers injuries sustained at USA Grappling sanctioned events. This is secondary coverage that kicks in after your primary insurance.",
      },
      {
        question: "How do I file an insurance claim?",
        answer: "Contact USA Grappling directly after any injury at a sanctioned event. We'll provide you with the necessary forms and guide you through the claims process.",
      },
      {
        question: "Are coaches covered by liability insurance?",
        answer: "Yes, Grappling Leader members receive liability coverage when coaching at sanctioned events. This protects you from claims related to your coaching activities.",
      },
    ],
  },
  {
    title: "Coaches & Officials",
    faqs: [
      {
        question: "How do I become a certified coach?",
        answer: "Start by obtaining a Grappling Leader membership, then complete the required certification courses. Background checks and SafeSport training are included in the process.",
      },
      {
        question: "What are the referee certification requirements?",
        answer: "Referees must complete our referee certification course, pass a rules exam, and officiate a minimum number of matches under supervision before receiving full certification.",
      },
      {
        question: "Can I coach at events without certification?",
        answer: "To corner athletes at USA Grappling sanctioned events, you must have an active Grappling Leader membership. Certification levels may be required for specific high-level competitions.",
      },
    ],
  },
  {
    title: "Events & Sanctioning",
    faqs: [
      {
        question: "How do I sanction an event with USA Grappling?",
        answer: "Apply for an Event Sanction ($90) through Smoothcomp. Your event will receive official status, insurance coverage, and promotional support from USA Grappling.",
      },
      {
        question: "What are the benefits of hosting a sanctioned event?",
        answer: "Sanctioned events receive insurance coverage, official ranking points, listing on our event calendar, and association with the USA Grappling brand. Athletes prefer competing at sanctioned events for the coverage and credibility.",
      },
      {
        question: "How far in advance should I apply for sanctioning?",
        answer: "We recommend applying at least 30 days before your event to ensure processing time and maximum promotional exposure.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl">
              Find answers to common questions about USA Grappling membership, 
              events, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-accent rounded-full" />
                  {category.title}
                </h2>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.title}-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <a href="/contact">Contact Us</a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <a href={SMOOTHCOMP_URL} target="_blank" rel="noopener noreferrer">
                  Visit Smoothcomp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;