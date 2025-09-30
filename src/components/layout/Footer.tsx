
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Info, GalleryVertical, Tent, Mail, PenSquare, Facebook, Instagram, Twitter } from "lucide-react";

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
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "Twitter", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="bg-[#FFF9F0] dark:bg-[#1E1E1E] text-foreground border-t border-accent/50 dark:border-primary/30">
      <div className="container pt-10 pb-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <Logo />
            <p className="mt-4 text-sm italic text-[#5C5C5C] dark:text-[#CFCFCF] max-w-xs">
              Your next adventure starts here, under the open sky.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#4A2E0F] dark:text-[#FFF5E6] mb-4">Navigate</h3>
            <ul className="space-y-3">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center justify-center md:justify-start gap-2 text-sm text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-accent dark:hover:text-primary hover:underline transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#4A2E0F] dark:text-[#FFF5E6] mb-4">Legal & Social</h3>
            <ul className="space-y-3">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center justify-center md:justify-start gap-2 text-sm text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-accent dark:hover:text-primary hover:underline transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-center md:justify-start gap-4 mt-6">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href} aria-label={label}>
                  <Icon className="w-6 h-6 text-[#6B6B6B] dark:text-[#A6A6A6] hover:text-accent dark:hover:text-primary transition-all duration-200 hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
      <div className="bg-[#FFF3E0] dark:bg-[#141414] py-4 px-4">
        <div className="container text-center">
            <p className="text-sm text-[#5C5C5C] dark:text-[#BDBDBD] transition-opacity hover:opacity-80">
                &copy; {new Date().getFullYear()} Wind & Sunset Camp. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}

    
