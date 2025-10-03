
"use server";

import { z } from "zod";
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(10),
  password: z.string().min(8),
});

export async function submitSignupForm(values: z.infer<typeof formSchema>) {
  try {
    const { app } = await initializeAdminApp();
    const auth = getAdminAuth(app);
    const db = getDatabase(app);

    const userRecord = await auth.createUser({
      email: values.email,
      password: values.password,
      displayName: values.name,
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
    
    // Use the ref from 'firebase-admin/database'
    const dbRef = db.ref(`users/${userRecord.uid}`);
    await dbRef.set(userProfile);
    
    return { success: true, userId: userRecord.uid };
  } catch (error: any) {
    console.error("Signup Error:", error);
    let errorMessage = "An unexpected error occurred during sign up.";
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-password') {
        errorMessage = 'Password is too weak. It must be at least 6 characters long.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
