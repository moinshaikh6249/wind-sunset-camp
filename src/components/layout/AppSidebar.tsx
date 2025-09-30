
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
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Home, Info, GalleryVertical, Tent, Mail, Shield, LogIn } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: GalleryVertical },
  { href: "/camps", label: "Upcoming Camps", icon: Tent },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null; // The admin layout will have its own sidebar
  }

  return (
    <Sidebar>
      <SidebarHeader>
        
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href}>
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/login">
              <SidebarMenuButton
                isActive={pathname === "/login"}
                tooltip={{ children: "Login" }}
              >
                <LogIn />
                <span>Login</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/admin/login">
              <SidebarMenuButton
                isActive={pathname === "/admin/login"}
                tooltip={{ children: "Admin Login" }}
              >
                <Shield />
                <span>Admin Login</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button asChild className="transition-transform duration-200 transform hover:scale-105">
          <Link href="/booking">Book Now</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
