
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface UseCollectionResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCollection<T = DocumentData>(
  memoizedQuery: Query | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
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

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot) => {
        const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(documents);
        setIsLoading(false);
      },
      (err: Error) => {
        console.error("Firestore collection listener error:", err.message);
        setError(err);
        setIsLoading(false);
        // Create and emit a detailed permission error
        const permissionError = new FirestorePermissionError({
          path: (memoizedQuery as any)._query.path.segments.join('/'),
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
