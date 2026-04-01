import { Flame, Mountain, Sparkles, Sun, Tent, Trees } from "lucide-react";
import { ExperienceStep, GalleryImageDoc, ReviewItem, UpcomingCamp } from "./types";

export const featureChips = [
  "Warm sunrise breakfasts",
  "Cinematic night stays",
  "Bonfire nights",
  "Lakeside camping",
];

export const experienceJourney: ExperienceStep[] = [
  { label: "Arrival", icon: Tent, copy: "Warm welcome with quick check-in." },
  { label: "Tent Setup", icon: Trees, copy: "Cozy premium tents ready before sunset." },
  { label: "Sunset", icon: Sun, copy: "Golden-hour views across Pawna Lake." },
  { label: "Bonfire", icon: Flame, copy: "Music, stories, and curated local bites." },
  { label: "Stargazing", icon: Sparkles, copy: "Clear skies and cinematic night vibes." },
  { label: "Breakfast", icon: Mountain, copy: "Fresh sunrise breakfast by the hills." },
];

export const fallbackMemories: GalleryImageDoc[] = [
  { id: "m1", imageUrl: "/images/light-hero.png", description: "Sunset by the lake", imageHint: "sunset lake camp" },
  { id: "m2", imageUrl: "/images/dark-hero.png", description: "Camp lights at night", imageHint: "night camp lights" },
  { id: "m3", imageUrl: "/images/light-hero.png", description: "Morning at tents", imageHint: "morning tent camping" },
  { id: "m4", imageUrl: "/images/dark-hero.png", description: "Bonfire moments", imageHint: "bonfire friends" },
  { id: "m5", imageUrl: "/images/light-hero.png", description: "Adventure trail", imageHint: "hiking trail" },
  { id: "m6", imageUrl: "/images/dark-hero.png", description: "Lakeside calm", imageHint: "calm lake" },
];

export const reviewItems: ReviewItem[] = [
  { name: "Aarav", quote: "Sunrise view was unreal and the team made everything seamless." },
  { name: "Sanya", quote: "Perfect mix of calm, bonfire energy, and great food." },
  { name: "Riya", quote: "The clean setup and lakeside vibe felt premium end-to-end." },
  { name: "Ishan", quote: "The best quick reset from city life. Highly recommended." },
  { name: "Kavya", quote: "Loved the hospitality and the stargazing experience." },
  { name: "Vivek", quote: "Everything felt thoughtfully curated and premium." },
];

export const fallbackUpcomingCamps: UpcomingCamp[] = [
  { id: "a", name: "Sunset Ridge Camp", date: "This Friday", location: "Pawna Lake" },
  { id: "b", name: "Bonfire Social Night", date: "Saturday", location: "Lonavala" },
  { id: "c", name: "Starry Sky Escape", date: "Sunday", location: "Pawna Shore" },
];
