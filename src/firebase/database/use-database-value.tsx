'use client';

import { useState, useEffect } from 'react';
import { onValue, off, type Query } from 'firebase/database';
import { useMemoFirebase } from '../provider';

interface UseDatabaseValueOptions {
  // If true, the hook will only fetch the data once.
  once?: boolean;
}

export function useDatabaseValue<T>(
  query: Query | null,
  options?: UseDatabaseValueOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the query to prevent re-renders from creating new query objects
  const memoizedQuery = useMemoFirebase(() => query, [query]);

  useEffect(() => {
    if (!memoizedQuery) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const listener = onValue(
      memoizedQuery,
      (snapshot) => {
        setData(snapshot.val() as T);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error("Realtime Database read failed: " + error.message);
        setError(error);
        setIsLoading(false);
        // Note: RealtimeDB security errors are not as detailed client-side.
        // A proper production app might log this to a server for analysis.
      }
    );

    // If `once` is true, we immediately detach the listener after the first value is received.
    if (options?.once) {
        // The onValue listener gets the first value, then we detach.
        return () => off(memoizedQuery, 'value', listener);
    }

    // Standard cleanup function to detach the listener on unmount
    return () => {
      off(memoizedQuery, 'value', listener);
    };
  }, [memoizedQuery, options?.once]);

  return { data, isLoading, error };
}
