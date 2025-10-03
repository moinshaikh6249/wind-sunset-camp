
"use server";

import { z } from "zod";
import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

// Helper function to initialize Firebase on the server if not already done.
const initializeServerApp = () => {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApps()[0];
};

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  try {
    const app = initializeServerApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: values.name,
    });

    const nameParts = values.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const userProfile = {
      firstName,
      lastName,
      email: values.email,
      phone: values.mobileNumber,
    };

    // The setDoc is now correctly awaited.
    await setDoc(doc(firestore, "users", user.uid), userProfile);
    
    return { success: true };
  } catch (error: any) {
    console.error("Signup Error:", error); // Log the full error for debugging.
    let errorMessage = "An unexpected error occurred during sign up.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code) {
        // Provide more specific firebase error messages if available
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
