
'use client';

import Image from "next/image";
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
import { Calendar, MapPin, IndianRupee, Zap, Tent } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { adaptCamps } from "@/lib/adapters/campAdapter";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
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

const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

function CampCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden rounded-2xl bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
            <Skeleton className="h-56 w-full" />
            <div className="flex flex-col flex-grow p-6 space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                 <div className="mt-auto pt-4">
                    <Skeleton className="h-11 w-full rounded-md" />
                 </div>
            </div>
        </Card>
    )
}

export default function CampsPageContent() {
  const [upcomingCamps, setUpcomingCamps] = useState<Camp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
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
        ? await api.get('/camps/search', {
            params: {
              ...(filters?.location ? { location: filters.location } : {}),
              ...(filters?.minPrice ? { minPrice: filters.minPrice } : {}),
              ...(filters?.maxPrice ? { maxPrice: filters.maxPrice } : {}),
              ...(filters?.date ? { date: filters.date } : {}),
            },
          })
        : await api.get('/camps');

      const camps = normalizeCampList(response);
      setUpcomingCamps(camps);
    } catch (error) {
      console.error('Failed to fetch camps:', error);
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
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedDate('');
    await fetchCamps();
  };


  return (
    <div className="bg-background woody-texture-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <Reveal className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-heading-color heading-shadow heading-underline mb-6">
            Upcoming Camps
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Your next adventure is just around the corner. Find the perfect camp
            for you and get ready to explore.
          </p>
        </Reveal>

        <Card className="mb-10 rounded-2xl border bg-card/85 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl sm:text-2xl">Search & Filter Camps</CardTitle>
            <CardDescription>
              Search by location, price range, and travel date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
              />
              <Input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="Min price"
              />
              <Input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Max price"
              />
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Button type="submit" className="w-full btn-glow" disabled={isLoading}>
                  Search
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {isLoading ? (
            <>
                <CampCardSkeleton />
                <CampCardSkeleton />
                <CampCardSkeleton />
            </>
          ) : upcomingCamps?.length > 0 ? (
            <>
            {upcomingCamps.map((camp, index) => {
              const campId = camp._id || camp.id;
              const imageUrl = isValidImageUrl(camp?.imageUrl || '')
                ? camp.imageUrl || '/images/placeholder.jpg'
                : '/images/placeholder.jpg';

              return (
              <motion.div
                key={campId}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={
                  !shouldReduceMotion && !isMobile
                    ? { scale: 1.03 }
                    : undefined
                }
                transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.05, ease: "easeOut" }}
                style={{ willChange: "transform" }}
              >
              <Card
                id={campId}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <motion.div
                    whileHover={
                      !shouldReduceMotion && !isMobile
                        ? { scale: 1.05 }
                        : undefined
                    }
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ width: "100%", height: "100%", willChange: "transform" }}
                  >
                    <Image
                      src={imageUrl}
                      alt={camp.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={camp?.imageHint || "camp adventure"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </motion.div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   {camp.price > 0 && (
                      <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg font-bold shadow-md">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {camp.price}
                      </Badge>
                    )}
                </div>
                <div className="flex flex-col flex-grow p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-2xl text-gradient">
                      {camp.name}
                    </CardTitle>
                    <CardDescription className="flex flex-col pt-2 text-sm gap-1">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-accent" /> {camp.date}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-accent" /> {camp.location}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow pt-4">
                    <p className="mb-6 text-muted-foreground text-sm line-clamp-3">
                      {camp.description}
                    </p>
                     {camp.activities && camp.activities.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                                <Zap className="h-4 w-4 text-accent" />
                                What's Included
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {camp.activities.map((activity, index) => (
                                    <Badge key={index} variant="secondary">{activity}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-0 mt-auto pt-6">
                    <Button asChild className="w-full btn-glow">
                      <Link href={`/camps/${campId}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
              </motion.div>
            )})}
            </>
          ) : (
             <div className="col-span-full text-center py-16 flex flex-col items-center">
                 <Tent className="h-16 w-16 text-muted-foreground/50 mb-4" />
                 <h3 className="text-xl font-semibold">No camps available right now.</h3>
                 <p className="text-muted-foreground mt-2">Stay tuned for exciting upcoming adventures!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
