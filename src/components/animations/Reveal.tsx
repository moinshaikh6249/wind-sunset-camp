'use client';

import { Children, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
};

export function StaggerReveal({ children, className, amount = 0.05 }: StaggerRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: amount,
          },
        },
      }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
