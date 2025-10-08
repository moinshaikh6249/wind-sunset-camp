
import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string): ImagePlaceholder => {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) {
      // Fallback for safety
      return { id: 'fallback', description: 'Fallback image', imageUrl: 'https://picsum.photos/seed/fallback/400/400', imageHint: '' };
    }
    return image;
};

export const teamMembers = [
  {
    name: 'Sameer More',
    role: 'Owner',
    bio: 'Alex founded Wind & Sunset Camp with the vision of sharing the transformative power of nature. An expert survivalist and storyteller.',
    image: findImage('team-1'),
  },
];

// This data is now managed in the database.
// This file is kept for the static team members data, but camps and gallery are no longer sourced from here.
export const upcomingCamps = [];

export const galleryImages = [];
