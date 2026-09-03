"use client";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Image from "@/components/ui/safe-image";
import {
  User,
  Mail,
  Phone,
  LogOut,
  Tent,
  Trash2,
  History,
  UserPlus,
  CalendarPlus,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  CreditCard,
  IndianRupee,
  Ticket,
  MessageSquare,
  ShieldCheck,
  Award,
  Lock,
  PhoneCall,
  Sparkles,
  Bell,
  CheckCheck,
  Edit3,
  Compass,
  ArrowRight,
  Shield,
  Camera,
  Filter,
  Layers,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserMemoryUploadModal } from "@/components/memories/UserMemoryUploadModal";
import { CampsiteBookingPassModal } from "@/components/booking/CampsiteBookingPassModal";
import { buildBookingWhatsappUrl } from "@/lib/whatsapp";
import { UserAvatar } from "@/components/ui/user-avatar";
import { buildUserNotificationsFromBookings, NotificationItem } from "@/lib/notifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  paymentMethod?: "online" | "cash";
  paymentStatus?: "pending" | "paid";
  paidAt?: string;
  status: "pending" | "approved" | "rejected";
};

type Camp = {
  _id: string;
  id?: string;
  name: string;
  date: string;
  location: string;
  imageUrl?: string;
  imageHint?: string;
  pricePerNight?: number;
  rating?: number;
};

type ActivityLog = {
  _id: string;
  id?: string;
  type: string;
  description: string;
  timestamp: string;
};

const activityIcons: { [key: string]: React.ReactNode } = {
  signup: <UserPlus className="h-4 w-4 text-emerald-500" />,
  booking: <CalendarPlus className="h-4 w-4 text-amber-500" />,
};

const statusConfig = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30",
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
  const [memoriesCount, setMemoriesCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);


  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [areCampsLoading, setAreCampsLoading] = useState(false);
  const [areBookingsLoading, setAreBookingsLoading] = useState(false);
  const [areHistoryLoading, setAreHistoryLoading] = useState(false);

  const [passBooking, setPassBooking] = useState<any>(null);
  const [passCampDetails, setPassCampDetails] = useState<any>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Phase 1: Dashboard Sub-Nav Tabs & Booking Filter state
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "memories" | "settings">("overview");
  const [bookingFilter, setBookingFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const shouldReduceMotion = useReducedMotion();

  // Computed filtered bookings using existing database status fields
  const filteredBookings = useMemo(() => {
    if (bookingFilter === "upcoming") {
      return bookings.filter((b) => b.status === "approved" || b.status === "pending");
    }
    if (bookingFilter === "completed") {
      return bookings.filter((b) => {
        if (b.status !== "approved") return false;
        const bDate = b.bookingDate ? new Date(b.bookingDate) : null;
        return bDate ? bDate < new Date() : false;
      });
    }
    if (bookingFilter === "cancelled") {
      return bookings.filter((b) => b.status === "rejected");
    }
    return bookings;
  }, [bookings, bookingFilter]);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        setIsProfileLoading(true);
        const userId = user._id || (user as any).id;
        if (!userId) return;
        const response = await api.get(`/users/${userId}`);
        const profileData = response.user || response;
        setUserProfile(profileData);
        setEditFirstName(profileData.firstName || user.firstName || "");
        setEditLastName(profileData.lastName || user.lastName || "");
        setEditPhone(profileData.phone || user.phone || "");
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
        const response = await api.get("/camps");
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
        const response = await api.get("/bookings/my");
        const bookingsData = Array.isArray(response)
          ? response
          : Array.isArray(response?.bookings)
          ? response.bookings
          : [];
        setBookings(
          bookingsData.map((booking: any) => ({
            ...booking,
            status: typeof booking.status === "string" ? booking.status.toLowerCase() : "pending",
          }))
        );
        setNotifications(buildUserNotificationsFromBookings(bookingsData));

      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setAreBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Fetch activity history & user memories count
  useEffect(() => {
    if (!user) return;

    const fetchHistoryAndMemories = async () => {
      try {
        setAreHistoryLoading(true);
        const [historyRes, memoriesRes] = await Promise.allSettled([
          api.get(`/users/${user._id}/history`),
          api.get("/memories"),
        ]);

        if (historyRes.status === "fulfilled") {
          const response = historyRes.value;
          const historyData = Array.isArray(response) ? response : response.history || [];
          const sorted = [...historyData].sort(
            (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setHistory(sorted);
        }

        if (memoriesRes.status === "fulfilled") {
          const response = memoriesRes.value;
          const memList = Array.isArray(response) ? response : response.memories || [];
          const userMems = memList.filter(
            (m: any) => m.userId === user._id || m.user === user._id || m.email === user.email
          );
          setMemoriesCount(userMems.length);
        }
      } catch (error) {
        console.error("Error fetching history/memories:", error);
      } finally {
        setAreHistoryLoading(false);
      }
    };

    fetchHistoryAndMemories();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const userId = user._id || (user as any).id;
      if (userId) {
        await api.put(`/users/${userId}`, {
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
        });
      }
      setUserProfile((prev: any) => ({
        ...prev,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
      }));
      toast({
        title: "Profile Updated",
        description: "Your details have been successfully saved.",
      });
      setIsEditProfileOpen(false);
    } catch (error: any) {
      setUserProfile((prev: any) => ({
        ...prev,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
      }));
      toast({
        title: "Profile Saved Locally",
        description: "Your details were updated for this session.",
      });
      setIsEditProfileOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to delete a booking.",
        variant: "destructive",
      });
      return;
    }

    if (user._id !== booking.userId && (user as any).id !== booking.userId) {
      toast({
        title: "Permission Denied",
        description: "You can only delete your own bookings.",
        variant: "destructive",
      });
      return;
    }

    if (booking.status !== "pending") {
      toast({
        title: "Action Not Allowed",
        description: "You can cancel only pending bookings.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingId = booking._id || booking.id;
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      await api.delete(`/bookings/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setBookings((prevBookings) =>
        prevBookings.filter((b) => b._id !== bookingId && b.id !== bookingId)
      );

      toast({
        title: "Booking Deleted",
        description: "Your booking has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Delete Booking Error:", error);
      toast({
        title: "Delete Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Could not delete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentLabel = (booking: Booking) => {
    if (booking.paymentStatus === "paid") {
      return booking.paidAt ? `Paid (${format(new Date(booking.paidAt), "PP")})` : "Paid";
    }
    if (booking.paymentMethod === "cash") return "Cash at Campsite";
    return "Pending";
  };

  const getPaymentBadgeClass = (booking: Booking) => {
    if (booking.paymentStatus === "paid") {
      return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
    }
    if (booking.paymentMethod === "cash") {
      return "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30";
    }
    return "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
  };

  const downloadInvoice = (booking: Booking, campDetails?: Camp) => {
    const bookingId = booking._id || booking.id || "N/A";
    const lines = [
      "Wind & Sunset Camp - Booking Invoice",
      "-----------------------------------",
      `Invoice Date: ${format(new Date(), "PPpp")}`,
      `Booking ID: ${bookingId}`,
      `Camp Name: ${booking.campName}`,
      `Camp Date: ${campDetails?.date || "N/A"}`,
      `Location: ${campDetails?.location || "Pawna Lake, Lonavala"}`,
      `Booked On: ${format(new Date(booking.bookingDate || booking.createdAt || Date.now()), "PPpp")}`,
      `People: ${booking.numberOfPeople}`,
      `Total Price: ₹${booking.totalPrice ?? 0}`,
      `Payment: ${getPaymentLabel(booking)}`,
      `Booking Status: ${booking.status}`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `booking-invoice-${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Stats computations
  const stats = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status === "approved" || b.status === "pending").length;
    const past = bookings.filter((b) => {
      if (b.status !== "approved") return false;
      const bDate = b.bookingDate ? new Date(b.bookingDate) : null;
      return bDate ? bDate < new Date() : false;
    }).length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return {
      upcomingStays: upcoming,
      pastStays: past,
      memories: memoriesCount,
      totalSpent,
    };
  }, [bookings, memoriesCount]);

  // Phase 2: Calculated Profile Completion (based ONLY on actual user profile fields)
  const profileCompletion = useMemo(() => {
    let filled = 0;
    const total = 4;

    if (userProfile?.firstName || user?.firstName) filled++;
    if (userProfile?.lastName || user?.lastName) filled++;
    if (user?.email) filled++;
    if (userProfile?.phone || user?.phone) filled++;

    const percentage = Math.round((filled / total) * 100);
    const isMissingPhone = !(userProfile?.phone || user?.phone);

    return { percentage, isMissingPhone, filled, total };
  }, [userProfile, user]);

  const isLoading =
    isUserLoading || isProfileLoading || areCampsLoading || areBookingsLoading || areHistoryLoading;

  if (isLoading || !user) {
    return (
      <div className="bg-background woody-texture-background min-h-screen pb-16">
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 max-w-7xl animate-pulse">
          {/* Hero Banner Skeleton */}
          <div className="h-48 w-full rounded-3xl bg-muted/40 border border-border/40" />
          {/* Sub-nav Skeleton */}
          <div className="h-14 w-full rounded-2xl bg-muted/30 border border-border/40" />
          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-8">
              <div className="h-[420px] w-full rounded-3xl bg-muted/40 border border-border/40" />
              <div className="h-48 w-full rounded-3xl bg-muted/30 border border-border/40" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <div className="h-[480px] w-full rounded-3xl bg-muted/40 border border-border/40" />
              <div className="h-64 w-full rounded-3xl bg-muted/30 border border-border/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = userProfile?.firstName || user?.firstName || user?.displayName?.split(" ")[0] || "Camper";
  const fullName = `${userProfile?.firstName || user?.firstName || ""} ${userProfile?.lastName || user?.lastName || ""}`.trim() || user?.displayName || user?.email || "User";
  const userPhone = userProfile?.phone || user?.phone || "Not provided";
  const userCreatedAt = userProfile?.createdAt ? format(new Date(userProfile.createdAt), "MMMM yyyy") : "2026";

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 max-w-7xl">
        {/* HERO / WELCOME BANNER */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 dark:bg-card/50 p-6 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Luxury Campsite Hub
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-foreground">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                Ready for your next adventure? Manage your campsite stays, booking passes, and customer memories in one polished space.
              </p>
            </div>

            {/* QUICK STATS PILLS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center backdrop-blur-md hover:scale-[1.03] transition-transform duration-200"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">Upcoming Stays</p>
                <p className="mt-1 text-2xl font-extrabold font-headline text-foreground">{stats.upcomingStays}</p>
              </motion.div>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center backdrop-blur-md hover:scale-[1.03] transition-transform duration-200"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">Past Stays</p>
                <p className="mt-1 text-2xl font-extrabold font-headline text-foreground">{stats.pastStays}</p>
              </motion.div>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5 text-center backdrop-blur-md hover:scale-[1.03] transition-transform duration-200"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-800 dark:text-purple-300">Memories</p>
                <p className="mt-1 text-2xl font-extrabold font-headline text-foreground">{stats.memories}</p>
              </motion.div>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-center backdrop-blur-md hover:scale-[1.03] transition-transform duration-200"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-800 dark:text-sky-300">Total Spent</p>
                <p className="mt-1 text-2xl font-extrabold font-headline text-foreground">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
        {/* DASHBOARD SUB-NAVIGATION HEADER */}
        <div className="sticky top-20 z-20 rounded-2xl border border-border/40 bg-card/85 dark:bg-card/75 backdrop-blur-xl p-1.5 shadow-lg">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: "overview", label: "Overview", icon: Compass },
              { id: "bookings", label: "My Bookings", icon: Tent, badge: bookings.length },
              { id: "memories", label: "My Memories", icon: Camera, badge: memoriesCount },
              { id: "settings", label: "Profile & Settings", icon: User },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "settings") {
                      setIsEditProfileOpen(true);
                    } else if (tab.id === "memories") {
                      router.push("/dashboard/memories");
                    } else if (tab.id === "bookings") {
                      const el = document.getElementById("bookings");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer",
                    isActive
                      ? "text-amber-950 dark:text-amber-100 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDashTab"
                      className="absolute inset-0 rounded-xl bg-amber-500/20 border border-amber-500/50 dark:bg-amber-500/30"
                      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10 text-amber-500" />
                  <span className="relative z-10">{tab.label}</span>
                  {typeof tab.badge === "number" && (
                    <span className="relative z-10 ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT SIDEBAR: PROFILE CARD & ACTIVITY & NOTIFICATIONS */}
          <div className="lg:col-span-1 space-y-8">
            {/* PROFILE CARD */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Card className="overflow-hidden border border-border/40 bg-card/85 dark:bg-card/65 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
                {/* NATURE COVER IMAGE */}
                <div className="relative h-32 w-full bg-gradient-to-r from-emerald-900 via-teal-950 to-amber-950 overflow-hidden">
                  <Image
                    src="/images/light-hero.png"
                    alt="Nature Cover"
                    fill
                    className="object-cover opacity-40 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <Badge className="bg-emerald-500/20 text-white border-emerald-400/40 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400" /> Verified Member
                    </Badge>
                  </div>
                </div>

                <CardHeader className="relative text-center pt-0 -mt-12 pb-4">
                  <div className="flex justify-center">
                    <div className="relative group cursor-pointer">
                      <UserAvatar
                        user={{
                          ...user,
                          firstName: userProfile?.firstName || user.firstName,
                          lastName: userProfile?.lastName || user.lastName,
                          photoURL: userProfile?.photoURL || user.photoURL,
                        }}
                        sizeClassName="h-24 w-24 rounded-full ring-4 ring-amber-500/30 group-hover:ring-amber-500/60 shadow-2xl transition-all duration-300 transform group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <CardTitle className="font-headline text-2xl text-foreground">
                      {fullName}
                    </CardTitle>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <Sparkles className="h-3 w-3 text-amber-500" /> PAWNA EXPLORER
                    </div>
                    <CardDescription className="text-xs text-muted-foreground pt-0.5">
                      Pawna Lake Campsite Explorer
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* CALCULATED PROFILE COMPLETION METER */}
                  <div className="space-y-2 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Profile Completion
                      </span>
                      <span className="font-extrabold text-amber-800 dark:text-amber-300">{profileCompletion.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${profileCompletion.percentage}%` }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    {profileCompletion.isMissingPhone && (
                      <p className="text-[11px] text-amber-900 dark:text-amber-300 font-medium pt-0.5 leading-tight">
                        💡 Add phone number for instant WhatsApp booking passes.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <User className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Full Name</span>
                        <span className="text-xs font-semibold text-foreground truncate">{fullName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Email Address</span>
                        <span className="text-xs font-semibold text-foreground truncate font-mono">{user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Phone Number</span>
                        <span className="text-xs font-semibold text-foreground truncate">{userPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Member Since</span>
                        <span className="text-xs font-semibold text-foreground">{userCreatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setIsEditProfileOpen(true)}
                      variant="outline"
                      className="w-full text-xs font-bold rounded-xl border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full text-xs font-bold rounded-xl"
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1.5" /> Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RECENT NOTIFICATIONS CARD */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2 font-headline text-xl text-foreground">
                    <Bell className="h-5 w-5 text-amber-500" /> Recent Notifications
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-700 dark:text-amber-300">
                    {notifications.filter((n) => !n.isRead).length} New
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-2xl border border-border/40 transition-all text-xs space-y-1",
                      !item.isRead ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {!item.isRead && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ACTIVITY LOG CARD */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-xl text-foreground flex items-center gap-2">
                  <History className="h-5 w-5 text-amber-500" /> Activity Log
                </CardTitle>
                <CardDescription className="text-xs">Recent account history & updates.</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ul className="space-y-3">
                    {history.slice(0, 5).map((activity: ActivityLog, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-2.5 rounded-2xl border border-border/30 bg-muted/20 text-xs">
                        <div className="mt-0.5 shrink-0">
                          {activityIcons[activity.type] || <History className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{activity.description}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {format(new Date(activity.timestamp), "PPpp")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    <History className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    No recent activity recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT CONTENT: BOOKINGS & PROMOTIONS & FEATURES */}
          <div className="lg:col-span-2 space-y-8" id="bookings">
            {/* MY BOOKED CAMPS */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-3xl text-foreground flex items-center gap-2">
                      <Tent className="h-7 w-7 text-amber-500" /> My Booked Camps
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Manage your campsite reservations, booking pass ticket, and WhatsApp direct contact.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <UserMemoryUploadModal />
                    <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                      <Link href="/dashboard/memories">My Memories</Link>
                    </Button>
                  </div>
                </div>

                {/* BOOKING STATUS FILTER CHIPS */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1 border-t border-border/30 mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mr-1">
                    <Filter className="h-3.5 w-3.5 text-amber-500" /> Filter:
                  </span>
                  {[
                    { id: "all", label: "All Stays", count: bookings.length },
                    {
                      id: "upcoming",
                      label: "Upcoming",
                      count: bookings.filter((b) => b.status === "approved" || b.status === "pending").length,
                    },
                    {
                      id: "completed",
                      label: "Completed",
                      count: bookings.filter((b) => {
                        if (b.status !== "approved") return false;
                        const bDate = b.bookingDate ? new Date(b.bookingDate) : null;
                        return bDate ? bDate < new Date() : false;
                      }).length,
                    },
                    {
                      id: "cancelled",
                      label: "Cancelled",
                      count: bookings.filter((b) => b.status === "rejected").length,
                    },
                  ].map((f) => {
                    const isActive = bookingFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={0}
                        onClick={() => setBookingFilter(f.id as any)}
                        className={cn(
                          "relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer",
                          isActive
                            ? "text-amber-950 dark:text-amber-100 font-bold shadow-sm"
                            : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/30"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeBookingFilterTab"
                            className="absolute inset-0 rounded-full bg-amber-500/20 border border-amber-500/50 dark:bg-amber-500/30"
                            transition={
                              shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }
                            }
                          />
                        )}
                        <span className="relative z-10">
                          {f.label} ({f.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </div>
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  <ul className="space-y-5">
                    {filteredBookings.map((booking: Booking, index: number) => {
                      const campDetails = camps.find((c) => c._id === booking.campId || c.id === booking.campId);
                      const status = booking.status || "pending";
                      const currentStatusConfig =
                        statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                      const Icon = currentStatusConfig.icon;
                      const campImage = campDetails?.imageUrl || "/images/pawna-sunset.jpg";

                      return (
                        <motion.li
                          key={booking._id || booking.id}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
                          className="rounded-3xl border border-border/40 bg-card/85 dark:bg-card/60 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-64 h-56 md:h-auto shrink-0">
                              <Image
                                src={campImage}
                                alt={booking.campName}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                <Badge variant="outline" className={cn("gap-1 py-0.5 px-2.5 text-xs font-bold backdrop-blur-md shadow-md", currentStatusConfig.className)}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {currentStatusConfig.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex-1 p-5 md:p-6 flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                  <div>
                                    <h3 className="font-headline text-2xl text-foreground font-bold">{booking.campName}</h3>
                                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                      Ref ID: WSC-{(booking._id || booking.id || "000000").slice(-6).toUpperCase()}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className={cn("w-fit text-xs font-bold", getPaymentBadgeClass(booking))}>
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {getPaymentLabel(booking)}
                                  </Badge>
                                </div>

                                {/* COUNTDOWN BADGE FOR UPCOMING APPROVED STAYS */}
                                {status === "approved" && (() => {
                                  const dateStr = booking.bookingDate || campDetails?.date;
                                  if (!dateStr) return null;
                                  const bDate = new Date(dateStr);
                                  if (isNaN(bDate.getTime())) return null;
                                  const diffDays = Math.ceil((bDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  if (diffDays < 0) return null;

                                  const countdownLabel =
                                    diffDays === 0 ? "🔥 Your stay starts today!" :
                                    diffDays === 1 ? "🌅 Your stay is tomorrow!" :
                                    `🏕️ Your stay is in ${diffDays} days`;

                                  return (
                                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-800 dark:text-amber-300 backdrop-blur-md">
                                      <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                      {countdownLabel}
                                    </div>
                                  );
                                })()}

                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                    {campDetails?.date || "Date confirmed on pass"}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-amber-500" />
                                    {campDetails?.location || "Pawna Lake, Lonavala"}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-amber-500" />
                                    {booking.numberOfPeople} Guests
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                                    <IndianRupee className="h-4 w-4 text-emerald-500" />
                                    ₹{(booking.totalPrice ?? 0).toLocaleString("en-IN")}
                                  </span>
                                </div>

                                {/* VISUAL BOOKING PROGRESS TIMELINE */}
                                <div className="mt-4 rounded-2xl border border-border/40 p-3 bg-muted/20 text-xs">
                                  <p className="font-bold text-foreground text-[11px] uppercase tracking-wider mb-2">Visual Booking Timeline</p>
                                  <div className="flex items-center gap-2 text-[11px] overflow-x-auto no-scrollbar">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                                      <CheckCircle className="h-3.5 w-3.5" /> Booked ✓
                                    </span>
                                    <span className="text-muted-foreground shrink-0">→</span>
                                    {status === "rejected" ? (
                                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                                        <XCircle className="h-3.5 w-3.5" /> Cancelled
                                      </span>
                                    ) : (
                                      <>
                                        <span className={cn("inline-flex items-center gap-1 font-bold shrink-0", status === "approved" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                          {status === "approved" ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5 animate-spin" />}
                                          {status === "approved" ? "Approved ✓" : "Awaiting Approval"}
                                        </span>
                                        <span className="text-muted-foreground shrink-0">→</span>
                                        <span className={cn("inline-flex items-center gap-1 font-bold shrink-0", status === "approved" ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
                                          <Ticket className="h-3.5 w-3.5" />
                                          {status === "approved" ? "Pass Ready ✓" : "Pass Pending"}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* RESPONSIVE 2X2 MOBILE / FLEX DESKTOP ACTION BUTTONS */}
                              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 pt-2">
                                <Button
                                  size="sm"
                                  className="h-11 sm:h-9 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
                                  onClick={() => {
                                    setPassBooking({
                                      ...booking,
                                      fullName: fullName,
                                      email: user?.email || "",
                                      phone: userPhone,
                                    });
                                    setPassCampDetails(campDetails);
                                    setIsPassModalOpen(true);
                                  }}
                                >
                                  <Ticket className="h-3.5 w-3.5 mr-1.5" />
                                  View Pass
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-11 sm:h-9 text-xs font-semibold rounded-xl"
                                  disabled={status !== "pending"}
                                  onClick={() => {
                                    if (!confirm(`Are you sure you want to cancel this booking for ${booking.campName}?`)) return;
                                    handleDeleteBooking(booking);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
                                  Cancel Booking
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-11 sm:h-9 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold rounded-xl"
                                  asChild
                                >
                                  <a
                                    href={buildBookingWhatsappUrl({
                                      name: fullName,
                                      campName: booking.campName,
                                      numberOfPeople: booking.numberOfPeople,
                                      campDate: campDetails?.date || "To be confirmed",
                                      phone: userPhone,
                                      bookingRef: `WSC-${(booking._id || booking.id || "000000").slice(-6).toUpperCase()}`,
                                      status: booking.status,
                                      paymentStatus: booking.paymentStatus,
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                                    WhatsApp Us
                                  </a>
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-11 sm:h-9 text-xs font-semibold rounded-xl"
                                  onClick={() => downloadInvoice(booking, campDetails)}
                                >
                                  <Download className="h-3.5 w-3.5 mr-1.5" />
                                  Invoice TXT
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                ) : (
                  /* BEAUTIFUL EMPTY STATE */
                  <div className="text-center py-16 px-6 bg-muted/20 rounded-3xl border border-dashed border-border/60 flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-md">
                      <Tent className="h-8 w-8" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h3 className="text-xl font-extrabold text-foreground font-headline">
                        {bookingFilter !== "all"
                          ? `No ${bookingFilter} campsite stays found.`
                          : "You haven't booked any camps yet."}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {bookingFilter !== "all"
                          ? `Try switching filters to view all your stays or explore Pawna Lake campsites.`
                          : "Your next adventure is waiting. Explore Pawna Lake campsites and reserve your luxury stay today."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {bookingFilter !== "all" ? (
                        <Button
                          onClick={() => setBookingFilter("all")}
                          variant="outline"
                          className="rounded-full text-xs font-bold"
                        >
                          Show All Stays
                        </Button>
                      ) : (
                        <Button asChild className="rounded-full bg-gradient-to-r from-amber-500 to-emerald-700 text-white font-bold px-6 text-xs shadow-lg hover:scale-105 transition-all">
                          <Link href="/camps">
                            Browse Camps <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CAMPS PROMOTION (EXPLORE OUR CAMPS) */}
            <Card className="border border-border/40 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-2xl text-foreground flex items-center gap-2">
                      <Compass className="h-6 w-6 text-amber-500" /> Explore Our Camps
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Handcrafted Pawna lakefront camping packages for families, couples & friends.
                    </CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-amber-700 dark:text-emerald-400">
                    <Link href="/camps">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {camps.slice(0, 2).map((camp) => (
                    <div key={camp._id || camp.id} className="group overflow-hidden rounded-2xl border border-border/40 bg-background/60 p-3 space-y-3 transition-all hover:shadow-lg">
                      <div className="relative h-36 w-full rounded-xl overflow-hidden">
                        <Image src={camp.imageUrl || "/images/pawna-sunset.jpg"} alt={camp.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground">
                          ₹{camp.pricePerNight || 1499} / night
                        </div>
                      </div>
                      <div>
                        <h4 className="font-headline text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors">{camp.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-amber-500" /> {camp.location || "Pawna Lake, Lonavala"}
                        </p>
                      </div>
                      <Button asChild size="sm" className="w-full text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                        <Link href={`/booking?campId=${camp._id || camp.id}`}>Reserve Now</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FEATURE HIGHLIGHTS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Best Price Guarantee</h4>
                <p className="text-[10px] text-muted-foreground">Direct campsite rates without middleman fees</p>
              </div>

              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Secure Booking</h4>
                <p className="text-[10px] text-muted-foreground">Protected reservation system & privacy</p>
              </div>

              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Pay at Campsite</h4>
                <p className="text-[10px] text-muted-foreground">Flexible cash payment upon arrival</p>
              </div>

              <div className="p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">24/7 Support</h4>
                <p className="text-[10px] text-muted-foreground">On-ground campsite helpdesk assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Profile Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update your account details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">First Name</label>
              <Input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="First name"
                className="text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Last Name</label>
              <Input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Last name"
                className="text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Phone Number</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone number"
                className="text-xs rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} className="text-xs rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BOOKING PASS MODAL */}
      <CampsiteBookingPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        booking={passBooking}
        campDetails={passCampDetails}
      />
    </div>
  );
}
