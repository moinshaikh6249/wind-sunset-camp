
"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, idTokenResult, isUserLoading } = useUser();
  const router = useRouter();

  const isAdmin = idTokenResult?.claims?.isAdmin;

  useEffect(() => {
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
  }, [user, isUserLoading, isAdmin, router]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
