import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, HelpCircle, PhoneCall, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
  {
    question: "What is included in the Pawna Lake camp package?",
    answer:
      "Camp packages typically include tent accommodation (foam mattress, pillows, blankets), evening snacks with tea/coffee, unlimited Veg/Non-Veg BBQ, buffet dinner, morning breakfast, bonfire, acoustic music, and free parking.",
  },
  {
    question: "What should I bring for camping?",
    answer:
      "We recommend bringing personal essentials such as comfortable clothing, jacket for cold night temperatures, personal toiletries, power bank, personal medicines, and valid photo ID proof for check-in.",
  },
  {
    question: "Are meals included and what is the menu?",
    answer:
      "Yes! Meals are included. Dinner features both Veg (Paneer, Dal, Rice, Chapati) and Non-Veg (Chicken Curry, Rice, Chapati) buffet. BBQ starters are served during the bonfire hour.",
  },
  {
    question: "Is the campsite safe for families, couples, and women?",
    answer:
      "100% safe. Our campsite maintains 24/7 caretaker presence, clean western washrooms, guided supervision, family-friendly atmosphere, and first-aid emergency readiness.",
  },
  {
    question: "Can I pay cash at the campsite upon arrival?",
    answer:
      "Yes! We offer a 'Pay at Campsite' option. You can reserve your spot online and settle the payment in cash or UPI when you arrive at Pawna Lake.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellations made 48 hours prior to check-in time are eligible for full refund or free rescheduling to another weekend subject to availability.",
  },
  {
    question: "Are pets allowed at Pawna Lake camp?",
    answer:
      "Yes! We are a pet-friendly campsite. Please notify us on WhatsApp after booking so we can arrange suitable tent placements for your furry friend.",
  },
  {
    question: "What are the check-in and check-out timings?",
    answer:
      "Standard check-in time is 4:00 PM on Day 1 (enjoy sunset & snacks) and check-out time is 11:00 AM on Day 2 after morning breakfast.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl space-y-12">
        {/* HERO */}
        <Reveal className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Clear Answers
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Pawna Lake camping, check-in, inclusions, and safety.
          </p>
        </Reveal>

        <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="border-b border-border/40 py-2">
                <AccordionTrigger className="text-left font-bold text-sm sm:text-base text-foreground hover:text-amber-500 transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* STILL HAVE QUESTIONS */}
        <div className="rounded-3xl border border-border/40 bg-muted/30 p-8 text-center space-y-3 backdrop-blur-md">
          <HelpCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h3 className="font-headline text-2xl text-foreground">Still have questions?</h3>
          <p className="text-xs text-muted-foreground">Our team is available 24/7 on WhatsApp & phone call.</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild className="btn-glow text-xs font-bold rounded-full px-6">
              <Link href="/contact">
                Contact Us <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
