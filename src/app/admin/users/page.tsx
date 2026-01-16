
'use client';

import { database, auth } from '@/lib/firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref } from 'firebase/database';
import { useMemo, useTransition, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, UserPlus, X, Calendar, Activity, Info, Tent, Mail } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useSearch } from '@/context/SearchProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddUserForm } from './AddUserForm';
import { deleteUser } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';

type Booking = {
  id: string;
  campName: string;
  bookingDate: string;
  status: 'Pending' | 'Approved' | 'Canceled';
};

type HistoryItem = {
    type: string;
    description: string;
    timestamp: string;
};

type DbUser = {
  uid: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  photoURL?: string;
  history?: { [key: string]: HistoryItem };
  bookings?: { [key: string]: Booking };
};

type DbUsers = {
  [uid: string]: Omit<DbUser, 'uid'>;
};

function UserTableRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[200px]" />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Skeleton className="h-5 w-[70px] rounded-full" />
            </TableCell>
             <TableCell>
                <Skeleton className="h-5 w-[70px] rounded-full" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>
        </TableRow>
    )
}

function UserProfileDialog({ user, isOpen, onOpenChange }: { user: (DbUser & { name: string; joined: string }) | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  if (!user) return null;

  const bookings = user.bookings ? Object.entries(user.bookings).map(([id, booking]) => ({ id, ...booking })) : [];
  const history = user.history ? Object.values(user.history).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
             <Avatar className="h-12 w-12">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              {user.name}
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="space-y-6 pr-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5 text-accent"/> User Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p><strong>Joined:</strong> {user.joined !== 'N/A' ? format(new Date(user.joined), "PPP") : 'N/A'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Tent className="h-5 w-5 text-accent"/> Bookings ({bookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length > 0 ? (
                        <ul className="space-y-3">
                            {bookings.map(booking => (
                                <li key={booking.id} className="border-b pb-2">
                                    <p className="font-semibold">{booking.campName}</p>
                                    <div className="text-sm text-muted-foreground">{format(new Date(booking.bookingDate), "PP")} - <Badge variant="outline">{booking.status || "Pending"}</Badge></div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground text-sm">No bookings found.</p>}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-accent"/> Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <ul className="space-y-4">
                            {history.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {item.type === 'signup' && <UserPlus className="h-4 w-4 text-green-500" />}
                                        {item.type === 'booking' && <Calendar className="h-4 w-4 text-blue-500" />}
                                        {item.type === 'message' && <Mail className="h-4 w-4 text-orange-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground text-sm">No activity recorded.</p>}
                </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage() {
  const [adminUser] = useAuthState(auth);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { searchQuery } = useSearch();
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<(DbUser & { name: string; joined: string }) | null>(null);
  
  const usersRef = useMemo(() => ref(database, 'users'), []);
  const [usersData, isLoading] = useObjectVal<DbUsers>(usersRef);

  const users = useMemo(() => {
    if (!usersData) return [];
    return Object.entries(usersData).map(([uid, userData]) => {
        const signupActivity = userData.history 
            ? Object.values(userData.history).find(h => h.type === 'signup')
            : null;
        
        return {
            ...userData,
            uid,
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            joined: signupActivity ? signupActivity.timestamp : 'N/A'
        } as DbUser & { name: string; joined: string };
    });
  }, [usersData]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);


  const handleDeleteUser = (uid: string, name: string) => {
    if (!adminUser) return;
    startTransition(async () => {
      try {
        const idToken = await adminUser.getIdToken();
        await deleteUser(idToken, uid);
        toast({
          title: "User Deleted",
          description: `${name} has been permanently deleted.`,
        });
      } catch (error: any) {
        toast({
          title: "Deletion Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const handleRowClick = (user: DbUser & { name: string; joined: string; }) => {
    setProfileUser(user);
  }

  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(5)].map((_, i) => <UserTableRowSkeleton key={i} />);
    }
    if (filteredUsers.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                </TableCell>
            </TableRow>
        );
    }
    return filteredUsers.map((user) => (
        <TableRow key={user.uid} onClick={() => handleRowClick(user)} className="cursor-pointer">
            <TableCell className="font-medium">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.name} />
                    <AvatarFallback>{(user.firstName || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline">Active</Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary">Member</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                 {user.joined !== 'N/A' ? format(new Date(user.joined), 'PP') : 'N/A'}
            </TableCell>
            <TableCell>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleRowClick(user)}>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Suspend</DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent onClick={e => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <span className="font-semibold"> {user.name} </span>
                             and all of their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                         className="bg-destructive hover:bg-destructive/90"
                         onClick={() => handleDeleteUser(user.uid, user.name)}
                         disabled={isPending}
                        >
                        {isPending ? "Deleting..." : "Yes, delete user"}
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
         <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
          <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account and add them to the database.
                    </DialogDescription>
                </DialogHeader>
                <AddUserForm onUserAdded={() => setAddUserDialogOpen(false)} />
            </DialogContent>
         </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage all registered users in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
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

      <UserProfileDialog 
        user={profileUser}
        isOpen={!!profileUser}
        onOpenChange={(open) => !open && setProfileUser(null)}
      />
    </>
  );
}
