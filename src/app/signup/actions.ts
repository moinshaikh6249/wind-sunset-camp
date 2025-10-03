
"use server";

import { z } from "zod";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    
    // After creating the user, update their profile
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: values.name,
        // Note: phoneNumber cannot be directly set here. It requires a more complex verification flow.
        // We can store it in Firestore if needed.
      });
    }

    return { success: true };
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred.";
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
    } else {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
