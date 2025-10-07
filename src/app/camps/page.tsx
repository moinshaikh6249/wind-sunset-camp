
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
import { Calendar, MapPin, LoaderCircle, IndianRupee, Zap } from "lucide-react";
import Link from "next/link";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
import { ref } from "firebase/database";
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

type DbCamps = {
    [id: string]: Camp;
}

const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        // More relaxed validation: just check if it's a valid URL format.
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

function CampCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden shadow-lg rounded-2xl">
            <Skeleton className="h-56 w-full" />
            <div className="flex flex-col flex-grow p-6">
                <Skeleton className="h-7 w-3/4 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                 <div className="mt-auto pt-4 border-t">
                    <Skeleton className="h-10 w-full" />
                 </div>
            </div>
        </Card>
    )
}

export default function CampsPage() {
  const database = useDatabase();
  const campsRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'camps');
  }, [database]);

  const { data: campsData, isLoading } = useDatabaseValue<DbCamps>(campsRef);

  const upcomingCamps = useMemo(() => {
    if (!campsData) return [];
    return Object.values(campsData);
  }, [campsData]);


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="font-headline text-4xl md:text-6xl mb-4 text-heading-color heading-shadow heading-underline">
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
          ) : upcomingCamps.length > 0 ? (
            upcomingCamps.map((camp) => {
              const imageUrl = isValidImageUrl(camp.image?.imageUrl) 
                ? camp.image.imageUrl 
                : `https://picsum.photos/seed/${camp.id}/600/400`;

              return (
              <Card
                key={camp.id}
                id={camp.id}
                className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-card transform hover:-translate-y-2 hover:scale-105 rounded-2xl"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={imageUrl}
                    alt={camp.name}
                    fill
                    className="object-cover"
                    data-ai-hint={camp.image.imageHint}
                  />
                   {camp.price > 0 && (
                      <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-lg font-bold">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {camp.price}
                      </Badge>
                    )}
                </div>
                <div className="flex flex-col flex-grow">
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl text-gradient">
                      {camp.name}
                    </CardTitle>
                    <CardDescription className="flex flex-col pt-2 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-accent" /> {camp.date}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-accent" /> {camp.location}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <p className="mb-6 text-muted-foreground">
                      {camp.description}
                    </p>
                     {camp.activities && camp.activities.length > 0 && (
                        <div className="mb-6">
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
                  <CardFooter className="mt-auto pt-4 border-t border-border/50">
                    <Button asChild className="w-full btn-glow">
                      <Link href={`/booking?camp=${camp.id}`}>Book This Camp</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            )})
          ) : (
             <div className="col-span-full text-center py-12">
                 <p className="text-muted-foreground mb-4">No upcoming camps at the moment. Please check back soon!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
