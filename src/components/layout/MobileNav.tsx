
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { useUser, useAdmin, useDatabaseValue, useDatabase, useAuth } from "@/firebase";
import { ref } from "firebase/database";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/camps", label: "Upcoming Camps" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

function UserProfileSection() {
    const { user, isUserLoading } = useUser();
    const { isAdmin, isAdminLoading } = useAdmin();
    const { toast } = useToast();
    const database = useDatabase();
    const auth = useAuth();

    const userProfileRef = React.useMemo(() => {
        if (!user || !database) return null;
        return ref(database, `users/${user.uid}`);
    }, [user, database]);

    const { data: userProfile, isLoading: isProfileLoading } = useDatabaseValue(userProfileRef);

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
        } catch (error) {
            toast({
                title: "Logout Failed",
                description: "An error occurred while logging out.",
                variant: "destructive",
            });
        }
    };
    
    if (isUserLoading || isAdminLoading || (user && isProfileLoading)) {
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
    
    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : (user.displayName || 'User');
    const photoURL = userProfile?.photoURL || user.photoURL;
    const userInitial = displayName.charAt(0).toUpperCase();

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
          <nav className="flex flex-col gap-4 text-base font-medium mt-6">
            {navLinks.map(({ href, label }) => (
              <SheetClose asChild key={href}>
                  <Link
                  href={href}
                  className={cn(
                      "transition-colors hover:text-foreground/80 p-2 rounded-md",
                      pathname === href
                      ? "text-foreground bg-accent/10"
                      : "text-foreground/60"
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
