'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <motion.section
      id="final-cta"
      className="py-20 md:py-28 bg-transparent"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 p-10 md:p-14 shadow-[0_30px_70px_rgba(0,0,0,0.3)] text-center text-white border border-white/30"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.35),transparent_36%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.2),transparent_40%)]" />
          <h2 className="font-headline tracking-wide text-3xl md:text-5xl">Ready for your next adventure?</h2>
          <p className="mt-3 text-white/90 max-w-2xl mx-auto leading-relaxed">Book your lakeside escape now and secure your perfect weekend under the stars.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full px-8 py-3 bg-white text-emerald-700 hover:bg-white/90 shadow-[0_20px_44px_rgba(0,0,0,0.28)] hover:scale-105 transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.9)]">
              <Link href="/booking">Book Your Camp Now</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
