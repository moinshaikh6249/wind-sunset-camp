
"use client";

import { BookingForm } from "./BookingForm";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/booking');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="font-headline text-3xl md:text-5xl text-primary mb-6 text-gradient">
          Just a moment...
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We're checking if you're logged in. You'll be redirected shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-6xl text-primary mb-6 text-gradient">
            Book Your Adventure
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete the form below to reserve your spot. You are booking as {user.displayName || user.email}.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
