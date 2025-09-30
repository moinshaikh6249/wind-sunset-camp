
'use client';

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile, setOpen } = useSidebar();
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          open && !isMobile ? "opacity-100" : "opacity-0 pointer-events-none",
          "md:hidden" // Only show overlay on smaller screens where sidebar overlaps content
        )} 
        onClick={() => setOpen(false)} 
      />
      <div className={cn(
          "flex flex-col min-h-screen w-full transition-all duration-300",
          {"md:blur-sm": open && !isMobile} // Optional: blur background when sidebar is open on desktop
        )}>
        <Header />
        <main className="flex-grow flex flex-col bg-background">{children}</main>
        <Footer />
      </div>
      <div 
        className={cn(
          "fixed inset-0 z-30",
          open && !isMobile ? "block" : "hidden"
        )} 
        onClick={() => setOpen(false)} 
      />
    </>
  )
}
