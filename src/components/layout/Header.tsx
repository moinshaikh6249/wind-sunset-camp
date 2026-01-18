
"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "./MobileNav";
import { SidebarTrigger } from "../ui/sidebar";
import { useUser } from "@/firebase";

export function Header() {
  const { user, isUserLoading } = useUser();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hidden md:flex" />
          <Logo />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          {!isUserLoading && (
             <Button asChild variant="ghost" size="icon">
                <Link href={user ? "/dashboard" : "/login"}>
                    <User />
                    <span className="sr-only">{user ? "Dashboard" : "Login"}</span>
                </Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm">
                <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>
                    Navigation links for the website.
                  </SheetDescription>
                </SheetHeader>
                <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
