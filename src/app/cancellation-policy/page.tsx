import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Transparency Terms
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
            Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Fair and transparent cancellation guidelines for all Pawna Lake campsite reservations.
          </p>
        </div>

        <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">1. Cancellation Time Limits</h2>
              <p>
                Cancellations requested 48 hours prior to camp check-in time (4:00 PM) qualify for 100% full refund or free date rescheduling to another available weekend.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">2. Late Cancellations</h2>
              <p>
                Cancellations submitted within 24 to 48 hours before check-in qualify for a 50% refund or 70% credit voucher towards a future booking.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">3. No-Show Policy</h2>
              <p>
                If a guest does not arrive at the campsite without prior notice by 8:00 PM on Day 1, the reservation will be treated as a no-show and is ineligible for refund.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">4. Organizer Cancellation or Severe Weather</h2>
              <p>
                If a camp is cancelled by Wind & Sunset Camp due to severe weather alerts or operational constraints, guests will receive an immediate 100% full refund or free rebooking option.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
