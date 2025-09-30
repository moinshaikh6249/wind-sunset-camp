
import Link from "next/link";
import { Flame } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-headline font-bold text-custom-green text-glow"
    >
      <Flame className="h-7 w-7 text-orange-500 icon-glow" />
      <div>
        <span>Wind & Sunset Camp</span>
      </div>
    </Link>
  );
}
