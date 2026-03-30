
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  GalleryVertical,
  Info,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  PenSquare,
  Phone,
  Star,
  Tent,
} from 'lucide-react';

const navLinks = [
  { href: '/about',   label: 'About Us', icon: Info           },
  { href: '/gallery', label: 'Gallery',  icon: GalleryVertical },
  { href: '/camps',   label: 'Camps',    icon: Tent            },
  { href: '/contact', label: 'Contact',  icon: Mail            },
  { href: '/booking', label: 'Book Now', icon: PenSquare       },
];

const legalLinks = [
  { href: '/privacy-policy',      label: 'Privacy Policy'      },
  { href: '/terms-of-service',    label: 'Terms of Service'    },
  { href: '/refund-policy',       label: 'Refund Policy'       },
  { href: '/cancellation-policy', label: 'Cancellation Policy' },
  { href: '/faq',                 label: 'FAQ'                 },
];

const socialLinks = [
  {
    href:  'https://www.instagram.com/wind_and_sunset_camping_123773/',
    label: 'Instagram',
    icon:  Instagram,
    hover: 'hover:text-[#E1306C] hover:bg-[#E1306C]/10 hover:border-[#E1306C]/40',
  },
  {
    href:  'https://wa.me/918080334787',
    label: 'WhatsApp',
    icon:  MessageCircle,
    hover: 'hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/40',
  },
  {
    href:  'https://maps.app.goo.gl/wUXEvEwvFkzxGz627',
    label: 'Google Maps',
    icon:  MapPin,
    hover: 'hover:text-[#4285F4] hover:bg-[#4285F4]/10 hover:border-[#4285F4]/40',
  },
  {
    href:  'mailto:sameermore3010@gmail.com',
    label: 'Email',
    icon:  Mail,
    hover: 'hover:text-amber-600 hover:bg-amber-500/10 hover:border-amber-400/40',
  },
];

export function Footer() {
  return (
    <footer className="bg-footer-light dark:bg-footer-dark text-foreground">

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <div className="border-y border-amber-200/60 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 dark:border-emerald-900/30 dark:from-green-950/50 dark:via-emerald-950/40 dark:to-green-950/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-emerald-400">
              Limited spots available
            </p>
            <h3 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl dark:text-white">
              Ready for your next adventure?
            </h3>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-full bg-green-600 px-8 font-bold text-white shadow-lg shadow-green-900/20 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400"
          >
            <Link href="/booking">
              Book Your Camp Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center sm:gap-12 md:grid-cols-2 md:text-left lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="mt-4 max-w-xs text-sm italic leading-relaxed text-muted-foreground/80">
              Unforgettable camping experiences at the edge of Pawna Lake — come for the sunset, stay for the stars.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex justify-center gap-2.5 md:justify-start">
              {socialLinks.map(({ href, label, icon: Icon, hover }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground/60 transition-all duration-300 hover:scale-110 hover:border-transparent ${hover}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Google Rating badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/80 px-4 py-2 dark:border-yellow-700/30 dark:bg-yellow-900/20">
              <div className="flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < 5 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-800 dark:text-yellow-300">
                4.8 / 5 on Google Reviews
              </span>
            </div>
          </div>

          {/* Column 2 — Navigate */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/60">Navigate</h3>
            <ul className="space-y-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center justify-center gap-2.5 text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-accent dark:hover:text-primary md:justify-start"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-accent/70 transition-colors group-hover:text-accent dark:text-primary/70 dark:group-hover:text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Legal */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/60">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-accent dark:hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact + Map */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/60">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:918080334787"
                  className="flex items-center justify-center gap-2.5 text-muted-foreground transition-colors hover:text-accent dark:hover:text-primary md:justify-start"
                >
                  <Phone className="h-4 w-4 shrink-0 text-accent/70 dark:text-primary/70" />
                  +91 80803 34787
                </a>
              </li>
              <li>
                <a
                  href="mailto:sameermore3010@gmail.com"
                  className="flex items-center justify-center gap-2.5 text-muted-foreground transition-colors hover:text-accent dark:hover:text-primary md:justify-start"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent/70 dark:text-primary/70" />
                  sameermore3010@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/wUXEvEwvFkzxGz627"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 text-muted-foreground transition-colors hover:text-accent dark:hover:text-primary md:justify-start"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-accent/70 dark:text-primary/70" />
                  Pawna Lake, Lonavala, Maharashtra
                </a>
              </li>
            </ul>

            {/* Map embed */}
            <a
              href="https://maps.app.goo.gl/wUXEvEwvFkzxGz627"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open camp location in Google Maps"
              className="mt-5 block overflow-hidden rounded-xl border border-border/60 shadow-md transition-all duration-300 hover:shadow-xl hover:border-accent/40 dark:hover:border-primary/40"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.351347313835!2d73.4989340752148!3d18.62310108257858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2a1380900f6ff%3A0x4d32a933224b174!2sWind%20and%20Sunset%20Camping%20Near%20Pawana%20Lake!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wind and Sunset Camping Location"
                className="pointer-events-none"
              />
            </a>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────── */}
      <div className="border-t border-border/40 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Wind &amp; Sunset Camp. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-yellow-400">
              Rated 4.8 / 5 on Google Reviews
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}
