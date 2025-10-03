
"use server";

import { z } from "zod";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { getSdks, initializeFirebase } from "@/firebase";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  const { auth, database } = initializeFirebase();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;

    const nameParts = values.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const userProfile = {
      firstName,
      lastName,
      email: values.email,
      phone: values.mobileNumber,
    };
    
    await set(ref(database, "users/" + user.uid), userProfile);
    
    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error("Signup Error:", error);
    let errorMessage = "An unexpected error occurred during sign up.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
