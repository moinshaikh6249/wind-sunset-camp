'use client';

import { useDatabase, useMemoFirebase } from '@/firebase';
import { useDatabaseValue } from '@/firebase/database/use-database-value';
import { ref } from 'firebase/database';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, UserPlus } from 'lucide-react';

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

type DbUser = {
  uid: string;
  firstName: string;
  lastName?: string;
  email: string;
  photoURL?: string;
  history?: { [key: string]: { type: string; description: string; timestamp: string } };
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

export default function UsersPage() {
  const database = useDatabase();
  
  const usersRef = useMemoFirebase(() => {
    if (!database) return null;
    return ref(database, 'users');
  }, [database]);

  const { data: usersData, isLoading } = useDatabaseValue<DbUsers>(usersRef);

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

  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(5)].map((_, i) => <UserTableRowSkeleton key={i} />);
    }
    if (users.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                </TableCell>
            </TableRow>
        );
    }
    return users.map((user) => (
        <TableRow key={user.uid}>
            <TableCell className="font-medium">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL} alt={user.name} />
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Suspend</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
    ));
  }


  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Users</h1>
          <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
          </Button>
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
    </>
  );
}
