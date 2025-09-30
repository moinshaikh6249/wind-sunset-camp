
import Link from "next/link";
import { Flame } from "lucide-react";

export function SidebarLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold text-foreground dark:text-custom-green dark:text-glow text-shadow-engraved"
    >
      <Flame className="h-7 w-7 text-orange-500 dark:text-custom-green icon-glow" />
      <div>
        <span>Wind & Sunset Camp</span>
      </div>
    </Link>
  );
}
