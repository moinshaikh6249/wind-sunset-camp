
"use server";

import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function submitLoginForm(values: z.infer<typeof formSchema>) {
  // This is a mock function. In a real application, you would
  // use a library like Firebase Auth, NextAuth.js, or Lucia to handle authentication.
  console.log("Login attempt:", values);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate a successful login for a specific user for demo purposes
  if (values.email === "user@example.com" && values.password === "password") {
    return { success: true };
  }

  return { success: false, error: "Invalid email or password." };
}
