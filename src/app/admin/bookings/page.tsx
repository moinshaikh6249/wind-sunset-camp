
'use client';

import { useDatabase, useMemoFirebase, useUser } from '@/firebase';
import { useDatabaseValue } from '@/firebase/database/use-database-value';
import { ref } from 'firebase/database';
import { useMemo, useTransition } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, CalendarSearch, FileDown } from 'lucide-react';
import { cancelBooking } from './actions';
import { useToast } from '@/hooks/use-toast';
import { adminFetch } from '@/lib/admin-fetch';

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

type DbUser = {
  firstName: string;
  lastName?: string;
  email: string;
  bookings?: { [bookingId: string]: DbBooking };
};

type DbUsers = {
  [uid: string]: DbUser;
};

type DbBooking = {
  bookingDate: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  userId: string;
};

type AggregatedBooking = DbBooking & {
  bookingId: string;
  customerName: string;
  customerEmail: string;
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
             <TableCell>
                <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[80px]" />
            </TableCell>
             <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-5 w-[70px] rounded-full" />
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
  const [isPending, startTransition] = useTransition();
  
  const usersRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'users');
  }, [database]);

  const { data: usersData, isLoading } = useDatabaseValue<DbUsers>(usersRef);

  const bookings: AggregatedBooking[] = useMemo(() => {
    if (!usersData) return [];
    
    const allBookings: AggregatedBooking[] = [];
    
    Object.values(usersData).forEach(user => {
      if (user.bookings) {
        Object.entries(user.bookings).forEach(([bookingId, bookingData]) => {
          allBookings.push({
            ...bookingData,
            bookingId,
            customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            customerEmail: user.email,
          });
        });
      }
    });

    allBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    
    return allBookings;
  }, [usersData]);

  const handleCancelBooking = (userId: string, bookingId: string, campName: string) => {
    if (!user) return;
    startTransition(async () => {
      const result = await adminFetch(() => cancelBooking(userId, bookingId));
      if (result.success) {
        toast({
          title: "Booking Canceled",
          description: `Booking for ${campName} has been canceled.`,
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
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
    return bookings.map((booking) => (
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
                <Badge variant="outline">Confirmed</Badge>
            </TableCell>
            <TableCell>
              <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Approve</DropdownMenuItem>
                    <DropdownMenuItem>Modify</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel the booking for 
                            <span className="font-semibold"> {booking.customerName} </span>
                             at <span className="font-semibold">{booking.campName}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                         className="bg-destructive hover:bg-destructive/90"
                         onClick={() => handleCancelBooking(booking.userId, booking.bookingId, booking.campName)}
                         disabled={isPending}
                        >
                        {isPending ? "Canceling..." : "Yes, cancel booking"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
        </TableRow>
    ));
  }


  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Bookings</h1>
          <Button size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarSearch className="h-5 w-5" />
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
