import { NextRequest } from 'next/server';
import { adminAuth } from './firebaseAdmin';

// Development mode flag - set to false in production
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

// Helper function to get user from Firebase ID token (for API routes)
export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      return { id: decodedToken.uid, email: decodedToken.email };
    } catch (adminError: any) {
      console.warn('Firebase Admin auth failed:', adminError.message);
      
      // In development mode, we can extract user info from the token without verification
      // This is NOT secure and should only be used for development
      if (DEVELOPMENT_MODE) {
        try {
          // Decode the JWT token without verification (development only)
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Development mode: Using unverified token payload');
          return { 
            id: payload.user_id || payload.sub, 
            email: payload.email || 'dev@example.com' 
          };
        } catch (decodeError) {
          console.error('Failed to decode token in development mode:', decodeError);
          return null;
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 