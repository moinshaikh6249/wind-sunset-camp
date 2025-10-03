
"use server";

import { z } from "zod";
import { getAuth } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { getSdks, initializeFirebase } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  // We are not using the Firebase Admin SDK here because we want the user
  // to be authenticated on the client-side after signing up.
  // The client-side SDK handles this automatically.
  // We initialize the app here to be able to use the client SDK on the server.
  const { auth, firestore } = initializeFirebase();

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
    
    // We are using the user's UID as the document ID in the 'users' collection.
    await setDoc(doc(firestore, "users", user.uid), userProfile);
    
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
