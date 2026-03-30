import axios from 'axios';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, IndianRupee, MapPin, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adaptCamp } from '@/lib/adapters/campAdapter';
import CampReviewsSection from './CampReviewsSection';

type CampDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const API_BASE_URL = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return raw.endsWith('/api') ? raw : `${raw}/api`;
})();

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

  if (!API_BASE_URL) {
    return null;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/camps/${id}`, {
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status === 404 || response.status === 400) {
      return null;
    }

    const source = response.data?.camp || response.data?.data || response.data;
    if (!source) {
      return null;
    }

    const camp = adaptCamp(source);

    if (!camp?._id && !camp?.id) {
      return null;
    }

    return camp;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

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

export default async function CampDetailPage({ params }: CampDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const camp = await getCamp(id);

  if (!camp) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <Card>
            <CardHeader>
              <CardTitle>Unable to load camp details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Please try again in a moment.</p>
              <Button asChild>
                <Link href="/camps">Back to Camps</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const campId = camp._id;
  const imageSrc = camp.imageUrl || '/images/placeholder.jpg';

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div className="relative h-[280px] overflow-hidden rounded-2xl sm:h-[360px] lg:h-[440px]">
              <Image
                src={imageSrc}
                alt={camp.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-custom-green">
                  Camp Details
                </p>
                <h1 className="font-headline text-4xl text-foreground md:text-5xl">{camp.name}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground md:text-base">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                    <MapPin className="h-4 w-4 text-custom-green" />
                    {camp.location}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                    <Calendar className="h-4 w-4 text-custom-green" />
                    {formatCampDate(camp.date)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                    <IndianRupee className="h-4 w-4 text-custom-green" />
                    {camp.price}
                  </span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">{camp.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-custom-green" />
                    Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {camp.activities && camp.activities.length > 0 ? (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {camp.activities.map((activity) => (
                        <li
                          key={activity}
                          className="rounded-xl border bg-card/60 px-4 py-3 text-sm font-medium text-foreground"
                        >
                          {activity}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Activities will be announced soon.</p>
                  )}
                </CardContent>
              </Card>

              <CampReviewsSection campId={campId} />
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden border-0 bg-card shadow-xl">
              <CardHeader className="space-y-4 bg-gradient-to-br from-custom-green/10 via-background to-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reserve your spot</p>
                    <CardTitle className="font-headline text-3xl">{camp.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  <span className="inline-flex items-center gap-1">
                    <IndianRupee className="h-6 w-6 text-custom-green" />
                    {camp.price}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                    <span>Location</span>
                    <span className="font-medium text-foreground">{camp.location}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                    <span>Date</span>
                    <span className="font-medium text-foreground">{formatCampDate(camp.date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
                    <span>Activities</span>
                    <span className="font-medium text-foreground">{camp.activities?.length || 0}</span>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full btn-glow">
                  <Link href={`/booking?campId=${campId}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}