
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function cancelBooking(idToken: string, userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (!decodedToken.isAdmin) {
            return { success: false, error: 'Permission denied. You must be an administrator.' };
        }

        const db = getDatabase(app);
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
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const decodedToken = await auth.verifyIdToken(idToken);

        if (!decodedToken.isAdmin) {
            return { success: false, error: 'Permission denied. You must be an administrator.' };
        }

        const db = getDatabase(app);
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
