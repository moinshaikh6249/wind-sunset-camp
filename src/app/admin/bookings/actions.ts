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
            throw new Error('Permission denied. You must be an administrator.');
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}`);
        await bookingRef.remove();
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error canceling booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function approveBooking(idToken: string, userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const adminApp = initializeAdminApp();
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(idToken);
        if (!decodedToken.isAdmin) {
            throw new Error('Permission denied. You must be an administrator.');
        }

        const db = getDatabase(adminApp);
        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}/status`);
        await bookingRef.set('Approved');
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error approving booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
