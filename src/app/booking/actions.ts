
"use server";

import { z } from "zod";
import { suggestBookingFormCompletion, SuggestBookingFormCompletionInput } from '@/ai/flows/booking-form-completion-suggester';
import { upcomingCamps } from '@/lib/mock-data';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';

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
});

export async function submitBooking(values: z.infer<typeof bookingFormSchema>) {
  try {
    const { app } = await initializeAdminApp();
    const auth = getAuth(app);
    // This is a placeholder for getting the current user. In a real app, you'd get this from the session.
    // For this example, we'll assume a hardcoded user for demonstration.
    // In a real app you would get the user from the session cookie.
    // This is a placeholder.
    const user = { uid: "NEEDS-A-REAL-USER-ID" }; 

    if (!user) {
      throw new Error("User not authenticated");
    }

    const camp = upcomingCamps.find(c => c.id === values.campId);
    if (!camp) {
      throw new Error("Selected camp not found.");
    }
    
    const firestore = getFirestore(app);
    
    const bookingData = {
      userId: user.uid,
      campId: values.campId,
      campName: camp.name,
      numberOfPeople: values.numberOfPeople,
      bookingDate: new Date().toISOString(),
    };

    await firestore.collection('users').doc(user.uid).collection('bookings').add(bookingData);

    return { success: true };
  } catch (error: any) {
    console.error("Booking submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const { app } = await initializeAdminApp();
    const firestore = getFirestore(app);
    const user = { uid: "NEEDS-A-REAL-USER-ID" }; // Placeholder

    if (!user) {
      throw new Error("User not authenticated");
    }

    await firestore.collection('users').doc(user.uid).collection('bookings').doc(bookingId).delete();
    
    return { success: true };
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return { success: false, error: error.message || "Failed to cancel booking." };
  }
}
