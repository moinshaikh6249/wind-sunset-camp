
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  User as UserIcon,
  CalendarDays,
  Images,
  Bell,
  Shield,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/camps", label: "Camps" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { user, loading: isUserLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
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

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName =
    `${firstName} ${lastName}`.trim() || user?.displayName || user?.email?.split("@")[0] || "User";

  const initials = (
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : fullName.slice(0, 2)
  ).toUpperCase();

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`pointer-events-auto mx-auto flex w-full max-w-7xl items-center rounded-2xl glass-nav px-4 transition-all duration-500 ease-out sm:px-6 lg:px-8 ${
          isScrolled
            ? "h-14 border-border/80 bg-background/85 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.65)] backdrop-blur-2xl"
            : "h-16 border-border/50 bg-background/55 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/60 bg-background/45 text-muted-foreground transition-all duration-300 hover:scale-[1.04] hover:border-border/80 hover:bg-background/70 hover:text-foreground ios-press" />
          <Logo />
        </div>

        <nav className="mx-auto hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative py-1 text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 transition-all duration-300 ease-out ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-80"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <NotificationCenter />
          {!mounted || isUserLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open account menu"
                  className="relative h-9.5 w-9.5 rounded-full border border-border/70 bg-background/50 p-0 text-foreground backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-amber-500/50 dark:hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] dark:hover:shadow-[0_0_22px_rgba(74,222,128,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ios-press"
                >
                  <UserAvatar user={user} sizeClassName="h-full w-full rounded-full" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="z-[100] w-64 rounded-2xl border border-border/50 bg-background/90 dark:bg-card/90 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-2.5">
                  <UserAvatar user={user} sizeClassName="h-10 w-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{fullName}</p>
                    <p className="truncate text-[11px] text-muted-foreground font-mono">{user.email}</p>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                    <Link href="/dashboard#bookings" className="flex items-center gap-2.5">
                      <CalendarDays className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                    <Link href="/dashboard/memories" className="flex items-center gap-2.5">
                      <Images className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                      <span>My Memories</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                    <Link href="/notifications" className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                    <Link href="/dashboard#settings" className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-xs font-semibold focus:bg-amber-500/10 dark:focus:bg-emerald-500/10">
                      <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl cursor-pointer py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 focus:bg-rose-500/10 dark:focus:bg-rose-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/60 bg-background/45 text-foreground backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-border/80 hover:bg-background/70 hover:shadow-[0_0_18px_rgba(255,255,255,0.16)] dark:border-white/20 dark:hover:shadow-[0_0_22px_rgba(74,222,128,0.25)] ios-press"
            >
              <Link href="/login">
                <UserIcon className="h-4 w-4" />
                <span className="sr-only">Login</span>
              </Link>
            </Button>
          )}

          {!isAdmin ? (
            <Button
              asChild
              className="hidden rounded-full border-0 bg-[linear-gradient(110deg,#4ade80_0%,#22c55e_45%,#fb923c_100%)] px-5 py-2 text-xs font-bold tracking-wide uppercase text-[#0b1324] shadow-[0_12px_28px_-16px_rgba(74,222,128,0.65)] transition-all duration-300 hover:scale-[1.04] hover:brightness-110 hover:shadow-[0_0_30px_rgba(251,146,60,0.45)] ios-press md:inline-flex"
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

