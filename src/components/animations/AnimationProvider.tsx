'use client';

import { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

type AnimationProviderProps = {
  children: ReactNode;
};

export function AnimationProvider({ children }: AnimationProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
