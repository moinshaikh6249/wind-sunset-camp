
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
    bio: "I founded Wind & Sunset pawna lake camping to help people unplug from the daily grind and find their own connection with nature. We aren't just offering a campsite we're providing a space for rest, reconnection, and the kind of moments that become lifelong memories.",
    image: findImage('team-1'),
  },
];

// This data is now managed in the database.
// This file is kept for the static team members data, but camps and gallery are no longer sourced from here.
export const upcomingCamps = [];

export const galleryImages = [];
