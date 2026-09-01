
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import api from "@/lib/api";

const navLinks = [
    { href: "/", label: "Home" },
  { href: "/camps", label: "Camps" },
  { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

function UserProfileSection() {
    const { user, loading: isUserLoading, logout } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [userProfile, setUserProfile] = React.useState<any>(null);
    const [isProfileLoading, setIsProfileLoading] = React.useState(false);

    React.useEffect(() => { setMounted(true) }, []);

    React.useEffect(() => {
      if (!user) return;

      const fetchUserProfile = async () => {
        try {
          setIsProfileLoading(true);
          const response = await api.get(`/users/${user._id}`);
          setUserProfile(response.user || response);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsProfileLoading(false);
        }
      };

      fetchUserProfile();
    }, [user]);

    const handleLogout = () => {
        logout();
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        router.push('/login');
    };
    
    if (!mounted || isUserLoading || (user && isProfileLoading)) {
        return (
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 text-xl animate-pulse bg-muted"></Avatar>
                <div className="flex flex-col truncate space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-32 bg-muted rounded"></div>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="space-y-2">
                <SheetClose asChild>
                    <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                    </Button>
                </SheetClose>
                <SheetClose asChild>
                     <Button asChild variant="outline" className="w-full">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </SheetClose>
            </div>
        );
    }
    
    const firstName = user?.firstName || userProfile?.firstName || '';
    const lastName = user?.lastName || userProfile?.lastName || '';
    const displayName =
      `${firstName} ${lastName}`.trim() || userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

    const photoURL = userProfile?.photoURL || user?.photoURL;
    const userInitial = (
      firstName && lastName
        ? `${firstName[0]}${lastName[0]}`
        : displayName.slice(0, 2)
    ).toUpperCase();
    const isAdmin = ['admin', 'super-admin'].includes(user?.role || '');

    return (
        <div className="space-y-3">
            <SheetClose asChild>
                <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-accent/5 hover:bg-accent/10">
                    <Avatar className="h-10 w-10 text-xs font-bold">
                        <AvatarImage src={photoURL ?? undefined} alt={displayName ?? "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-emerald-600 text-white">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate text-foreground">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate font-mono">{user.email}</span>
                    </div>
                </Link>
            </SheetClose>

            <div className="space-y-1.5 pt-1">
                <SheetClose asChild>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
                        <Link href="/dashboard">
                            My Profile & Bookings
                        </Link>
                    </Button>
                </SheetClose>
                <SheetClose asChild>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
                        <Link href="/dashboard/memories">
                            My Memories
                        </Link>
                    </Button>
                </SheetClose>
                <SheetClose asChild>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
                        <Link href="/notifications">
                            Notifications
                        </Link>
                    </Button>
                </SheetClose>
            </div>

            {isAdmin && (
              <SheetClose asChild>
                <Button asChild variant="secondary" size="sm" className="w-full text-xs font-semibold">
                    <Link href="/admin/dashboard">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                    </Link>
                </Button>
              </SheetClose>
            )}

            <SheetClose asChild>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold text-rose-600 dark:text-rose-400" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </SheetClose>
        </div>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    
    return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b">
            <Logo />
          </div>
          <nav className="mt-6 flex flex-col gap-2 text-base font-medium">
            {navLinks.map(({ href, label }) => (
              <SheetClose asChild key={href}>
                  <Link
                  href={href}
                  className={cn(
                      "rounded-xl px-3 py-2.5 transition-all duration-300",
                      pathname === href
                      ? "bg-accent/10 text-foreground"
                      : "text-foreground/65 hover:bg-accent/5 hover:text-foreground"
                  )}
                  >
                  {label}
                  </Link>
              </SheetClose>
            ))}
          </nav>
          
          <div className="mt-auto space-y-4">
            <div className="border-t pt-4">
                <UserProfileSection />
            </div>
            <SheetClose asChild>
                <Button asChild size="lg" className="w-full btn-glow">
                    <Link href="/booking">Book Now</Link>
                </Button>
            </SheetClose>
          </div>
        </div>
    )
}
