
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
  useSidebar,
  SidebarSeparator,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Images, Tent, Mail, Star, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/camps", label: "Camps", icon: Tent },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  const handleLogout = () => {
    logout();
    handleLinkClick();
    router.push("/login");
  };

  if (pathname?.startsWith('/admin')) return null;

  const displayName = user?.email?.split("@")[0] || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-sidebar-border/60"
    >
      <SidebarHeader className="border-b border-sidebar-border/60 bg-sidebar/95 px-3 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <SidebarLogo />
          <div className="shrink-0">
            <SidebarTrigger className="h-8 w-8 rounded-md text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col bg-sidebar/95 px-3 py-3 backdrop-blur-xl">
        <SidebarMenu className="gap-1.5">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={href === "/" ? pathname === "/" : pathname?.startsWith(href)}
                  tooltip={{ children: label }}
                  className={cn(
                    "h-10 rounded-xl px-3 text-[13px] font-medium transition-all duration-300",
                    "hover:bg-sidebar-accent/70 hover:text-foreground hover:shadow-[0_0_0_1px_hsla(var(--accent)/0.22)]",
                    "data-[active=true]:bg-sidebar-primary/90 data-[active=true]:text-sidebar-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-5 px-1">
          <SidebarSeparator className="mx-0 bg-sidebar-border/70" />
          <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/75">
            Explore
          </p>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 bg-sidebar/95 px-3 py-3 backdrop-blur-xl">
        {user ? (
          <div className="rounded-xl border border-sidebar-border/70 bg-background/45 p-3">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary/85 text-sidebar-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              </div>
            </div>

            <SidebarSeparator className="mx-0 my-3 bg-sidebar-border/70" />

            <div className="space-y-2">
              <Button
                asChild
                variant="ghost"
                className="h-9 w-full justify-start gap-2 rounded-lg border border-sidebar-primary/35 bg-sidebar-primary/12 px-3 text-sm font-medium text-sidebar-primary transition-all duration-300 hover:bg-sidebar-primary/18"
              >
                <Link href="/dashboard" onClick={handleLinkClick}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="h-9 w-full justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-300 hover:bg-sidebar-accent/70"
              >
                <Link href="/dashboard" onClick={handleLinkClick}>
                  <CalendarDays className="h-4 w-4" />
                  My Bookings
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="h-9 w-full justify-start gap-2 rounded-lg px-3 text-sm transition-all duration-300 hover:bg-sidebar-accent/70"
              >
                <Link href="/dashboard/memories" onClick={handleLinkClick}>
                  <Images className="h-4 w-4" />
                  My Memories
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-9 w-full justify-start gap-2 rounded-lg border-sidebar-border/75 bg-background/60"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button asChild variant="secondary" className="h-9 w-full rounded-lg">
              <Link href="/login" onClick={handleLinkClick}>Login</Link>
            </Button>
            <Button asChild variant="outline" className="h-9 w-full rounded-lg border-sidebar-border/75 bg-background/60">
              <Link href="/register" onClick={handleLinkClick}>Sign Up</Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
