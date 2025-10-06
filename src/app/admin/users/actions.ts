
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// This helper function verifies the admin token.
async function verifyAdmin(idToken: string) {
    if (!idToken) {
        throw new Error('Authentication token is missing. Access denied.');
    }
    
    const app = initializeAdminApp();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (!decodedToken.isAdmin) {
        throw new Error('Permission denied. You must be an administrator.');
    }
}

const createUserSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters."),
});

// This is the main server action for creating a user.
export async function createUser(idToken: string, values: z.infer<typeof createUserSchema>) {
    await verifyAdmin(idToken);

    const parsed = createUserSchema.safeParse(values);
    if (!parsed.success) {
        throw new Error(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { firstName, lastName, email, password } = parsed.data;

    try {
        const app = initializeAdminApp();
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Step 1: Create the user in Firebase Authentication.
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName || ''}`.trim(),
        });

        // Step 2: Add the user's profile to the Realtime Database.
        const userRef = db.ref(`users/${userRecord.uid}`);
        await userRef.set({
            firstName,
            lastName: lastName || '',
            email,
            photoURL: "", // Default empty photo URL
            phone: "", // Default empty phone
        });

        // Step 3: Add a signup event to the user's history log.
        const historyRef = db.ref(`users/${userRecord.uid}/history/${Date.now()}`);
        await historyRef.set({
            type: 'signup',
            description: 'Account created by admin',
            timestamp: new Date().toISOString(),
        });
        
        // Step 4: Revalidate the users page to show the new user.
        revalidatePath('/admin/users');

    } catch (error: any) {
        console.error('Error creating user:', error);
        // Provide a more user-friendly error message.
        if (error.code === 'auth/email-already-exists') {
            throw new Error('A user with this email already exists.');
        }
        throw new Error(error.message || 'An unexpected error occurred while creating the user.');
    }
}

export async function deleteUser(idToken: string, uid: string) {
    await verifyAdmin(idToken);
    
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
    } catch (error: any) {
        console.error('Error deleting user:', error);
        throw new Error(error.message || 'An unexpected error occurred while deleting the user.');
    }
}
