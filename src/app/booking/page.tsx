"use client";

import { BookingForm } from "./BookingForm";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, IndianRupee, LoaderCircle, MapPin, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { adaptCamp } from "@/lib/adapters/campAdapter";

type Camp = {
    _id: string;
    id?: string;
    name: string;
  date?: string;
    location: string;
    description: string;
    price: number;
  activities?: string[];
  imageUrl?: string;
  imageHint?: string;
};

function BookingPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [isCampLoading, setIsCampLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const campId = searchParams.get("campId") || searchParams.get("camp");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.user || response);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (isUserLoading || user) return;

    const redirectPath = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/booking";

    const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&message=${encodeURIComponent("Please login to continue booking")}`;
    router.replace(loginUrl);
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (campId) {
      const fetchCamp = async () => {
        try {
          setIsCampLoading(true);
          const response = await api.get(`/camps/${campId}`);
          const campData = adaptCamp(response?.camp || response?.data || response);
          setCamp(campData);
        } catch (error) {
          console.error('Failed to fetch camp:', error);
        } finally {
          setIsCampLoading(false);
        }
      };

      fetchCamp();
    }
  }, [campId]);

  if (isUserLoading || !user || (campId && isCampLoading)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
        <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl text-primary mb-6 text-gradient">
          Loading Your Adventure...
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8">
          We're getting everything ready for you.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary mb-6 text-gradient">
            Book Your Adventure
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {`Complete the form below to reserve your spot. You are booking as ${user.firstName || user.email}.`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
                 {campId && camp ? (
                    <Card className="overflow-hidden">
                        <div className="relative h-56 w-full sm:h-64">
                        <Image src={camp?.imageUrl ?? "/images/placeholder.jpg"} alt={camp.name} fill className="object-cover" />
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h2 className="font-headline text-2xl sm:text-3xl text-gradient mb-2">{camp.name}</h2>
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
       <div className="mx-auto w-full max-w-7xl px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8 lg:py-24">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
        <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl text-primary mb-6 text-gradient">
                    Loading...
                </h1>
            </div>
        }>
            <BookingPageContent />
        </Suspense>
    )
}
