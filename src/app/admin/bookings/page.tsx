'use client';

import api, { API_BASE_URL } from '@/lib/api';
import { useMemo, useState, useTransition, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { FileDown, CheckCircle, XCircle, Clock, Ticket, MessageSquare } from 'lucide-react';
import { CampsiteBookingPassModal } from '@/components/booking/CampsiteBookingPassModal';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useToast } from '@/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Booking } from './types';
import { useSearch } from '@/context/SearchProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger as TooltipTriggerComp } from '@/components/ui/tooltip';

const statusConfig: Record<Booking['status'], { label: string; icon: React.FC<any>, className: string }> = {
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

function BookingTableRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[200px]" />
                </div>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-[120px]" />
            </TableCell>
             <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-[90px]" />
            </TableCell>
             <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-6 w-[90px] rounded-full" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-6 w-[110px] rounded-full" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
        </TableRow>
    )
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPassBooking, setSelectedPassBooking] = useState<any>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const endpoint = '/admin/bookings';
      console.log('[AdminBookings] Fetch start', {
        baseURL: API_BASE_URL,
        endpoint,
      });

      const response = await api.get(endpoint);
      console.log('[AdminBookings] Fetch response', response);

      const rawBookings = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.bookings)
          ? (response as any).bookings
          : Array.isArray((response as any)?.data?.bookings)
            ? (response as any).data.bookings
            : [];

      console.log('[AdminBookings] Parsed bookings count', rawBookings.length);

      const normalizedBookings: Booking[] = rawBookings.map((booking: any) => ({
        ...booking,
        id: booking.id || booking._id,
        bookingDate: booking.bookingDate || booking.createdAt,
        status: typeof booking.status === 'string' ? booking.status.toLowerCase() : 'pending',
      }));
      setBookings(normalizedBookings);
    } catch (error: any) {
      console.error('[AdminBookings] Fetch failed', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      const timeA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
      const timeB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
      
      if (isNaN(timeB)) return -1;
      if (isNaN(timeA)) return 1;

      return timeB - timeA;
    });
  }, [bookings]);


  const filteredBookings = useMemo(() => {
    if (!searchQuery) return sortedBookings;
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedBookings.filter(booking => 
        booking.fullName.toLowerCase().includes(lowercasedQuery) ||
        booking.email.toLowerCase().includes(lowercasedQuery) ||
        booking.campName.toLowerCase().includes(lowercasedQuery)
    );
  }, [sortedBookings, searchQuery]);

  const handleAction = async (action: () => Promise<any>, successTitle: string, successDescription: string, errorTitle: string) => {
    try {
      await action();
      toast({
        title: successTitle,
        description: successDescription,
      });
    } catch (error: any) {
      toast({
        title: errorTitle,
        description: error.message || "An unexpected error occurred. You may not have the required permissions.",
        variant: "destructive",
      });
    }
  };

  function ActionButtons({ booking, onViewPass }: { booking: Booking; onViewPass: () => void }) {
    const [isApprovePending, startApproveTransition] = useTransition();
    const [isRejectPending, startRejectTransition] = useTransition();
    const [isMarkPaidPending, startMarkPaidTransition] = useTransition();
    
    const onApprove = () => {
      if (!user) return;
      startApproveTransition(async () => {
        if (!booking?.id) {
          toast({
            title: "Approval Failed",
            description: "Booking ID is missing. Cannot proceed.",
            variant: "destructive",
          });
          return;
        }

        await handleAction(
          () => api.patch(`/admin/bookings/${booking.id}/approve`),
          "Booking Approved!",
          `${booking.fullName}'s booking for ${booking.campName} is now approved.`,
          "Approval Failed"
        );
        await fetchBookings();
      });
    };
    
    const onReject = () => {
        if (!user) return;
        startRejectTransition(async () => {
          if (!booking?.id) {
            toast({
              title: "Rejection Failed",
              description: "Booking ID is missing. Cannot proceed.",
              variant: "destructive",
            });
            return;
          }

          await handleAction(
              () => api.patch(`/admin/bookings/${booking.id}/reject`),
              "Booking Rejected",
              `${booking.fullName}'s booking for ${booking.campName} has been rejected.`,
              "Rejection Failed"
          );
          await fetchBookings();
        });
    };

    const onMarkPaid = () => {
      if (!user) return;
      if (!confirm(`Confirm cash payment of ₹${booking.totalPrice || 0} received for ${booking.fullName}?`)) return;

      startMarkPaidTransition(async () => {
        if (!booking?.id) {
          toast({
            title: "Update Failed",
            description: "Booking ID is missing. Cannot proceed.",
            variant: "destructive",
          });
          return;
        }

        await handleAction(
          () => api.patch(`/admin/bookings/${booking.id}/mark-paid`),
          "Payment Marked as Paid!",
          `Payment for ${booking.fullName}'s booking has been verified and marked as Paid.`,
          "Payment Update Failed"
        );
        await fetchBookings();
      });
    };

    return (
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium"
          onClick={onViewPass}
        >
          <Ticket className="h-3.5 w-3.5 mr-1 text-amber-500" />
          Pass
        </Button>
        {booking.phone && (
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium"
            asChild
          >
            <a
              href={buildWhatsappUrl(
                [
                  `Hello ${booking.fullName} 👋`,
                  '',
                  `This is Wind & Sunset Camp regarding your booking reference WSC-${(booking.id || booking._id || '000000').slice(-6).toUpperCase()}.`,
                  `Camp: ${booking.campName}`,
                  `Status: ${booking.status}`,
                  `Payment: ${booking.paymentStatus === 'paid' ? 'Paid / Cash Received' : 'Pay at Campsite'}`,
                  '',
                  'How can we assist you with your upcoming stay?',
                ].join('\n'),
                booking.phone
              )}
              target="_blank"
              rel="noopener noreferrer"
              title="Contact guest via WhatsApp"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Contact
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onApprove}
          disabled={booking.status !== 'pending' || isApprovePending || isRejectPending || isMarkPaidPending}
        >
          {isApprovePending ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={booking.status !== 'pending' || isRejectPending || isApprovePending || isMarkPaidPending}
        >
          {isRejectPending ? 'Rejecting...' : 'Reject'}
        </Button>
        {booking.paymentStatus !== 'paid' && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm dark:bg-emerald-700 dark:hover:bg-emerald-600"
            onClick={onMarkPaid}
            disabled={isMarkPaidPending || isApprovePending || isRejectPending}
          >
            {isMarkPaidPending ? 'Updating...' : 'Mark Paid'}
          </Button>
        )}
      </div>
    );
  }

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no bookings to export.",
      });
      return;
    }

    const headers = ["Customer Name", "Email", "Camp Name", "Booked On", "Guests", "Total Price", "Status", "Payment Method", "Payment Status", "Paid At"];
    const csvRows = [
      headers.join(','),
      ...filteredBookings.map(booking => {
        const row = [
          `"${booking.fullName.replace(/"/g, '""')}"`,
          booking.email,
          `"${booking.campName.replace(/"/g, '""')}"`,
          booking.bookingDate ? format(new Date(booking.bookingDate), 'yyyy-MM-dd HH:mm:ss') : '',
          booking.numberOfPeople,
          booking.totalPrice ?? 0,
          booking.status,
          'Cash',
          booking.paymentStatus === 'paid' ? 'Paid' : 'Pending',
          booking.paidAt ? format(new Date(booking.paidAt), 'yyyy-MM-dd HH:mm:ss') : ''
        ];
        return row.join(',');
      })
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const filename = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Export Successful",
      description: "Your bookings data has been downloaded.",
    });
  };


  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(5)].map((_, i) => <BookingTableRowSkeleton key={i} />);
    }
    if (bookings.length === 0) {
        return (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                    Waiting for activity… Your analytics will grow as users start booking.
                </TableCell>
            </TableRow>
        );
    }
    if (filteredBookings.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center">
            No bookings match your current search.
          </TableCell>
        </TableRow>
      );
    }
    return filteredBookings.map((booking) => {
        const currentStatusConfig = statusConfig[booking.status] || statusConfig.pending;
        const Icon = currentStatusConfig.icon;
        const isPaid = booking.paymentStatus === 'paid';

        return (
        <TableRow key={booking.id} className="even:bg-muted/40">
            <TableCell>
                <div className="font-medium">{booking.fullName}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                    {booking.email}
                </div>
            </TableCell>
             <TableCell>
                {booking.campName}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {booking.bookingDate ? format(new Date(booking.bookingDate), 'PPpp') : 'N/A'}
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
                {booking.numberOfPeople}
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
              ₹{booking.totalPrice ?? 0}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge key={booking.status} variant="outline" className={cn("gap-1.5 py-1 px-3 text-sm", currentStatusConfig.className)}>
                    <Icon className="h-3.5 w-3.5" />
                    {currentStatusConfig.label}
                </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {isPaid ? (
                <div className="flex flex-col gap-0.5">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700 py-1 px-3 text-sm flex items-center gap-1.5 w-fit">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    Paid
                  </Badge>
                  {booking.paidAt ? (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {format(new Date(booking.paidAt), 'PP')}
                    </span>
                  ) : null}
                </div>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700 py-1 px-3 text-sm">
                  Cash / Pending
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <ActionButtons
                booking={booking}
                onViewPass={() => {
                  setSelectedPassBooking({
                    ...booking,
                    phone: booking.phone || '9876543210',
                  });
                  setIsPassModalOpen(true);
                }}
              />
            </TableCell>
        </TableRow>
    )});
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-xl font-extrabold tracking-tight md:text-2xl font-headline text-foreground">Bookings</h1>
           <p className="text-xs text-muted-foreground">Review, approve, and track all guest campsite reservations.</p>
         </div>
         <TooltipProvider>
          <Tooltip>
            <TooltipTriggerComp asChild>
              <Button size="sm" onClick={handleExport} className="rounded-full bg-gradient-to-r from-amber-500 to-emerald-700 text-white shadow-md hover:scale-105 transition-all text-xs font-semibold">
                  <FileDown className="h-4 w-4 mr-1.5" />
                  Export CSV
              </Button>
            </TooltipTriggerComp>
            <TooltipContent>
              <p>Export bookings data to CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="glass-card border border-border/40 bg-card/65 dark:bg-card/45 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold">
            All Bookings
          </CardTitle>
          <CardDescription className="text-xs">
            Filterable list of campsite bookings and live guest statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Camp</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground">Booked On</TableHead>
                  <TableHead className="text-center hidden md:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground">Guests</TableHead>
                  <TableHead className="text-center hidden md:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Price</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CampsiteBookingPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        booking={selectedPassBooking}
      />
    </div>
  );
}
