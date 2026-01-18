
'use client';

import { db, auth } from '@/lib/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemo, useState, useTransition } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { format } from 'date-fns';
import { MoreHorizontal, FileDown, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

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
import type { Booking } from './types';
import { useSearch } from '@/context/SearchProvider';

const statusConfig: Record<Booking['status'], { label: string; icon: React.FC<any>, className: string }> = {
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
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { searchQuery } = useSearch();
  
  // Ensure the query points to the top-level 'bookings' collection
  const bookingsRef = useMemo(() => collection(db, 'bookings'), []);
  const [bookings, isLoading] = useCollectionData<Booking>(bookingsRef, { idField: 'id' });

  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      const timeA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
      const timeB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
      
      if (isNaN(timeB)) return -1; // Put invalid dates at the end
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

  function ActionMenu({ booking }: { booking: Booking }) {
    const [isApprovePending, startApproveTransition] = useTransition();
    const [isCancelPending, startCancelTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [dialogType, setDialogType] = useState<'cancel' | 'delete' | null>(null);
    
    const onApprove = () => {
      if (!user) return;
      startApproveTransition(async () => {
        const bookingRef = doc(db, 'bookings', booking.id);
        await handleAction(
          () => updateDoc(bookingRef, { status: 'Approved' }),
          "Booking Approved",
          `Booking for ${booking.campName} has been approved.`,
          "Approval Failed"
        );
      });
    };
    
    const onCancel = () => {
        if (!user) return;
        startCancelTransition(async () => {
          const bookingRef = doc(db, 'bookings', booking.id);
            await handleAction(
                () => updateDoc(bookingRef, { status: 'Canceled' }),
                "Booking Canceled",
                `Booking for ${booking.campName} has been canceled.`,
                "Cancellation Failed"
            );
        });
    };

    const onDelete = () => {
        if(!user) return;
        startDeleteTransition(async () => {
            if (!booking?.id) {
                toast({
                    title: "Deletion Failed",
                    description: "Booking ID is missing. Cannot proceed.",
                    variant: "destructive",
                });
                return;
            }
            const bookingRef = doc(db, 'bookings', booking.id);
            await handleAction(
                () => deleteDoc(bookingRef),
                "Booking Deleted",
                `Booking for ${booking.campName} has been permanently deleted.`,
                "Deletion Failed"
            );
        });
    }

    return (
       <AlertDialog onOpenChange={(open) => !open && setDialogType(null)}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isApprovePending || isCancelPending || isDeletePending}>
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
                
                 <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={() => setDialogType('cancel')}
                    disabled={isCancelPending || booking.status === 'Canceled'}
                  >
                   Cancel Booking
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <DropdownMenuSeparator />

                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                        className="text-destructive" 
                        onSelect={() => setDialogType('delete')}
                        disabled={isDeletePending}
                    >
                        <Trash2 className="mr-2 h-4 w-4"/> Delete Booking
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
         <AlertDialogContent>
            {dialogType === 'cancel' && (
                <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the booking as Canceled for 
                            <span className="font-semibold"> {booking.fullName} </span>
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
                </>
            )}
             {dialogType === 'delete' && (
                <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this booking permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the booking for
                            <span className="font-semibold"> {booking.fullName} </span>
                            at <span className="font-semibold">{booking.campName}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={onDelete}
                        disabled={isDeletePending}
                        >
                        {isDeletePending ? "Deleting..." : "Yes, delete booking"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </>
            )}
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no bookings to export.",
      });
      return;
    }

    const headers = ["Customer Name", "Email", "Camp Name", "Booked On", "Guests", "Status"];
    const csvRows = [
      headers.join(','),
      ...filteredBookings.map(booking => {
        const row = [
          `"${booking.fullName.replace(/"/g, '""')}"`,
          booking.email,
          `"${booking.campName.replace(/"/g, '""')}"`,
          booking.bookingDate ? format(new Date(booking.bookingDate), 'yyyy-MM-dd HH:mm:ss') : '',
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
    if (filteredBookings.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No bookings found.
                </TableCell>
            </TableRow>
        );
    }
    return filteredBookings.map((booking) => {
        const currentStatusConfig = statusConfig[booking.status] || statusConfig.Pending;
        const Icon = currentStatusConfig.icon;

        return (
        <TableRow key={booking.id}>
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
