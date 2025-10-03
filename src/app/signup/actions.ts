
"use server";

import { z } from "zod";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeAdminApp } from "@/lib/firebase-admin";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  try {
    const { app } = await initializeAdminApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const userRecord: UserRecord = await auth.createUser({
      email: values.email,
      password: values.password,
      displayName: values.name,
      phoneNumber: values.mobileNumber,
    });

    const nameParts = values.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const userProfile = {
      firstName,
      lastName,
      email: values.email,
      phone: values.mobileNumber,
    };

    await firestore.collection("users").doc(userRecord.uid).set(userProfile);
    
    return { success: true };
  } catch (error: any) {
    console.error("Signup Error:", error);
    let errorMessage = "An unexpected error occurred during sign up.";
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
