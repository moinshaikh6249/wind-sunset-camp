"use client";

import { useUser, useAdmin } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchProvider } from "@/context/SearchProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isUserLoading || isAdminLoading) {
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
  }, [user, isUserLoading, isAdmin, isAdminLoading, router, isLoginPage, pathname]);

  // If on the login page, just render the content without the admin layout.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages, show loading or protect the content.
  if (isUserLoading || isAdminLoading || !isAdmin || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SearchProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
          <AdminHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
