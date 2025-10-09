
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface UseDocResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDoc<T = DocumentData>(
  memoizedDocRef: DocumentReference | null | undefined,
): UseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setIsLoading(false);
      },
      (err: Error) => {
        console.error("Firestore document listener error:", err.message);
        setError(err);
        setIsLoading(false);
        
        const permissionError = new FirestorePermissionError({
            path: memoizedDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
