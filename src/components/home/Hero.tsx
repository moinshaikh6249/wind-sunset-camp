'use client';

import Link from "next/link";
import { RefObject } from "react";
import { motion, MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroProps = {
  heroRef: RefObject<HTMLElement>;
  videoY: MotionValue<string>;
  featureChips: string[];
};

const heroButtonContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.45,
    },
  },
};

const heroButtonItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Hero({ heroRef, videoY, featureChips }: HeroProps) {
  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center text-center text-white"
    >
      <motion.div style={{ y: videoY }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/light-hero.png')] bg-cover bg-center dark:bg-[url('/images/dark-hero.png')]" />
        <video
          className="h-full w-full object-cover dark:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/light-hero.png"
        >
          <source src="/videos/Light.mp4" type="video/mp4" />
        </video>
        <video
          className="hidden h-full w-full object-cover dark:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/dark-hero.png"
        >
          <source src="/videos/Dark.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/55 dark:from-black/30 dark:via-black/35 dark:to-black/70" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.22),transparent_45%)]" />

      <div className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="font-headline tracking-[0.02em] text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
        >
          Wind &amp; Sunset Camp
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-[0_10px_26px_rgba(0,0,0,0.45)] font-body text-white/95 leading-relaxed"
        >
          Pawna Lake Camping Experience
        </motion.p>

        <motion.div
          variants={heroButtonContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
        >
          <motion.div variants={heroButtonItem} whileHover={{ y: -2, scale: 1.02 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
            <Button asChild size="lg" className="relative overflow-hidden rounded-full px-8 py-3 w-full sm:w-auto backdrop-blur-xl border border-white/40 bg-white/20 text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:shadow-[0_22px_48px_rgba(0,0,0,0.45)] hover:bg-white/30">
              <Link href="#featured-camps">Explore Camps</Link>
            </Button>
          </motion.div>
          <motion.div variants={heroButtonItem} whileHover={{ y: -2, scale: 1.02 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
            <Button asChild size="lg" className="rounded-full px-8 py-3 w-full sm:w-auto bg-accent/95 text-white shadow-[0_16px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:shadow-[0_22px_50px_rgba(249,115,22,0.45)] hover:bg-accent">
              <Link href="/booking">Book Your Adventure</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {featureChips.map((chip, index) => (
            <motion.span
              key={chip}
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 3 + index * 0.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="backdrop-blur-xl bg-white/12 border border-white/30 rounded-full px-4 py-2 text-sm font-medium text-white shadow-[0_12px_26px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-white/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.32)]"
            >
              {chip}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <a
        href="#featured-camps"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-xs tracking-[0.2em] text-white/95 animate-bounce opacity-80"
      >
        <span className="rounded-full border border-white/35 bg-white/10 p-2 backdrop-blur-md">
          <ArrowDown className="h-4 w-4" />
        </span>
        SCROLL
      </a>
    </section>
  );
}
