
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upcomingCamps } from "@/lib/mock-data";
import { ArrowRight, Mountain, Sun, UsersRound } from "lucide-react";

export default function Home() {
  const featuredCamps = upcomingCamps.slice(0, 3);
  const heroImageUrl = "https://images.unsplash.com/photo-1505881502628-ac0bf1ae3e2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjYW1wZmlyZXxlbnwwfHx8fDE3NjAyOTE5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="flex flex-col">
      <section 
        className="relative h-[70vh] md:h-[90vh] w-full flex items-center justify-center text-center text-white bg-cover bg-center"
        style={{ backgroundImage: `url('${heroImageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-6 max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
            Adventure Under the Open Sky
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md font-body text-gray-200">
            Join us at Wind & Sunset Camp for an adventure that renews your spirit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="woody-texture text-shadow-engraved transition-transform duration-200 transform hover:scale-105"
            >
              <Link href="/camps">View Camps</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="woody-texture text-shadow-engraved transition-transform duration-200 transform hover:scale-105"
            >
              <Link href="/booking">Book Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 transition-all duration-200 transform hover:scale-105 woody-texture text-shadow-engraved"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-primary mb-4">
            An Adventure for Everyone
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
            Whether you&apos;re a seasoned explorer or a first-time camper, Wind & Sunset
            Camp offers a unique blend of adventure, relaxation, and connection
            with nature.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-4 transition-transform duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Mountain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline text-foreground">
                Expert-Led Expeditions
              </h3>
              <p className="text-muted-foreground">
                Journey with our experienced guides who are passionate about the
                outdoors.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 transition-transform duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Sun className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline text-foreground">
                Stunning Locations
              </h3>
              <p className="text-muted-foreground">
                From serene lakesides to majestic mountain peaks, our campsites
                are breathtaking.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 transition-transform duration-300 transform hover:-translate-y-2">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <UsersRound className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline text-foreground">
                Community & Connection
              </h3>
              <p className="text-muted-foreground">
                Share stories and create lasting memories around the campfire.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl md:text-4xl text-primary">
              Upcoming Camps
            </h2>
            <Button
              asChild
              variant="link"
              className="text-accent hover:text-accent/80 font-bold transition-transform duration-200 transform hover:scale-105"
            >
              <Link href="/camps">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCamps.map((camp) => (
              <Card
                key={camp.id}
                className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col transform hover:-translate-y-2 hover:rotate-1 bg-background"
              >
                {camp.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={camp.image.imageUrl}
                      alt={camp.name}
                      fill
                      className="object-cover"
                      data-ai-hint={camp.image.imageHint}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline text-primary">{camp.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {camp.description}
                  </p>
                  <Button asChild className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-transform duration-200 transform hover:scale-105">
                    <Link href={`/camps#${camp.id}`}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
