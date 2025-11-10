
'use client';

import { useState, useEffect } from 'react';
import { onValue, ref, query, Query } from 'firebase/database';
import { useDatabase } from '@/firebase';

export interface UseDatabaseValueResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDatabaseValue<T = any>(
  memoizedQuery: Query | null | undefined,
): UseDatabaseValueResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

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
        // A more robust solution might involve a global error handler
        // or a specific error boundary for components that use this hook.
      }
    );

    return () => {
      // Detach the listener when the component unmounts
      // This is done by calling the function returned by onValue with no arguments,
      // but the Firebase SDK overloads `off` for this purpose as well.
      // In modern SDKs, the returned function itself is the unsubscriber.
      listener();
    };
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
