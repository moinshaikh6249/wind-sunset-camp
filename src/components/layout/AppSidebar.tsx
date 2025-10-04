
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Home, Info, GalleryVertical, Tent, Mail, User as UserIcon, LogOut, Shield } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { useUser, useDatabase, useMemoFirebase } from "@/firebase";
import { useDatabaseValue } from "@/firebase/database/use-database-value";
import { ref } from "firebase/database";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: GalleryVertical },
  { href: "/camps", label: "Upcoming Camps", icon: Tent },
  { href: "/contact", label: "Contact", icon: Mail },
];

function UserProfileSection() {
  const { user, idTokenResult, isUserLoading } = useUser();
  const isAdmin = idTokenResult?.claims?.isAdmin;
  const database = useDatabase();
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return ref(database, `users/${user.uid}`);
  }, [database, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDatabaseValue(userProfileRef);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="p-2 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-2 space-y-2">
        <Button asChild className="w-full">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin/login">Admin Login</Link>
        </Button>
      </div>
    );
  }

  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : (user.displayName || 'User');
  const photoURL = userProfile?.photoURL || user.photoURL;
  const userInitial = displayName.charAt(0).toUpperCase();


  return (
    <div className="p-2 space-y-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Avatar className="h-10 w-10 text-xl">
            <AvatarImage src={photoURL ?? undefined} alt={displayName ?? "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-sm truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </Link>
      {isAdmin && (
         <Button asChild variant="secondary" size="sm" className="w-full">
            <Link href="/admin/dashboard">
              <Shield className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
         </Button>
      )}
      <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile } = useSidebar();
  const { user } = useUser();

  const handleLinkClick = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarMenu>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname === href}
                  tooltip={{ children: label }}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
            {user && (
            <SidebarMenuItem>
              <Link href="/dashboard" onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard"}
                  tooltip={{ children: "User Dashboard" }}
                >
                  <UserIcon />
                  <span>User Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        <div className="mt-auto">
          <SidebarSeparator />
          <UserProfileSection />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <Button asChild className="btn-glow">
          <Link href="/booking">Book Now</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
