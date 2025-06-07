import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Get project ID from environment or fallback to hardcoded value
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'task-mates-1a798';

let adminApp;

if (!getApps().length) {
  try {
    // Try to initialize with service account (production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: PROJECT_ID,
      });
    } else {
      // Development mode - use project ID only (for Firebase Auth verification)
      adminApp = initializeApp({
        projectId: PROJECT_ID,
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback initialization with just project ID
    adminApp = initializeApp({
      projectId: PROJECT_ID,
    });
  }
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export { adminApp }; 