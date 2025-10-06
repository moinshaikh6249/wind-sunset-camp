
'use client';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Settings, Users2, CalendarCheck, BarChart, Search, PanelLeft, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchProvider";


const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users2 },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

function MobileNav() {
    const pathname = usePathname();
    return (
        <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/admin/dashboard"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Home className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Admin Dashboard</span>
          </Link>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-4 px-2.5 ${pathname === href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        try {
          await signOut(auth);
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
          });
          router.push('/admin/login');
        } catch (error) {
          toast({
            title: "Logout Failed",
            description: "An error occurred while logging out.",
            variant: "destructive",
          });
        }
      };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
                >
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL ?? undefined} alt="Admin" />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
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


function ThemeToggle() {
    const { theme, setTheme } = useTheme();
  
    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}

export function AdminHeader() {
    const pathname = usePathname();
    const pageName = pathname.split('/').pop();
    const capitalizedPageName = pageName ? pageName.charAt(0).toUpperCase() + pageName.slice(1) : 'Dashboard';
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <MobileNav />
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin/dashboard">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{capitalizedPageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
            <UserMenu />
        </header>
    )
}
