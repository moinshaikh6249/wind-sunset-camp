
"use server";

import { z } from "zod";
import { suggestBookingFormCompletion, SuggestBookingFormCompletionInput } from '@/ai/flows/booking-form-completion-suggester';
import { upcomingCamps } from '@/lib/mock-data';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { DecodedIdToken } from "firebase-admin/auth";
import { set, ref } from "firebase/database";

// This is a helper function to get the user from the session cookie.
async function getUser(auth: Auth): Promise<DecodedIdToken | null> {
    const sessionCookie = headers().get('__session')?.valueOf();
    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedIdToken = await auth.verifySessionCookie(sessionCookie);
        return decodedIdToken;
    } catch (error) {
        return null;
    }
}


export async function getCompletionSuggestions(
  partialForm: Record<string, string>
): Promise<Record<string, string>> {
  try {
    const availableOptions: Record<string, string[]> = {
      campName: upcomingCamps.map(camp => camp.name),
    };

    const input: SuggestBookingFormCompletionInput = {
      partialForm,
      availableOptions,
    };
    
    const campName = partialForm.campName;
    if (campName) {
      const selectedCamp = upcomingCamps.find(camp => camp.name === campName);
      if (selectedCamp) {
        input.partialForm.campDetails = `Date: ${selectedCamp.date}, Location: ${selectedCamp.location}`;
      }
    }
    
    const suggestions = await suggestBookingFormCompletion(input);
    return suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return {};
  }
}

const bookingFormSchema = z.object({
  campId: z.string(),
  numberOfPeople: z.number(),
  fullName: z.string(),
  email: z.string(),
});

export async function submitBooking(values: z.infer<typeof bookingFormSchema>) {
  try {
    const { app } = await initializeAdminApp();
    const auth = getAdminAuth(app);
    const user = await auth.getUserByEmail(values.email);


    if (!user) {
      throw new Error("User not authenticated");
    }

    const camp = upcomingCamps.find(c => c.id === values.campId);
    if (!camp) {
      throw new Error("Selected camp not found.");
    }
    
    const db = getDatabase(app);
    
    const bookingData = {
      userId: user.uid,
      campId: values.campId,
      campName: camp.name,
      numberOfPeople: values.numberOfPeople,
      bookingDate: new Date().toISOString(),
    };

    const bookingsRef = ref(db, `users/${user.uid}/bookings`);
    const newBookingRef = ref(bookingsRef, bookingData.bookingDate);
    await set(newBookingRef, bookingData);

    return { success: true };
  } catch (error: any) {
    console.error("Booking submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const { app } = await initializeAdminApp();
    const auth = getAdminAuth(app);
    const user = await getUser(auth);

    if (!user) {
      throw new Error("User not authenticated");
    }

    const db = getDatabase(app);

    await db.ref(`users/${user.uid}/bookings/${bookingId}`).remove();
    
    return { success: true };
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return { success: false, error: error.message || "Failed to cancel booking." };
  }
}
