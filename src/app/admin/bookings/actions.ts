
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { revalidatePath } from 'next/cache';
import { initializeAdminApp } from '@/lib/firebase-admin';

export async function cancelBooking(idToken: string, userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (!decodedToken.isAdmin) {
            return { success: false, error: 'Permission denied. You must be an administrator.' };
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}`);
        await bookingRef.remove();
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error canceling booking:', error);
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return { success: false, error: 'Authentication failed. Please log in again.' };
        }
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function approveBooking(idToken: string, userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(idToken);

        if (!decodedToken.isAdmin) {
            return { success: false, error: 'Permission denied. You must be an administrator.' };
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}/status`);
        await bookingRef.set('Approved');
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error approving booking:', error);
         if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return { success: false, error: 'Authentication failed. Please log in again.' };
        }
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

type BookingUpdateData = {
    campId: string;
    campName: string;
    numberOfPeople: number;
    status: 'Pending' | 'Approved' | 'Canceled';
}

export async function updateBooking(idToken: string, userId: string, bookingId: string, data: Partial<BookingUpdateData>): Promise<{ success: boolean; error?: string }> {
    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(idToken);

        if (!decodedToken.isAdmin) {
            return { success: false, error: 'Permission denied. You must be an administrator.' };
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}`);
        
        // Fetch existing booking to merge with new data
        const snapshot = await bookingRef.once('value');
        const existingBooking = snapshot.val();
        
        const updatedBooking = {
            ...existingBooking,
            ...data
        };

        await bookingRef.update(updatedBooking);
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating booking:', error);
         if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
            return { success: false, error: 'Authentication failed. Please log in again.' };
        }
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
