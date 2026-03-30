
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
import { Home, Info, GalleryVertical, Tent, Mail, User as UserIcon, LogOut, Shield, Star, Images } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: GalleryVertical },
  { href: "/camps", label: "Upcoming Camps", icon: Tent },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/contact", label: "Contact", icon: Mail },
];

function UserProfileSection() {
  const { user, loading: isUserLoading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  useEffect(() => {
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

  const displayName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : (user?.email || 'User');
  const photoURL = userProfile?.photoURL;
  const userInitial = displayName.charAt(0).toUpperCase();
  const isAdmin = ['admin', 'super-admin'].includes(user?.role || '');

  return (
    <div className="p-2 space-y-3">
        <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3">
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
  const { user } = useAuth();

  const handleLinkClick = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  if (pathname?.startsWith('/admin')) return null;

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
            {user && !['admin', 'super-admin'].includes(user.role) && (
              <>
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
                <SidebarMenuItem>
                  <Link href="/dashboard/memories" onClick={handleLinkClick}>
                    <SidebarMenuButton
                      isActive={pathname === "/dashboard/memories"}
                      tooltip={{ children: "My Memories" }}
                    >
                      <Images />
                      <span>My Memories</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </>
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
