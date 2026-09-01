'use client';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Settings, Users2, CalendarCheck, BarChart, Search, PanelLeft, Tent, GalleryVertical, Mail, Star, Bell, ChevronRight, LogOut, User as UserIcon, Camera } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchProvider";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/camps", label: "Camps", icon: Tent },
    { href: "/admin/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/admin/memories", label: "Customer Memories", icon: Camera },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

function MobileNav() {
    const pathname = usePathname();
    return (
        <SheetContent side="left" className="flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-emerald-700 text-white shadow-md">
            <Tent className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-sm tracking-wider text-foreground">WIND & SUNSET</span>
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Campsite Operations</span>
          </div>
        </div>
        <nav className="grid gap-1.5 py-4 text-sm font-medium">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground",
                 pathname.startsWith(href) && "bg-amber-500/10 text-amber-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-amber-500/20 dark:border-emerald-500/30"
                )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    );
}

function UserMenu() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out of Admin operations.",
        });
        router.push('/admin/login');
      };

    const adminName = user ? (`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.displayName || user.email?.split('@')[0] || 'Admin') : 'Admin';
    const adminEmail = user?.email || 'admin@windandsunset.com';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 ring-2 ring-amber-500/30 dark:ring-emerald-500/30 transition-all hover:scale-105"
                >
                <UserAvatar user={user} sizeClassName="h-10 w-10" />
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} sizeClassName="h-10 w-10 shrink-0" />
                        <div className="flex flex-col space-y-1 min-w-0">
                            <p className="text-sm font-semibold leading-none text-foreground truncate">{adminName}</p>
                            <p className="text-xs leading-none text-muted-foreground font-mono truncate">{adminEmail}</p>
                            <span className="mt-1 inline-flex w-max items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                                Administrator
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="cursor-pointer gap-2 rounded-xl text-xs font-semibold py-2">
                    <UserIcon className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                    Admin Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="cursor-pointer gap-2 rounded-xl text-xs font-semibold py-2">
                    <Settings className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                    Settings & Security
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 rounded-xl text-xs font-semibold py-2 text-rose-600 focus:text-rose-600 dark:text-rose-400">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AdminHeader() {
    const pathname = usePathname();
    const pageSegment = pathname.split('/').filter(Boolean).pop() || 'dashboard';
    const pageTitle = pageSegment.charAt(0).toUpperCase() + pageSegment.slice(1);
    const { searchQuery, setSearchQuery } = useSearch();

    return (
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/75 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 lg:px-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl md:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Operations Menu</span>
                </Button>
              </SheetTrigger>
              <MobileNav />
            </Sheet>

            {/* Breadcrumb Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Admin</Link>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span className="text-foreground font-bold">{pageTitle}</span>
            </div>

            {/* Global Search Bar */}
            <div className="w-full flex-1 max-w-md mx-auto sm:mx-0">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search bookings, camps, guests..."
                            className="w-full rounded-full border-border/40 bg-muted/40 pl-9 pr-4 py-1.5 text-xs shadow-inner transition-all duration-300 focus:border-amber-500/40 focus:bg-background focus:ring-2 focus:ring-amber-500/20 dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>

            {/* Right Action Icons & User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <NotificationCenter />
                <UserMenu />
            </div>
        </header>
    );
}
