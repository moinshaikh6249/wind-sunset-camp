'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, UserPlus, X, Calendar, Activity, Info, Tent, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useSearch } from '@/context/SearchProvider';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddUserForm } from './AddUserForm';

type User = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  photoURL?: string;
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
  );
}

function UserProfileDialog({ user, isOpen, onOpenChange }: { user: User | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photoURL ?? undefined} alt={`${user.firstName} ${user.lastName ?? ''}`} />
              <AvatarFallback>{(user.firstName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              {`${user.firstName} ${user.lastName ?? ''}`.trim()}
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" /> User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Phone:</strong> {user.phone || 'Not provided'}
              </p>
              <p>
                <strong>Joined:</strong>{' '}
                {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
              </p>
              <p>
                <strong>Role:</strong> {user.role ?? 'user'}
              </p>
              <p>
                <strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { searchQuery } = useSearch();
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ success: boolean; users: any[] }>('/admin/users?limit=1000');
      const mapped = (data.users || []).map((user) => ({
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        photoURL: user.photoURL,
      }));
      setUsers(mapped);
    } catch (error: any) {
      toast({
        title: 'Failed to load users',
        description: error?.message || 'Unable to fetch user list.',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter((user) =>
      `${user.firstName} ${user.lastName ?? ''}`.toLowerCase().includes(lowercasedQuery) ||
      user.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);

  const handleDeleteUser = (user: User) => {
    startTransition(async () => {
      try {
        await api.delete(`/admin/users/${user.id}`);
        toast({
          title: 'User Deleted',
          description: `${user.firstName} ${user.lastName ?? ''} has been permanently deleted.`,
        });
        await fetchUsers();
      } catch (error: any) {
        toast({
          title: 'Deletion Failed',
          description: error?.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRowClick = (user: User) => {
    setProfileUser(user);
  };

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
      <TableRow key={user.id} onClick={() => handleRowClick(user)} className="cursor-pointer">
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? undefined} alt={`${user.firstName} ${user.lastName ?? ''}`} />
              <AvatarFallback>{(user.firstName || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5">
              <span className="font-semibold">{`${user.firstName} ${user.lastName ?? ''}`.trim()}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{user.isActive ? 'Active' : 'Inactive'}</Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Badge variant="secondary">{user.role ?? 'user'}</Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}
        </TableCell>
        <TableCell>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user{' '}
                  <span className="font-semibold">{`${user.firstName} ${user.lastName ?? ''}`.trim()}</span> 
                  and all of their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => handleDeleteUser(user)}
                  disabled={isPending}
                >
                  {isPending ? 'Deleting...' : 'Yes, delete user'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all registered users in your application.</CardDescription>
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
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserProfileDialog
        user={profileUser}
        isOpen={!!profileUser}
        onOpenChange={(open) => !open && setProfileUser(null)}
      />
    </div>
  );
}
