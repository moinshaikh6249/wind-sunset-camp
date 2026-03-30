'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, MessageSquare, Star } from 'lucide-react';

import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
};

type CampReviewsSectionProps = {
  campId: string;
};

const formatReviewDate = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const renderStars = (rating: number, filledClassName: string, emptyClassName: string) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, index) => {
      const filled = index < rating;

      return (
        <Star
          key={`${rating}-${index}`}
          className={`h-4 w-4 ${filled ? filledClassName : emptyClassName}`}
          fill={filled ? 'currentColor' : 'none'}
        />
      );
    })}
  </div>
);

export default function CampReviewsSection({ campId }: CampReviewsSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasUserToken, setHasUserToken] = useState(false);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/reviews/${campId}`);
      setReviews(Array.isArray(response?.reviews) ? response.reviews : []);
    } catch (error) {
      console.error('Failed to fetch camp reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [campId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
        title: 'Login Required',
        description: 'Please log in to submit a review.',
        variant: 'destructive',
      });
      return;
    }

    if (!trimmedComment || trimmedComment.length < 10) {
      toast({
        title: 'Comment Required',
        description: 'Please enter at least 10 characters for your review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/reviews', {
        campId,
        rating: selectedRating,
        comment: trimmedComment,
      });

      if (response?.review) {
        setReviews((currentReviews) => [response.review, ...currentReviews]);
      } else {
        await loadReviews();
      }

      setComment('');
      setSelectedRating(5);

      toast({
        title: 'Review Submitted',
        description: 'Thanks for sharing your experience.',
      });
    } catch (error: any) {
      toast({
        title: 'Review Failed',
        description: error.response?.data?.message || error.message || 'Failed to submit review.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Ratings & Reviews</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              See what campers are saying about this experience.
            </p>
          </div>
          <div className="rounded-2xl border bg-card/60 px-4 py-3 text-right">
            <div className="text-2xl font-bold text-foreground">
              {reviews.length > 0 ? `${averageRating} ⭐` : 'No ratings yet'}
            </div>
            <p className="text-sm text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Leave a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your Rating</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const ratingValue = index + 1;
                const active = ratingValue <= selectedRating;

                return (
                  <Button
                    key={ratingValue}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRating(ratingValue)}
                    className="gap-2"
                  >
                    <Star className="h-4 w-4" fill={active ? 'currentColor' : 'none'} />
                    {ratingValue}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your Review</p>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Share your camp experience, activities, and overall stay."
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {hasUserToken ? 'Your review will appear immediately on this camp page.' : 'Log in to leave a review for this camp.'}
            </p>
            {hasUserToken ? (
              <Button type="button" onClick={handleSubmitReview} disabled={isSubmitting} className="btn-glow">
                {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Login to Review</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 p-6 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading reviews...
            </CardContent>
          </Card>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{review.userName || 'Camper'}</p>
                    <p className="text-sm text-muted-foreground">{formatReviewDate(review.createdAt)}</p>
                  </div>
                  {renderStars(review.rating, 'text-amber-500', 'text-muted-foreground/40')}
                </div>
                <p className="leading-7 text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
              <div>
                <p className="font-semibold text-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground">Be the first camper to rate this camp.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}