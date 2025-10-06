'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { revalidatePath } from 'next/cache';
import { initializeAdminApp } from '@/lib/firebase-admin';

/**
 * Approves a booking by setting its status to 'Approved'.
 * This is a secure server action that can only be performed by an admin.
 * 
 * @param idToken - The Firebase ID token of the user making the request.
 * @param userId - The UID of the user who owns the booking.
 * @param bookingId - The ID of the booking to approve.
 */
export async function approveBooking(idToken: string, userId: string, bookingId: string) {
    if (!idToken) {
        throw new Error('Authentication token is missing. Access denied.');
    }

    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (!decodedToken.isAdmin) {
            throw new Error('Permission denied. You must be an administrator to perform this action.');
        }

        const db = getDatabase(adminApp);
        // Specifically target the status field to avoid overwriting other data
        const bookingStatusRef = db.ref(`users/${userId}/bookings/${bookingId}/status`);
        await bookingStatusRef.set('Approved');
        
        // Revalidate the path to ensure the UI updates with the new data.
        revalidatePath('/admin/bookings');

    } catch (error: any) {
        console.error('Error approving booking:', error);
        // Rethrow a clear error message for the client to display.
        throw new Error(error.message || 'An unexpected error occurred while approving the booking.');
    }
}

/**
 * Cancels and removes a booking.
 * This is a secure server action that can only be performed by an admin.
 * 
 * @param idToken - The Firebase ID token of the user making the request.
 * @param userId - The UID of the user who owns the booking.
 * @param bookingId - The ID of the booking to cancel.
 */
export async function cancelBooking(idToken: string, userId: string, bookingId: string) {
    if (!idToken) {
        throw new Error('Authentication token is missing. Access denied.');
    }
    
    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        
        const decodedToken = await auth.verifyIdToken(idToken);
        if (!decodedToken.isAdmin) {
            throw new Error('Permission denied. You must be an administrator to perform this action.');
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}`);
        await bookingRef.remove();
        
        revalidatePath('/admin/bookings');
    } catch (error: any) {
        console.error('Error canceling booking:', error);
        throw new Error(error.message || 'An unexpected error occurred while canceling the booking.');
    }
}
