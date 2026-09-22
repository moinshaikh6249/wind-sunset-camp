import type { Metadata } from 'next';
import Image from '@/components/ui/safe-image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  Calendar,
  IndianRupee,
  MapPin,
  Zap,
  ArrowLeft,
  Star,
  ShieldCheck,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Utensils,
  Music,
  Moon,
  Sun,
  Waves,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adaptCamp } from '@/lib/adapters/campAdapter';
import CampReviewsSection from './CampReviewsSection';
import CampAvailabilityCard from './CampAvailabilityCard';

type CampDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatCampDate = (value?: string) => {
  if (!value) return 'Date to be announced';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const getCamp = async (id?: string) => {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return null;
  }

  try {
    const backendApiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api`
        : process.env.NODE_ENV === 'production'
          ? 'https://wind-sunset-camp.vercel.app/api'
          : 'http://localhost:5000/api');
    const response = await fetch(`${backendApiUrl}/camps/${id}`, {
      cache: 'no-store',
    });

    if (response.status === 404 || response.status === 400) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch camp: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Camp API returned non-JSON response: ${response.status} ${contentType} (${backendApiUrl})`
      );
    }

    const payload = await response.json();

    const source = payload?.camp || payload?.data || payload;
    if (!source) {
      return null;
    }

    const camp = adaptCamp(source);

    if (!camp?._id && !camp?.id) {
      return null;
    }

    return camp;
  } catch (error: any) {
    throw error;
  }
};

export async function generateMetadata({ params }: CampDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: 'Camp Not Found',
    };
  }
  const camp = await getCamp(id);

  if (!camp) {
    return {
      title: 'Camp Not Found',
    };
  }

  return {
    title: `${camp.name} | Wind & Sunset Camp`,
    description: camp.description,
    alternates: {
      canonical: `/camps/${id}`,
    },
    openGraph: {
      title: `${camp.name} | Wind & Sunset Camp`,
      description: camp.description,
      images: camp.imageUrl ? [camp.imageUrl] : undefined,
    },
  };
}

const getActivityBadgeInfo = (activity: string) => {
  const lower = activity.toLowerCase();
  if (lower.includes('camp') || lower.includes('tent')) return { icon: '⛺', label: activity };
  if (lower.includes('fire') || lower.includes('bonfire')) return { icon: '🔥', label: activity };
  if (lower.includes('bbq') || lower.includes('dinner') || lower.includes('food')) return { icon: '🍽️', label: activity };
  if (lower.includes('music') || lower.includes('dj') || lower.includes('sing')) return { icon: '🎵', label: activity };
  if (lower.includes('star') || lower.includes('night') || lower.includes('gazing')) return { icon: '🌌', label: activity };
  if (lower.includes('sun') || lower.includes('rise') || lower.includes('set')) return { icon: '🌅', label: activity };
  if (lower.includes('lake') || lower.includes('walk') || lower.includes('water') || lower.includes('boating')) return { icon: '🌊', label: activity };
  if (lower.includes('game') || lower.includes('sport') || lower.includes('archery')) return { icon: '🎯', label: activity };
  return { icon: '⚡', label: activity };
};

export default async function CampDetailPage({ params }: CampDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const camp = await getCamp(id);

  if (!camp) {
    return (
      <div className="bg-background min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <Card className="border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl p-8 space-y-4">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Unable to load camp details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-sm">Please try again in a moment or explore our available camps.</p>
              <Button asChild className="btn-glow">
                <Link href="/camps">Browse All Camps</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const campId = camp._id;
  const imageSrc = camp.imageUrl || '/images/light-hero.png';
  const activitiesList = camp.activities && camp.activities.length > 0
    ? camp.activities
    : ['Lakefront Camping', 'Bonfire Night', 'BBQ Dinner', 'Stargazing', 'Sunrise Lake View'];

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl space-y-8">
        {/* TOP NAVIGATION & EDITORIAL GALLERY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-border/40 bg-card/60 text-xs font-bold text-foreground backdrop-blur-md transition-transform hover:-translate-x-1"
            >
              <Link href="/camps">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Camps
              </Link>
            </Button>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bold px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Pawna Lake Verified
            </Badge>
          </div>

          {/* EDITORIAL HERO GALLERY GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-border/40 relative">
            <div className="lg:col-span-2 relative h-full w-full group overflow-hidden">
              <Image
                src={imageSrc}
                alt={camp.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500/90 text-white border-none text-[11px] font-bold">
                    ★ 4.9 Supercamp
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md text-[11px] font-bold">
                    <MapPin className="h-3 w-3 mr-1" /> {camp.location}
                  </Badge>
                </div>
                <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-white font-extrabold tracking-tight drop-shadow-md">
                  {camp.name}
                </h1>
              </div>
            </div>

            {/* SIDE GALLERY PANELS */}
            <div className="hidden lg:grid grid-rows-2 gap-4 h-full">
              <div className="relative h-full w-full overflow-hidden rounded-2xl group">
                <Image
                  src="/images/light-hero.png"
                  alt="Camp Experience"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Sunset Vista
                </div>
              </div>
              <div className="relative h-full w-full overflow-hidden rounded-2xl group">
                <Image
                  src="/images/dark-hero.png"
                  alt="Bonfire & Stargazing"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Bonfire & Night Atmosphere
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HORIZONTAL FEATURE STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg text-xs font-semibold text-foreground">
          <div className="flex items-center gap-2.5 justify-center py-1">
            <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{camp.location || 'Pawna Lake'}</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center py-1 border-l border-border/40">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{activitiesList.length} Activities Included</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center py-1 sm:border-l border-border/40">
            <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{formatCampDate(camp.date)}</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center py-1 border-l border-border/40">
            <IndianRupee className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-extrabold text-sm">₹{camp.price} / person</span>
          </div>
        </div>

        {/* MAIN LAYOUT: LEFT CONTENT & RIGHT STICKY BOOKING CARD */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)] lg:items-start">
          {/* LEFT SECTION: ABOUT, ACTIVITIES, REVIEWS */}
          <div className="space-y-8">
            {/* ABOUT THIS CAMP */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 w-fit">
                  <Compass className="h-3 w-3 text-amber-500" /> Lakeside Story
                </div>
                <CardTitle className="font-headline text-3xl text-foreground mt-2">
                  About This Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <p>{camp.description}</p>
                <p>
                  Immerse yourself in the tranquility of Pawna Lake. Enjoy comfortable lakeside tents, evening bonfire under open stars, freshly prepared BBQ, music, and an unforgettable sunrise over calm waters.
                </p>
              </CardContent>
            </Card>

            {/* INCLUDED ACTIVITIES GRID */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 w-fit">
                  <Sparkles className="h-3 w-3 text-emerald-500" /> Included Experiences
                </div>
                <CardTitle className="font-headline text-3xl text-foreground mt-2 flex items-center gap-2">
                  Activities & Amenities
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  All activities below are included in your campsite booking package.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activitiesList.map((act) => {
                    const info = getActivityBadgeInfo(act);
                    return (
                      <div
                        key={act}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-muted/30 hover:border-amber-500/40 transition-all hover:scale-[1.02] shadow-sm"
                      >
                        <span className="text-xl shrink-0">{info.icon}</span>
                        <span className="text-xs font-semibold text-foreground truncate">{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* WHAT'S INCLUDED CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 text-center space-y-1.5">
                <span className="text-2xl">🎪</span>
                <h4 className="text-xs font-bold text-foreground">Waterproof Tents</h4>
                <p className="text-[10px] text-muted-foreground">Foam mattress, clean pillows & blankets provided</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 text-center space-y-1.5">
                <span className="text-2xl">🍲</span>
                <h4 className="text-xs font-bold text-foreground">Meals Included</h4>
                <p className="text-[10px] text-muted-foreground">Evening snacks, Veg/Non-Veg BBQ & Buffet Dinner</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 text-center space-y-1.5">
                <span className="text-2xl">🛡️</span>
                <h4 className="text-xs font-bold text-foreground">Hygiene & Safety</h4>
                <p className="text-[10px] text-muted-foreground">Clean western toilets, 24/7 caretaker assistance</p>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <CampReviewsSection campId={campId} />
          </div>

          {/* RIGHT FLOATING STICKY BOOKING PANEL */}
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden border border-border/40 bg-card/90 dark:bg-card/70 shadow-2xl backdrop-blur-2xl transition-all duration-300">
              <CardHeader className="space-y-4 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border-b border-border/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
                      Reserve Your Spot
                    </span>
                    <CardTitle className="font-headline text-2xl text-foreground mt-1">
                      {camp.name}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold text-xs">
                    Available
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-foreground font-headline flex items-center">
                    <IndianRupee className="h-6 w-6 text-amber-500" />
                    {camp.price}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/ person per night</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/30">
                    <span className="text-muted-foreground font-medium">Location</span>
                    <span className="font-bold text-foreground">{camp.location}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/30">
                    <span className="text-muted-foreground font-medium">Event Date</span>
                    <span className="font-bold text-foreground">{formatCampDate(camp.date)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/30">
                    <span className="text-muted-foreground font-medium">Payment Method</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Pay at Campsite Available</span>
                  </div>
                </div>

                {/* LIVE AVAILABILITY INDICATOR */}
                <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Current Capacity Status
                  </p>
                  <CampAvailabilityCard campId={campId} />
                </div>

                <Button asChild size="lg" className="w-full btn-glow font-bold text-sm py-6 rounded-2xl shadow-xl">
                  <Link href={`/booking?campId=${campId}`}>
                    Reserve Your Spot Now
                  </Link>
                </Button>

                <p className="text-center text-[11px] text-muted-foreground font-medium">
                  🔒 Instant Confirmation • Flexible Pay at Campsite
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}