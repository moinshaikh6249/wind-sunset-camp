
'use client';

import { db } from "@/lib/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useMemo, useTransition } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { formatDistanceToNow } from 'date-fns';
import { Star, Trash2, Eye, EyeOff, Pin, PinOff, MessageSquare } from "lucide-react";

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

function ReviewCardSkeleton() {
    return (
        <div className="review-card bg-card/80 dark:bg-card/70 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-border/50">
            <div className="flex justify-between items-start">
                 <div className="w-full space-y-3">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <div className="flex gap-2 mt-4">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const { searchQuery } = useSearch();
  const { isAdmin } = useAdmin();
  const [isPending, startTransition] = useTransition();
  
  const reviewsQuery = useMemo(() => query(collection(db, 'reviews'), orderBy("createdAt", "desc")), []);
  const [reviewsSnapshot, isLoading] = useCollection(reviewsQuery);
  const reviewsData = useMemo(() => reviewsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)), [reviewsSnapshot]);
  
  const sortedReviews = useMemo(() => {
      if (!reviewsData) return [];
      return [...reviewsData].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
  }, [reviewsData]);


  const filteredReviews = useMemo(() => {
    if (!sortedReviews) return [];
    if (!searchQuery) return sortedReviews;
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedReviews.filter(review => 
        review.name.toLowerCase().includes(lowercasedQuery) ||
        review.comment.toLowerCase().includes(lowercasedQuery)
    );
  }, [sortedReviews, searchQuery]);
  
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
    const reviewRef = doc(db, 'reviews', review.id);
    handleAction(
        () => updateDoc(reviewRef, { visible: !review.visible }),
        `Review ${!review.visible ? 'is now visible' : 'is now hidden'}.`,
        "Failed to update visibility"
    );
  }

  const onTogglePin = (review: Review) => {
    const reviewRef = doc(db, 'reviews', review.id);
    handleAction(
        () => updateDoc(reviewRef, { pinned: !review.pinned }),
        `Review ${!review.pinned ? 'pinned' : 'unpinned'}.`,
        "Failed to update pin status"
    );
  }

  const onDelete = (review: Review) => {
    const reviewRef = doc(db, 'reviews', review.id);
    handleAction(
        () => deleteDoc(reviewRef),
        `Review by ${review.name} deleted.`,
        "Failed to delete review"
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-slide-in">
      <div className="flex items-center justify-between">
         <h1 className="text-lg font-semibold md:text-2xl">Manage Reviews</h1>
      </div>
       <Card className="glass-card">
        <CardHeader>
          <CardTitle>
            All Submitted Reviews
          </CardTitle>
          <CardDescription>
            Moderate user-submitted reviews. Pinned reviews appear first on the public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading && (
                  <>
                    <ReviewCardSkeleton />
                    <ReviewCardSkeleton />
                    <ReviewCardSkeleton />
                  </>
              )}
               {!isLoading && filteredReviews.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-10 bg-card/50 rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <p className="text-lg font-semibold">No reviews yet 🌄</p>
                  <p className="text-sm">User reviews will appear here once submitted.</p>
                </div>
              )}
              {!isLoading && filteredReviews.map((review) => (
                  <div key={review.id} className="review-card bg-card/80 dark:bg-card/70 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-border/50 hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{review.name}</h3>
                        <div className="my-1"><StarRating rating={review.rating} /></div>
                        <p className="text-muted-foreground mt-3 italic text-sm">&quot;{review.comment}&quot;</p>
                         <p className="text-xs text-muted-foreground/80 mt-3">
                           {review.createdAt ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {review.pinned && (
                              <Badge variant="secondary" className="gap-1.5 bg-accent/20 text-accent dark:bg-sidebar-accent/20 dark:text-sidebar-accent-foreground border-accent/30">
                                  <Pin className="h-3.5 w-3.5" /> Pinned
                              </Badge>
                          )}
                           <Badge variant="outline" className={cn(review.visible ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-gray-500/20 text-gray-400 border border-gray-500/40")}>
                              {review.visible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>
                        {isAdmin && (
                            <TooltipProvider>
                            <div className="flex gap-1 justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(review)} disabled={isPending}>
                                            {review.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{review.visible ? 'Hide Review' : 'Show Review'}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => onTogglePin(review)} disabled={isPending}>
                                            {review.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{review.pinned ? 'Unpin Review' : 'Pin Review'}</TooltipContent>
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
                                        <TooltipContent>Delete Review</TooltipContent>
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
                                            disabled={isPending}
                                            >
                                            {isPending ? "Deleting..." : "Yes, delete review"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
