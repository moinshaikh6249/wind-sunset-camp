
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teamMembers } from "@/lib/mock-data";
import { Compass, Leaf, Star } from "lucide-react";

export default function AboutPage() {
  const roleIcons: { [key: string]: React.ReactNode } = {
    'Founder & Lead Guide': <Compass className="h-4 w-4 text-accent" />,
    'Activities Coordinator': <Star className="h-4 w-4 text-accent" />,
    'Chef & Nutritionist': <Leaf className="h-4 w-4 text-accent" />,
  };

  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <section className="text-center max-w-4xl mx-auto mb-20">
          <div className="bg-card/80 dark:bg-card/70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg transition-all duration-300">
            <h1 className="font-headline text-4xl md:text-6xl mb-4 text-heading-color heading-shadow heading-underline">
              Our Story
            </h1>
            <div className="divider-icon my-4" />
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Wind & Sunset Camp was born from a simple yet profound love for the great
              outdoors. We believe that spending time in nature is not just a
              leisure activity, but a vital practice for well-being, connection,
              and personal growth.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to create accessible, memorable, and safe camping
              experiences for everyone. From seasoned mountaineers to families
              looking for their first adventure, we provide the guidance, gear, and
              gourmet campfire meals to make your trip unforgettable. We're more
              than a camping company; we're a community of nature lovers dedicated
              to preserving our wild spaces for generations to come.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-3xl md:text-5xl text-center mb-12 text-heading-color heading-shadow heading-underline">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="text-center border-0 bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-2 rounded-2xl team-card-hover"
              >
                <CardHeader className="items-center p-0">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-background">
                    <Image
                      src={member.image.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      data-ai-hint={member.image.imageHint}
                    />
                  </div>
                  <CardTitle className="font-headline text-2xl text-heading-color">
                    {member.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {roleIcons[member.role]}
                    <p className="text-accent font-semibold tracking-wider uppercase text-sm">{member.role}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                  <p className="text-muted-foreground text-base">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
