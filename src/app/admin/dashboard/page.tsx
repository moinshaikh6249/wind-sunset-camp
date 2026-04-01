
'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { io as socketClient } from 'socket.io-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Activity,
  IndianRupee,
  Tent,
  ListTodo,
  BadgeAlert,
  MessageSquare,
  Star,
  Clock3,
  Plus,
  ImagePlus,
  Inbox,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { useAuth } from '@/context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

type MonthlyBookings = {
  month: string;
  count: number;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type CampPopularity = {
  campName: string;
  bookings: number;
};

type DashboardAnalytics = {
  totals: {
    totalUsers: number;
    totalBookings: number;
    totalCamps: number;
    pendingBookings: number;
    totalReviews: number;
    totalMessages: number;
  };
  bookingsPerMonth: MonthlyBookings[];
  campPopularity: CampPopularity[];
};

type PendingActionCounts = {
  pendingApprovals: number;
  newReviews: number;
  refundRequests: number;
};

type BookingItem = {
  _id: string;
  fullName: string;
  email: string;
  campName: string;
  numberOfPeople: number;
  status: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
};

type MessageItem = {
  _id: string;
  name: string;
  email: string;
  message: string;
  timestamp?: string;
  createdAt?: string;
};

type LiveBookingNotification = {
  name: string;
  camp: string;
  people: number;
  date?: string;
};

type CustomerMemoryItem = {
  _id: string;
  imageUrl: string;
  caption?: string;
  createdAt?: string;
};

const formatDate = (dateValue?: string) => {
  if (!dateValue) return '—';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const getStatusUi = (status: string) => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'approved' || normalized === 'confirmed') {
    return {
      label: 'Confirmed',
      className:
        'border-green-500/30 bg-green-500/10 text-green-300 dark:text-green-300',
    };
  }

  if (normalized === 'rejected' || normalized === 'cancelled' || normalized === 'canceled') {
    return {
      label: 'Cancelled',
      className:
        'border-red-500/30 bg-red-500/10 text-red-300 dark:text-red-300',
    };
  }

  return {
    label: 'Pending',
    className:
      'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 dark:text-yellow-300',
  };
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [recentMessages, setRecentMessages] = useState<MessageItem[]>([]);
  const [memories, setMemories] = useState<CustomerMemoryItem[]>([]);
  const [pendingActionCounts, setPendingActionCounts] = useState<PendingActionCounts>({
    pendingApprovals: 0,
    newReviews: 0,
    refundRequests: 0,
  });
  const [liveNotification, setLiveNotification] = useState<LiveBookingNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emptyAnalytics: DashboardAnalytics = {
    totals: {
      totalUsers: 0,
      totalBookings: 0,
      totalCamps: 0,
      pendingBookings: 0,
      totalReviews: 0,
      totalMessages: 0,
    },
    bookingsPerMonth: [],
    campPopularity: [],
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async () => {
      try {
        const [analyticsResponse, statsResponse, bookingsResponse, messagesResponse, memoriesResponse] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/dashboard/stats'),
          api.get('/admin/bookings'),
          api.get('/admin/messages'),
          api.get('/memories'),
        ]);

        if (!mounted) return;

        const normalizedAnalytics = analyticsResponse?.data || analyticsResponse || {};
        const normalizedStats = statsResponse?.data || statsResponse || {};
        const normalizedBookings = bookingsResponse?.data || bookingsResponse || {};
        const normalizedMessages = messagesResponse?.data || messagesResponse || {};
        const normalizedMemories = memoriesResponse?.data || memoriesResponse || {};

        const bookingsList = Array.isArray(normalizedBookings?.bookings)
          ? normalizedBookings.bookings
          : [];

        const messagesList = Array.isArray(normalizedMessages?.messages)
          ? normalizedMessages.messages
          : [];

        const memoriesList = Array.isArray(normalizedMemories?.memories)
          ? normalizedMemories.memories
          : [];

        const pendingBookings = bookingsList.filter(
          (booking: BookingItem) => String(booking?.status || '').toLowerCase() === 'pending'
        ).length;

        setAnalytics({
          ...emptyAnalytics,
          ...normalizedAnalytics,
          totals: {
            ...emptyAnalytics.totals,
            ...(normalizedAnalytics?.totals || {}),
            pendingBookings,
            totalReviews: Number(normalizedStats?.totalReviews || 0),
            totalMessages: Number(normalizedStats?.totalMessages || 0),
          },
          bookingsPerMonth: Array.isArray(normalizedAnalytics?.bookingsPerMonth) ? normalizedAnalytics.bookingsPerMonth : [],
          campPopularity: Array.isArray(normalizedAnalytics?.campPopularity) ? normalizedAnalytics.campPopularity : [],
        });

        setAllBookings(bookingsList);
        setRecentBookings(bookingsList.slice(0, 8));
        setRecentMessages(messagesList.slice(0, 5));
        setMemories(memoriesList);
        setPendingActionCounts({
          pendingApprovals: Number(normalizedStats?.pendingApprovals || pendingBookings),
          newReviews: Number(normalizedStats?.newReviews || normalizedStats?.pendingReviews || 0),
          refundRequests: Number(normalizedStats?.refundRequests || normalizedStats?.pendingRefundRequests || 0),
        });
      } catch (err: any) {
        console.error('Failed to load dashboard analytics', err);
        if (!mounted) return;
        setError('Failed to load dashboard analytics.');
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.warn('NEXT_PUBLIC_SOCKET_URL not configured; real-time notifications disabled');
      return;
    }
    const socket = socketClient(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('newBooking', (payload: LiveBookingNotification) => {
      setLiveNotification({
        name: payload?.name || 'Guest',
        camp: payload?.camp || 'Camp',
        people: Number(payload?.people || 0),
        date: payload?.date,
      });

      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => null);
      } catch {
        // Optional sound; ignore if browser blocks autoplay or file is missing.
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!liveNotification) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLiveNotification(null);
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [liveNotification]);

  const handleMemoryDelete = async (memoryId: string) => {
    try {
      await api.delete(`/admin/memories/${memoryId}`);
      setMemories((prev) => prev.filter((memory) => memory._id !== memoryId));
    } catch (deleteError: any) {
      setMemoryError(deleteError?.response?.data?.message || 'Failed to delete memory.');
    }
  };

  const chartColors = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        primary: '#0ea5e9',
        accent: '#22c55e',
        warning: '#f59e0b',
        muted: '#94a3b8',
      };
    }
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: `hsl(${styles.getPropertyValue('--primary')})`,
      accent: `hsl(${styles.getPropertyValue('--chart-2, 142 76% 36%') || '142 76% 36%'})`,
      warning: `hsl(${styles.getPropertyValue('--chart-4, 43 96% 56%') || '43 96% 56%'})`,
      muted: `hsl(${styles.getPropertyValue('--muted-foreground')})`,
    };
  }, [theme]);

  const bookingsChartData = useMemo(() => {
    const source = analytics?.bookingsPerMonth || [];
    return {
      labels: source.map((item) => item.month),
      datasets: [
        {
          label: 'Bookings',
          data: source.map((item) => item.count),
          backgroundColor: chartColors.primary,
          borderRadius: 6,
        },
      ],
    };
  }, [analytics, chartColors]);

  const campPopularityChartData = useMemo(() => {
    const source = analytics?.campPopularity || [];
    const palette = [
      chartColors.primary,
      chartColors.accent,
      chartColors.warning,
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316',
      '#64748b',
    ];

    return {
      labels: source.map((item) => item.campName),
      datasets: [
        {
          label: 'Camp Popularity',
          data: source.map((item) => item.bookings),
          backgroundColor: source.map((_, index) => palette[index % palette.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [analytics, chartColors]);

  const commonChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartColors.muted,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartColors.muted,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
        },
      },
      y: {
        ticks: {
          color: chartColors.muted,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.15)',
        },
      },
    },
  }), [chartColors]);

  const displayName = user?.firstName || user?.email ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email : 'Admin';

  const todayStats = useMemo(() => {
    const today = new Date();
    const isSameDay = (input?: string) => {
      if (!input) return false;
      const parsed = new Date(input);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed.toDateString() === today.toDateString();
    };

    const todaysBookings = allBookings.filter((booking) => isSameDay(booking.createdAt));
    const todayRevenue = todaysBookings.reduce((sum, booking) => {
      const rawAmount = (booking as any)?.totalAmount ?? (booking as any)?.amount ?? (booking as any)?.totalPrice ?? 0;
      return sum + Number(rawAmount || 0);
    }, 0);

    return {
      bookingsCount: todaysBookings.length,
      revenue: todayRevenue,
      activeCamps: Number(analytics?.totals?.totalCamps || 0),
      pendingBookings: Number(analytics?.totals?.pendingBookings || 0),
    };
  }, [allBookings, analytics?.totals?.pendingBookings, analytics?.totals?.totalCamps]);

  const quickActions = [
    {
      label: 'Add Camp',
      description: 'Create a new camp listing',
      href: '/admin/camps',
      icon: Plus,
      glow: 'hover:shadow-[0_0_28px_rgba(34,197,94,0.28)]',
    },
    {
      label: 'View Bookings',
      description: 'Review and update booking status',
      href: '/admin/bookings',
      icon: CalendarCheck,
      glow: 'hover:shadow-[0_0_28px_rgba(250,204,21,0.28)]',
    },
    {
      label: 'Manage Gallery',
      description: 'Upload and curate camp photos',
      href: '/admin/gallery',
      icon: ImagePlus,
      glow: 'hover:shadow-[0_0_28px_rgba(59,130,246,0.28)]',
    },
    {
      label: 'View Messages',
      description: 'Respond to customer inquiries',
      href: '/admin/messages',
      icon: Inbox,
      glow: 'hover:shadow-[0_0_28px_rgba(236,72,153,0.28)]',
    },
  ];

  return (
    <div className="flex-1 space-y-7 p-4 pt-6 md:p-8">
      {liveNotification ? (
        <div className="fixed right-4 top-20 z-50 w-[min(92vw,360px)] rounded-2xl border border-emerald-400/35 bg-slate-950/95 p-4 text-slate-100 shadow-[0_0_35px_rgba(16,185,129,0.35)] backdrop-blur-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">New Booking Received</p>
              <p className="mt-2 text-sm text-slate-200">
                <span className="font-semibold text-white">Name:</span> {liveNotification.name}
              </p>
              <p className="mt-1 text-sm text-slate-200">
                <span className="font-semibold text-white">Camp:</span> {liveNotification.camp}
              </p>
              <p className="mt-1 text-sm text-slate-200">
                <span className="font-semibold text-white">People:</span> {liveNotification.people}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close notification"
              onClick={() => setLiveNotification(null)}
              className="rounded-full border border-emerald-300/30 bg-emerald-500/10 p-1.5 text-emerald-200 transition-colors hover:bg-emerald-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/65 p-6 shadow-[0_0_45px_rgba(34,197,94,0.2)] before:pointer-events-none before:absolute before:-left-16 before:top-1/2 before:h-40 before:w-40 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400/15 before:blur-3xl after:pointer-events-none after:absolute after:-right-20 after:top-0 after:h-44 after:w-44 after:rounded-full after:bg-orange-400/14 after:blur-3xl">
        <h2 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">Welcome back, {displayName}!</h2>
        <p className="mt-2 text-sm text-slate-300/90">
          Here&apos;s a live overview of bookings, engagement, and growth across Wind &amp; Sunset Camp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total Bookings"
          value={(analytics?.totals?.totalBookings ?? 0).toLocaleString()}
          icon={CalendarCheck}
          description="Total number of bookings"
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={(analytics?.totals?.totalUsers ?? 0).toLocaleString()}
          icon={Users}
          description="Total registered users"
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Total Camps"
          value={(analytics?.totals?.totalCamps ?? 0).toLocaleString()}
          icon={Activity}
          description="Total listed camps"
          isLoading={isLoading}
          color="purple"
        />
        <StatCard
          title="Pending Bookings"
          value={(analytics?.totals?.pendingBookings ?? 0).toLocaleString()}
          icon={Clock3}
          description="Awaiting admin confirmation"
          isLoading={isLoading}
          color="orange"
        />
        <StatCard
          title="Total Reviews"
          value={(analytics?.totals?.totalReviews ?? 0).toLocaleString()}
          icon={Star}
          description="Camp feedback submitted"
          isLoading={isLoading}
          color="purple"
        />
        <StatCard
          title="Total Messages"
          value={(analytics?.totals?.totalMessages ?? 0).toLocaleString()}
          icon={MessageSquare}
          description="Contact form inquiries"
          isLoading={isLoading}
          color="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="glass-card xl:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking requests with quick visibility into status and people count.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="border-primary/30 bg-primary/5 hover:bg-primary/10">
              <Link href="/admin/bookings">Open all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Camp</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No recent bookings available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => {
                      const statusUi = getStatusUi(booking.status);

                      return (
                        <TableRow key={booking._id} className="border-white/10 transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-orange-500/5 hover:shadow-[inset_0_0_0_1px_rgba(34,197,94,0.15)]">
                          <TableCell>
                            <div className="font-medium text-foreground">{booking.fullName}</div>
                            <p className="text-xs text-muted-foreground">{booking.email}</p>
                          </TableCell>
                          <TableCell className="font-medium">{booking.campName}</TableCell>
                          <TableCell>{booking.numberOfPeople}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusUi.className}`}>
                              {statusUi.label}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(booking.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-primary hover:text-primary">
                              <Link href="/admin/bookings">
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card xl:col-span-5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Most-used admin workflows for faster operations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`group relative overflow-hidden rounded-xl border border-emerald-400/20 bg-gradient-to-br from-slate-950/70 via-slate-900/70 to-emerald-950/35 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/45 hover:shadow-[0_16px_36px_-20px_rgba(34,197,94,0.85)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(34,197,94,0.12),transparent_45%,rgba(249,115,22,0.14))] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${action.glow}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-100">{action.label}</h4>
                      <p className="mt-1 text-xs text-slate-300/80">{action.description}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-400/25 bg-gradient-to-br from-emerald-500/20 to-orange-500/20 p-2 text-emerald-200 transition-transform duration-300 group-hover:scale-110 group-hover:text-orange-200">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-12">
        <Card className="glass-card xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              Bookings per month
            </CardTitle>
            <CardDescription>Track monthly booking demand trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              {isLoading ? <Skeleton className="h-full w-full" /> : <Bar data={bookingsChartData} options={commonChartOptions} />}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-muted-foreground" />
              Today&apos;s Action Hub
            </CardTitle>
            <CardDescription>Actionable daily metrics, latest bookings, and pending tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-emerald-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Today Bookings
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-100">{todayStats.bookingsCount}</p>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-cyan-300">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Today Revenue
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-100">{formatCurrency(todayStats.revenue)}</p>
              </div>
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-violet-300">
                  <Tent className="h-3.5 w-3.5" />
                  Active Camps
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-100">{todayStats.activeCamps}</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-amber-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  Pending Bookings
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-100">{todayStats.pendingBookings}</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/15 bg-slate-950/35 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-100">Recent Bookings Snapshot</h4>
                <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary hover:text-primary">
                  <Link href="/admin/bookings">View all</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {(recentBookings.slice(0, 4)).map((booking) => {
                  const statusUi = getStatusUi(booking.status);

                  return (
                    <div key={`snapshot-${booking._id}`} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{booking.fullName}</p>
                        <p className="text-xs text-muted-foreground">{booking.campName} • {formatDate(booking.createdAt)}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusUi.className}`}>
                        {statusUi.label}
                      </span>
                    </div>
                  );
                })}
                {recentBookings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No bookings yet for quick review.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-primary/15 bg-slate-950/35 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-100">Pending Actions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-amber-200">
                    <Clock3 className="h-4 w-4" />
                    Pending approvals
                  </div>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-100">
                    {pendingActionCounts.pendingApprovals}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-violet-200">
                    <Star className="h-4 w-4" />
                    New reviews
                  </div>
                  <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-xs font-bold text-violet-100">
                    {pendingActionCounts.newReviews}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-rose-200">
                    <BadgeAlert className="h-4 w-4" />
                    Refund requests
                  </div>
                  <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-xs font-bold text-rose-100">
                    {pendingActionCounts.refundRequests}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2 xl:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Most popular camps
            </CardTitle>
            <CardDescription>Top camps by booking volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Doughnut
                  data={campPopularityChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: chartColors.muted,
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2 xl:col-span-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest 5 customer inquiries from the contact form.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="border-primary/30 bg-primary/5 hover:bg-primary/10">
              <Link href="/admin/messages">Open inbox</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent messages found.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <div
                    key={message._id}
                    className="rounded-xl border border-primary/15 bg-slate-950/30 p-3 transition-all duration-300 hover:border-primary/35 hover:shadow-[0_0_24px_rgba(34,197,94,0.15)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">{message.name}</p>
                        <p className="text-xs text-slate-300/80">{message.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(message.timestamp || message.createdAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-300/85">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Memories</CardTitle>
            <CardDescription>Photos approved from customers shown in the homepage memories section.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="border-primary/30 bg-primary/5 hover:bg-primary/10">
            <Link href="/admin/memories">Manage Memories</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {memoryError ? <p className="text-sm text-destructive">{memoryError}</p> : null}

          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customer memories yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memories.map((memory) => (
                <div key={memory._id} className="overflow-hidden rounded-xl border border-primary/20 bg-slate-950/35">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={memory.imageUrl}
                      alt={memory.caption || 'Customer memory'}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-3">
                    <p className="line-clamp-2 text-xs text-slate-300">{memory.caption || 'No caption'}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMemoryDelete(memory._id)}
                      className="h-8 w-8 shrink-0 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

    </div>
  );
}
