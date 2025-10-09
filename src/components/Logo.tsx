
import Link from "next/link";
import { Flame } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold text-foreground dark:text-custom-green dark:text-glow text-shadow-engraved group"
    >
      <Flame className="h-7 w-7 text-orange-500 icon-glow" />
      <div className="flex flex-col items-center">
        <span>Wind & Sunset Camp</span>
        <span className="block text-xs font-headline text-foreground tracking-widest capitalize">
          Pawna Lake Camping
        </span>
      </div>
    </Link>
  );
}
