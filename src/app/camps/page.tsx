
import type { Metadata } from 'next';
import CampsPageContent from './CampsPageContent';

export const metadata: Metadata = {
  title: 'Upcoming Camps',
  description: 'Explore our upcoming camps and book your next adventure.',
  openGraph: {
    title: 'Upcoming Camps | Wind & Sunset Camp',
    description: 'Explore our upcoming camps and book your next adventure.',
  },
  alternates: {
    canonical: '/camps',
  },
};

export default function CampsPage() {
  return <CampsPageContent />;
}
