
"use client";

import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center items-center">
               <Avatar className="h-24 w-24 mb-4 text-4xl">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-3xl text-heading-color">{user.displayName || "User Profile"}</CardTitle>
              <CardDescription>Welcome back to your adventure hub!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                  <User className="h-5 w-5 text-accent" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Full Name</span>
                    <span className="font-medium">{user.displayName || "Not set"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                  <Mail className="h-5 w-5 text-accent" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email Address</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                  <Phone className="h-5 w-5 text-accent" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Phone Number</span>
                    <span className="font-medium">{user.phoneNumber || "Not provided"}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
