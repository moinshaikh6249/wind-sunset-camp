'use client';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Settings, Users2, CalendarCheck, BarChart, Search, PanelLeft, Tent, GalleryVertical, Mail, Star, Bell } from "lucide-react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchProvider";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { NotificationCenter } from "@/components/layout/NotificationCenter";


const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/camps", label: "Camps", icon: Tent },
    { href: "/admin/gallery", label: "Gallery", icon: GalleryVertical },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

function MobileNav() {
    const pathname = usePathname();
    return (
        <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <Tent className="h-6 w-6" />
            <span className="">Wind & Sunset</span>
          </Link>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                 pathname.startsWith(href) && "bg-muted text-foreground"
                )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    )
}

function UserMenu() {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        router.push('/admin/login');
      };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                >
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL ?? undefined} alt="Admin" />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function AdminHeader() {
    const pathname = usePathname();
    const pageName = pathname.split('/').pop();
    const capitalizedPageName = pageName ? pageName.charAt(0).toUpperCase() + pageName.slice(1) : 'Dashboard';
    const { searchQuery, setSearchQuery } = useSearch();

    return (
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/10 bg-slate-950/45 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/35 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <MobileNav />
            </Sheet>
            <div className="w-full flex-1">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                      className="w-full appearance-none border-white/10 bg-slate-900/60 pl-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:w-2/3 lg:w-1/3 transition-all duration-300 focus:w-full focus:border-emerald-400/40 focus:shadow-[0_0_0_1px_rgba(34,197,94,0.25),0_0_24px_rgba(34,197,94,0.18)] lg:focus:w-2/3"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>
            <NotificationCenter />
            <UserMenu />
        </header>
    )
}
