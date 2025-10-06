
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

async function getAdminUser(idToken: string): Promise<DecodedIdToken | null> {
    if (!idToken) return null;
      
    try {
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (decodedToken.isAdmin) {
            return decodedToken;
        }
        return null;
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return null;
      }
}


export async function cancelBooking(idToken: string, userId: string, bookingId: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser(idToken);
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    try {
        const { app } = await initializeAdminApp();
        const db = getDatabase(app);

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
    const adminUser = await getAdminUser(idToken);
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    try {
        const { app } = await initializeAdminApp();
        const db = getDatabase(app);

        const bookingRef = db.ref(`users/${userId}/bookings/${bookingId}/status`);
        await bookingRef.set('Approved');
        
        revalidatePath('/admin/bookings');
        return { success: true };
    } catch (error: any) {
        console.error('Error approving booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
