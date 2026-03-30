
'use client';

import { useEffect, useState } from "react";
import { LoaderCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { adaptGalleryImages } from "@/lib/adapters/campAdapter";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Reveal } from "@/components/animations/Reveal";

// This is the shape of the document in MongoDB.
type GalleryImageDoc = {
  _id: string;
  id?: string;
  imageUrl?: string;
  description: string;
  imageHint?: string;
  createdAt: any;
};

export default function GalleryPageContent() {
  const [images, setImages] = useState<GalleryImageDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImageDoc | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/gallery');
        const rawImages = Array.isArray(response)
          ? response
          : Array.isArray(response?.images)
            ? response.images
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.images)
                ? response.data.images
                : [];
        const imageList = adaptGalleryImages(rawImages);
        setImages(imageList as GalleryImageDoc[]);
      } catch (err) {
        setError(err);
        console.error("Error loading gallery:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

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
    
    return (
      <>
        {images.map((image, index) => {
          const imageId = image._id || image.id;
          return (
            <motion.div
              key={imageId}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              className="group relative aspect-video overflow-hidden rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
              whileHover={
                !shouldReduceMotion && !isMobile
                  ? { scale: 1.03 }
                  : undefined
              }
              transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
              style={{ willChange: 'transform' }}
              onClick={() => setSelectedImage(image)}
            >
              <motion.div
                whileHover={
                  !shouldReduceMotion && !isMobile
                    ? { scale: 1.05 }
                    : undefined
                }
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ width: '100%', height: '100%', willChange: 'transform' }}
              >
                <Image
                  src={image?.imageUrl || "/images/placeholder.jpg"}
                  alt={image.description}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  data-ai-hint={image?.imageHint || "camp adventure"}
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium drop-shadow-md">{image.description}</p>
              </div>
            </motion.div>
          );
        })}
      </>
    );
  }

  return (
    <>
      <div className="bg-background woody-texture-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
              <Reveal className="text-center max-w-4xl mx-auto mb-16">
                  <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-heading-color heading-shadow heading-underline mb-6">
                    Camp Gallery
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  A glimpse into the adventures and serene moments at Wind & Sunset Camp.
                  </p>
              </Reveal>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                  {renderContent()}
              </div>
          </div>
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-0 shadow-none">
          {selectedImage && (
             <div className="relative aspect-video">
                <Image
                  src={selectedImage?.imageUrl ?? "/images/placeholder.jpg"}
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
