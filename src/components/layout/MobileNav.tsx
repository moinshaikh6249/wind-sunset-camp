
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { useUser, useDatabase, useMemoFirebase, useAuth } from "@/firebase";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
import { ref } from "firebase/database";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Gallery" },
    { href: "/camps", label: "Upcoming Camps" },
    { href: "/contact", label: "Contact" },
  ];

function UserProfileSection() {
    const { user, isUserLoading } = useUser();
    const database = useDatabase();
    const auth = useAuth();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return ref(database, `users/${user.uid}`);
    }, [database, user]);

    const { data: userProfile } = useDatabaseValue(userProfileRef);

    const handleLogout = async () => {
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
    
    if (isUserLoading || !user) {
        return (
            <SheetClose asChild>
                <Button asChild className="w-full">
                    <Link href="/login">Login / Sign Up</Link>
                </Button>
            </SheetClose>
        );
    }
    
    const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : user.displayName;
    const photoURL = userProfile?.photoURL || user.photoURL;
    const userInitial = userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

    return (
        <div className="space-y-4">
            <SheetClose asChild>
                <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/10">
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
