"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SearchProvider } from "@/context/SearchProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isAdminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isAdminLoading) {
      return; // Do nothing while loading
    }

    if (isLoginPage) {
      // If user is already an admin, redirect from login to dashboard
      if (isAdmin) {
        router.replace("/admin/dashboard");
      }
    } else {
      // For all other admin pages, if not an admin, redirect to login
      if (!isAdmin) {
        router.replace("/admin/login");
      }
    }
  }, [user, isAdmin, isAdminLoading, router, isLoginPage, pathname]);

  // For the login page, render children directly without the layout.
  // This avoids showing the loading spinner on the login page itself when not logged in.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For protected admin pages, show loading spinner or the content.
  if (isAdminLoading || !isAdmin) {
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
          <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
