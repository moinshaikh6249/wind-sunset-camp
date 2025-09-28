import Link from "next/link";
import { Sunset } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors"
    >
      <Sunset className="h-7 w-7 text-accent dark:icon-glow" />
      <span className="dark:text-glow">Sunset Camp</span>
    </Link>
  );
}
