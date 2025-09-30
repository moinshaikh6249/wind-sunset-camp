
'use client';

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile, setOpen } = useSidebar();
  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-black/50 transition-opacity", open && !isMobile ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setOpen(false)} />
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-grow bg-background">{children}</main>
        <Footer />
      </div>
    </>
  )
}
