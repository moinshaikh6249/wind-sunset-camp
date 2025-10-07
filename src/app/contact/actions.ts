
"use server";

import { z } from "zod";
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from "next/cache";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email(),
  subject: z.string().min(5, "Subject is required."),
  message: z.string().min(10, "Message is required."),
});

export async function submitContactForm(values: z.infer<typeof formSchema>) {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) {
      // This will be caught by the try/catch in the client component
      throw new Error(parsed.error.errors.map(e => e.message).join(', '));
  }

  try {
    const app = initializeAdminApp();
    const db = getDatabase(app);
    
    const messageData = {
      ...parsed.data,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const messagesRef = db.ref('contactMessages');
    await messagesRef.push(messageData);

    // Revalidate the path to ensure the admin sees the new message immediately
    revalidatePath('/admin/messages');

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting contact form:", error);
    // Return a structured error for the client
    return { success: false, error: error.message || "An unexpected server error occurred." };
  }
}
