
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';

// This is a helper function to get the user from the session cookie.
async function getAdminUser(): Promise<DecodedIdToken | null> {
    const sessionCookie = headers().get('__session')?.valueOf();
    if (!sessionCookie) {
        return null;
    }

    try {
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const decodedIdToken = await auth.verifySessionCookie(sessionCookie);
        
        // Verify the user is an admin
        if (decodedIdToken.isAdmin) {
            return decodedIdToken;
        }
        return null;
    } catch (error) {
        return null;
    }
}


export async function cancelBooking(userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser();
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    try {
        const { app } = await initializeAdminApp();
        const db = getDatabase(app);

        // Reference to the specific booking
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}`);

        // Remove the booking
        await bookingRef.remove();
        
        return { success: true };
    } catch (error: any) {
        console.error('Error canceling booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
