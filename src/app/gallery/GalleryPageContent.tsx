"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Maximize2,
  RotateCcw,
  Compass,
  MapPin,
} from "lucide-react";
import Image from "@/components/ui/safe-image";
import api from "@/lib/api";
import { adaptGalleryImages } from "@/lib/adapters/campAdapter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Reveal, HeroReveal } from "@/components/animations/Reveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type GalleryImageDoc = {
  _id: string;
  id?: string;
  imageUrl?: string;
  description: string;
  imageHint?: string;
  category?: string;
  featured?: boolean;
  createdAt?: any;
};

const CATEGORIES = [
  { id: "all", label: "All Moments" },
  { id: "camp", label: "Campsite" },
  { id: "activity", label: "Activities" },
  { id: "facility", label: "Facilities" },
  { id: "nature", label: "Nature & Sunset" },
];

export default function GalleryPageContent() {
  const [images, setImages] = useState<GalleryImageDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/gallery");
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
    } catch (err: any) {
      setError(err?.message || "Failed to load gallery images");
      console.error("Error loading gallery:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex]);

  // Filtered images list
  const filteredImages = useMemo(() => {
    if (activeCategory === "all") return images;
    return images.filter(
      (img) =>
        img.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [images, activeCategory]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null || filteredImages.length === 0) return;
    setSelectedIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : (prev ?? 0) - 1
    );
  }, [selectedIndex, filteredImages.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null || filteredImages.length === 0) return;
    setSelectedIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : (prev ?? 0) + 1
    );
  }, [selectedIndex, filteredImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  const selectedImage =
    selectedIndex !== null ? filteredImages[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-background woody-texture-background pb-24 text-foreground selection:bg-amber-500/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8 space-y-10 md:space-y-12">
        {/* HERO SECTION */}
        <HeroReveal className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>A GLIMPSE OF PAWNA</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight leading-tight">
            Camp Gallery
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Moments of serenity, lakeside bonfires, vibrant golden sunsets, and star-filled night skies at Wind & Sunset Camp.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-500" /> Pawna Lake, Lonavala
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-amber-500" /> Waterfront Campsite
            </span>
          </div>
        </HeroReveal>

        {/* CATEGORY FILTER CHIPS */}
        {!isLoading && !error && images.length > 0 && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-4xl mx-auto py-2 px-1"
          >
            {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedIndex(null);
                    }}
                    className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isActive
                        ? "text-amber-950 dark:text-amber-100 font-semibold shadow-md"
                        : "bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card border border-border/40"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryBg"
                        className="absolute inset-0 rounded-full bg-amber-500/20 border border-amber-500/50 dark:bg-amber-500/30"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
          </motion.div>
        )}

        {/* GALLERY CONTENT */}
        {isLoading ? (
          /* SKELETON PLACEHOLDERS MATCHING EDITORIAL GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[260px]">
            <div className="col-span-2 row-span-2 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
            <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
            <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
            <div className="col-span-1 row-span-2 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
            <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
            <div className="col-span-2 row-span-1 rounded-2xl md:rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
          </div>
        ) : error ? (
          /* ERROR STATE */
          <Reveal>
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-card/80 dark:bg-card/40 rounded-3xl border border-destructive/30 shadow-xl space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold font-headline text-foreground">
                Unable to Load Gallery
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {error}
              </p>
              <Button
                onClick={fetchImages}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-medium rounded-full text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try Again
              </Button>
            </div>
          </Reveal>
        ) : filteredImages.length === 0 ? (
          /* EMPTY STATE */
          <Reveal>
            <div className="max-w-md mx-auto text-center py-16 px-6 bg-card/80 dark:bg-card/40 rounded-3xl border border-dashed border-border/60 shadow-lg space-y-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline text-foreground">
                No Gallery Moments Found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeCategory !== "all"
                  ? `No photos available in "${CATEGORIES.find((c) => c.id === activeCategory)?.label}". Try viewing all moments!`
                  : "Campsite gallery moments are being prepared. Check back soon!"}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {activeCategory !== "all" ? (
                  <Button
                    onClick={() => setActiveCategory("all")}
                    variant="outline"
                    className="rounded-full text-xs"
                  >
                    View All Photos
                  </Button>
                ) : (
                  <Link href="/booking">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs">
                      Book Your Experience
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        ) : (
          /* EDITORIAL MASONRY GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[260px]">
            <AnimatePresence>
              {filteredImages.map((image, index) => {
                const imageId = image._id || image.id || `img-${index}`;
                const src = image?.imageUrl || "/images/light-hero.png";
                const isFeatured = index === 0;

                // Span classes for editorial visual hierarchy
                let spanClasses = "col-span-1 row-span-1";
                if (isFeatured) {
                  spanClasses = "col-span-2 row-span-2";
                } else if (index % 5 === 2) {
                  spanClasses = "col-span-1 row-span-2 md:row-span-2";
                } else if (index % 7 === 4 && !isMobile) {
                  spanClasses = "col-span-2 row-span-1";
                }

                return (
                  <motion.div
                    key={imageId}
                    layout
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.35,
                      delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.3),
                      ease: "easeOut",
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View image: ${image.description || "Camp gallery moment"}`}
                    onClick={() => setSelectedIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedIndex(index);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/40 bg-card shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${spanClasses}`}
                  >
                    <Image
                      src={src}
                      alt={image.description || "Camp Moment"}
                      fill
                      priority={index < 2}
                      sizes={
                        isFeatured
                          ? "(max-width: 768px) 100vw, 50vw"
                          : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      }
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading={index < 2 ? "eager" : "lazy"}
                    />

                    {/* FEATURED BADGE */}
                    {isFeatured && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                          <Sparkles className="h-3 w-3 text-amber-400" /> Featured
                        </span>
                      </div>
                    )}

                    {/* HOVER GRADIENT OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" />

                    {/* OVERLAY CONTENT */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex items-end justify-between gap-2 z-10">
                      <div className="space-y-1 max-w-[80%]">
                        {image.category && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/30">
                            {image.category}
                          </span>
                        )}
                        <p className="text-white font-medium text-xs sm:text-sm drop-shadow-md line-clamp-2 leading-snug">
                          {image.description}
                        </p>
                      </div>

                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FULL-SCREEN CINEMATIC LIGHTBOX */}
      <AnimatePresence>
        {selectedIndex !== null && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6"
            onClick={() => setSelectedIndex(null)}
          >
            {/* LIGHTBOX CONTAINER */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col items-center justify-between rounded-3xl overflow-hidden bg-card/10 border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TOP BAR */}
              <div className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-white/10 text-white z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-400 tracking-wider">
                    {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                    {String(filteredImages.length).padStart(2, "0")}
                  </span>
                  {selectedImage.category && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-semibold uppercase tracking-wider">
                      {selectedImage.category}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedIndex(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="Close Lightbox"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* CENTER IMAGE DISPLAY */}
              <div className="relative w-full flex-1 min-h-[300px] flex items-center justify-center p-2 sm:p-6">
                <Image
                  src={selectedImage?.imageUrl || "/images/light-hero.png"}
                  alt={selectedImage.description || "Camp Gallery Photo"}
                  fill
                  className="object-contain"
                  priority
                />

                {/* PREVIOUS / NEXT NAV BUTTONS */}
                {filteredImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/80 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-xl z-20"
                      aria-label="Previous Image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={handleNext}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-black/80 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-xl z-20"
                      aria-label="Next Image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* FOOTER CAPTION BAR */}
              <div className="w-full bg-black/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between text-white border-t border-white/10 gap-2 z-20">
                <p className="text-xs sm:text-sm font-medium text-center sm:text-left text-white/90 line-clamp-2 max-w-2xl">
                  {selectedImage.description}
                </p>

                <div className="text-[11px] text-white/50 hidden sm:block whitespace-nowrap">
                  Use ← → keys to navigate • Esc to close
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
