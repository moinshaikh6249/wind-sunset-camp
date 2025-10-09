'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

async function verifyAdmin(idToken: string) {
    if (!idToken) {
        throw new Error('Authentication token is missing. Access denied.');
    }
    
    const app = initializeAdminApp();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.isAdmin !== true) {
        throw new Error('Permission denied. You must be an administrator.');
    }
}

export async function toggleReviewVisibility(idToken: string, reviewId: string, currentVisibility: boolean) {
    await verifyAdmin(idToken);
    
    try {
        const app = initializeAdminApp();
        const firestore = getFirestore(app);
        const reviewRef = firestore.collection('reviews').doc(reviewId);
        await reviewRef.update({ visible: !currentVisibility });
        revalidatePath('/admin/reviews');
        revalidatePath('/reviews');
    } catch (error: any) {
        console.error('Error toggling review visibility:', error);
        throw new Error(error.message || 'An unexpected error occurred.');
    }
}

export async function toggleReviewPinned(idToken: string, reviewId: string, currentPinnedStatus: boolean) {
    await verifyAdmin(idToken);

    try {
        const app = initializeAdminApp();
        const firestore = getFirestore(app);
        const reviewRef = firestore.collection('reviews').doc(reviewId);
        await reviewRef.update({ pinned: !currentPinnedStatus });
        revalidatePath('/admin/reviews');
        revalidatePath('/reviews');
    } catch (error: any) {
        console.error('Error toggling review pinned status:', error);
        throw new Error(error.message || 'An unexpected error occurred.');
    }
}

export async function deleteReview(idToken: string, reviewId: string) {
    await verifyAdmin(idToken);

    try {
        const app = initializeAdminApp();
        const firestore = getFirestore(app);
        const reviewRef = firestore.collection('reviews').doc(reviewId);
        await reviewRef.delete();
        revalidatePath('/admin/reviews');
        revalidatePath('/reviews');
    } catch (error: any) {
        console.error('Error deleting review:', error);
        throw new Error(error.message || 'An unexpected error occurred.');
    }
}
