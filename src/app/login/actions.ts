
"use server";

import { z } from "zod";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper function to initialize Firebase on the server if not already done.
const initializeServerApp = () => {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApps()[0];
};

export async function submitLoginForm(values: z.infer<typeof formSchema>) {
  try {
    const app = initializeServerApp();
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred. Please try again later.";
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many login attempts. Please try again later.';
        break;
    }
    return { success: false, error: errorMessage };
  }
}
