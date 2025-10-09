
import Link from "next/link";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold text-foreground dark:text-custom-green dark:text-glow text-shadow-engraved group"
    >
      <Flame className="h-7 w-7 text-orange-500 icon-glow" />
      <div className={cn(
        "flex flex-col items-center",
        "transition-opacity duration-300",
        "md:group-data-[collapsed=icon]:opacity-0 md:group-data-[collapsed=icon]:hidden"
        )}>
        <span>Wind & Sunset Camp</span>
        <span className="block text-xs font-headline text-foreground tracking-widest capitalize">
          Pawna Lake Camping
        </span>
      </div>
    </Link>
  );
}
