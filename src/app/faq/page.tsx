import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is included in the camp package?",
    answer:
      "Camp packages typically include stay arrangements, selected activities, and basic support services as listed on the camp details page.",
  },
  {
    question: "What should I bring for camping?",
    answer:
      "You should bring personal essentials such as weather-appropriate clothing, toiletries, medicines, and any personal gear mentioned in your booking instructions.",
  },
  {
    question: "Are meals included?",
    answer:
      "Meal inclusion depends on the selected camp package and is clearly mentioned in the booking details before payment.",
  },
  {
    question: "Is the campsite safe?",
    answer:
      "Safety protocols and guided supervision are maintained at campsites, along with standard emergency readiness and on-ground coordination.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, cancellations are allowed subject to the active cancellation policy and applicable timelines for refunds or partial credits.",
  },
  {
    question: "Are pets allowed?",
    answer:
      "Pet allowance may vary by location and camp type. Please check the specific camp listing or contact support before booking.",
  },
];

export default function FAQPage() {
  return (
    <section className="max-w-[800px] mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-10">FAQ</h1>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
