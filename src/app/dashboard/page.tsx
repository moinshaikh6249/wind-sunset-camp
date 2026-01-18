
"use client";

import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, LogOut, Tent, Trash2, History, UserPlus, CalendarPlus, Calendar, MapPin, Users, LoaderCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { doc, collection, query, deleteDoc, where } from "firebase/firestore";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Camp = {
    id: string;
    name: string;
    date: string;
    location: string;
};

const activityIcons: { [key: string]: React.ReactNode } = {
  'signup': <UserPlus className="h-5 w-5 text-green-500" />,
  'booking': <CalendarPlus className="h-5 w-5 text-blue-500" />,
};

const statusConfig = {
    Approved: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700",
    },
    Pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700",
    },
    Canceled: {
      label: "Canceled",
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700",
    },
  };


export default function DashboardPage() {
  const [user, isUserLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemo(() => {
    if (!user) return null;
    return doc(db, `users/${user.uid}`);
  }, [user]);
  
  const [userProfile, isProfileLoading] = useDocumentData<any>(userProfileRef);
  const [campsData, areCampsLoading] = useCollectionData<Camp>(collection(db, 'camps'), { idField: 'id' });
  
  const bookingsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'bookings'), where('userId', '==', user.uid));
  }, [user]);

  const [bookings, areBookingsLoading] = useCollectionData(bookingsQuery, { idField: 'id' });
  
  const [history, areHistoryLoading] = useCollectionData(user ? query(collection(db, `users/${user.uid}/history`)) : null, { idField: 'id' });

  const sortedHistory = useMemo(() => {
      if (!history) return [];
      return [...history].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      const bookingRef = doc(db, `bookings/${bookingId}`);
      await deleteDoc(bookingRef);
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
  
  const isLoading = isUserLoading || isProfileLoading || areCampsLoading || areBookingsLoading || areHistoryLoading;

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

  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : (user.displayName || 'User');
  const photoURL = userProfile?.photoURL || user.photoURL;
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
             <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center items-center">
                 <div className="relative group">
                    <Avatar className="h-24 w-24 mb-4 text-4xl">
                      <AvatarImage src={photoURL ?? undefined} alt={displayName ?? "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                    </Avatar>
                 </div>
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
            <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-heading-color flex items-center gap-2">
                  <History className="h-7 w-7" /> Activity Log
                </CardTitle>
                <CardDescription>Recent activities on your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedHistory.length > 0 ? (
                  <ul className="space-y-4">
                    {sortedHistory.map((activity: any, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="mt-1">
                            {activityIcons[activity.type] || <History className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent activity.</p>
                )}
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
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <ul className="space-y-4">
                    {bookings.map((booking: any) => {
                      const campDetails = campsData ? campsData.find(c => c.id === booking.campId) : null;
                      const status = booking.status || 'Pending';
                      const currentStatusConfig = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
                      const Icon = currentStatusConfig.icon;

                      return (
                      <Dialog key={booking.id}>
                        <DialogTrigger asChild>
                          <li className="flex items-center justify-between p-4 bg-background rounded-lg border cursor-pointer hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className={cn("gap-1.5", currentStatusConfig.className)}>
                                <Icon className="h-3.5 w-3.5" />
                                {currentStatusConfig.label}
                              </Badge>
                              <div>
                                <p className="font-semibold text-foreground">{booking.campName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.numberOfPeople} person(s)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={status === 'Canceled'}>
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
                            </div>
                          </li>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">{booking.campName}</DialogTitle>
                            <DialogDescription>
                              Your booking details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                             <div className="flex items-center gap-4">
                                <Badge variant="outline" className={cn("gap-1.5", currentStatusConfig.className)}>
                                    <Icon className="h-3.5 w-3.5" />
                                    {currentStatusConfig.label}
                                </Badge>
                             </div>
                            <div className="flex items-center gap-4">
                              <Users className="h-5 w-5 text-accent" />
                              <span className="font-medium">{booking.numberOfPeople} Person(s)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <CalendarPlus className="h-5 w-5 text-accent" />
                              <span className="font-medium">Booked on: {format(new Date(booking.bookingDate), "PPP")}</span>
                            </div>
                            {campDetails && (
                              <>
                                <div className="flex items-center gap-4">
                                  <Calendar className="h-5 w-5 text-accent" />
                                  <span className="font-medium">Camp Dates: {campDetails.date}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <MapPin className="h-5 w-5 text-accent" />
                                  <span className="font-medium">Location: {campDetails.location}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )})}
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
