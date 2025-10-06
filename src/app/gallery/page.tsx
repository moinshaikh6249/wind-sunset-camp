
'use client';

import Image from "next/image";
import { useDatabase, useMemoFirebase } from "@/firebase";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
import { ref } from "firebase/database";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type DbGalleryImage = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

type DbGalleryImages = {
    [id: string]: DbGalleryImage;
}

function ImageSkeleton() {
    return (
        <div className="relative aspect-w-3 aspect-h-2 rounded-xl overflow-hidden group">
            <Skeleton className="w-full h-full" />
        </div>
    )
}

export default function GalleryPage() {
  const database = useDatabase();
  const galleryRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'galleryImages');
  }, [database]);

  const { data: galleryData, isLoading } = useDatabaseValue<DbGalleryImages>(galleryRef);

  const galleryImages = useMemo(() => {
    if (!galleryData) return [];
    return Object.values(galleryData);
  }, [galleryData]);

  return (
    <div className="bg-background woody-texture-background">
        <div className="container mx-auto px-4 sm:px-8 py-12 md:py-16">
            <div className="text-center max-w-4xl mx-auto mb-10">
                <h1 className="font-headline text-4xl md:text-5xl text-heading-color heading-shadow heading-underline mb-6">
                  Camp Gallery
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A glimpse into the adventures and serene moments at Wind & Sunset Camp.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <ImageSkeleton />
                        <ImageSkeleton />
                        <ImageSkeleton />
                        <ImageSkeleton />
                        <ImageSkeleton />
                        <ImageSkeleton />
                    </>
                ) : galleryImages.length > 0 ? (
                    galleryImages.map((image) => (
                        <div key={image.id} className="relative aspect-w-3 aspect-h-2 rounded-xl overflow-hidden group shadow-md transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
                            <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            data-ai-hint={image.imageHint}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white text-sm drop-shadow-md">{image.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground mb-4">The gallery is currently empty. Adventures await to be captured!</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
