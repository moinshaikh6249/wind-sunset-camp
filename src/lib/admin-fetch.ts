
import { getAuth } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// This is a client-side utility

/**
 * A wrapper around the native `fetch` function that automatically
 * includes the current user's Firebase ID token in the Authorization header.
 * This is used for calling secured server actions from the admin panel.
 * @param action A function that performs the server action call.
 * @returns The result of the server action.
 */
export async function adminFetch<T>(action: () => Promise<T>): Promise<T> {
  const { auth } = initializeFirebase();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No authenticated user found for admin action.');
  }

  const idToken = await user.getIdToken();

  // Temporarily override global fetch to inject the header
  const originalFetch = global.fetch;
  global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${idToken}`);
    const newInit = { ...init, headers };
    return originalFetch(input, newInit);
  };

  try {
    // Execute the server action which will now use the overridden fetch
    const result = await action();
    return result;
  } finally {
    // IMPORTANT: Restore the original fetch function
    global.fetch = originalFetch;
  }
}
