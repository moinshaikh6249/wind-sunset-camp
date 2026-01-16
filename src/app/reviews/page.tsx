
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useMemo, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, addDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { Star, MessageSquare, Send, ThumbsUp, Check, LoaderCircle, Pin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }),
});

type Review = {
    id: string;
    name: string;
    rating: number;
    comment: string;
    visible: boolean;
    pinned: boolean;
    createdAt: { seconds: number; nanoseconds: number; };
    userId?: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                />
            ))}
        </div>
    );
}

function ReviewSkeleton() {
    return (
        <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const [user] = useAuthState(auth);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [reviewsSnapshot, isLoading, error] = useCollection(
    query(
      collection(db, "reviews"),
      where("visible", "==", true),
      orderBy("createdAt", "desc")
    )
  );
  
  const reviews = useMemo(() => {
    if (!reviewsSnapshot) return [];
    const fetchedReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    const pinnedReviews = fetchedReviews.filter(r => r.pinned);
    const unpinnedReviews = fetchedReviews.filter(r => !r.pinned);
    return [...pinnedReviews, ...unpinnedReviews];
  }, [reviewsSnapshot]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rating: 0,
      comment: "",
    },
  });

  useEffect(() => {
    if (user && user.displayName) {
        form.setValue("name", user.displayName);
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Not logged in", description: "You must be logged in to leave a review.", variant: "destructive" });
        return;
    }

    try {
        const reviewData = {
            ...values,
            userId: user.uid,
            visible: true, // New reviews are visible by default
            pinned: false,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "reviews"), reviewData);

        toast({
            title: "Review Submitted!",
            description: "Thank you for your feedback. Your review is now visible.",
            icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
        });
        form.reset();
        if (user?.displayName) {
            form.setValue('name', user.displayName);
        }
        form.setValue('rating', 0);


    } catch (error: any) {
        toast({
            title: "Submission Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  }

  return (
    <div className="bg-background woody-texture-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <section className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="font-headline text-4xl md:text-6xl text-heading-color heading-shadow heading-underline mb-6">
                Guest Reviews
            </h1>
            <p className="text-lg text-muted-foreground">
                See what our adventurers are saying about their experience at Wind & Sunset Camp.
            </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-6">
                <h2 className="font-headline text-3xl text-gradient">What Our Guests Say</h2>
                {isLoading && (
                    <div className="space-y-6">
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                    </div>
                )}
                {!isLoading && reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                        <Card key={review.id} className="bg-card/80 dark:bg-card/70 backdrop-blur-sm shadow-lg">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12 text-xl">
                                    <AvatarFallback>{review.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{review.name}</CardTitle>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        {review.pinned && (
                                            <Badge variant="secondary" className="gap-1.5 bg-sidebar-accent text-sidebar-accent-foreground">
                                                <Pin className="h-3.5 w-3.5" />
                                                Pinned
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                            </CardContent>
                        </Card>
                    ))
                ) : !isLoading && (
                    <p className="text-muted-foreground text-center py-8">Be the first to leave a review!</p>
                )}
            </div>

            <div className="lg:col-span-2">
                <Card className="sticky top-24 bg-card/90 dark:bg-card/80 backdrop-blur-md shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl text-gradient">
                            <MessageSquare />
                            Leave a Review
                        </CardTitle>
                        <CardDescription>Share your experience with us and future campers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user ? (
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Your Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John D." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="rating"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Your Rating</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                                    {[...Array(5)].map((_, i) => {
                                                        const ratingValue = i + 1;
                                                        return (
                                                            <Star
                                                                key={i}
                                                                className={`h-8 w-8 cursor-pointer transition-colors ${ratingValue <= (hoverRating || field.value) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                                                                onClick={() => field.onChange(ratingValue)}
                                                                onMouseEnter={() => setHoverRating(ratingValue)}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="comment"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Your Comment</FormLabel>
                                            <FormControl>
                                                <Textarea rows={4} placeholder="It was an amazing experience..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                            <div className="text-center text-muted-foreground p-8">
                                <p>You must be logged in to leave a review.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
