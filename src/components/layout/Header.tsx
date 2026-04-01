
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "../ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/camps", label: "Camps" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { user, loading: isUserLoading } = useAuth();
  const pathname = usePathname();
  const isAdmin = ["admin", "super-admin"].includes(user?.role || "");
  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`pointer-events-auto mx-auto flex w-full max-w-7xl items-center rounded-2xl border px-4 transition-all duration-500 ease-out sm:px-6 lg:px-8 ${
          isScrolled
            ? "h-14 border-border/70 bg-background/88 shadow-[0_20px_38px_-28px_rgba(15,23,42,0.72)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/82"
            : "h-16 border-border/45 bg-background/58 shadow-[0_14px_28px_-26px_rgba(15,23,42,0.4)] backdrop-blur-md supports-[backdrop-filter]:bg-background/46"
        }`}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 rounded-md border border-border/60 bg-background/45 text-muted-foreground transition-all duration-300 hover:scale-[1.03] hover:border-border/80 hover:bg-background/70 hover:text-foreground" />
          <Logo />
        </div>

        <nav className="mx-auto hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-1 text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-foreground" : "text-foreground/72 hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1.5px] rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-90 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <NotificationCenter />
          {!mounted || isUserLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
             <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-white/25 bg-background/45 text-foreground backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-white/40 hover:bg-background/70 hover:shadow-[0_0_18px_rgba(255,255,255,0.16)] dark:border-white/20 dark:hover:shadow-[0_0_22px_rgba(74,222,128,0.25)]"
             >
                <Link href={user ? (isAdmin ? "/admin/dashboard" : "/dashboard") : "/login"}>
                <User className="h-4 w-4" />
                    <span className="sr-only">{user ? (isAdmin ? "Admin Dashboard" : "Dashboard") : "Login"}</span>
                </Link>
            </Button>
          )}

          {!isAdmin ? (
            <Button
              asChild
              className="hidden rounded-full border-0 bg-[linear-gradient(110deg,#4ade80_0%,#22c55e_45%,#fb923c_100%)] px-6 py-2.5 text-sm font-semibold text-[#0b1324] shadow-[0_12px_30px_-18px_rgba(74,222,128,0.6)] transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_0_32px_rgba(251,146,60,0.45)] md:inline-flex"
              variant="default"
            >
              <Link href="/booking">Book Now</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
