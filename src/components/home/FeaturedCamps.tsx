'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camp } from "./types";
import { FeaturedCampSkeleton, SafeImage } from "./shared";

type FeaturedCampsProps = {
  featuredCamps?: Camp[];
  isLoading: boolean;
};

export function FeaturedCamps({ featuredCamps, isLoading }: FeaturedCampsProps) {
  return (
    <motion.section
      id="featured-camps"
      className="py-20 md:py-28 bg-background"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h2 className="font-headline text-3xl md:text-4xl text-foreground">
            Featured Experiences
          </h2>
          <p className="text-muted-foreground">Handpicked stays curated for unforgettable nights</p>
          <Button
            asChild
            variant="link"
            className="text-custom-green font-bold transition-transform duration-200 transform hover:scale-105"
          >
            <Link href="/camps">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-9">
          {isLoading ? (
            <>
              <FeaturedCampSkeleton />
              <FeaturedCampSkeleton />
              <FeaturedCampSkeleton />
            </>
          ) : featuredCamps?.map((camp) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="h-full"
            >
              <Card
                className="group rounded-2xl shadow-[0_18px_38px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 flex flex-col h-full bg-white/55 dark:bg-white/5 backdrop-blur-xl border border-white/45 dark:border-white/12"
              >
                <div className="relative h-52 w-full">
                  <SafeImage
                    src={camp.image?.imageUrl || "/images/light-hero.png"}
                    alt={camp.name}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    hint={camp.image?.imageHint || "camping lake sunset"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/8 to-transparent" />
                  <div className="absolute top-3 right-3 rounded-full bg-white/85 dark:bg-black/65 backdrop-blur px-3 py-1.5 text-xs font-semibold text-foreground dark:text-white flex items-center gap-1.5 shadow-md">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {camp.date || "Coming Soon"}
                  </div>
                  <div className="absolute top-3 left-3 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    🔥 Trending
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-full bg-white/85 dark:bg-black/60 px-2.5 py-1 text-xs font-semibold text-foreground dark:text-white flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 4.8
                  </div>
                </div>
                <CardContent className="flex-grow flex flex-col p-6">
                  <h3 className="font-headline text-xl mt-1 mb-2 text-foreground">{camp.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent dark:text-primary" />
                    {camp.location || "Pawna Lake, Lonavala"}
                  </p>
                  <p className="text-base font-semibold text-accent dark:text-primary mb-2">
                    {typeof camp.price === "number" ? `Starting at ₹${camp.price}` : camp.price || "Starting at ₹1,499 / person"}
                  </p>
                  <p className="text-sm text-foreground/90 mb-3 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 4.8 (Top Rated)
                  </p>
                  <p className="text-sm text-muted-foreground mb-5 flex-grow leading-relaxed line-clamp-2">
                    {camp.description}
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="rounded-full backdrop-blur-sm bg-white/70 dark:bg-transparent hover:bg-white">
                      <Link href={`/camps#${camp.id}`}>View Details</Link>
                    </Button>
                    <Button asChild className="btn-glow rounded-full">
                      <Link href="/booking">Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
