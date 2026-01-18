
'use client';

import { db } from "@/lib/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { LoaderCircle, Image as ImageIcon } from "lucide-react";

// This is the shape of the document in Firestore.
type GalleryImageDoc = {
  id: string; // Added by idField option in the hook
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: any;
};

export default function GalleryPage() {
  const galleryQuery = useMemo(() => 
    query(collection(db, "galleryImages"), orderBy("createdAt", "desc"))
  , []);
  
  // Capture the error object from the hook for debugging.
  const [images, isLoading, error] = useCollectionData<GalleryImageDoc>(galleryQuery, { idField: 'id' });

  // Effect for debugging Firestore connection and data.
  useEffect(() => {
    if (!isLoading) {
      console.log("Gallery Data:", images);
      if (error) {
        console.error("Firestore Error on Gallery Page:", error);
      }
    }
  }, [images, isLoading, error]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="col-span-full text-center py-12">
            <p className="text-destructive">Error loading images. Check the console for details.</p>
        </div>
      );
    }

    if (!images || images.length === 0) {
      return (
        <div className="col-span-full text-center py-12 flex flex-col items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No images available in the gallery yet.</p>
        </div>
      );
    }
    
    return images.map((image) => (
      <div key={image.id} className="relative aspect-w-3 aspect-h-2 rounded-xl overflow-hidden group shadow-md transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
          <img
              src={image.imageUrl}
              alt={image.description}
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white text-sm drop-shadow-md">{image.description}</p>
          </div>
      </div>
    ));
  }

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
                {renderContent()}
            </div>
        </div>
    </div>
  );
}
