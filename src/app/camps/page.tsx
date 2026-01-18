
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
import { Calendar, MapPin, IndianRupee, Zap, Tent } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function CampsPage() {
  const campsRef = useMemo(() => collection(db, 'camps'), []);
  const [upcomingCamps, isLoading] = useCollectionData<Camp>(campsRef, { idField: 'id' });


  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="font-headline text-4xl md:text-6xl text-heading-color heading-shadow heading-underline mb-6">
            Upcoming Camps
          </h1>
          <p className="text-lg text-muted-foreground">
            Your next adventure is just around the corner. Find the perfect camp
            for you and get ready to explore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
                <CampCardSkeleton />
                <CampCardSkeleton />
                <CampCardSkeleton />
            </>
          ) : upcomingCamps && upcomingCamps.length > 0 ? (
            upcomingCamps.map((camp) => {
              const imageUrl = isValidImageUrl(camp.image?.imageUrl) 
                ? camp.image.imageUrl 
                : `https://picsum.photos/seed/${camp.id}/600/400`;

              return (
              <Card
                key={camp.id}
                id={camp.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={camp.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={camp.image.imageHint}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
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
                      <Link href={`/booking?camp=${camp.id}`}>Book This Camp</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            )})
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
