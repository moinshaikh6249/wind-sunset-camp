
'use client';

import { useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { useDatabaseValue } from '@/firebase/database/use-database-value';
import { ref, update, push } from 'firebase/database';
import { useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, FileDown, CheckCircle, XCircle, Clock } from 'lucide-react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import type { BookingStatus, AggregatedBooking, DbUsers } from './types';

const statusConfig: Record<BookingStatus, { label: string; icon: React.FC<any>, className: string }> = {
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
             <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-5 w-[80px] rounded-full" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
        </TableRow>
    )
}

export default function BookingsPage() {
  const database = useDatabase();
  const { user } = useUser();
  const { toast } = useToast();
  
  const usersRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'users');
  }, [database]);

  const { data: usersData, isLoading } = useDatabaseValue<DbUsers>(usersRef);

  const bookings = useMemo(() => {
    if (!usersData) return [];
    
    const allBookings: AggregatedBooking[] = [];
    
    Object.entries(usersData).forEach(([uid, userEntry]) => {
      if (userEntry.bookings) {
        Object.entries(userEntry.bookings).forEach(([bookingId, bookingData]) => {
          allBookings.push({
            ...bookingData,
            userId: uid,
            status: bookingData.status ?? 'Pending', 
            bookingId,
            customerName: `${userEntry.firstName || ''} ${userEntry.lastName || ''}`.trim(),
            customerEmail: userEntry.email,
          });
        });
      }
    });

    allBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
    return allBookings;
  }, [usersData]);

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

  function ActionMenu({ booking }: { booking: AggregatedBooking }) {
    const [isApprovePending, startApproveTransition] = useTransition();
    const [isCancelPending, startCancelTransition] = useTransition();
    
    const onApprove = () => {
      if (!user || !database) return;
      startApproveTransition(async () => {
        const bookingStatusRef = ref(database, `users/${booking.userId}/bookings/${booking.bookingId}/status`);
        await handleAction(
          () => update(bookingStatusRef.parent!, { status: 'Approved' }),
          "Booking Approved",
          `Booking for ${booking.campName} has been approved.`,
          "Approval Failed"
        );
      });
    };
    
    const onCancel = () => {
        if (!user || !database) return;
        startCancelTransition(async () => {
            const bookingPath = `users/${booking.userId}/bookings/${booking.bookingId}/status`;
            const historyPath = `users/${booking.userId}/history`;
            const newHistoryKey = push(ref(database, historyPath)).key;

            if (!newHistoryKey) {
                toast({ title: "Failed to generate history key", variant: "destructive" });
                return;
            }

            const updates: {[key: string]: any} = {};
            updates[bookingPath] = 'Canceled';
            updates[`${historyPath}/${newHistoryKey}`] = {
                type: 'booking',
                description: `Booking for ${booking.campName} canceled by admin`,
                timestamp: new Date().toISOString(),
            };
            
            await handleAction(
                () => update(ref(database), updates),
                "Booking Canceled",
                `Booking for ${booking.campName} has been canceled.`,
                "Cancellation Failed"
            );
        });
    };

    return (
       <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isApprovePending || isCancelPending}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                    onSelect={onApprove}
                    disabled={booking.status === 'Approved' || isApprovePending}
                >
                    {isApprovePending ? "Approving..." : "Approve"}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onSelect={(e) => e.preventDefault()}
                    disabled={isCancelPending || booking.status === 'Canceled'}
                  >
                    Cancel
                  </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
         <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will mark the booking as Canceled for 
                    <span className="font-semibold"> {booking.customerName} </span>
                     at <span className="font-semibold">{booking.campName}</span>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                 className="bg-destructive hover:bg-destructive/90"
                 onClick={onCancel}
                 disabled={isCancelPending}
                >
                {isCancelPending ? "Canceling..." : "Yes, cancel booking"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const handleExport = () => {
    if (bookings.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no bookings to export.",
      });
      return;
    }

    const headers = ["Customer Name", "Email", "Camp Name", "Booked On", "Guests", "Status"];
    const csvRows = [
      headers.join(','),
      ...bookings.map(booking => {
        const row = [
          `"${booking.customerName.replace(/"/g, '""')}"`,
          booking.customerEmail,
          `"${booking.campName.replace(/"/g, '""')}"`,
          format(new Date(booking.bookingDate), 'yyyy-MM-dd HH:mm:ss'),
          booking.numberOfPeople,
          booking.status
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
                <TableCell colSpan={6} className="h-24 text-center">
                    No bookings found.
                </TableCell>
            </TableRow>
        );
    }
    return bookings.map((booking) => {
        const currentStatusConfig = statusConfig[booking.status] || statusConfig.Pending;
        const Icon = currentStatusConfig.icon;

        return (
        <TableRow key={booking.bookingId}>
            <TableCell>
                <div className="font-medium">{booking.customerName}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                    {booking.customerEmail}
                </div>
            </TableCell>
             <TableCell>
                {booking.campName}
            </TableCell>
            <TableCell className="hidden md:table-cell">
                {format(new Date(booking.bookingDate), 'PPpp')}
            </TableCell>
            <TableCell className="text-center hidden md:table-cell">
                {booking.numberOfPeople}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className={cn("gap-1.5", currentStatusConfig.className)}>
                    <Icon className="h-3.5 w-3.5" />
                    {currentStatusConfig.label}
                </Badge>
            </TableCell>
            <TableCell>
                <ActionMenu booking={booking} />
            </TableCell>
        </TableRow>
    )});
  }

  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Bookings</h1>
          <Button size="sm" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings
          </CardTitle>
          <CardDescription>
            View and manage all camp bookings from your users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Camp</TableHead>
                <TableHead className="hidden md:table-cell">Booked On</TableHead>
                <TableHead className="text-center hidden md:table-cell">Guests</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
