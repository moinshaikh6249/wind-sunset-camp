
"use client";

import { BookingForm } from "./BookingForm";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, Suspense } from "react";
import { doc } from "firebase/firestore";
import Image from "next/image";
import { Calendar, IndianRupee, LoaderCircle, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Camp = {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    price: number;
    activities: string[];
    image: {
        id: string;
        imageUrl: string;
        imageHint: string;
    };
};

function BookingPageContent() {
  const [user, isUserLoading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  const campId = searchParams.get("camp");

  const campRef = useMemo(() => {
    if (!campId) return null;
    return doc(db, `camps/${campId}`);
  }, [campId]);
  
  const [camp, isCampLoading] = useDocumentData<Camp>(campRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      const redirectUrl = campId ? `/login?redirect=/booking?camp=${campId}` : '/login?redirect=/booking';
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, campId]);

  if (isUserLoading || !user || (campId && isCampLoading)) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
        <h1 className="font-headline text-3xl md:text-5xl text-primary mb-6 text-gradient">
          Loading Your Adventure...
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We're getting everything ready for you.
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
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
                 {campId && camp ? (
                    <Card className="overflow-hidden">
                        <div className="relative h-64 w-full">
                            <Image src={camp.image.imageUrl} alt={camp.name} fill className="object-cover" />
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h2 className="font-headline text-3xl text-gradient mb-2">{camp.name}</h2>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-accent" /> {camp.date}
                                    </span>
                                     <span className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-accent" /> {camp.location}
                                    </span>
                                </div>
                            </div>

                            <p className="text-muted-foreground">{camp.description}</p>
                            
                            {camp.price > 0 && (
                                <Badge className="text-lg font-bold">
                                    <IndianRupee className="h-5 w-5 mr-1" />
                                    {camp.price}
                                </Badge>
                            )}

                             {camp.activities && camp.activities.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-accent" />
                                        Activities
                                    </h4>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {camp.activities.map((activity, index) => (
                                            <li key={index}>{activity}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                ) : campId ? (
                     <p className="text-muted-foreground">Loading camp details...</p>
                ) : null}
            </div>
            <div className="lg:col-span-2">
                <BookingForm />
            </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
             <div className="container mx-auto px-4 py-16 md:py-24 text-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                <h1 className="font-headline text-3xl md:text-5xl text-primary mb-6 text-gradient">
                    Loading...
                </h1>
            </div>
        }>
            <BookingPageContent />
        </Suspense>
    )
}
