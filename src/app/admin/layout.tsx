
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, idTokenResult, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = idTokenResult?.claims?.isAdmin;
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }
    if (isLoginPage) {
      // If user is already logged in and is an admin, redirect to dashboard
      if (user && isAdmin) {
        router.replace("/admin/dashboard");
      }
      return;
    }
    // For all other admin pages:
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user && !isAdmin) {
      // If user is not an admin, redirect them away.
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, isAdmin, router, isLoginPage, pathname]);

  // If on the login page, just render the content without the admin layout.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages, show loading or protect the content.
  if (isUserLoading || !isAdmin || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <AdminHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
  );
}
