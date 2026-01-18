
import type { Metadata } from 'next';
import ReviewsPageContent from './ReviewsPageContent';

export const metadata: Metadata = {
  title: 'Guest Reviews',
  description: 'See what our guests are saying about their stay.',
  openGraph: {
    title: 'Guest Reviews | Wind & Sunset Camp',
    description: 'See what our guests are saying about their stay.',
  },
  alternates: {
    canonical: '/reviews',
  },
};

export default function ReviewsPage() {
  return <ReviewsPageContent />;
}
