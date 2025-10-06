
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function getAdminUser(idToken: string): Promise<DecodedIdToken | null> {
    if (!idToken) return null;
      
    try {
        const app = initializeAdminApp();
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

export async function createUser(idToken: string, values: any): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser(idToken);
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    const schema = z.object({
        firstName: z.string().min(1, "First name is required."),
        lastName: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters."),
    });

    const parsed = schema.safeParse(values);

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const app = initializeAdminApp();
        const auth = getAuth(app);
        const db = getDatabase(app);

        const { firstName, lastName, email, password } = parsed.data;

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName || ''}`.trim(),
        });

        // Add user profile to Realtime Database
        const userRef = db.ref(`users/${userRecord.uid}`);
        await userRef.set({
            firstName,
            lastName: lastName || '',
            email,
            photoURL: "", // Default empty photo URL
            phone: "", // Default empty phone
        });

        // Add signup history event
        const historyRef = db.ref(`users/${userRecord.uid}/history/${Date.now()}`);
        await historyRef.set({
            type: 'signup',
            description: 'Account created by admin',
            timestamp: new Date().toISOString(),
        });
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating user:', error);
        let errorMessage = 'An unexpected error occurred.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'A user with this email already exists.';
        }
        return { success: false, error: errorMessage };
    }
}


export async function deleteUser(idToken: string, uid: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser(idToken);
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    try {
        const app = initializeAdminApp();
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Delete from Firebase Authentication
        await auth.deleteUser(uid);

        // Delete from Realtime Database
        const userRef = db.ref(`users/${uid}`);
        await userRef.remove();
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
