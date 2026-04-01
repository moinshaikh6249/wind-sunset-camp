import { LucideIcon } from "lucide-react";

export type Camp = {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  price?: number | string;
  image: {
    id: string;
    imageUrl: string;
    imageHint: string;
  };
};

export type GalleryImageDoc = {
  id?: string;
  imageUrl: string;
  description: string;
  imageHint: string;
};

export type ExperienceStep = {
  label: string;
  icon: LucideIcon;
  copy: string;
};

export type ReviewItem = {
  name: string;
  quote: string;
};

export type UpcomingCamp = {
  id: string;
  name: string;
  date: string;
  location: string;
};
