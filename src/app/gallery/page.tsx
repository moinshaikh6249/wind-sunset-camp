
import type { Metadata } from 'next';
import GalleryPageContent from './GalleryPageContent';

export const metadata: Metadata = {
  title: 'Camp Gallery',
  description: 'View beautiful moments from our camping experiences.',
  openGraph: {
    title: 'Camp Gallery | Wind & Sunset Camp',
    description: 'View beautiful moments from our camping experiences.',
  },
  alternates: {
    canonical: '/gallery',
  },
};

export default function GalleryPage() {
  return <GalleryPageContent />;
}
