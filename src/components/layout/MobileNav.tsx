
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/camps", label: "Upcoming Camps" },
    { href: "/contact", label: "Contact" },
  ];

export function MobileNav() {
    const pathname = usePathname();
    
    return (
        <div className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 border-b">
          <Logo />
        </div>
        <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
          {navLinks.map(({ href, label }) => (
            <SheetClose asChild key={href}>
                <Link
                href={href}
                className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
                >
                {label}
                </Link>
            </SheetClose>
          ))}
        </nav>
        <SheetClose asChild>
            <Button asChild size="lg" className="mt-auto bg-primary hover:bg-primary/90 btn-glow">
                <Link href="/booking">Book Now</Link>
            </Button>
        </SheetClose>
      </div>
    )
}
