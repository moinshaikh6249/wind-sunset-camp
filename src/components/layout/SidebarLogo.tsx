
"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarLogo() {
  const { open } = useSidebar();
  
  return (
    <div className="flex items-center justify-center px-1">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
      >
        <Flame className={cn(
          "h-5 w-5 text-orange-500 transition-all dark:text-custom-green",
          {"animate-flicker": open}
        )} />
        <span className={cn("transition-opacity duration-300", {"opacity-100": open, "opacity-90": !open})}>Wind & Sunset</span>
      </Link>
    </div>
  );
}
