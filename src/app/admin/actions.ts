
"use server";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // This function is running on the server, so we can't set cookies directly
    // in a way that the browser will pick up for client-side routing.
    // The session management will be handled by the client-side logic in the login form.
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
