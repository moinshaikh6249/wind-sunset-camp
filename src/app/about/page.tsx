import Image from "@/components/ui/safe-image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teamMembers } from "@/lib/mock-data";
import { Compass, Leaf, Star, Sparkles, Heart, ShieldCheck, Tent, Flame, Waves, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const roleIcons: { [key: string]: React.ReactNode } = {
    Owner: <Compass className="h-4 w-4 text-amber-500" />,
    "Activities Coordinator": <Star className="h-4 w-4 text-amber-500" />,
    "Chef & Nutritionist": <Leaf className="h-4 w-4 text-amber-500" />,
  };

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl space-y-16">
        {/* HERO */}
        <Reveal className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Our Passion & Purpose
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Our Story
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Wind & Sunset Camp was born from a deep love for the Pawna Lake outdoors. We craft accessible, memorable, and safe lakeside camping experiences for everyone.
          </p>
        </Reveal>

        {/* EDITORIAL STORY SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Card className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl rounded-3xl p-8 space-y-4">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Heart className="h-4 w-4 text-amber-500" /> Founded with Heart
              </div>
              <CardTitle className="font-headline text-3xl text-foreground mt-2">
                Connecting People with Pawna Nature
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                We believe that spending quality time in nature is not just a weekend luxury, but a essential practice for well-being, authentic connection, and personal growth.
              </p>
              <p>
                Whether you're a first-time camper, a couple seeking a romantic sunset getaway, or a group celebrating a milestone, we provide high-grade tents, gourmet campfire meals, and warm hospitality to make your journey effortless.
              </p>
            </CardContent>
          </Card>

          <div className="relative h-[340px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-border/40 group">
            <Image
              src="/images/light-hero.png"
              alt="Pawna Lake Sunset"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Sunset Point</span>
              <p className="font-headline text-2xl font-bold">Unmatched Waterfront Views</p>
            </div>
          </div>
        </div>

        {/* WHAT MAKES US DIFFERENT */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-headline text-3xl sm:text-4xl text-foreground">Why Choose Wind & Sunset</h2>
            <p className="text-xs text-muted-foreground">The signature pillars of our campsite hospitality.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Tent className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl text-foreground">Private Lakeside Spots</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spacious waterproof tents situated directly along the Pawna Lake shoreline with prime sunset views.
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl text-foreground">Bonfire & Live Music</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evening campfires with acoustic music sessions, unlimited BBQ starters, and starlit night vibes.
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-headline text-xl text-foreground">Hygiene & Safety</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clean western toilets, 24/7 caretaker assistance, secure parking, and family-friendly environments.
              </p>
            </Card>
          </div>
        </section>

        {/* MEET THE TEAM */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-headline text-3xl sm:text-4xl text-foreground">Meet the Host</h2>
            <p className="text-xs text-muted-foreground">Dedicated professionals ensuring your stay is seamless.</p>
          </div>

          <div className="flex justify-center">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="text-center border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 rounded-3xl max-w-md w-full space-y-4"
              >
                <CardHeader className="items-center p-0 space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-emerald-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-background">
                    SM
                  </div>
                  <CardTitle className="font-headline text-3xl text-foreground">
                    {member.name}
                  </CardTitle>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                    {roleIcons[member.role] || <Star className="h-3.5 w-3.5" />}
                    {member.role}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <div className="rounded-3xl border border-border/40 bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-amber-500/20 p-8 md:p-12 text-center space-y-4 backdrop-blur-xl shadow-2xl">
          <h2 className="font-headline text-3xl sm:text-4xl text-foreground">Ready to Experience Pawna Lake?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Reserve your tent today and wake up to scenic lakefront views.
          </p>
          <Button asChild size="lg" className="btn-glow text-xs font-bold rounded-full px-8">
            <Link href="/camps">
              Explore Camps Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
