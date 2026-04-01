'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "./shared";
import { GalleryImageDoc } from "./types";

type GalleryProps = {
  memories: GalleryImageDoc[];
};

export function Gallery({ memories }: GalleryProps) {
  return (
    <motion.section
      id="gallery"
      className="relative py-20 md:py-28 bg-transparent"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(253,164,129,0.2),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(34,197,94,0.1),transparent_45%)]" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl text-foreground">Moments</h2>
            <p className="text-muted-foreground mt-2">A quick look at the camp mood before you book.</p>
          </div>
          <Button asChild variant="link" className="text-custom-green font-bold">
            <Link href="/gallery">Open Full Gallery <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="columns-2 md:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
          {(memories.length > 0 ? memories.slice(0, 6) : []).map((image, index) => (
            <motion.div key={`${image.id ?? `m-${index}`}-${index}`} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <Link href="/gallery" className="group relative block break-inside-avoid overflow-hidden rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.14)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.2)] transition-all duration-500">
              <div className={`relative ${index % 3 === 0 ? "h-60" : "h-44 md:h-56"}`}>
                <SafeImage
                  src={image.imageUrl}
                  alt={image.description || "Camp gallery preview"}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  hint={image.imageHint || "camp gallery"}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
