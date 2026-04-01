'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewItem } from "./types";

type ReviewsProps = {
  items: ReviewItem[];
};

export function Reviews({ items }: ReviewsProps) {
  return (
    <motion.section
      id="reviews"
      className="py-20 md:py-28 bg-transparent"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-3xl md:text-4xl text-foreground">What Our Guests Are Saying</h2>
          <p className="text-muted-foreground mt-3">
            Real moments from campers who chose weekends under open skies.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {items.map((item, index) => (
            <motion.div
              key={item.name + item.quote}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="backdrop-blur-2xl bg-white/55 dark:bg-white/10 rounded-2xl p-6 shadow-[0_16px_36px_rgba(0,0,0,0.14)] border border-white/35 dark:border-white/12 transition-all duration-300 hover:shadow-[0_20px_46px_rgba(0,0,0,0.24)]"
            >
              <div className="mb-3 flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
              </div>
              <p className="text-foreground/90 leading-relaxed">{item.quote}</p>
              <p className="text-sm text-muted-foreground mt-5">{item.name}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild className="btn-glow">
            <Link href="/reviews">See All Reviews</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
