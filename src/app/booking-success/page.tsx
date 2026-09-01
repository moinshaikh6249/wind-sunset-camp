import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, MessageCircle, Sparkles, Ticket, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BookingSuccessPageProps = {
  searchParams?: {
    bookingId?: string;
    campName?: string;
    campDate?: string;
    people?: string;
    totalPrice?: string;
    whatsappUrl?: string;
  };
};

export default function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const bookingId = searchParams?.bookingId || "BK-2026-0001";
  const campName = searchParams?.campName || "Pawna Lake Camp";
  const campDate = searchParams?.campDate || "To be confirmed";
  const people = searchParams?.people || "2";
  const totalPrice = searchParams?.totalPrice || "₹0";
  const whatsappUrl = searchParams?.whatsappUrl;

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="overflow-hidden border border-border/40 bg-card/90 dark:bg-card/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 sm:p-10 space-y-8">
          {/* SUCCESS HEADER */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 shadow-xl ring-8 ring-emerald-500/10">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bold px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Reserved & Confirmed
              </Badge>
              <h1 className="font-headline text-3xl sm:text-4xl text-foreground font-extrabold tracking-tight">
                Booking Request Received 🎉
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Your reservation has been logged. Pay cash or UPI conveniently at the campsite upon check-in.
              </p>
            </div>
          </div>

          {/* DIGITAL PASS TICKET */}
          <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-amber-500" /> Digital Camp Pass
              </span>
              <span>Pay at Campsite</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground font-medium">Booking ID</span>
                <span className="font-mono font-bold text-foreground">{bookingId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground font-medium">Camp Experience</span>
                <span className="font-bold text-foreground">{campName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground font-medium">Camp Date</span>
                <span className="font-bold text-foreground">{campDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-muted-foreground font-medium">Number of Guests</span>
                <span className="font-bold text-foreground">{people} Adventurers</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground font-medium">Total Amount Due</span>
                <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
            {whatsappUrl ? (
              <Button asChild className="sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl py-5 shadow-lg">
                <Link href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> Open WhatsApp Chat
                </Link>
              </Button>
            ) : null}
            <Button asChild className="sm:flex-1 btn-glow text-xs font-bold rounded-xl py-5">
              <Link href="/dashboard">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline" className="sm:flex-1 text-xs font-bold rounded-xl py-5 border-border/40">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
