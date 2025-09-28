import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teamMembers } from "@/lib/mock-data";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-6xl text-primary mb-6">
            Our Story
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sunset Camp was born from a simple yet profound love for the great
            outdoors. We believe that spending time in nature is not just a
            leisure activity, but a vital practice for well-being, connection,
            and personal growth.
          </p>
          <p className="text-muted-foreground">
            Our mission is to create accessible, memorable, and safe camping
            experiences for everyone. From seasoned mountaineers to families
            looking for their first adventure, we provide the guidance, gear, and
            gourmet campfire meals to make your trip unforgettable. We&apos;re more
            than a camping company; we&apos;re a community of nature lovers dedicated
            to preserving our wild spaces for generations to come.
          </p>
        </section>

        <section className="mt-16 md:mt-24">
          <h2 className="font-headline text-3xl md:text-5xl text-primary text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="text-center border-0 bg-transparent shadow-none hover:bg-card/80 hover:shadow-xl transition-all duration-300 p-4"
              >
                <CardHeader className="items-center p-0">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 shadow-lg">
                    <Image
                      src={member.image.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      data-ai-hint={member.image.imageHint}
                    />
                  </div>
                  <CardTitle className="font-headline text-2xl">
                    {member.name}
                  </CardTitle>
                  <p className="text-accent font-semibold">{member.role}</p>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
