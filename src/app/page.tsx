'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Star, Tent, Users, Award, ShieldCheck, BadgeDollarSign, Headset, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

import api from '@/lib/api';
import { adaptCamps } from '@/lib/adapters/campAdapter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  id: string;
  name: string;
  travelerType: string;
  location: string;
  visitDate?: string;
  avatarUrl?: string;
  rating: number;
  verified: boolean;
  quote: string;
};

const FALLBACK_IMAGE = '/images/light-hero.png';
const HERO_VIDEO_LIGHT = '/videos/light-hero.mp4.mp4';
const HERO_VIDEO_DARK = '/videos/dark-hero.mp4.mp4';

const testimonials: Testimonial[] = [
  {
    id: 'neha',
    name: 'Neha Kulkarni',
    travelerType: 'Friends',
    location: 'Mumbai',
    visitDate: 'Jan 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    rating: 4.7,
    verified: true,
    quote:
      'Booked this for a quick break with college friends and it worked out really well. Check-in took maybe five minutes, tents were neat, and the late-night chai counter was a nice surprise.',
  },
  {
    id: 'aditya',
    name: 'Aditya Deshpande',
    travelerType: 'Couple',
    location: 'Pune',
    visitDate: 'Feb 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    rating: 4.3,
    verified: true,
    quote:
      'Went with my partner for her birthday weekend. Sunset view was honestly the highlight. Dinner came a little late on Saturday, but staff handled it politely and the rest of the stay was smooth.',
  },
  {
    id: 'sameer',
    name: 'Sameer Khan',
    travelerType: 'Solo',
    location: 'Thane',
    visitDate: 'Mar 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1542204625-de293a0f5f73?auto=format&fit=crop&w=160&q=80',
    rating: 4.2,
    verified: true,
    quote: 'Solo trip. Quiet mornings near the lake were perfect.',
  },
  {
    id: 'prerna',
    name: 'Prerna Nair',
    travelerType: 'Couple',
    location: 'Nashik',
    visitDate: 'Feb 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&q=80',
    rating: 4.9,
    verified: true,
    quote:
      'Property has a calm vibe and the organizers keep things moving without rushing anyone. We joined the acoustic session after dinner and ended up staying longer than planned.',
  },
  {
    id: 'rutuja',
    name: 'Rutuja Patil',
    travelerType: 'Friends',
    location: 'Kolhapur',
    visitDate: 'Jan 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    rating: 4.6,
    verified: true,
    quote:
      'This was our second visit and still felt fresh. Bonfire area was better arranged this time and music volume was balanced, so you could actually talk and chill.',
  },
  {
    id: 'harsh',
    name: 'Harsh Vora',
    travelerType: 'Solo',
    location: 'Ahmedabad',
    visitDate: 'Mar 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80',
    rating: 5.0,
    verified: true,
    quote:
      'Came here after a rough work month and needed a reset. Staff was kind, food portions were generous, and the sunrise kayaking add-on was worth it. I would come again.',
  },
];

const trustStats = [
  {
    icon: Award,
    value: '4.8',
    suffix: '⭐',
    label: 'Average Rating',
  },
  {
    icon: Users,
    value: '500+',
    suffix: '👥',
    label: 'Happy Campers',
  },
  {
    icon: Tent,
    value: '120+',
    suffix: '🏕',
    label: 'Camps Organized',
  },
  {
    icon: MapPin,
    value: '5+',
    suffix: '📍',
    label: 'Years Experience',
  },
];

const trustStrip = [
  '⭐ 4.8 Average Rating',
  '👥 500+ Happy Campers',
  '🏕 120+ Camps Organized',
];

const whyChooseFeatures = [
  {
    icon: ShieldCheck,
    title: 'Verified Campsites',
    description: 'Safe and trusted locations near Pawna Lake',
  },
  {
    icon: BadgeDollarSign,
    title: 'Best Price Guarantee',
    description: 'Affordable pricing with maximum value',
  },
  {
    icon: Headset,
    title: '24/7 Support',
    description: 'Always available for help and queries',
  },
  {
    icon: Star,
    title: '5-Star Experience',
    description: 'Highly rated by happy campers',
  },
];

const activities = [
  {
    emoji: '🔥',
    title: 'Bonfire Nights',
    description: 'Evening campfire stories by the lake.',
  },
  {
    emoji: '🎶',
    title: 'Live Music',
    description: 'Acoustic sessions under open skies.',
  },
  {
    emoji: '🎯',
    title: 'Lakeside Games',
    description: 'Fun group games near the waterfront.',
  },
  {
    emoji: '✨',
    title: 'Stargazing',
    description: 'Clear night skies and quiet moments.',
  },
  {
    emoji: '🍗',
    title: 'BBQ Dinner',
    description: 'Freshly grilled dinner by the camp.',
  },
  {
    emoji: '🌅',
    title: 'Sunrise Views',
    description: 'Wake up to scenic Pawna lake views.',
  },
];

const weekendTimeline = [
  {
    emoji: '🌅',
    title: 'Arrival & Check-in',
    description: 'Smooth check-in and lakeside welcome',
  },
  {
    emoji: '🔥',
    title: 'Bonfire & Music',
    description: 'Chill around the fire with music vibes',
  },
  {
    emoji: '🍗',
    title: 'BBQ Dinner',
    description: 'Fresh food under the stars',
  },
  {
    emoji: '🌌',
    title: 'Stargazing',
    description: 'Calm night under a sky full of stars',
  },
  {
    emoji: '☀️',
    title: 'Sunrise Breakfast',
    description: 'Peaceful morning with scenic views',
  },
];

const featuredHighlights = ['Meals Included', 'Bonfire & Music', 'Lakeside View', 'Free Parking'];

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
  const [activeReview, setActiveReview] = useState(0);
  const [isActivityDragging, setIsActivityDragging] = useState(false);
  const [isActivityHovered, setIsActivityHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const activityTrackRef = useRef<HTMLDivElement | null>(null);
  const activityPointerIdRef = useRef<number | null>(null);
  const activityIsDraggingRef = useRef(false);
  const activityDragStartXRef = useRef(0);
  const activityDragStartOffsetRef = useRef(0);
  const activityLoopWidthRef = useRef(0);
  const activityViewportRef = useRef<HTMLDivElement | null>(null);
  const activityCardRefs = useRef<Array<HTMLElement | null>>([]);
  const activityCurrentSpeedRef = useRef(0.028);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);
  const stripActivities = useMemo(() => [...activities, ...activities], []);
  const marqueeX = useMotionValue(0);

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

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
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
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: 'easeOut' },
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

  const getReviewRelativeIndex = (index: number) => {
    const total = testimonials.length;
    let diff = index - activeReview;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  };

  const normalizeMarqueeX = (value: number) => {
    const loop = activityLoopWidthRef.current;
    if (loop <= 0) return value;

    let next = value;
    while (next <= -loop) next += loop;
    while (next > 0) next -= loop;
    return next;
  };

  useEffect(() => {
    const track = activityTrackRef.current;
    if (!track) return;

    const measure = () => {
      activityLoopWidthRef.current = track.scrollWidth / 2;
      marqueeX.set(normalizeMarqueeX(marqueeX.get()));
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [marqueeX, stripActivities.length]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || isActivityDragging) return;
    if (activityLoopWidthRef.current <= 0) return;

    const targetSpeed = isActivityHovered ? -0.015 : 0.028;
    activityCurrentSpeedRef.current += (targetSpeed - activityCurrentSpeedRef.current) * 0.035;

    const next = marqueeX.get() + delta * activityCurrentSpeedRef.current;
    marqueeX.set(normalizeMarqueeX(next));

    const viewport = activityViewportRef.current;
    if (!viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const maxDistance = viewportRect.width / 2;

    activityCardRefs.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.min(Math.abs(cardCenter - viewportCenter), maxDistance);
      const focus = 1 - distance / maxDistance;
      card.style.setProperty('--focus-strength', focus.toFixed(3));
    });
  });

  const handleActivityPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    activityPointerIdRef.current = event.pointerId;
    activityIsDraggingRef.current = true;
    setIsActivityDragging(true);
    activityDragStartXRef.current = event.clientX;
    activityDragStartOffsetRef.current = marqueeX.get();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleActivityPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!activityIsDraggingRef.current || activityPointerIdRef.current !== event.pointerId) return;

    const deltaX = event.clientX - activityDragStartXRef.current;
    const next = activityDragStartOffsetRef.current + deltaX;
    marqueeX.set(normalizeMarqueeX(next));
  };

  const handleActivityPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activityPointerIdRef.current !== event.pointerId) return;

    activityIsDraggingRef.current = false;
    activityPointerIdRef.current = null;
    setIsActivityDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <main className="scroll-smooth bg-[#f4efe6] text-[#1f3b2f] selection:bg-accent/20 dark:bg-slate-900 dark:text-slate-200">
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/42 via-black/58 to-black/82 dark:from-black/38 dark:via-black/60 dark:to-black/86" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.1),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_26%,rgba(74,222,128,0.12),transparent_58%)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.52)]" />

        <motion.div
          variants={reduceMotion ? undefined : heroContainer}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
          className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 py-24 text-center md:px-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[23rem] w-full max-w-4xl -translate-y-1/2 rounded-[2.5rem] bg-black/28 blur-2xl dark:bg-black/45" />
          <div className="pointer-events-none absolute left-[24%] top-[32%] h-2.5 w-2.5 rounded-full bg-white/35 blur-[2px]" aria-hidden />
          <div className="pointer-events-none absolute right-[26%] top-[36%] h-2 w-2 rounded-full bg-amber-200/35 blur-[2px]" aria-hidden />
          <div className="pointer-events-none absolute left-[62%] top-[58%] h-1.5 w-1.5 rounded-full bg-white/30 blur-[1px]" aria-hidden />

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
            className="pointer-events-none absolute left-6 top-[26%] hidden rounded-2xl border border-white/30 bg-black/25 px-4 py-2 text-left shadow-[0_20px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md lg:block"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/75">Guest Rating</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              <Star className="h-3.5 w-3.5 text-[#f59e0b]" />
              4.8 out of 5
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: 'easeOut' }}
            className="pointer-events-none absolute right-6 top-[32%] hidden rounded-2xl border border-white/30 bg-black/25 px-4 py-2 text-left shadow-[0_20px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md lg:block"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/75">Trusted By</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              <Users className="h-3.5 w-3.5" />
              500+ Campers
            </p>
          </motion.div>

          <div className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-black/28 px-7 py-10 shadow-[0_34px_70px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:px-10 sm:py-12 md:px-12 md:py-14">
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_40px_rgba(255,255,255,0.06)]" />
            <motion.h1
              variants={reduceMotion ? undefined : heroItem}
              initial={reduceMotion ? { opacity: 1 } : undefined}
              animate={reduceMotion ? { opacity: 1 } : undefined}
              className="mx-auto max-w-3xl font-sans text-5xl font-bold leading-[1.02] tracking-[0.015em] drop-shadow-[0_8px_24px_rgba(0,0,0,0.52)] sm:text-6xl md:text-7xl"
            >
              <span className="block bg-gradient-to-b from-white via-[#fff8e6] to-[#fde7c3] bg-clip-text text-transparent">Escape the City.</span>
              <span className="mt-1 block bg-gradient-to-b from-white via-[#fff8e6] to-[#fde7c3] bg-clip-text text-transparent">Discover Pawna Lake.</span>
            </motion.h1>

            <motion.p
              variants={reduceMotion ? undefined : heroItem}
              initial={reduceMotion ? { opacity: 1 } : undefined}
              animate={reduceMotion ? { opacity: 1 } : undefined}
              className="mx-auto mt-7 max-w-2xl text-base font-medium leading-relaxed text-[#d1d5db] sm:text-lg"
            >
              Lakeside camping with meals, music and bonfire, starting at ₹999.
            </motion.p>

            <motion.div
              variants={reduceMotion ? undefined : heroItem}
              initial={reduceMotion ? { opacity: 1 } : undefined}
              animate={reduceMotion ? { opacity: 1 } : undefined}
              className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/88 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md sm:text-xs">
                <Star className="h-4 w-4" aria-hidden />
                4.8 Rating
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/88 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md sm:text-xs">
                <Users className="h-4 w-4" aria-hidden />
                500+ Campers
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/88 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md sm:text-xs">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Verified
              </span>
            </motion.div>

            <motion.div
              variants={reduceMotion ? undefined : buttonGroup}
              initial={reduceMotion ? { opacity: 1 } : undefined}
              animate={reduceMotion ? { opacity: 1 } : undefined}
              className="mt-10 flex w-full max-w-xl flex-col gap-4 sm:mx-auto sm:flex-row sm:justify-center"
            >
              <motion.div variants={reduceMotion ? undefined : buttonItem}>
                <Button
                  asChild
                  size="lg"
                  variant="primary"
                  className="w-full rounded-full px-10 py-3.5 text-base font-semibold shadow-[0_0_30px_rgba(245,158,11,0.42)] transition-all duration-300 hover:translate-y-[-1px] sm:w-auto"
                >
                  <Link href="/booking">Check Availability</Link>
                </Button>
              </motion.div>
              <motion.div variants={reduceMotion ? undefined : buttonItem}>
                <Button
                  asChild
                  size="lg"
                  variant="glass"
                  className="w-full rounded-full border-white/30 bg-white/10 px-10 py-3.5 text-base font-semibold text-white backdrop-blur-lg transition-all duration-300 hover:bg-white/18 sm:w-auto"
                >
                  <Link href="/camps">View Camps</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.a
            href="#featured-camps"
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: [0, 8, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center text-white/90"
          >
            <span className="text-xl leading-none">↓</span>
            <span className="mt-1 text-[10px] font-semibold tracking-[0.28em]">SCROLL</span>
          </motion.a>
        </motion.div>
      </section>

      <section id="trust-strip" className="border-y border-[#e6d8c0] bg-[#fbf5ea]/90 py-2.5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-center text-sm font-semibold text-[#3e5f50] dark:text-slate-200 md:px-10">
          {trustStrip.map((item) => (
            <span key={item} className="tracking-wide">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section id="weekend-story" className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-[#e5d8c2] bg-gradient-to-br from-[#f8f1e4] via-[#fbf7ee] to-[#f5ece0] px-6 py-14 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-gradient-to-br dark:from-[#060b1d] dark:via-[#0d1832] dark:to-[#1d1636] sm:px-8 md:px-12 md:py-16"
        >
          <div className="pointer-events-none absolute inset-0 hidden dark:block" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(99,102,241,0.16),transparent_48%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(74,222,128,0.1),transparent_34%)]" />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-white">
              Your Perfect Weekend at Pawna Lake
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#51685b] dark:text-[#cbd5e1] sm:text-lg">
              From sunset vibes to peaceful mornings — here&apos;s how your experience unfolds.
            </p>
          </div>

          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-[#d3c2a6] to-transparent dark:via-white/20 md:block" />
            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
              {weekendTimeline.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.08, ease: 'easeOut' }}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.015 }}
                  className="group relative z-10 min-w-[82%] snap-start rounded-2xl border border-[#e4d7c2] bg-white/80 p-6 text-center shadow-[0_14px_30px_-26px_rgba(15,23,42,0.65)] backdrop-blur-sm transition-all duration-300 hover:border-[#f59e0b]/35 hover:shadow-[0_24px_36px_-30px_rgba(245,158,11,0.55)] dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:shadow-[0_18px_38px_-30px_rgba(15,23,42,0.85)] dark:hover:border-[#4ade80]/45 dark:hover:brightness-110 dark:hover:shadow-[0_26px_38px_-28px_rgba(74,222,128,0.36)] md:min-w-0"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ead7] text-2xl shadow-[0_0_0_1px_rgba(245,158,11,0.15)] transition-transform duration-300 group-hover:scale-105 dark:bg-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_24px_rgba(99,102,241,0.25)]">
                    {step.emoji}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-[#153527] dark:text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#51685b] dark:text-[#cbd5e1]">{step.description}</p>
                </motion.article>
              ))}
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="mt-12 border-t border-[#e2d4bf] pt-7 text-center dark:border-white/10"
          >
            <p className="text-base font-medium text-[#27483a] dark:text-[#cbd5e1]">Ready to experience this?</p>
            <Button asChild variant="primary" className="mt-4 rounded-2xl px-8 py-3 text-sm font-semibold dark:bg-gradient-to-r dark:from-[#4ade80] dark:to-[#fb923c] dark:text-[#0b1220] dark:shadow-[0_0_24px_rgba(74,222,128,0.45)] dark:hover:scale-[1.03] dark:hover:shadow-[0_0_34px_rgba(251,146,60,0.42)]">
              <Link href="/booking">Book Your Camp</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section id="featured-camps" className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b45309]">Most Booked Stays</p>
          <h2 className="font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-slate-100">Featured Camps</h2>
        </div>

        {isLoadingCamps ? (
          <p className="mt-10 text-center text-sm text-[#4b6355]">Loading featured camps...</p>
        ) : featuredCampsForDisplay.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[#decfb8] bg-white/80 p-8 text-center shadow-[0_10px_30px_-24px_rgba(15,23,42,0.5)] dark:border-slate-700 dark:bg-slate-800/80">
            <p className="text-lg font-semibold text-[#163427] dark:text-slate-100">No featured camps are live right now.</p>
            <p className="mt-2 text-sm text-[#4b6355] dark:text-slate-300">Check upcoming dates or contact support to reserve your preferred weekend slot.</p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="rounded-2xl">
                <Link href="/camps">View Upcoming Camps</Link>
              </Button>
              <Button asChild variant="glass" className="rounded-2xl">
                <Link href="/contact">Talk to Support</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
            {featuredCampsForDisplay.map((camp, index) => {
              const campId = camp.id || camp._id || `camp-${index}`;
              const src = campFallback[campId] ? FALLBACK_IMAGE : (camp.imageUrl || FALLBACK_IMAGE);
              const valueBadge = index % 2 === 0 ? 'Most Popular' : 'Best Value';
              const availableDate = formatDate(camp.date);

              return (
                <motion.article
                  key={campId}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
                  className="group min-w-[86%] snap-start overflow-hidden rounded-2xl border border-[#d9cdb8] bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:min-w-[63%] lg:min-w-[44%] dark:border-slate-700 dark:bg-slate-800"
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
                        {availableDate}
                      </span>
                    </div>
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm">
                        {valueBadge}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1f2937] shadow-[0_0_14px_rgba(255,255,255,0.4)]">
                        <Star className="h-3.5 w-3.5 fill-current text-[#f59e0b]" />
                        {ratingForIndex(index)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="space-y-2">
                      <h3 className="font-sans text-2xl font-bold tracking-tight text-[#1b3a2d] dark:text-slate-100">{camp.name}</h3>
                      <p className="line-clamp-2 text-sm leading-6 text-[#4b6355] dark:text-slate-300">
                        {camp.description || 'A scenic lakeside camp experience with premium setup and warm hospitality.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-[#325343] dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {camp.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-medium">Next Available:</span> {availableDate}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#eaf5ee] px-3 py-1 font-semibold text-[#1b4d3a] dark:bg-slate-700 dark:text-slate-200">
                        {`Starting from ₹${camp.price || 999}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {featuredHighlights.map((point) => (
                        <span
                          key={`${campId}-${point}`}
                          className="rounded-full border border-[#d9cdb8] bg-[#f7f1e6] px-2.5 py-1 text-[11px] font-semibold text-[#365748] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                        >
                          {point}
                        </span>
                      ))}
                    </div>

                    <Button asChild variant="primary" className="w-full rounded-2xl py-3 text-base font-semibold">
                      <Link href={`/booking?campId=${campId}`}>
                        Check Availability
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

      <section id="why-choose-us" className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-slate-100">
            Why Choose Wind &amp; Sunset Camp
          </h2>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: 0.42, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="group rounded-2xl border border-[#e4d7c2] bg-white/80 p-5 text-center shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_38px_-24px_rgba(15,23,42,0.65)] dark:border-slate-700 dark:bg-slate-800/80"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e7d3] text-[#1e4d3a] transition-transform duration-300 group-hover:scale-110 dark:bg-slate-700 dark:text-slate-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-[#163427] dark:text-slate-100">{feature.title}</h3>
                <p className="mt-1 text-sm text-[#51685b] dark:text-slate-300">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="upcoming-camps" className="bg-[#fbf7f0] py-16 dark:bg-slate-900 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Next Dates</p>
            <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-slate-100">Upcoming Camps</h2>
          </div>

          {isLoadingCamps ? (
            <p className="text-center text-sm text-[#4b6355]">Loading upcoming camps...</p>
          ) : (
            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
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
                    className="min-w-[84%] snap-start overflow-hidden rounded-2xl border border-[#e5d8c2] bg-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:min-w-[58%] lg:min-w-[36%] dark:border-slate-700 dark:bg-slate-800"
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
                      <span className="inline-flex rounded-full border border-[#f59e0b]/40 bg-[#fdf0dd] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#b45309] dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300">
                        Filling Fast
                      </span>
                      <h3 className="font-sans text-2xl font-bold tracking-tight text-[#1b3a2d] dark:text-slate-100">{camp.name}</h3>
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
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-slate-100">Gallery</h2>
        </div>

        {isLoadingMemories ? (
          <p className="text-center text-sm text-[#4b6355]">Loading gallery...</p>
        ) : memoriesGrid.length === 0 ? (
          <p className="text-center text-sm text-[#4b6355]">No gallery moments uploaded yet.</p>
        ) : (
          <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
            {memoriesGrid.map((memory, index) => {
              const memoryId = memory.id || memory._id || `memory-${index}`;
              const src = memoryFallback[memoryId] ? FALLBACK_IMAGE : (memory.imageUrl || FALLBACK_IMAGE);
              const tall = index % 4 === 0 || index % 5 === 3;

              return (
                <motion.div
                  key={memoryId}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.03, ease: 'easeOut' }}
                  className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl ${tall ? 'h-[330px]' : 'h-[185px]'}`}
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

      <section id="reviews" className="bg-[#f8f3ea] py-16 dark:bg-slate-900 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b45309]">Reviews</p>
            <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-[#143023] sm:text-4xl dark:text-slate-100">What Guests Are Saying</h2>
            <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#e3d8c7] bg-white/75 px-4 py-1.5 text-xs font-semibold text-[#3f594c] shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
              <Star className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
              4.8/5 from 500+ campers
            </p>
          </div>

          <div className="relative mx-auto mt-10 h-[28rem] w-full max-w-6xl overflow-hidden">
            {testimonials.map((review, index) => {
              const relative = getReviewRelativeIndex(index);
              const abs = Math.abs(relative);

              if (abs > 2) return null;

              return (
                <motion.article
                  key={`${review.id}-${activeReview}`}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          x: relative * 330,
                          scale: abs === 0 ? 1 : abs === 1 ? 0.92 : 0.84,
                          opacity: abs === 0 ? 1 : abs === 1 ? 0.66 : 0.34,
                          filter: abs === 0 ? 'blur(0px)' : abs === 1 ? 'blur(1px)' : 'blur(2px)',
                        }
                  }
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ zIndex: 20 - abs }}
                  className="absolute left-1/2 top-1/2 w-[92%] max-w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#e3d9c8] bg-white/80 p-7 shadow-[0_14px_40px_rgba(50,35,14,0.1)] backdrop-blur-md dark:border-white/10 dark:bg-slate-800/55 dark:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.75)]"
                >
                  <div className="inline-flex items-center gap-1 rounded-full border border-[#f59e0b]/30 bg-[#fff4df] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b45309] dark:border-[#4ade80]/35 dark:bg-[#4ade80]/10 dark:text-[#86efac]">
                    {abs === 0 ? 'Featured Review' : 'Guest Review'}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className={`${abs === 0 ? 'h-14 w-14' : 'h-11 w-11'} border border-white/40 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.45)]`}>
                      <AvatarImage src={review.avatarUrl} alt={review.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#f59e0b] to-[#2f5d50] text-sm font-bold text-white">
                        {review.name
                          .split(' ')
                          .map((chunk) => chunk[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold text-[#163528] dark:text-slate-100">{review.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#6b7f72] dark:text-slate-400">
                        {review.travelerType} • {review.location}
                        {review.visitDate ? ` • ${review.visitDate}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={`${review.id}-star-${i}`}
                        className={`h-4 w-4 ${i < Math.round(review.rating) ? 'fill-[#f59e0b] text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.55)]' : 'text-[#d1d5db]'}`}
                      />
                    ))}
                    <span className="text-sm font-semibold text-[#355446] dark:text-slate-200">{review.rating.toFixed(1)}</span>
                    {review.verified ? (
                      <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-[#d9cbb4] bg-[#f9f2e5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3f5f50] dark:border-slate-600 dark:bg-slate-700/70 dark:text-slate-200">
                        <CheckCircle2 className="h-3 w-3 text-[#16a34a]" />
                        ✔ Verified Stay
                      </span>
                    ) : null}
                  </div>
                  <p className={`${abs === 0 ? 'mt-4 text-base leading-8' : 'mt-3 text-sm leading-7'} text-[#2f4a3d] dark:text-slate-300`}>
                    {review.quote}
                  </p>
                </motion.article>
              );
            })}

            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
              <button
                aria-label="Previous review"
                onClick={() => setActiveReview((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4c6af] bg-white/85 text-[#2f4a3d] transition hover:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next review"
                onClick={() => setActiveReview((prev) => (prev + 1) % testimonials.length)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4c6af] bg-white/85 text-[#2f4a3d] transition hover:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="secondary" className="rounded-full px-6">
              <Link href="/reviews">See All Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] via-[#f4a261] to-[#2f5d50] dark:from-[#0f2a1e] dark:via-[#174a36] dark:to-[#4ade80]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.24),transparent_35%)] dark:bg-[radial-gradient(circle_at_18%_22%,rgba(74,222,128,0.22),transparent_35%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center text-white md:px-10">
          <motion.h2
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="font-sans text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            Reserve Your Premium Weekend Slot
          </motion.h2>
          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.05, ease: 'easeOut' }}
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:text-base"
          >
            Limited weekend inventory is filling fast. Book now to secure your Pawna Lake experience.
          </motion.p>
          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
            className="mx-auto mt-3 max-w-xl text-xs font-semibold uppercase tracking-[0.26em] text-white/80"
          >
            Few spots left for this month
          </motion.p>
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
              <Button asChild size="lg" className="rounded-2xl bg-[#f59e0b] px-10 py-3.5 text-base font-semibold text-black shadow-[0_0_25px_rgba(245,158,11,0.55)] transition-all duration-300 hover:scale-105 hover:bg-[#fbbf24] dark:bg-[#4ade80] dark:text-[#0f172a] dark:shadow-[0_0_28px_rgba(74,222,128,0.5)] dark:hover:bg-[#6ff29a]">
              <Link href="/booking">Reserve Your Spot</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
                className="rounded-2xl border-white/70 bg-white/10 px-10 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
            >
              <Link href="/contact">Talk to Camp Expert</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
