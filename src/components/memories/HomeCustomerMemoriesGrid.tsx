'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

import type { MemoryItem } from '@/lib/memoriesApi';

type HomeCustomerMemoriesGridProps = {
  memories: MemoryItem[];
  isLoading: boolean;
};

export function HomeCustomerMemoriesGrid({ memories, isLoading }: HomeCustomerMemoriesGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="customer-memories" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-sm font-semibold uppercase tracking-[0.32em] text-rose-700 dark:text-rose-300"
          >
            Customer Memories
          </motion.p>
          <motion.h2
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 28 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
            className="mt-4 text-3xl font-black text-gray-900 sm:text-4xl md:text-5xl dark:text-white"
          >
            Customer Memories
          </motion.h2>
        </div>

        {isLoading ? (
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading customer memories...</p>
        ) : null}

        {!isLoading && memories.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">No memories available yet.</p>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {memories.map((memory, index) => (
            <motion.article
              key={memory.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 28 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : (index % 4) * 0.08, ease: 'easeOut' }}
              whileHover={shouldReduceMotion ? undefined : { y: -8 }}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-lg transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="relative h-64 overflow-hidden">
                <motion.div whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }} transition={{ duration: 0.4 }} className="h-full w-full">
                  <Image
                    src={memory.imageUrl}
                    alt={memory.caption || 'Camp memory'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                </motion.div>
              </div>
              <div className="space-y-2 p-4">
                <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-200">{memory.caption || 'Camp memory'}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{memory.userName}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
