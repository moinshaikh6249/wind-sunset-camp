"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const HIDDEN_PREFIXES = ["/admin", "/dashboard", "/login", "/signup", "/booking", "/booking-success"];

export function MobileStickyCTA() {
  const pathname = usePathname();

  if (!pathname || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-md md:hidden">
      <Button asChild variant="primary" size="lg" fullWidth className="rounded-2xl">
        <Link href="/booking">Reserve Spot</Link>
      </Button>
    </div>
  );
}
