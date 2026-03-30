import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <section className="max-w-[800px] mx-auto py-20 px-6">
      <div className="rounded-xl border bg-card p-8 md:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Booking Request Received 🎉</h1>
          <p className="text-muted-foreground">
            Your booking request has been received. Please pay at the campsite.
          </p>
        </div>

        <div className="space-y-4 text-sm md:text-base">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Booking ID</span>
            <span className="font-semibold">{bookingId}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Camp Name</span>
            <span className="font-semibold">{campName}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Camp Date</span>
            <span className="font-semibold">{campDate}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Number of People</span>
            <span className="font-semibold">{people}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Price</span>
            <span className="font-semibold">{totalPrice}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {whatsappUrl ? (
            <Button asChild variant="secondary" className="sm:flex-1">
              <Link href={whatsappUrl} target="_blank" rel="noreferrer">
                Open WhatsApp Chat
              </Link>
            </Button>
          ) : null}
          <Button asChild className="sm:flex-1">
            <Link href="/dashboard">View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="sm:flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
