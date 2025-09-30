
"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarLogo() {
  const { open } = useSidebar();
  
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-headline font-bold text-foreground dark:text-custom-green dark:text-glow text-shadow-engraved"
      >
        <Flame className={cn(
          "h-7 w-7 text-orange-500 dark:text-custom-green icon-glow transition-all",
          {"animate-flicker": open}
        )} />
        <div className="group-data-[collapsible=icon]:hidden">
          <span className={cn("transition-all", {"animate-text-glow": open})}>Wind & Sunset Camp</span>
        </div>
      </Link>
      <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:hidden" />
    </div>
  );
}
