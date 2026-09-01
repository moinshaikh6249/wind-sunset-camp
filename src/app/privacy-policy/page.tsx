import { Card } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Data Privacy
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            How Wind & Sunset Camp safeguards your personal details and booking information.
          </p>
        </div>

        <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">1. Information We Collect</h2>
              <p>
                We collect personal details such as your name, email address, phone number, and reservation dates required to process your campsite booking and issue booking passes.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground font-headline">2. Data Security & Storage</h2>
              <p>
                All guest data is securely encrypted. We never sell, rent, or trade your contact information to third parties.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
