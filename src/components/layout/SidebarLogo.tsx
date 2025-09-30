
import Link from "next/link";
import { Flame } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarLogo() {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-headline font-bold text-foreground dark:text-custom-green dark:text-glow text-shadow-engraved"
      >
        <Flame className="h-7 w-7 text-orange-500 dark:text-custom-green icon-glow" />
        <div className="group-data-[collapsible=icon]:hidden">
          <span>Wind & Sunset Camp</span>
        </div>
      </Link>
      <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:hidden" />
    </div>
  );
}
