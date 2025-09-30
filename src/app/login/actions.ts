
"use server";

import { z } from "zod";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function submitLoginForm(values: z.infer<typeof formSchema>) {
  try {
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
        default:
            errorMessage = error.message;
            break;
    }
    return { success: false, error: errorMessage };
  }
}
