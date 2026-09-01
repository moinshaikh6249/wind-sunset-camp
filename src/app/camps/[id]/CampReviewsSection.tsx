"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoaderCircle, MessageSquare, Star, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    photoURL?: string;
  };
};

type CampReviewsSectionProps = {
  campId: string;
};

const formatReviewDate = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export default function CampReviewsSection({ campId }: CampReviewsSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasUserToken, setHasUserToken] = useState(false);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/reviews/${campId}`);
      setReviews(Array.isArray(response?.reviews) ? response.reviews : []);
    } catch (error) {
      console.error("Failed to fetch camp reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [campId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    setHasUserToken(Boolean(token));
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return Number(avg.toFixed(1));
  }, [reviews]);

  const handleSubmitReview = async () => {
    const trimmedComment = comment.trim();

    if (!hasUserToken) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedComment || trimmedComment.length < 10) {
      toast({
        title: "Comment Required",
        description: "Please enter at least 10 characters for your review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/reviews", {
        campId,
        rating: selectedRating,
        comment: trimmedComment,
      });

      if (response?.review) {
        setReviews((currentReviews) => [response.review, ...currentReviews]);
      } else {
        await loadReviews();
      }

      setComment("");
      setSelectedRating(5);

      toast({
        title: "Review Submitted! 🎉",
        description: "Thank you for sharing your Pawna Lake experience.",
      });
    } catch (error: any) {
      toast({
        title: "Review Failed",
        description: error.response?.data?.message || error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" id="reviews">
      {/* RATING SUMMARY CARD */}
      <Card className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-500" /> Guest Testimonials
            </div>
            <CardTitle className="font-headline text-3xl mt-2 text-foreground">Ratings & Stories</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Authentic reviews from verified campers who stayed at this campsite.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-right backdrop-blur-md">
            <div>
              <div className="text-3xl font-extrabold text-foreground font-headline">
                {reviews.length > 0 ? averageRating : "New"}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4"
                    fill={index < Math.round(averageRating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">Pawna Lake Rated</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* LEAVE A REVIEW FORM */}
      <Card className="border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-headline text-2xl text-foreground">Share Your Experience</CardTitle>
          <CardDescription className="text-xs">
            Tell future campers about your stay, activities, bonfire night, and lakeside views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* STAR SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Rating
            </label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const ratingValue = index + 1;
                const isFilled = ratingValue <= (hoverRating || selectedRating);

                return (
                  <button
                    key={ratingValue}
                    type="button"
                    onClick={() => setSelectedRating(ratingValue)}
                    onMouseEnter={() => setHoverRating(ratingValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${ratingValue} stars`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors duration-200",
                        isFilled
                          ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "text-muted-foreground/30 fill-none"
                      )}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                {selectedRating} / 5 Stars
              </span>
            </div>
          </div>

          {/* COMMENT TEXTAREA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Review
              </label>
              <span className="text-[11px] text-muted-foreground">
                {comment.length} characters
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="Tell future campers about your experience... (minimum 10 characters)"
              className="rounded-2xl border-border/40 bg-background/60 text-xs focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              {hasUserToken
                ? "Your review will appear immediately on this camp page."
                : "Log in to post a verified guest review."}
            </p>
            {hasUserToken ? (
              <Button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting || comment.trim().length < 10}
                className="btn-glow text-xs font-bold rounded-xl px-6"
              >
                {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Sharing..." : "Share My Experience"}
              </Button>
            ) : (
              <Button asChild variant="outline" className="text-xs font-bold rounded-xl border-amber-500/40 text-amber-700 dark:text-amber-300">
                <Link href="/login">Login to Review</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* REVIEWS LIST & INTENTIONAL EMPTY STATE */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="border border-border/40 bg-card/60">
            <CardContent className="flex items-center justify-center gap-3 p-8 text-muted-foreground text-xs font-medium">
              <LoaderCircle className="h-5 w-5 animate-spin text-amber-500" />
              Loading guest reviews...
            </CardContent>
          </Card>
        ) : reviews.length > 0 ? (
          reviews.map((review) => {
            const authorName = review.userName || `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || "Verified Camper";
            return (
              <Card
                key={review._id}
                className="overflow-hidden border border-border/40 bg-card/80 dark:bg-card/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={{
                          displayName: authorName,
                          firstName: review.user?.firstName,
                          lastName: review.user?.lastName,
                          photoURL: review.user?.photoURL,
                        }}
                        sizeClassName="h-10 w-10 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-foreground">{authorName}</p>
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                            <ShieldCheck className="h-3 w-3 mr-1" /> Verified Guest
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full w-fit">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-3.5 w-3.5"
                          fill={index < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="leading-relaxed text-xs sm:text-sm text-muted-foreground/90 pl-1">
                    "{review.comment}"
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          /* BEAUTIFUL INTENTIONAL EMPTY STATE */
          <Card className="border border-dashed border-amber-500/40 bg-amber-500/5 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-md">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="font-headline text-2xl font-bold text-foreground">
                  Be the first to share your Pawna Lake experience.
                </p>
                <p className="text-xs text-muted-foreground">
                  No reviews have been posted for this camp yet. Rate your stay and help future adventurers plan their trip.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}