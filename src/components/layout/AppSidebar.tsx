
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
import { Home, Info, GalleryVertical, Tent, Mail, User as UserIcon, LogOut, Shield, MessageSquare, CheckCircle, Clock, Star } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { useUser, useAdmin, useDatabase, useDatabaseValue, useAuth } from "@/firebase";
import { ref } from "firebase/database";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: GalleryVertical },
  { href: "/camps", label: "Upcoming Camps", icon: Tent },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/contact", label: "Contact", icon: Mail },
];

type Message = {
  id: string;
  subject: string;
  timestamp: string;
  read: boolean;
};

function MessagesDialog() {
  const { user } = useUser();
  const database = useDatabase();

  const userMessagesRef = useMemo(() => {
    if (!user || !database) return null;
    return ref(database, `users/${user.uid}/messages`);
  }, [user, database]);

  const { data: messagesData, isLoading: messagesLoading } = useDatabaseValue<{[id: string]: Omit<Message, 'id'>}>(userMessagesRef);

  const sentMessages = useMemo(() => {
    if (!messagesData) return [];
    return Object.entries(messagesData)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messagesData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          My Messages
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Sent Messages</DialogTitle>
          <DialogDescription>
            Here is a list of messages you've sent to the camp administrators.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {messagesLoading ? (
            <p>Loading messages...</p>
          ) : sentMessages.length > 0 ? (
            <ul className="space-y-4">
              {sentMessages.map(msg => (
                <li key={msg.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-semibold">{msg.subject}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                    <div className={cn("flex items-center gap-1.5", msg.read ? "text-green-600" : "text-amber-600")}>
                      {msg.read ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {msg.read ? "Read" : "Sent"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">You have not sent any messages yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UserProfileSection() {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdmin();
  const { toast } = useToast();
  const router = useRouter();
  const database = useDatabase();
  const auth = useAuth();

  const userProfileRef = useMemo(() => {
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
      router.push('/login');
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
      {!isAdmin && <MessagesDialog />}
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
  const { isAdmin } = useAdmin();


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
            {user && !isAdmin && (
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
