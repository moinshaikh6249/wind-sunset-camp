import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Guest Agreement
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Operational policies and rules for guests staying at Wind & Sunset Camp.
          </p>
        </div>

        <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">1. Campsite Rules & Conduct</h2>
              <p>
                Guests are requested to respect nature, fellow campers, and campsite quiet hours (11:00 PM onwards). Plastic littering along Pawna Lake is strictly prohibited.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">2. Reservation Confirmation</h2>
              <p>
                A booking is confirmed once approved or reserved through our online system. Present your digital Booking Pass upon arrival at check-in.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
