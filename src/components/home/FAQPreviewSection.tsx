import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Preview FAQs for homepage - full list will be on FAQ page
const previewFaqs = [
  {
    question: "What does a USA Grappling membership include?",
    answer: "Your membership includes accident medical insurance at all sanctioned events, eligibility to compete for Team USA at world championships, member discounts, and access to the entire USA Grappling community and events nationwide.",
  },
  {
    question: "How do I register for events?",
    answer: "All event registration is handled through Smoothcomp. Once you have an active USA Grappling membership, you can browse and register for sanctioned events across the country.",
  },
  {
    question: "What age groups can compete?",
    answer: "USA Grappling welcomes athletes of all ages. We have youth divisions starting from age 4 and adult divisions with no upper age limit. Masters divisions are available for competitors 30 and older.",
  },
];

export function FAQPreviewSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to common questions about USA Grappling membership.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {previewFaqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
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

          <div className="text-center mt-8">
            <Link 
              to="/faq" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              View All FAQs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}