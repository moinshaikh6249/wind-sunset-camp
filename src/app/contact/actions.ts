
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
    const newMessageRef = messagesRef.push();
    await newMessageRef.set(messageData);

    revalidatePath('/admin/messages');

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
