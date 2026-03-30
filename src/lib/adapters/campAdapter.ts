import { Camp, GalleryImage } from '@/types';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const API_ORIGIN = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!raw) return '';

  const withoutApiSuffix = raw.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
  return withoutApiSuffix;
})();

const toPublicImageUrl = (value: unknown): string => {
  if (!isNonEmptyString(value)) return '/images/placeholder.jpg';

  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) {
    return API_ORIGIN ? `${API_ORIGIN}${raw}` : raw;
  }

  return API_ORIGIN ? `${API_ORIGIN}/uploads/${raw}` : `/uploads/${raw}`;
};

export const adaptCamp = (camp: any): Camp => {
  const imageUrl = toPublicImageUrl(camp?.imageUrl);

  const imageHint = isNonEmptyString(camp?.imageHint) ? camp.imageHint : 'camp adventure';

  return {
    ...camp,
    imageUrl,
    imageHint,
  };
};

export const adaptCamps = (camps: any[] = []): Camp[] => camps.map(adaptCamp);

export const adaptGalleryImage = (image: any): GalleryImage => {
  const imageUrl = toPublicImageUrl(image?.imageUrl);
  const imageHint = isNonEmptyString(image?.imageHint) ? image.imageHint : 'camp adventure';

  return {
    ...image,
    imageUrl,
    imageHint,
  };
};

export const adaptGalleryImages = (images: any[] = []): GalleryImage[] => images.map(adaptGalleryImage);
