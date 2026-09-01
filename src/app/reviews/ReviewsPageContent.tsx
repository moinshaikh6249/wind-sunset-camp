"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, LoaderCircle, Pin, Sparkles, ShieldCheck } from "lucide-react";

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
import { UserAvatar } from "@/components/ui/user-avatar";
import { Reveal, HeroReveal } from "@/components/animations/Reveal";

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
};

type User = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
};

type Camp = {
  _id: string;
  id?: string;
  name: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <Card className="rounded-3xl border border-border/40 bg-card/80 dark:bg-card/70 backdrop-blur-xl p-6 shadow-lg space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="w-full space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full rounded-xl pt-2" />
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
        // Unauthenticated users can still browse reviews
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
      form.setValue("name", `${user.firstName} ${user.lastName || ''}`.trim());
    }
  }, [user, form]);

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
        title: "Review Submitted! 🎉",
        description: "Thank you for your feedback. Your review is now visible.",
      });
      form.reset();
      if (user?.firstName) {
        form.setValue('name', `${user.firstName} ${user.lastName || ''}`.trim());
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

  return (
    <div className="bg-background woody-texture-background min-h-screen pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 space-y-12">
        {/* HERO */}
        <HeroReveal className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Stories From The Lake
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl text-foreground font-extrabold tracking-tight">
            Guest Reviews
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Authentic experiences and stories shared by campers at Wind & Sunset Camp, Pawna Lake.
          </p>
        </HeroReveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12 items-start">
          {/* REVIEWS LIST */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl sm:text-3xl text-foreground">What Our Campers Say</h2>
              <Badge variant="outline" className="text-xs font-bold border-amber-500/30 text-amber-700 dark:text-amber-300">
                {reviews.length} Stories
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <ReviewSkeleton />
                <ReviewSkeleton />
                <ReviewSkeleton />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card
                    key={review._id || review.id}
                    className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl"
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={{ displayName: review.name }}
                            sizeClassName="h-11 w-11 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-foreground">{review.name}</h3>
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-500" /> Verified Camper
                              </Badge>
                            </div>
                            <div className="mt-1">
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                        </div>

                        {review.pinned && (
                          <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                            <Pin className="h-3 w-3" /> Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic pl-1">
                        "{review.comment}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-border/60 bg-muted/20 rounded-3xl p-12 text-center space-y-3">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-bold text-foreground font-headline">No guest stories yet.</h3>
                <p className="text-xs text-muted-foreground">Be the first camper to share your Pawna Lake memory!</p>
              </Card>
            )}
          </div>

          {/* SUBMIT REVIEW FORM */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <Card className="border border-border/40 bg-card/90 dark:bg-card/70 backdrop-blur-xl shadow-2xl rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 font-headline text-2xl text-foreground">
                  <MessageSquare className="h-6 w-6 text-amber-500" />
                  Leave a Review
                </CardTitle>
                <CardDescription className="text-xs">
                  Share your Pawna Lake camping experience with future travelers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="text-xs rounded-xl" />
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
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Camp</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full text-xs rounded-xl">
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
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Rating</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                              {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                const active = ratingValue <= (hoverRating || field.value);
                                return (
                                  <Star
                                    key={i}
                                    className={`h-7 w-7 cursor-pointer transition-all duration-200 ${
                                      active ? "text-amber-500 fill-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-muted-foreground/30 hover:scale-110"
                                    }`}
                                    onClick={() => field.onChange(ratingValue)}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                  />
                                );
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
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Review</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="It was an amazing experience... (minimum 10 characters)" {...field} className="text-xs rounded-2xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full btn-glow text-xs font-bold rounded-2xl py-5" disabled={form.formState.isSubmitting || isCampsLoading || camps.length === 0}>
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
