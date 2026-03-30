'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Flame, MapPin, Mountain, Star, Sun, Sunset, Tent, X } from 'lucide-react';

import api from '@/lib/api';
import { adaptCamps } from '@/lib/adapters/campAdapter';
import { Button } from '@/components/ui/button';

type Camp = {
  _id: string;
  id?: string;
  name: string;
  location: string;
  description: string;
  imageUrl?: string;
  date?: string;
  price?: number;
  featured?: boolean;
  status?: 'active' | 'inactive';
};

type Memory = {
  _id?: string;
  id?: string;
  imageUrl?: string;
  caption?: string;
  user?: {
    name?: string;
  };
  userName?: string;
};

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  quote: string;
};

const FALLBACK_IMAGE = '/images/light-hero.png';
const HERO_VIDEO_LIGHT = '/videos/light-hero.mp4.mp4';
const HERO_VIDEO_DARK = '/videos/dark-hero.mp4.mp4';

const heroChips = [
  'Warm sunrise breakfasts',
  'Cinematic night stays',
  'Bonfire nights',
  'Lakeside camping',
];

const sectionLinks = [
  { href: '#featured-camps', label: 'Featured Camps' },
  { href: '#camp-experience', label: 'Camp Experience' },
  { href: '#upcoming-camps', label: 'Upcoming Camps' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Contact' },
];

const timelineSteps = [
  {
    title: 'Arrival at Pawna Lake',
    description: 'Guests arrive at the lakeside campsite and check in to their tents.',
    icon: MapPin,
  },
  {
    title: 'Tent Setup & Welcome',
    description: 'Guests explore the campsite and settle into their comfortable tents.',
    icon: Tent,
  },
  {
    title: 'Sunset Views',
    description: 'Enjoy breathtaking sunset views over Pawna Lake.',
    icon: Sunset,
  },
  {
    title: 'Bonfire & Dinner',
    description: 'Gather around the bonfire with music, food and great company.',
    icon: Flame,
  },
  {
    title: 'Stargazing Night',
    description: 'Relax under the stars and enjoy peaceful lakeside nights.',
    icon: Star,
  },
  {
    title: 'Sunrise & Breakfast',
    description: 'Wake up to a beautiful sunrise and enjoy a warm breakfast.',
    icon: Sun,
  },
];

const whyChooseItems = [
  {
    title: 'Beautiful Pawna Lake Location',
    description: 'Enjoy breathtaking lakeside views surrounded by mountains and nature.',
    icon: Mountain,
  },
  {
    title: 'Bonfire & Night Activities',
    description: 'Relax around the bonfire, enjoy music and connect with fellow campers.',
    icon: Flame,
  },
  {
    title: 'Comfortable Tents',
    description: 'Spacious and cozy tents designed for a comfortable camping experience.',
    icon: Tent,
  },
  {
    title: 'Sunrise & Sunset Views',
    description: 'Witness magical sunsets and refreshing sunrises over Pawna Lake.',
    icon: Sun,
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'Aarav Patel',
    role: 'Weekend Traveler',
    rating: 5,
    quote: 'This felt like a luxury retreat by the lake. Clean setup, great food, and the bonfire vibe was perfect.',
  },
  {
    name: 'Riya Shah',
    role: 'Couple Getaway',
    rating: 5,
    quote: 'The sunset, music, and host experience were all premium. We booked again before we left.',
  },
  {
    name: 'Kunal Mehta',
    role: 'Group Organizer',
    rating: 4,
    quote: 'Super smooth coordination for our group. Tents were comfortable and the whole night felt cinematic.',
  },
  {
    name: 'Sneha Rao',
    role: 'Nature Lover',
    rating: 5,
    quote: 'A rare mix of comfort and raw nature. Sunrise at Pawna Lake is unforgettable.',
  },
  {
    name: 'Dev Malhotra',
    role: 'Adventure Seeker',
    rating: 5,
    quote: 'Best camp stay I have had near Pune. Great team, great energy, and excellent value.',
  },
];

const ratingForIndex = (index: number) => (4.7 + (index % 3) * 0.1).toFixed(1);

const formatDate = (value?: string) => {
  if (!value) return 'Date announced soon';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const normalizeMemories = (response: any): Memory[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.memories)) return response.memories;
  if (Array.isArray(response?.data?.memories)) return response.data.memories;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export default function Home() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [campFallback, setCampFallback] = useState<Record<string, boolean>>({});
  const [memoryFallback, setMemoryFallback] = useState<Record<string, boolean>>({});
  const [activeMemoryIndex, setActiveMemoryIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [campRes, memoryRes] = await Promise.allSettled([
        api.get('/camps'),
        api.get('/memories'),
      ]);

      if (!mounted) return;

      if (campRes.status === 'fulfilled') {
        const raw = Array.isArray(campRes.value)
          ? campRes.value
          : Array.isArray(campRes.value?.camps)
            ? campRes.value.camps
            : Array.isArray(campRes.value?.data)
              ? campRes.value.data
              : [];

        const normalized = adaptCamps(raw).filter((camp: Camp) => camp.status !== 'inactive');
        setCamps(normalized);
      } else {
        setCamps([]);
      }
      setIsLoadingCamps(false);

      if (memoryRes.status === 'fulfilled') {
        setMemories(normalizeMemories(memoryRes.value));
      } else {
        setMemories([]);
      }
      setIsLoadingMemories(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredCamps = useMemo(() => {
    const featured = camps.filter((camp) => camp.featured);
    const active = featured.length > 0 ? featured : camps;
    return active.slice(0, 6);
  }, [camps]);

  const featuredCampsForDisplay = useMemo(() => {
    if (featuredCamps.length >= 3) return featuredCamps;

    const usedIds = new Set(featuredCamps.map((camp) => camp.id || camp._id));
    const fillers = camps.filter((camp) => !usedIds.has(camp.id || camp._id));
    const merged = [...featuredCamps, ...fillers].slice(0, 3);

    if (merged.length === 0) return merged;
    while (merged.length < 3) merged.push(merged[merged.length - 1]);
    return merged;
  }, [featuredCamps, camps]);

  const upcomingCamps = useMemo(() => {
    const featuredIds = new Set(featuredCamps.map((camp) => camp.id || camp._id));
    const remaining = camps.filter((camp) => !featuredIds.has(camp.id || camp._id));
    const source = remaining.length > 0 ? remaining : camps;
    return source.slice(0, 3);
  }, [camps, featuredCamps]);

  const memoriesGrid = useMemo(() => {
    const source = memories.filter((memory) => typeof memory.imageUrl === 'string' && memory.imageUrl.trim().length > 0);
    return source.slice(0, 8);
  }, [memories]);

  const memoryWall = useMemo(() => {
    const source = memories.filter((memory) => typeof memory.imageUrl === 'string' && memory.imageUrl.trim().length > 0);
    return source.slice(0, 12);
  }, [memories]);

  const activeMemory = activeMemoryIndex !== null ? memoryWall[activeMemoryIndex] : null;

  const heroContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: reduceMotion ? 0 : 0.14,
      },
    },
  };

  const heroItem: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  const buttonGroup: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: reduceMotion ? 0 : 0.12,
      },
    },
  };

  const buttonItem: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <main className="scroll-smooth bg-[#f4efe6] text-[#1f3b2f] dark:bg-slate-900 dark:text-slate-200">
      <section ref={heroRef} id="hero" className="relative min-h-screen w-full overflow-hidden">
        <motion.div
          style={{ y: parallaxY }}
          animate={reduceMotion ? undefined : { scale: [1.06, 1.1, 1.06] }}
          transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 scale-[1.08]"
        >
          <video
            className="h-full w-full object-cover dark:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={HERO_VIDEO_LIGHT} type="video/mp4" />
          </video>
          <video
            className="hidden h-full w-full object-cover dark:block"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={HERO_VIDEO_DARK} type="video/mp4" />
          </video>
        </motion.div>

        <div className="absolute inset-0 bg-white/30 dark:bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.18),transparent_42%)]" />

        <motion.div
          variants={reduceMotion ? undefined : heroContainer}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
          className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 py-20 text-center md:px-10"
        >
          <motion.h1
            variants={reduceMotion ? undefined : heroItem}
            initial={reduceMotion ? { opacity: 1 } : undefined}
            animate={reduceMotion ? { opacity: 1 } : undefined}
            className="font-headline text-5xl leading-[0.95] text-white drop-shadow-xl sm:text-6xl md:text-7xl"
          >
            Wind &amp; Sunset Camp
          </motion.h1>

          <motion.p
            variants={reduceMotion ? undefined : heroItem}
            initial={reduceMotion ? { opacity: 1 } : undefined}
            animate={reduceMotion ? { opacity: 1 } : undefined}
            className="mt-5 max-w-2xl text-lg font-medium text-white/95 drop-shadow-xl sm:text-2xl"
          >
            Pawna Lake Camping Experience
          </motion.p>

          <motion.div
            variants={reduceMotion ? undefined : buttonGroup}
            initial={reduceMotion ? { opacity: 1 } : undefined}
            animate={reduceMotion ? { opacity: 1 } : undefined}
            className="mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div variants={reduceMotion ? undefined : buttonItem}>
              <Button asChild size="lg" className="w-full rounded-full bg-[#f59e0b] px-8 text-black shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-105 hover:bg-[#fbbf24] sm:w-auto">
                <Link href="/camps">Explore Camps</Link>
              </Button>
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : buttonItem}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full border-[#1f3b2f]/40 bg-white/60 px-8 text-[#193428] shadow-[0_0_18px_rgba(255,255,255,0.3)] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/85 dark:border-white/60 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:w-auto"
              >
                <Link href="/booking">Book Your Adventure</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {heroChips.map((chip) => (
              <motion.span
                key={chip}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                className="rounded-full border border-[#e7d9bd] bg-white/80 px-4 py-2 text-xs font-semibold text-[#244638] shadow-md backdrop-blur-sm transition-all duration-300 dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>

          <motion.nav
            initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full border border-[#1f3b2f]/20 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#173426] transition hover:bg-white/90 dark:border-white/20 dark:bg-black/20 dark:text-white dark:hover:bg-black/35"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>

          <motion.a
            href="#featured-camps"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: [0, 8, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center text-[#173426] dark:text-white"
          >
            <ChevronDown className="h-6 w-6" />
            <span className="mt-1 text-[10px] font-semibold tracking-[0.28em]">SCROLL</span>
          </motion.a>
        </motion.div>
      </section>

      <section id="featured-camps" className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b45309]">Premium Picks</p>
          <h2 className="font-headline text-3xl text-[#143023] sm:text-4xl">Featured Camps</h2>
        </div>

        {isLoadingCamps ? (
          <p className="mt-10 text-center text-sm text-[#4b6355]">Loading featured camps...</p>
        ) : (
          <div className="mx-auto mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featuredCampsForDisplay.map((camp, index) => {
              const campId = camp.id || camp._id || `camp-${index}`;
              const src = campFallback[campId] ? FALLBACK_IMAGE : (camp.imageUrl || FALLBACK_IMAGE);

              return (
                <motion.article
                  key={campId}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
                  className="group overflow-hidden rounded-2xl border border-[#d9cdb8] bg-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={src}
                      alt={camp.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      onError={() => {
                        setCampFallback((prev) => ({ ...prev, [campId]: true }));
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-semibold text-black shadow-[0_0_14px_rgba(245,158,11,0.45)]">
                        <CalendarDays className="mr-1 h-3.5 w-3.5" />
                        {formatDate(camp.date)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1f2937] shadow-[0_0_14px_rgba(255,255,255,0.4)]">
                        <Star className="h-3.5 w-3.5 fill-current text-[#f59e0b]" />
                        {ratingForIndex(index)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <h3 className="font-headline text-2xl text-[#1b3a2d] dark:text-slate-100">{camp.name}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[#4b6355] dark:text-slate-300">{camp.description || 'A scenic lakeside camp experience with premium setup and warm hospitality.'}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#325343] dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {camp.location}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#eaf5ee] px-3 py-1 font-semibold text-[#1b4d3a] dark:bg-slate-700 dark:text-slate-200">
                        {`₹${camp.price || 1999}`}
                      </span>
                    </div>
                    <Button asChild className="w-full rounded-full bg-[#1f6f57] hover:bg-[#195b48]">
                      <Link href={`/booking?campId=${campId}`}>
                        Book This Camp
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section id="camp-experience" className="relative overflow-hidden bg-[#f7f0e5] py-16 dark:bg-slate-900 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.12),transparent_36%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.12),transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b45309]">Your Camp Experience</p>
            <h2 className="mt-4 font-headline text-3xl text-[#143023] sm:text-4xl">A perfect weekend escape at Pawna Lake.</h2>
          </motion.div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute left-0 right-0 top-[34px] h-[2px] bg-gradient-to-r from-[#f3d6a1] via-[#f59e0b] to-[#f3d6a1] dark:from-slate-700 dark:via-amber-300 dark:to-slate-700" />
              <div className="grid grid-cols-6 gap-4">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <motion.article
                      key={step.title}
                      initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: 'easeOut' }}
                      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                      className="relative"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#efcc93] bg-gradient-to-br from-[#fff5e6] to-[#f8dab0] shadow-md transition-all duration-300 dark:border-amber-200/30 dark:from-slate-700 dark:to-slate-800 dark:shadow-[0_0_20px_rgba(251,191,36,0.18)]">
                        <Icon className="h-6 w-6 text-[#9a5c0d] dark:text-amber-200" />
                      </div>
                      <div className="mt-5 rounded-xl border border-[#e7d7be] bg-white p-4 text-center shadow-md dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b45309]">Step {index + 1}</p>
                        <h3 className="mt-2 text-base font-semibold text-[#1f3b2f] dark:text-slate-100">{step.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-[#4b6355] dark:text-slate-300">{step.description}</p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:hidden">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.title}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.06, ease: 'easeOut' }}
                  whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                  className="relative pl-16"
                >
                  {index !== timelineSteps.length - 1 && (
                    <div className="absolute bottom-[-28px] left-[31px] top-14 w-[2px] bg-gradient-to-b from-[#f59e0b] to-[#f3d6a1] dark:from-amber-300 dark:to-slate-700" />
                  )}
                  <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-[#efcc93] bg-gradient-to-br from-[#fff5e6] to-[#f8dab0] shadow-md transition-all duration-300 dark:border-amber-200/30 dark:from-slate-700 dark:to-slate-800 dark:shadow-[0_0_20px_rgba(251,191,36,0.18)]">
                    <Icon className="h-5 w-5 text-[#9a5c0d] dark:text-amber-200" />
                  </div>
                  <div className="rounded-xl border border-[#e7d7be] bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b45309]">Step {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#1f3b2f] dark:text-slate-100">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4b6355] dark:text-slate-300">{step.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why-choose-camp" className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-12 text-center"
        >
          <h2 className="font-headline text-3xl text-[#143023] sm:text-4xl">Why Choose Wind &amp; Sunset Camp</h2>
          <p className="mt-4 text-base text-[#4b6355] dark:text-slate-300">Experience the best lakeside camping at Pawna Lake.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyChooseItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: 'easeOut' }}
                className="rounded-2xl border border-[#e3d5bf] bg-white p-6 shadow-[0_18px_40px_rgba(48,30,12,0.12)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fde9c7] to-[#f2c98a] text-[#7b4b10] shadow-md dark:from-slate-700 dark:to-slate-800 dark:text-amber-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#1f3b2f] dark:text-slate-100">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4b6355] dark:text-slate-300">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="upcoming-camps" className="bg-[#fbf7f0] py-16 dark:bg-slate-900 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Next Dates</p>
            <h2 className="mt-4 font-headline text-3xl text-[#143023] sm:text-4xl">Upcoming Camps</h2>
          </div>

          {isLoadingCamps ? (
            <p className="text-center text-sm text-[#4b6355]">Loading upcoming camps...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingCamps.map((camp, index) => {
                const campId = camp.id || camp._id || `upcoming-${index}`;
                const src = campFallback[campId] ? FALLBACK_IMAGE : (camp.imageUrl || FALLBACK_IMAGE);

                return (
                  <motion.article
                    key={campId}
                    initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.06, ease: 'easeOut' }}
                    className="overflow-hidden rounded-2xl border border-[#e5d8c2] bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="relative h-48">
                      <Image
                        src={src}
                        alt={camp.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        onError={() => {
                          setCampFallback((prev) => ({ ...prev, [campId]: true }));
                        }}
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <h3 className="font-headline text-2xl text-[#1b3a2d] dark:text-slate-100">{camp.name}</h3>
                      <p className="inline-flex rounded-full bg-[#f3e7d3] px-3 py-1 text-xs font-semibold text-[#6e3f0f] dark:bg-slate-700 dark:text-slate-200">
                        {formatDate(camp.date)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-[#325343] dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {camp.location}
                        </span>
                        <span className="font-semibold text-[#1b4d3a] dark:text-slate-200">{`₹${camp.price || 1999}`}</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Moments</p>
          <h2 className="mt-4 font-headline text-3xl text-[#143023] sm:text-4xl">Gallery</h2>
        </div>

        {isLoadingMemories ? (
          <p className="text-center text-sm text-[#4b6355]">Loading gallery...</p>
        ) : memoriesGrid.length === 0 ? (
          <p className="text-center text-sm text-[#4b6355]">No gallery moments uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {memoriesGrid.map((memory, index) => {
              const memoryId = memory.id || memory._id || `memory-${index}`;
              const src = memoryFallback[memoryId] ? FALLBACK_IMAGE : (memory.imageUrl || FALLBACK_IMAGE);
              const tall = index % 5 === 0 || index % 5 === 3;

              return (
                <motion.div
                  key={memoryId}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.03, ease: 'easeOut' }}
                  className={`group relative overflow-hidden rounded-2xl ${tall ? 'row-span-2 h-[320px]' : 'h-[155px] sm:h-[170px]'}`}
                >
                  <Image
                    src={src}
                    alt={memory.caption || 'Customer camp memory'}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-110"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    onError={() => {
                      setMemoryFallback((prev) => ({ ...prev, [memoryId]: true }));
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-4 p-3 text-white opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs font-medium sm:text-sm">{memory.caption || 'Unforgettable Pawna moment'}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/80 sm:text-xs">
                      {memory.user?.name || memory.userName || 'Happy Camper'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section id="customer-memories" className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Customer Memories</p>
          <h2 className="mt-4 font-headline text-3xl text-[#143023] sm:text-4xl">Moments captured by our happy campers.</h2>
        </div>

        {isLoadingMemories ? (
          <p className="text-center text-sm text-[#4b6355]">Loading customer memories...</p>
        ) : memoryWall.length === 0 ? (
          <p className="text-center text-sm text-[#4b6355]">No customer memories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {memoryWall.map((memory, index) => {
              const memoryId = memory.id || memory._id || `wall-${index}`;
              const src = memoryFallback[memoryId] ? FALLBACK_IMAGE : (memory.imageUrl || FALLBACK_IMAGE);
              const dynamicHeight = index % 4 === 0 ? 'h-[240px]' : index % 3 === 0 ? 'h-[320px]' : 'h-[280px]';

              return (
                <motion.button
                  key={memoryId}
                  type="button"
                  initial={reduceMotion ? undefined : { opacity: 0 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.03, ease: 'easeOut' }}
                  onClick={() => setActiveMemoryIndex(index)}
                  className={`group relative w-full overflow-hidden rounded-2xl shadow-md transition-all duration-300 ${dynamicHeight}`}
                >
                  <Image
                    src={src}
                    alt={memory.caption || 'Customer memory'}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={() => {
                      setMemoryFallback((prev) => ({ ...prev, [memoryId]: true }));
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      <AnimatePresence>
        {activeMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
          >
            <button
              type="button"
              onClick={() => setActiveMemoryIndex(null)}
              className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveMemoryIndex((prev) => {
                if (prev === null) return prev;
                return prev === 0 ? memoryWall.length - 1 : prev - 1;
              })}
              className="absolute left-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.div
              key={activeMemory.id || activeMemory._id || activeMemoryIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-2xl"
            >
              <Image
                src={activeMemory.imageUrl || FALLBACK_IMAGE}
                alt={activeMemory.caption || 'Customer memory preview'}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            <button
              type="button"
              onClick={() => setActiveMemoryIndex((prev) => {
                if (prev === null) return prev;
                return prev === memoryWall.length - 1 ? 0 : prev + 1;
              })}
              className="absolute right-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="reviews" className="bg-[#f8f3ea] py-16 dark:bg-slate-900 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Reviews</p>
            <h2 className="mt-4 font-headline text-3xl text-[#143023] sm:text-4xl">What Guests Are Saying</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((review, index) => (
              <motion.article
                key={`${review.name}-${index}`}
                initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
                className="rounded-3xl border border-[#e3d9c8] bg-white/70 p-6 shadow-[0_12px_35px_rgba(50,35,14,0.09)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800/70"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-[#f59e0b] text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]' : 'text-[#d1d5db]'}`}
                    />
                  ))}
                </div>
                <p className="text-sm leading-7 text-[#2f4a3d] dark:text-slate-300">{review.quote}</p>
                <div className="mt-5 border-t border-[#ede4d6] pt-4 dark:border-slate-700">
                  <p className="font-semibold text-[#163528] dark:text-slate-100">{review.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b7f72] dark:text-slate-400">{review.role}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.22),transparent_35%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center text-white md:px-10">
          <motion.h2
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="font-headline text-4xl leading-tight sm:text-5xl"
          >
            Contact Wind &amp; Sunset Camp
          </motion.h2>
          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.05, ease: 'easeOut' }}
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base"
          >
            Plan your perfect lake weekend with our team. We will help you choose dates, camp style, and add-on experiences.
          </motion.p>
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="rounded-full bg-[#f59e0b] px-10 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 hover:bg-[#fbbf24] animate-pulse">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/70 bg-white/10 px-10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
            >
              <Link href="/booking">Book Your Adventure</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
