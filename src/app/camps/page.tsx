
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
import { ref } from "firebase/database";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";


type Camp = {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    image: {
        id: string;
        imageUrl: string;
        imageHint: string;
    };
};

type DbCamps = {
    [id: string]: Camp;
}

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
                <Skeleton className="h-10 w-full mt-auto" />
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
            upcomingCamps.map((camp) => (
              <Card
                key={camp.id}
                id={camp.id}
                className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-card transform hover:-translate-y-2 hover:scale-105 rounded-2xl"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={camp.image.imageUrl}
                    alt={camp.name}
                    fill
                    className="object-cover"
                    data-ai-hint={camp.image.imageHint}
                  />
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
                    <p className="mb-6 text-muted-foreground flex-grow">
                      {camp.description}
                    </p>
                    <div className="mt-auto">
                      <Button asChild className="w-full btn-glow">
                        <Link href={`/booking?camp=${camp.id}`}>Book This Camp</Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
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
