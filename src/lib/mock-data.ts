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
    name: 'Alex Johnson',
    role: 'Founder & Lead Guide',
    bio: 'Alex founded Wind & Sunset Camp with the vision of sharing the transformative power of nature. An expert survivalist and storyteller.',
    image: findImage('team-1'),
  },
  {
    name: 'Maria Garcia',
    role: 'Activities Coordinator',
    bio: 'Maria designs all our camp activities, from kayaking to stargazing, ensuring every moment is an adventure.',
    image: findImage('team-2'),
  },
  {
    name: 'Sam Lee',
    role: 'Chef & Nutritionist',
    bio: 'Sam believes that great food is a core part of the camping experience. He creates delicious, healthy meals over the open fire.',
    image: findImage('team-3'),
  },
];

export const upcomingCamps = [
  {
    id: 'summer-adventure-2024',
    name: 'Summer Adventure Camp',
    date: 'July 15-20, 2024',
    location: 'Whispering Pines Forest',
    description: 'A classic summer camp experience with hiking, bonfires, and lake swimming. Perfect for all ages.',
    image: findImage('gallery-1'),
  },
  {
    id: 'mountain-explorer-2024',
    name: 'Mountain Explorer',
    date: 'August 5-12, 2024',
    location: 'Granite Peak National Park',
    description: 'Challenge yourself with advanced rock climbing and high-altitude trekking. For experienced adventurers.',
    image: findImage('gallery-2'),
  },
  {
    id: 'coastal-survival-2024',
    name: 'Coastal Survival Skills',
    date: 'September 2-7, 2024',
    location: 'Shipwreck Cove',
    description: 'Learn to forage, fish, and build shelters on the beautiful but rugged coastline.',
    image: findImage('gallery-9'),
  },
  {
    id: 'autumn-retreat-2024',
    name: 'Autumn Colors Retreat',
    date: 'October 10-14, 2024',
    location: 'Maple Valley',
    description: 'A relaxing retreat focused on photography, yoga, and enjoying the stunning autumn foliage.',
    image: findImage('gallery-8'),
  },
];

export const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));
