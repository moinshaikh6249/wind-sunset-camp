'use client';

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCampSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-xl flex flex-col w-full">
      <Skeleton className="h-48 w-full" />
      <CardContent className="flex-grow flex flex-col">
        <Skeleton className="h-6 w-3/4 mt-4" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export function SafeImage({
  src,
  alt,
  className,
  hint,
  priority = false,
}: {
  src: string;
  alt: string;
  className: string;
  hint?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const fallback = "/images/light-hero.png";

  return (
    <Image
      src={failed ? fallback : src}
      alt={alt}
      fill
      priority={priority}
      className={className}
      data-ai-hint={hint}
      onError={() => setFailed(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading={priority ? "eager" : "lazy"}
    />
  );
}
