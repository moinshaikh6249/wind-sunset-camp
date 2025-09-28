import { BookingForm } from "./BookingForm";

export default function BookingPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-6xl text-primary mb-6">
            Book Your Adventure
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete the form below to reserve your spot. Let our AI assistant help you fill in the details!
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
