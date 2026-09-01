"use client";

import { BookingForm } from "./BookingForm";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/ui/safe-image";
import { Calendar, IndianRupee, LoaderCircle, MapPin, Zap, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { adaptCamp } from "@/lib/adapters/campAdapter";
import { Reveal } from "@/components/animations/Reveal";

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
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await api.get("/auth/me");
          setUser(response.user || response);
        }
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (isUserLoading || user) return;

    const redirectPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/booking";

    const loginUrl = `/login?redirect=${encodeURIComponent(
      redirectPath
    )}&message=${encodeURIComponent("Please login to continue booking")}`;
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
          console.error("Failed to fetch camp:", error);
        } finally {
          setIsCampLoading(false);
        }
      };

      fetchCamp();
    }
  }, [campId]);

  if (isUserLoading || !user || (campId && isCampLoading)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 md:py-24">
        <LoaderCircle className="h-10 w-10 animate-spin text-amber-500 mx-auto mb-4" />
        <h2 className="font-headline text-2xl sm:text-3xl text-foreground font-bold mb-2">
          Preparing Your Booking Form...
        </h2>
        <p className="text-xs text-muted-foreground">
          Fetching campsite details and account authorization.
        </p>
      </div>
    );
  }

  const campImage = camp?.imageUrl || "/images/light-hero.png";
  const activitiesList =
    camp?.activities && camp.activities.length > 0
      ? camp.activities
      : ["Lakeside Camping", "Bonfire & Music", "BBQ Dinner", "Stargazing"];

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 space-y-10">
        {/* STEP PROGRESS INDICATOR */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> 01 Select Camp
          </div>
          <div className="h-0.5 w-8 bg-amber-500/40" />
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
              2
            </span>{" "}
            02 Details & Guests
          </div>
          <div className="h-0.5 w-8 bg-border/40" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">
              3
            </span>{" "}
            03 Confirmation
          </div>
        </div>

        {/* HERO TITLE - MUST PRESERVE "Book Your Adventure" */}
        <Reveal className="text-center max-w-4xl mx-auto space-y-3">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Book Your Adventure
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            {`Complete the form below to reserve your spot at Pawna Lake. You are logged in as ${
              user.firstName || user.email
            }.`}
          </p>
        </Reveal>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 items-start">
          {/* LEFT: CAMP SUMMARY CARD */}
          <div className="lg:col-span-3 space-y-6">
            {campId && camp ? (
              <Card className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl">
                <div className="relative h-64 w-full sm:h-72">
                  <Image
                    src={campImage}
                    alt={camp.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <Badge className="bg-emerald-500/20 text-white border-emerald-400/40 text-[10px] font-bold">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Pawna Verified
                    </Badge>
                    <h2 className="font-headline text-3xl sm:text-4xl font-extrabold">
                      {camp.name}
                    </h2>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-muted/30 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />{" "}
                      {camp.location}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-muted/30 text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-amber-500" />{" "}
                      {camp.date || "Upcoming"}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                      <IndianRupee className="h-3.5 w-3.5" /> ₹{camp.price} / person
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" /> What's Included In This Camp
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activitiesList.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-border/40 bg-muted/20 text-xs font-medium text-foreground"
                        >
                          <span className="text-amber-500">✓</span> {act}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-border/60 bg-muted/20 p-8 rounded-3xl text-center space-y-2">
                <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="font-headline text-xl text-foreground font-bold">Select a Camp Below</h3>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred campsite from the dropdown on the right to view inclusions and live pricing.
                </p>
              </Card>
            )}
          </div>

          {/* RIGHT: BOOKING FORM CARD */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <BookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 md:py-24">
          <LoaderCircle className="h-10 w-10 animate-spin text-amber-500 mx-auto mb-4" />
          <h1 className="font-headline text-3xl font-bold text-foreground">
            Book Your Adventure
          </h1>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
