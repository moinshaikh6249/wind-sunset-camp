
'use client';

import { db } from "@/lib/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// This is the shape of the document in Firestore.
type GalleryImageDoc = {
  id: string; // Added by idField option in the hook
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: any;
};

export default function GalleryPageContent() {
  const galleryQuery = useMemo(() => 
    query(collection(db, "galleryImages"), orderBy("createdAt", "desc"))
  , []);
  
  const [images, isLoading, error] = useCollectionData<GalleryImageDoc>(galleryQuery, { idField: 'id' });
  const [selectedImage, setSelectedImage] = useState<GalleryImageDoc | null>(null);

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
      return [...Array(8)].map((_, i) => (
        <div key={i} className="aspect-video w-full rounded-2xl bg-muted animate-pulse" />
      ));
    }
    
    if (error) {
       return (
        <div className="col-span-full text-center py-12">
            <p className="text-destructive">Error loading images. Please check the browser console for details.</p>
        </div>
      );
    }

    if (!images || images.length === 0) {
      return (
        <div className="col-span-full text-center py-16 flex flex-col items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-6" />
            <h3 className="text-xl font-semibold">Gallery is empty right now.</h3>
            <p className="text-muted-foreground mt-2">Amazing moments will appear here soon!</p>
        </div>
      );
    }
    
    return images.map((image) => (
      <div
        key={image.id}
        className="group relative aspect-video overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
        onClick={() => setSelectedImage(image)}
      >
        <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            data-ai-hint={image.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white font-medium drop-shadow-md">{image.description}</p>
        </div>
      </div>
    ));
  }

  return (
    <>
      <div className="bg-background woody-texture-background">
          <div className="container mx-auto px-4 sm:px-8 py-16 md:py-24">
              <div className="text-center max-w-4xl mx-auto mb-16">
                  <h1 className="font-headline text-4xl md:text-6xl text-heading-color heading-shadow heading-underline mb-6">
                    Camp Gallery
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  A glimpse into the adventures and serene moments at Wind & Sunset Camp.
                  </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {renderContent()}
              </div>
          </div>
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-0 shadow-none">
          {selectedImage && (
             <div className="relative aspect-video">
                <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.description}
                    fill
                    className="object-contain"
                />
             </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
