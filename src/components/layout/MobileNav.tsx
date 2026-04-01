
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
                        <Link href="/admin/login">Admin Login</Link>
                    </Button>
                </SheetClose>
            </div>
        );
    }
    
    const displayName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : (user?.email || 'User');
    const photoURL = userProfile?.photoURL;
    const userInitial = displayName.charAt(0).toUpperCase();
    const isAdmin = ['admin', 'super-admin'].includes(user?.role || '');

    return (
        <div className="space-y-4">
            <SheetClose asChild>
                <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/10">
                    <Avatar className="h-10 w-10 text-xl">
                        <AvatarImage src={photoURL ?? undefined} alt={displayName ?? "User"} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                </Link>
            </SheetClose>
            {isAdmin && (
              <SheetClose asChild>
                <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href="/admin/dashboard">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                    </Link>
                </Button>
              </SheetClose>
            )}
            <SheetClose asChild>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
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
