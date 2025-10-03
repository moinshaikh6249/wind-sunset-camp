
"use server";

import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { initializeFirebase } from "@/firebase";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function submitLoginForm(values: z.infer<typeof formSchema>) {
  try {
    const { auth } = initializeFirebase();
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred.";
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        default:
            errorMessage = "An unexpected error occurred. Please try again later.";
            break;
    }
    return { success: false, error: errorMessage };
  }
}
