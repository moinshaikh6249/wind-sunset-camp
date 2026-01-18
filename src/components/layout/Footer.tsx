
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Info, GalleryVertical, Tent, Mail, PenSquare, Instagram, Phone } from "lucide-react";

const navLinks = [
    { href: "/about", label: "About Us", icon: Info },
    { href: "/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/camps", label: "Camps", icon: Tent },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/booking", label: "Book Now", icon: PenSquare },
];

const legalLinks = [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
]

const socialLinks = [
  { href: "https://www.instagram.com/wind_and_sunset_camping_123773/", label: "Instagram", icon: Instagram },
];

export function Footer() {
  return (
    <footer className="bg-footer-light dark:bg-footer-dark text-foreground border-t border-accent/20 dark:border-primary/20">
      <div className="container pt-16 pb-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="mt-4 text-sm italic text-muted-foreground/80 max-w-xs">
              Your next adventure starts here, under the open sky.
            </p>
             <div className="mt-4 space-y-2 text-sm text-muted-foreground/90">
                <a href="mailto:sameermore3010@gmail.com" className="flex items-center justify-center md:justify-start gap-2.5 hover:text-accent dark:hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    sameermore3010@gmail.com
                </a>
                <a href="tel:8080334787" className="flex items-center justify-center md:justify-start gap-2.5 hover:text-accent dark:hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    8080334787
                </a>
             </div>
          </div>

          <div>
            <h3 className="font-bold text-base uppercase tracking-wider text-foreground/80 dark:text-foreground/80 mb-4">Navigate</h3>
            <ul className="space-y-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center justify-center md:justify-start gap-2.5 text-muted-foreground hover:text-accent dark:hover:text-primary transition-all duration-300 transform hover:scale-105">
                    <Icon className="w-4 h-4 text-accent/80 dark:text-primary/80 group-hover:text-accent dark:group-hover:text-primary transition-colors" />
                    <span className="relative">
                      {label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent dark:bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base uppercase tracking-wider text-foreground/80 dark:text-foreground/80 mb-4">Legal & Social</h3>
            <ul className="space-y-3">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="group flex items-center justify-center md:justify-start gap-2.5 text-muted-foreground hover:text-accent dark:hover:text-primary transition-all duration-300 transform hover:scale-105">
                     <span className="relative">
                      {label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent dark:bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex justify-center md:justify-start gap-5 mt-6">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                  <Icon className="w-6 h-6 text-muted-foreground/70 hover:text-accent dark:hover:text-primary transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_5px_hsl(var(--accent))] dark:hover:drop-shadow-[0_0_5px_hsl(var(--primary))]" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
             <h3 className="font-bold text-base uppercase tracking-wider text-foreground/80 dark:text-foreground/80 mb-4">Our Location</h3>
             <a href="https://maps.app.goo.gl/wUXEvEwvFkzxGz627" target="_blank" rel="noopener noreferrer" className="block aspect-video w-full rounded-lg overflow-hidden border-2 border-accent/20 dark:border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.351347313835!2d73.4989340752148!3d18.62310108257858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2a1380900f6ff%3A0x4d32a933224b174!2sWind%20and%20Sunset%20Camping%20Near%20Pawana%20Lake!5e0!3m2!1sen!2sin!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Wind and Sunset Camping Location"
                    className="pointer-events-none"
                ></iframe>
             </a>
          </div>

        </div>
      </div>
      <div className="py-6 border-t border-border/50">
        <div className="container text-center">
            <p className="text-sm text-muted-foreground transition-all duration-300 hover:text-glow">
                &copy; {new Date().getFullYear()} Wind & Sunset Camp. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
