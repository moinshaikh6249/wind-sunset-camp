
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, LoaderCircle, Pin } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    campId: z.string().min(1, { message: "Please select a camp." }),
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }),
});

type Review = {
    _id: string;
    id?: string;
    name: string;
    rating: number;
    comment: string;
    visible: boolean;
    pinned: boolean;
    createdAt: string;
    userId?: string;
}

type User = {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

type Camp = {
    _id: string;
    id?: string;
    name: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 transition-colors ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

function ReviewSkeleton() {
    return (
        <Card className="bg-card/80 dark:bg-card/70 backdrop-blur-sm p-5 shadow-lg">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="w-full space-y-3">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function ReviewsPageContent() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [isCampsLoading, setIsCampsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.user || response);
        }
      } catch (error) {
                    // noop: unauthenticated users can still browse reviews
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
        const fetchCamps = async () => {
            try {
                setIsCampsLoading(true);
                const response = await api.get('/camps');

                const campList = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.camps)
                        ? response.camps
                        : Array.isArray(response?.data)
                            ? response.data
                            : [];

                setCamps(campList);
            } catch (error) {
                console.error('Failed to fetch camps:', error);
                setCamps([]);
            } finally {
                setIsCampsLoading(false);
            }
        };

        fetchCamps();
    }, []);

    useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/reviews');
        const allReviews = response.reviews || response.data || [];
        
        // Sort reviews: pinned first, then by date
        const sorted = allReviews.sort((a: Review, b: Review) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setReviews(sorted);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
        const selectedCampId = values.campId?.trim();

        if (!selectedCampId) {
            toast({
                title: "Camp Required",
                description: "Please select a camp before submitting your review.",
                variant: "destructive",
            });
            return;
        }

        const hasSelectedCamp = camps.some((camp) => (camp._id || camp.id) === selectedCampId);
        if (!hasSelectedCamp) {
            toast({
                title: "Camp Not Found",
                description: "Please select a valid camp from the list.",
                variant: "destructive",
            });
            return;
        }

    try {
                await api.post('/reviews', {
            name: values.name,
                        campId: selectedCampId,
            rating: values.rating,
            comment: values.comment,
        });

        toast({
            title: "Review Submitted!",
            description: "Thank you for your feedback. Your review is now visible.",
        });
        form.reset();
        if (user?.firstName) {
            form.setValue('name', `${user.firstName} ${user.lastName || ''}`);
        }
        form.setValue('campId', '');
        form.setValue('rating', 0);

        // Refresh reviews
        const updatedResponse = await api.get('/reviews');
        const allReviews = updatedResponse.reviews || updatedResponse.data || [];
        const sorted = allReviews.sort((a: Review, b: Review) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setReviews(sorted);

    } catch (error: any) {
        console.error("Review submission failed:", error);
        toast({
            title: "Submission Failed",
            description: error.response?.data?.message || error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
            campId: "",
      rating: 0,
      comment: "",
    },
  });

  useEffect(() => {
    if (user && user.firstName) {
        form.setValue("name", `${user.firstName} ${user.lastName || ''}`);
    }
  }, [user, form]);

  return (
    <div className="bg-background woody-texture-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <section className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-heading-color heading-shadow heading-underline mb-6">
                Guest Reviews
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
                See what our adventurers are saying about their experience at Wind & Sunset Camp.
            </p>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3 space-y-6">
                <h2 className="font-headline text-2xl sm:text-3xl text-gradient">What Our Guests Say</h2>
                {isLoading && (
                    <div className="space-y-6">
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                    </div>
                )}
                {!isLoading && reviews && reviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                      {reviews.map((review, index) => (
                          <Card 
                              key={review._id || review.id} 
                              className="bg-card/80 dark:bg-card/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-transparent hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in"
                              style={{ animationDelay: `${index * 100}ms` }}
                          >
                              <div className="flex items-start gap-4">
                                  <Avatar className="h-11 w-11 sm:h-12 sm:w-12 text-xl shadow-inner">
                                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent/50 text-foreground font-semibold">
                                          {review.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div>
                                              <CardTitle className="text-base sm:text-lg font-semibold">{review.name}</CardTitle>
                                              <div className="mt-1">
                                                  <StarRating rating={review.rating} />
                                              </div>
                                          </div>
                                          {review.pinned && (
                                              <Badge variant="secondary" className="w-fit gap-1.5 bg-accent/20 text-accent border-accent/30 dark:bg-sidebar-accent/20 dark:text-sidebar-accent-foreground">
                                                  <Pin className="h-3.5 w-3.5" />
                                                  Pinned
                                              </Badge>
                                          )}
                                      </div>
                                      <CardContent className="p-0 mt-3">
                                          <p className="text-sm sm:text-base text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                                      </CardContent>
                                  </div>
                              </div>
                          </Card>
                      ))}
                    </div>
                ) : !isLoading && (
                     <div className="text-center text-muted-foreground py-16 bg-card/50 rounded-lg">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                        <p className="text-lg font-semibold">No reviews yet.</p>
                        <p className="text-sm">Be the first to share your experience!</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <Card className="bg-card/90 dark:bg-card/80 backdrop-blur-md shadow-xl border lg:sticky lg:top-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 font-headline text-xl sm:text-2xl text-gradient">
                            <MessageSquare className="text-accent"/>
                            Leave a Review
                        </CardTitle>
                        <CardDescription>Share your experience with us and future campers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John D." {...field} className="bg-background/70"/>
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                     <FormField
                                                                                control={form.control}
                                                                                name="campId"
                                                                                render={({ field }) => (
                                                                                        <FormItem>
                                                                                        <FormLabel>Camp</FormLabel>
                                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                                            <FormControl>
                                                                                                <SelectTrigger className="w-full bg-background/70">
                                                                                                    <SelectValue placeholder="Select the camp you visited" />
                                                                                                </SelectTrigger>
                                                                                            </FormControl>
                                                                                            <SelectContent>
                                                                                                {isCampsLoading ? (
                                                                                                    <SelectItem value="__loading" disabled>Loading camps...</SelectItem>
                                                                                                ) : camps.length === 0 ? (
                                                                                                    <SelectItem value="__empty" disabled>No camps available</SelectItem>
                                                                                                ) : (
                                                                                                    camps
                                                                                                        .map((camp) => ({ id: camp._id || camp.id, name: camp.name }))
                                                                                                        .filter((camp) => Boolean(camp.id))
                                                                                                        .map((camp) => (
                                                                                                            <SelectItem key={camp.id} value={camp.id || ''}>
                                                                                                                {camp.name}
                                                                                                            </SelectItem>
                                                                                                        ))
                                                                                                )}
                                                                                            </SelectContent>
                                                                                        </Select>
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
                                                                className={`h-8 w-8 cursor-pointer transition-all duration-200 ${ratingValue <= (hoverRating || field.value) ? "text-yellow-400 fill-yellow-400 scale-110" : "text-muted-foreground/50 hover:scale-110"}`}
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
                                                <Textarea rows={4} placeholder="It was an amazing experience..." {...field} className="bg-background/70"/>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" size="lg" className="w-full btn-glow" disabled={form.formState.isSubmitting || isCampsLoading || camps.length === 0}>
                                        {form.formState.isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </form>
                            </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
