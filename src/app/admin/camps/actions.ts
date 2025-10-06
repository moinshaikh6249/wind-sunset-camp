
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const app = initializeAdminApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Helper function to verify the admin token.
async function verifyAdmin(idToken: string) {
    if (!idToken) {
        throw new Error('Authentication token is missing. Access denied.');
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check for custom admin claim OR if the user is in the admin list in RTDB
    const adminRef = db.ref(`admins/${decodedToken.uid}`);
    const adminSnapshot = await adminRef.once('value');

    if (!decodedToken.isAdmin && !adminSnapshot.exists()) {
        throw new Error('Permission denied. You must be an administrator.');
    }
}

const campSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3),
    date: z.string().min(3),
    location: z.string().min(3),
    description: z.string().min(10),
    image: z.object({
        id: z.string(),
        imageUrl: z.string().url(),
        imageHint: z.string(),
    }),
});

export async function createOrUpdateCamp(idToken: string, campData: z.infer<typeof campSchema>) {
    await verifyAdmin(idToken);

    const parsed = campSchema.safeParse(campData);
    if (!parsed.success) {
        throw new Error(`Invalid camp data: ${parsed.error.errors.map(e => e.message).join(', ')}`);
    }

    const { id, ...data } = parsed.data;
    const campId = id || db.ref('camps').push().key;

    if (!campId) {
        throw new Error("Failed to generate a new camp ID.");
    }
    
    try {
        const campRef = db.ref(`camps/${campId}`);
        await campRef.set({ ...data, id: campId });
        revalidatePath('/admin/camps');
        revalidatePath('/camps');
    } catch (error: any) {
        console.error('Error saving camp:', error);
        throw new Error('An unexpected error occurred while saving the camp.');
    }
}

export async function deleteCamp(idToken: string, campId: string, imageUrl?: string) {
    await verifyAdmin(idToken);
    
    if (!campId) {
        throw new Error("Camp ID is required for deletion.");
    }
    
    try {
        // Delete from Realtime Database
        const campRef = db.ref(`camps/${campId}`);
        await campRef.remove();

        // Delete image from Storage if URL is provided
        if (imageUrl) {
            try {
                // Extract the file path from the full URL
                const fileRef = storage.bucket().file(new URL(imageUrl).pathname.split('/').slice(3).join('/'));
                await fileRef.delete();
            } catch (storageError: any) {
                // If the file doesn't exist in storage, we can ignore the error
                // as the primary goal (deleting DB entry) is achieved.
                if (storageError.code !== 404) {
                     console.error(`Failed to delete image from storage: ${imageUrl}`, storageError);
                }
            }
        }
        
        revalidatePath('/admin/camps');
        revalidatePath('/camps');

    } catch (error: any) {
        console.error('Error deleting camp:', error);
        throw new Error('An unexpected error occurred while deleting the camp.');
    }
}
