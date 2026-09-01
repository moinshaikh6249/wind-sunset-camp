import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Payment Protection
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
            Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Clear timelines and rules regarding refund requests and payment processing.
          </p>
        </div>

        <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">1. Introduction</h2>
              <p>
                This Refund Policy explains when refunds are available for campsite bookings and online payment transactions processed through Wind & Sunset Camp.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">2. Processing Timelines</h2>
              <p>
                Approved refunds are initiated within 2 business days and credited back via original UPI / Bank account within 5-7 business days.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">3. Pay at Campsite Bookings</h2>
              <p>
                For Cash / Pay at Campsite bookings, no advance deposit is forfeited if cancelled 24 hours in advance.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
