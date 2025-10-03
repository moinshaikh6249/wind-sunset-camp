
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
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Home, Info, GalleryVertical, Tent, Mail } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { useUser } from "@/hooks/use-user";

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
  const { setOpen, setOpenMobile } = useSidebar();
  const { user } = useUser();

  const handleLinkClick = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  if (isAdminPage) {
    return null; // The admin layout will have its own sidebar
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="justify-center">
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button asChild className="btn-glow">
          <Link href="/booking">Book Now</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
