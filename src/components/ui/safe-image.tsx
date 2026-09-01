'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export function isGoogleUserContentUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  return url.includes('googleusercontent.com');
}

export const SafeImage = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt = '', unoptimized, onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState(src || '/images/light-hero.png');
    const isGoogle = isGoogleUserContentUrl(imgSrc);

    useEffect(() => {
      setImgSrc(src || '/images/light-hero.png');
    }, [src]);

    return (
      <Image
        ref={ref}
        src={imgSrc}
        alt={alt}
        unoptimized={unoptimized || isGoogle}
        onError={(e) => {
          if (imgSrc !== '/images/light-hero.png') {
            setImgSrc('/images/light-hero.png');
          }
          if (onError) onError(e);
        }}
        {...props}
      />
    );
  }
);

SafeImage.displayName = 'SafeImage';
export default SafeImage;
