'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LoaderCircle, Trash2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { deleteMyMemory, getMyMemories, type MemoryItem } from '@/lib/memoriesApi';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserMemoryUploadModal } from '@/components/memories/UserMemoryUploadModal';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-700',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-700',
};

export default function DashboardMemoriesPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const data = await getMyMemories();
      setMemories(data);
    } catch (error: any) {
      toast({
        title: 'Failed to load memories',
        description: error?.message || 'Unable to fetch your memories.',
        variant: 'destructive',
      });
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
      return;
    }

    if (user) {
      fetchMemories();
    }
  }, [user, isAuthLoading, router]);

  const sortedMemories = useMemo(
    () => [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [memories]
  );

  const handleDelete = async (memoryId: string) => {
    try {
      setIsDeleting(memoryId);
      await deleteMyMemory(memoryId);
      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      toast({
        title: 'Memory deleted',
        description: 'Your memory has been removed successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error?.message || 'Unable to delete this memory.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-headline text-heading-color">My Memories</CardTitle>
              <CardDescription>View and manage all your uploaded camping memories.</CardDescription>
            </div>
            <UserMemoryUploadModal onSuccess={fetchMemories} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading your memories...</div>
          ) : sortedMemories.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">You haven’t uploaded any memories yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedMemories.map((memory) => (
                <Card key={memory.id} className="overflow-hidden border-border/60">
                  <div className="relative h-56">
                    <Image
                      src={memory.imageUrl}
                      alt={memory.caption || 'Memory image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={statusStyles[memory.status]}>
                        {memory.status.charAt(0).toUpperCase() + memory.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(memory.createdAt), 'PP')}</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3">{memory.caption || 'No caption'}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDelete(memory.id)}
                      disabled={isDeleting === memory.id}
                    >
                      {isDeleting === memory.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      {isDeleting === memory.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
