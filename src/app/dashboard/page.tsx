
"use client";

import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, LogOut, Tent, Trash2 } from 'lucide-react';
import { useDoc } from "@/firebase/firestore/use-doc";
import { useCollection } from "@/firebase/firestore/use-collection";
import { doc, collection, deleteDoc } from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: bookings, isLoading: areBookingsLoading } = useCollection(bookingsRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    const auth = (await import('@/firebase')).auth;
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'bookings', bookingId));
      toast({
        title: "Booking Canceled",
        description: "Your booking has been successfully canceled.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const userInitial = userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : user.displayName;

  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center items-center">
                 <Avatar className="h-24 w-24 mb-4 text-4xl">
                  <AvatarImage src={user.photoURL ?? undefined} alt={displayName ?? "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-3xl text-heading-color">{displayName || "User Profile"}</CardTitle>
                <CardDescription>Welcome back to your adventure hub!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                    <User className="h-5 w-5 text-accent" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Full Name</span>
                      <span className="font-medium">{displayName || "Not set"}</span>
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
                      <span className="font-medium">{userProfile?.phone || "Not provided"}</span>
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
          <div className="lg:col-span-2">
            <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-heading-color flex items-center gap-2">
                  <Tent className="h-7 w-7" /> My Booked Camps
                </CardTitle>
                <CardDescription>Here are all your upcoming adventures. Manage your bookings here.</CardDescription>
              </CardHeader>
              <CardContent>
                {areBookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <ul className="space-y-4">
                    {bookings.map(booking => (
                      <li key={booking.id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                        <div>
                          <p className="font-semibold text-foreground">{booking.campName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.numberOfPeople} person(s)
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently cancel your booking for {booking.campName}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                Yes, Cancel It
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                     <p className="text-muted-foreground mb-4">You haven&apos;t booked any camps yet.</p>
                     <Button asChild className="btn-glow">
                       <a href="/camps">Explore Camps</a>
                     </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
