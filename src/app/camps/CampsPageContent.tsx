"use client";

import Image from "@/components/ui/safe-image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, IndianRupee, Zap, Tent, Sparkles, ArrowRight, ShieldCheck, Search, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { adaptCamps } from "@/lib/adapters/campAdapter";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Reveal, HeroReveal } from "@/components/animations/Reveal";

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

function CampCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card/80 dark:bg-card/70 backdrop-blur-xl shadow-lg">
      <Skeleton className="h-60 w-full" />
      <div className="flex flex-col flex-grow p-6 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-auto pt-4 flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export default function CampsPageContent() {
  const [upcomingCamps, setUpcomingCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const normalizeCampList = (response: any) => {
    const campList = Array.isArray(response)
      ? response
      : Array.isArray(response?.camps)
      ? response.camps
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.camps)
      ? response.data.camps
      : [];

    return adaptCamps(campList);
  };

  const fetchCamps = async (filters?: {
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    date?: string;
  }) => {
    try {
      setIsLoading(true);
      const hasFilters = Boolean(
        filters?.location || filters?.minPrice || filters?.maxPrice || filters?.date
      );

      const response = hasFilters
        ? await api.get("/camps/search", {
            params: {
              ...(filters?.location ? { location: filters.location } : {}),
              ...(filters?.minPrice ? { minPrice: filters.minPrice } : {}),
              ...(filters?.maxPrice ? { maxPrice: filters.maxPrice } : {}),
              ...(filters?.date ? { date: filters.date } : {}),
            },
          })
        : await api.get("/camps");

      const camps = normalizeCampList(response);
      setUpcomingCamps(camps);
    } catch (error) {
      console.error("Failed to fetch camps:", error);
      setUpcomingCamps([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await fetchCamps({
      location,
      minPrice,
      maxPrice,
      date: selectedDate,
    });
  };

  const handleReset = async () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedDate("");
    await fetchCamps();
  };

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <HeroReveal className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Pawna Lake Adventures
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Upcoming Camps
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your perfect escape. Lakeside camping, bonfire nights, BBQ, music, and starlit views at Pawna Lake.
          </p>
        </HeroReveal>

        {/* SEARCH & FILTER CARD */}
        <Card className="rounded-3xl border border-border/40 bg-card/80 shadow-2xl backdrop-blur-xl transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="font-headline text-xl sm:text-2xl text-foreground flex items-center gap-2">
              <Search className="h-5 w-5 text-amber-500" /> Search & Filter Camps
            </CardTitle>
            <CardDescription className="text-xs">
              Filter by location, date, or budget to find your Pawna Lake stay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location (e.g. Pawna Lake)"
                className="text-xs rounded-xl"
              />
              <Input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min price (₹)"
                className="text-xs rounded-xl"
              />
              <Input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max price (₹)"
                className="text-xs rounded-xl"
              />
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="text-xs rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-2">
                <Button type="submit" className="w-full btn-glow text-xs font-bold rounded-xl" disabled={isLoading}>
                  Search
                </Button>
                <Button type="button" variant="outline" className="w-full text-xs font-bold rounded-xl" onClick={handleReset} disabled={isLoading}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* CAMPS CARDS GRID */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <CampCardSkeleton />
              <CampCardSkeleton />
              <CampCardSkeleton />
            </>
          ) : upcomingCamps?.length > 0 ? (
            upcomingCamps.map((camp, index) => {
              const campId = camp._id || camp.id;
              const imageUrl = camp?.imageUrl || "/images/light-hero.png";
              const activities = camp.activities && camp.activities.length > 0
                ? camp.activities
                : ["Camping", "Bonfire", "BBQ Dinner", "Music", "Stargazing"];

              return (
                <motion.div
                  key={campId}
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.05, ease: "easeOut" }}
                >
                  <Card
                    id={campId}
                    className="group flex flex-col h-full overflow-hidden rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="relative h-60 w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={camp.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                        <Badge className="bg-emerald-500/20 text-white border-emerald-400/30 backdrop-blur-md text-[10px] font-bold">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Pawna Verified
                        </Badge>
                      </div>

                      {camp.price > 0 && (
                        <Badge className="absolute top-4 right-4 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-amber-400" />
                          {camp.price} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/ person</span>
                        </Badge>
                      )}

                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-400" /> {camp.location || "Pawna Lake"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-400" /> {camp.date || "Upcoming"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow p-6 space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="font-headline text-2xl text-foreground group-hover:text-amber-500 transition-colors">
                          {camp.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {camp.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" /> Included Experiences
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {activities.slice(0, 4).map((act, i) => (
                            <Badge key={i} variant="outline" className="rounded-xl border-border/40 bg-muted/30 text-[10px] font-medium py-0.5">
                              {act}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex items-center gap-2">
                        <Button asChild variant="outline" className="flex-1 text-xs font-bold rounded-xl border-border/40">
                          <Link href={`/camps/${campId}`}>View Camp</Link>
                        </Button>
                        <Button asChild className="flex-1 btn-glow text-xs font-bold rounded-xl">
                          <Link href={`/booking?campId=${campId}`}>
                            Book Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/60 flex flex-col items-center space-y-3">
              <Tent className="h-16 w-16 text-muted-foreground/40" />
              <h3 className="text-xl font-bold text-foreground font-headline">No camps available matching filters.</h3>
              <p className="text-xs text-muted-foreground">Try resetting your search parameters or explore all upcoming adventures.</p>
              <Button onClick={handleReset} className="btn-glow text-xs font-bold rounded-full px-6">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
