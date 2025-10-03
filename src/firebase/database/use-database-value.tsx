
'use client';

import { useState, useEffect } from 'react';
import {
  ref,
  onValue,
  off,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database';
import { errorEmitter } from '@/firebase/error-emitter';

export interface UseDatabaseValueResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDatabaseValue<T = any>(
  memoizedDbRef: DatabaseReference | null | undefined,
): UseDatabaseValueResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedDbRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const listener = onValue(
      memoizedDbRef,
      (snapshot: DataSnapshot) => {
        setData(snapshot.val() as T);
        setIsLoading(false);
      },
      (error: Error) => {
        console.error("Realtime Database read failed: " + error.message);
        setError(error);
        setIsLoading(false);
        // Note: RealtimeDB security errors are not as detailed client-side.
        // For better debugging, you might need server-side logging or use the profiler.
        // We can emit a generic error here if needed.
      }
    );

    return () => {
      off(memoizedDbRef, 'value', listener);
    };
  }, [memoizedDbRef]);

  return { data, isLoading, error };
}
