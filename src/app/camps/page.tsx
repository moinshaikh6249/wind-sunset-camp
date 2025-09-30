
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { upcomingCamps } from "@/lib/mock-data";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export default function CampsPage() {
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
          {upcomingCamps.map((camp) => (
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
                      <Link href={`/booking?camp=${encodeURIComponent(camp.name)}`}>Book This Camp</Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

    
