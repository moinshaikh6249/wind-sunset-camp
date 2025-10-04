
"use client";

import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

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
    // If we are on the login page, don't run any redirection logic.
    if (isLoginPage) {
      return;
    }

    if (isUserLoading) {
      return; // Wait for user status to be determined
    }
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (!isAdmin) {
      // If user is not an admin, redirect them to the regular dashboard
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, isAdmin, router, isLoginPage]);

  // If on the login page, just render the content.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other admin pages, show loading or protect the content.
  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
