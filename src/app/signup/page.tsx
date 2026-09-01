"use client";

import { SignupForm } from './SignupForm';
import Image from '@/components/ui/safe-image';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SignupPage() {
  return (
    <div className="bg-background min-h-screen grid grid-cols-1 lg:grid-cols-2 items-stretch">
      {/* LEFT: CINEMATIC HERO IMAGE PANEL (DESKTOP) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-black text-white">
        <Image
          src="/images/dark-hero.png"
          alt="Pawna Lake Bonfire"
          fill
          className="object-cover opacity-60 transition-transform duration-1000 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-lg">
            WS
          </div>
          <span className="font-headline text-xl font-bold tracking-tight">Wind & Sunset Camp</span>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-400" /> Join The Adventurers
          </Badge>
          <h2 className="font-headline text-4xl font-extrabold leading-tight">
            "Create your account and start your lakeside story today."
          </h2>
          <p className="text-xs text-white/70">
            Enjoy instant booking confirmations, member discounts, and personalized campsite passes.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 text-xs text-white/80">
          <span>★ 4.9 Verified Lakefront Campsite</span>
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Free & Instant Signup
          </span>
        </div>
      </div>

      {/* RIGHT: LUXURY FORM PANEL */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 woody-texture-background min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Start Your Journey
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Join our community of Pawna Lake campers today.
            </p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
