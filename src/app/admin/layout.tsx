
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Image, Settings, Tent, Users, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";


export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/admin/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }

  return (
    <div className="flex">
        <Sidebar>
            <SidebarHeader>
                
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/admin/dashboard">
                            <SidebarMenuButton tooltip={{ children: 'Dashboard' }}><Home /><span>Dashboard</span></SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/camps">
                            <SidebarMenuButton tooltip={{ children: 'Manage Camps' }}><Tent /><span>Camps</span></SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/gallery">
                            <SidebarMenuButton tooltip={{ children: 'Manage Gallery' }}><Image /><span>Gallery</span></SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/admin/team">
                            <SidebarMenuButton tooltip={{ children: 'Manage Team' }}><Users /><span>Team</span></SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <Link href="/admin/settings">
                            <SidebarMenuButton tooltip={{ children: 'Settings' }}><Settings /><span>Settings</span></SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
      <main className="flex-grow p-8">{children}</main>
    </div>
  );
}
