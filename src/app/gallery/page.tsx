
'use client';

import { db } from "@/lib/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { useEffect, useMemo } from "react";

// Define the type based on the exact fields required.
type GalleryImage = {
  id: string;
  imageUrl: string;
  description: string;
  createdAt: any; // Keep `any` for serverTimestamp flexibility
};

export default function GalleryPage() {
  // Create the Firestore query, ordered by createdAt descending.
  const galleryQuery = useMemo(() => 
    query(collection(db, "galleryImages"), orderBy("createdAt", "desc"))
  , []);
  
  // Use the hook to fetch data.
  const [images, isLoading] = useCollectionData<Omit<GalleryImage, 'id'>>(galleryQuery, { idField: 'id' });

  // Add console log for debugging, as requested.
  useEffect(() => {
    if (!isLoading) {
      console.log("Gallery Images:", images);
    }
  }, [images, isLoading]);

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
                {/* Handle loading state */}
                {isLoading ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">Loading gallery...</p>
                    </div>
                ) : images && images.length > 0 ? (
                    // Render images if they exist
                    images.map((image) => (
                        <div key={image.id} className="relative aspect-w-3 aspect-h-2 rounded-xl overflow-hidden group shadow-md transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
                            {/* Use normal <img> tag with imageUrl */}
                            <img
                                src={image.imageUrl}
                                alt={image.description}
                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                {/* Use description for the overlay text */}
                                <p className="text-white text-sm drop-shadow-md">{image.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    // Handle empty state
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No images available</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
