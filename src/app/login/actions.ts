
"use server";

import { z } from "zod";
import { initializeFirebase } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function submitLoginForm(values: z.infer<typeof formSchema>) {
  const { auth } = initializeFirebase();
  try {
    // This will not sign the user in on the client, as the server action
    // cannot share auth state with the browser. The client-side form now
    // handles the sign-in itself. This action serves as a backend check
    // or could be used for other server-side logic upon login.
    // For this app, we will let the client handle sign-in fully.
    return { success: true };

  } catch (error: any) {
    let errorMessage = "An unexpected error occurred. Please try again later.";
    // Convert Firebase error codes to user-friendly messages
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
