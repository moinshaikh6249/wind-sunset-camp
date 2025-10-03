
"use server";

import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  try {
    const { auth, firestore } = initializeFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    
    const user = userCredential.user;
    if (user) {
      await updateProfile(user, {
        displayName: values.name,
      });

      const nameParts = values.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const userProfile = {
        firstName,
        lastName,
        email: values.email,
        phone: values.mobileNumber,
      };

      await setDoc(doc(firestore, "users", user.uid), userProfile);
    }

    return { success: true };
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else {
      errorMessage = "An unexpected error occurred during sign up.";
    }
    return { success: false, error: errorMessage };
  }
}
