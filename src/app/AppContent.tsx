
'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/animations/PageTransition";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { useAuth } from "@/context/AuthContext";

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const isAdmin = ["admin", "super-admin"].includes(user?.role || "");
    if (!isAdmin) return;

    const isAdminRoute = pathname?.startsWith('/admin');
    if (!isAdminRoute) {
      router.replace('/admin/dashboard');
    }
  }, [loading, pathname, router, user?.role]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main section")).filter(
      (section) => section.id !== "hero"
    );
    sections.forEach((section) => {
      section.classList.add("auto-reveal-section");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove("auto-reveal-section", "is-visible");
      });
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden transition-all duration-300">
        <Header />
        <main className="flex-grow flex flex-col bg-background pb-24 md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
        <MobileStickyCTA />
        <Footer />
      </div>
    </>
  )
}
