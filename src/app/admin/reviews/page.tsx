'use client';

import { useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useMemo, useTransition } from "react";
import { formatDistanceToNow } from 'date-fns';
import { Star, Trash2, Eye, EyeOff, Pin, PinOff } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
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
import { useSearch } from '@/context/SearchProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Review = {
    id: string;
    name: string;
    rating: number;
    comment: string;
    visible: boolean;
    pinned: boolean;
    createdAt: { seconds: number; nanoseconds: number; }
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

function ReviewTableRowSkeleton() {
    return (
        <TableRow>
            <TableCell className="w-[200px]">
                <div className="space-y-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </TableCell>
             <TableCell className="hidden md:table-cell text-center">
                <Skeleton className="h-4 w-20 mx-auto" />
            </TableCell>
            <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function ReviewsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { searchQuery } = useSearch();
  const [isPending, startTransition] = useTransition();
  
  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reviews'), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: reviewsData, isLoading } = useCollection<Review>(reviewsQuery);

  const filteredReviews = useMemo(() => {
    if (!reviewsData) return [];
    if (!searchQuery) return reviewsData;
    const lowercasedQuery = searchQuery.toLowerCase();
    return reviewsData.filter(review => 
        review.name.toLowerCase().includes(lowercasedQuery) ||
        review.comment.toLowerCase().includes(lowercasedQuery)
    );
  }, [reviewsData, searchQuery]);

  const handleAction = async (action: () => Promise<any>, successTitle: string, errorTitle: string) => {
    startTransition(async () => {
        try {
            await action();
            toast({ title: successTitle });
        } catch (error: any) {
            toast({
                title: errorTitle,
                description: error.message || "An unexpected error occurred. You may not have sufficient permissions.",
                variant: "destructive",
            });
        }
    });
  };
  
  const onToggleVisibility = (review: Review) => {
    if (!firestore) return;
    const reviewRef = doc(firestore, 'reviews', review.id);
    handleAction(
        () => updateDoc(reviewRef, { visible: !review.visible }),
        `Review ${!review.visible ? 'is now visible' : 'is now hidden'}.`,
        "Failed to update visibility"
    );
  }

  const onTogglePin = (review: Review) => {
     if (!firestore) return;
    const reviewRef = doc(firestore, 'reviews', review.id);
    handleAction(
        () => updateDoc(reviewRef, { pinned: !review.pinned }),
        `Review ${!review.pinned ? 'pinned' : 'unpinned'}.`,
        "Failed to update pin status"
    );
  }

  const onDelete = (review: Review) => {
    if (!firestore) return;
    const reviewRef = doc(firestore, 'reviews', review.id);
    handleAction(
        () => deleteDoc(reviewRef),
        `Review by ${review.name} deleted.`,
        "Failed to delete review"
    );
  }


  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(5)].map((_, i) => <ReviewTableRowSkeleton key={i} />);
    }
    if (filteredReviews.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No reviews found.
                </TableCell>
            </TableRow>
        );
    }
    return filteredReviews.map((review) => (
        <TableRow key={review.id} className={cn(!review.visible && "bg-muted/30")}>
            <TableCell>
                <div className="font-medium">{review.name}</div>
                <div className="text-xs text-muted-foreground">
                    {review.createdAt ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                </div>
            </TableCell>
            <TableCell>
                <StarRating rating={review.rating} />
            </TableCell>
            <TableCell>
                <p className="max-w-md truncate">{review.comment}</p>
            </TableCell>
            <TableCell className="hidden md:table-cell text-center">
                <div className="flex justify-center gap-2">
                    <Badge variant={review.visible ? "default" : "secondary"} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                        {review.visible ? 'Visible' : 'Hidden'}
                    </Badge>
                     {review.pinned && (
                        <Badge variant="secondary" className="gap-1.5">
                            <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <TooltipProvider>
                    <div className="flex gap-1 justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(review)} disabled={isPending}>
                                    {review.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{review.visible ? 'Hide' : 'Show'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onTogglePin(review)} disabled={isPending}>
                                    {review.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{review.pinned ? 'Unpin' : 'Pin'}</TooltipContent>
                        </Tooltip>
                         <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPending}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the review by <span className="font-semibold">{review.name}</span>. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => onDelete(review)}
                                    >
                                    Yes, delete review
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TooltipProvider>
            </TableCell>
        </TableRow>
    ));
  }

  return (
    <>
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Manage Reviews</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Submitted Reviews
          </CardTitle>
          <CardDescription>
            Moderate user-submitted reviews. Pinned reviews appear first on the public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="hidden md:table-cell text-center">Status</TableHead>
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
