'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import {
  approveMemory,
  deleteMemoryAdmin,
  getAdminMemories,
  rejectMemory,
  type MemoryItem,
} from '@/lib/memoriesApi';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700',
};

export default function AdminMemoriesPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminMemories();
      setMemories(data);
    } catch (error: any) {
      toast({
        title: 'Failed to load memories',
        description: error?.message || 'Unable to fetch customer memories.',
        variant: 'destructive',
      });
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const sortedMemories = useMemo(
    () => [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [memories]
  );

  const runAction = async (action: () => Promise<any>, successMessage: string) => {
    startTransition(async () => {
      try {
        await action();
        toast({
          title: 'Updated',
          description: successMessage,
        });
        await fetchMemories();
      } catch (error: any) {
        toast({
          title: 'Action failed',
          description: error?.message || 'Unable to complete this action.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Customer Memories</h1>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Manage Customer Memories</CardTitle>
          <CardDescription>Approve, reject, or delete user-submitted memories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading memories...</TableCell>
                </TableRow>
              ) : sortedMemories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No customer memories found.</TableCell>
                </TableRow>
              ) : (
                sortedMemories.map((memory) => (
                  <TableRow key={memory.id}>
                    <TableCell>
                      <div className="relative h-14 w-20 overflow-hidden rounded-md border">
                        <Image
                          src={memory.imageUrl}
                          alt={memory.caption || 'Memory image'}
                          fill
                          className="object-cover"
                          sizes="80px"
                          loading="lazy"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm">{memory.caption || 'No caption'}</p>
                    </TableCell>
                    <TableCell>{memory.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[memory.status]}>
                        {memory.status.charAt(0).toUpperCase() + memory.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(memory.createdAt), 'PP')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || memory.status === 'approved'}
                          onClick={() => runAction(() => approveMemory(memory.id), 'Memory approved successfully.')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending || memory.status === 'rejected'}
                          onClick={() => runAction(() => rejectMemory(memory.id), 'Memory rejected successfully.')}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => runAction(() => deleteMemoryAdmin(memory.id), 'Memory deleted successfully.')}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
