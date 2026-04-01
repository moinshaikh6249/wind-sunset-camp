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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SearchProvider>
      <div className="relative grid min-h-screen w-full overflow-x-clip bg-[radial-gradient(circle_at_20%_0%,rgba(34,197,94,0.1),transparent_42%),radial-gradient(circle_at_85%_8%,rgba(249,115,22,0.1),transparent_45%),linear-gradient(180deg,#05070b_0%,#0a0f16_48%,#0a1119_100%)] md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:44px_44px]" />
        <AdminSidebar />
        <div className="relative flex min-h-screen flex-col">
          <AdminHeader />
          <main className="flex flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
