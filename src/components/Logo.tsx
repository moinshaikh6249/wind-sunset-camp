import Link from "next/link";
import { Campfire } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold"
    >
      <Campfire className="h-7 w-7 text-accent dark:icon-glow" />
      <span className="text-gradient dark:text-glow">Wind & Sunset Camp</span>
    </Link>
  );
}
