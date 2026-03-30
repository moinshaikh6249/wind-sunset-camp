
"use client";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { User, Mail, Phone, LogOut, Tent, Trash2, History, UserPlus, CalendarPlus, Calendar, MapPin, Users, CheckCircle, Clock, XCircle, Download, CreditCard, IndianRupee } from 'lucide-react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserMemoryUploadModal } from "@/components/memories/UserMemoryUploadModal";

type Booking = {
  _id: string;
  id?: string;
  userId: string;
  campId: string;
  campName: string;
  bookingDate: string;
  createdAt?: string;
  numberOfPeople: number;
  totalPrice?: number;
  paymentMethod?: 'online' | 'cash';
  paymentStatus?: 'pending' | 'paid';
  status: 'pending' | 'approved' | 'rejected';
};

type Camp = {
  _id: string;
  id?: string;
  name: string;
  date: string;
  location: string;
  imageUrl?: string;
  imageHint?: string;
};

type ActivityLog = {
  _id: string;
  id?: string;
  type: string;
  description: string;
  timestamp: string;
};

const activityIcons: { [key: string]: React.ReactNode } = {
  'signup': <UserPlus className="h-5 w-5 text-green-500" />,
  'booking': <CalendarPlus className="h-5 w-5 text-blue-500" />,
};

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700",
  },
};

export default function DashboardPage() {
  const { user, loading: isUserLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [areCampsLoading, setAreCampsLoading] = useState(false);
  const [areBookingsLoading, setAreBookingsLoading] = useState(false);
  const [areHistoryLoading, setAreHistoryLoading] = useState(false);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        setIsProfileLoading(true);
        const userId = user._id || (user as any).id;
        if (!userId) return;
        const response = await api.get(`/users/${userId}`);
        setUserProfile(response.user || response);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch camps
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setAreCampsLoading(true);
        const response = await api.get('/camps');
        setCamps(Array.isArray(response) ? response : response.camps || []);
      } catch (error) {
        console.error("Error fetching camps:", error);
      } finally {
        setAreCampsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  // Fetch bookings
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        setAreBookingsLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await api.get('/bookings/my', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const bookingsData = Array.isArray(response)
          ? response
          : Array.isArray(response?.bookings)
            ? response.bookings
            : [];
        setBookings(
          bookingsData.map((booking: any) => ({
            ...booking,
            status: typeof booking.status === 'string' ? booking.status.toLowerCase() : 'pending',
          }))
        );
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setAreBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Fetch activity history
  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setAreHistoryLoading(true);
        const response = await api.get(`/users/${user._id}/history`);
        const historyData = Array.isArray(response) ? response : response.history || [];
        const sorted = [...historyData].sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setHistory(sorted);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setAreHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!user) {
      toast({ 
        title: "Not Authenticated", 
        description: "You must be logged in to delete a booking.", 
        variant: "destructive" 
      });
      return;
    }

    if (user._id !== booking.userId) {
      toast({ 
        title: "Permission Denied", 
        description: "You can only delete your own bookings.", 
        variant: "destructive" 
      });
      return;
    }

    if (booking.status !== 'pending') {
      toast({
        title: "Action Not Allowed",
        description: "You can cancel only pending bookings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingId = booking._id || booking.id;
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await api.delete(`/bookings/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      setBookings((prevBookings) =>
        prevBookings.filter((b) => (b._id !== bookingId && b.id !== bookingId))
      );

      toast({
        title: "Booking Deleted",
        description: "Your booking has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Delete Booking Error:", error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || error.message || "Could not delete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentLabel = (booking: Booking) => {
    if (booking.paymentStatus === 'paid') return 'Paid';
    if (booking.paymentMethod === 'cash') return 'Cash at Camp';
    return 'Pending';
  };

  const getPaymentBadgeClass = (booking: Booking) => {
    if (booking.paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700';
    }
    if (booking.paymentMethod === 'cash') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700';
  };

  const downloadInvoice = (booking: Booking, campDetails?: Camp) => {
    const bookingId = booking._id || booking.id || 'N/A';
    const lines = [
      'Wind & Sunset Camp - Booking Invoice',
      '-----------------------------------',
      `Invoice Date: ${format(new Date(), 'PPpp')}`,
      `Booking ID: ${bookingId}`,
      `Camp Name: ${booking.campName}`,
      `Camp Date: ${campDetails?.date || 'N/A'}`,
      `Location: ${campDetails?.location || 'N/A'}`,
      `Booked On: ${format(new Date(booking.bookingDate || booking.createdAt || Date.now()), 'PPpp')}`,
      `People: ${booking.numberOfPeople}`,
      `Total Price: ₹${booking.totalPrice ?? 0}`,
      `Payment: ${getPaymentLabel(booking)}`,
      `Booking Status: ${booking.status}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking-invoice-${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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

  const displayName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : (user?.email || 'User');
  const photoURL = userProfile?.photoURL;
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
                {history.length > 0 ? (
                  <ul className="space-y-4">
                    {history.map((activity: ActivityLog, index: number) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="mt-1">
                          {activityIcons[activity.type] || <History className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.timestamp), "PPpp")}
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
                <CardDescription>Manage your trips, payment details, and booking progress in one place.</CardDescription>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <UserMemoryUploadModal />
                  <Button asChild variant="outline">
                    <Link href="/dashboard/memories">View My Memories</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <ul className="space-y-5">
                    {bookings.map((booking: Booking) => {
                      const campDetails = camps.find(c => (c._id === booking.campId || c.id === booking.campId));
                      const status = booking.status || 'pending';
                      const currentStatusConfig = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                      const Icon = currentStatusConfig.icon;
                      const campImage = campDetails?.imageUrl || '/images/placeholder.jpg';

                      return (
                        <li
                          key={booking._id || booking.id}
                          className="rounded-2xl border bg-background/90 dark:bg-background/70 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-64 h-52 md:h-auto shrink-0">
                              <Image
                                src={campImage}
                                alt={booking.campName}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 p-5 md:p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="space-y-2">
                                  <h3 className="font-headline text-2xl text-heading-color">{booking.campName}</h3>

                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4 text-accent" />
                                      {campDetails?.date || 'Date not available'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      <MapPin className="h-4 w-4 text-accent" />
                                      {campDetails?.location || 'Location not available'}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                      <Users className="h-4 w-4 text-accent" />
                                      {booking.numberOfPeople} People
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                                      <IndianRupee className="h-4 w-4 text-accent" />
                                      {booking.totalPrice ?? 0}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 md:justify-end">
                                  <Badge variant="outline" className={cn("gap-1.5", currentStatusConfig.className)}>
                                    <Icon className="h-3.5 w-3.5" />
                                    {currentStatusConfig.label}
                                  </Badge>
                                  <Badge variant="outline" className={cn("gap-1.5", getPaymentBadgeClass(booking))}>
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Payment: {getPaymentLabel(booking)}
                                  </Badge>
                                </div>
                              </div>

                              <div className="mt-5 rounded-xl border p-4 bg-muted/30">
                                <p className="text-sm font-medium mb-3">Booking Timeline</p>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="inline-flex items-center gap-1 text-foreground">
                                    <CheckCircle className="h-4 w-4 text-green-600" /> Booked
                                  </span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className={cn(
                                    "inline-flex items-center gap-1",
                                    status === 'pending' ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'
                                  )}>
                                    <Clock className="h-4 w-4" /> Pending Approval
                                  </span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className={cn(
                                    "inline-flex items-center gap-1",
                                    status === 'approved'
                                      ? 'text-green-700 dark:text-green-400'
                                      : status === 'rejected'
                                        ? 'text-red-700 dark:text-red-400'
                                        : 'text-muted-foreground'
                                  )}>
                                    {status === 'rejected' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />} {status === 'rejected' ? 'Rejected' : 'Approved'}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                <Button
                                  variant="outline"
                                  className="sm:flex-1"
                                  disabled={status !== 'pending'}
                                  onClick={() => {
                                    if (!confirm(`Are you sure you want to cancel this booking for ${booking.campName}?`)) return;
                                    handleDeleteBooking(booking);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </Button>
                                <Button
                                  className="sm:flex-1 btn-glow"
                                  onClick={() => downloadInvoice(booking, campDetails)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Invoice
                                </Button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center">
                    <Tent className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">You haven't booked any camps yet.</h3>
                    <p className="text-muted-foreground mb-6">Your next adventure is waiting. Explore available camps and reserve your spot.</p>
                    <Button asChild className="btn-glow">
                      <a href="/camps">Browse Camps</a>
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
