import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

interface ExternalSheet {
  id: string;
  userId: string;
  sheetName: string;
  sheetUrl: string;
  accessToken?: string;
  isConnected: boolean;
  lastSync?: Date;
  createdAt: Date;
}

// GET - Fetch external sheet configuration for a user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const sheetRef = db.collection('external-sheets');
    const snapshot = await sheetRef.where('userId', '==', userId).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json(null);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    const externalSheet: ExternalSheet = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastSync: data.lastSync?.toDate(),
    } as ExternalSheet;

    return NextResponse.json(externalSheet);
  } catch (error) {
    console.error('Error fetching external sheet:', error);
    return NextResponse.json({ error: 'Failed to fetch external sheet' }, { status: 500 });
  }
}

// POST - Create or update external sheet configuration
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { sheetName, sheetUrl, accessToken } = body;

    // Validate required fields
    if (!sheetName || !sheetUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(sheetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if user already has an external sheet configured
    const existingSnapshot = await db.collection('external-sheets')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    const sheetData = {
      userId,
      sheetName,
      sheetUrl,
      accessToken: accessToken || null,
      isConnected: await testSheetConnection(sheetUrl, accessToken),
      lastSync: null,
      updatedAt: new Date(),
    };

    let docRef;
    if (!existingSnapshot.empty) {
      // Update existing sheet
      docRef = existingSnapshot.docs[0].ref;
      await docRef.update(sheetData);
    } else {
      // Create new sheet
      const newSheetData = {
        ...sheetData,
        createdAt: new Date(),
      };
      docRef = await db.collection('external-sheets').add(newSheetData);
    }

    // Fetch the updated/created document
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    const externalSheet: ExternalSheet = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt?.toDate() || new Date(),
      lastSync: updatedData?.lastSync?.toDate(),
    } as ExternalSheet;

    return NextResponse.json(externalSheet);
  } catch (error) {
    console.error('Error configuring external sheet:', error);
    return NextResponse.json({ error: 'Failed to configure external sheet' }, { status: 500 });
  }
}

// DELETE - Remove external sheet configuration
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const snapshot = await db.collection('external-sheets')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'External sheet not found' }, { status: 404 });
    }

    await snapshot.docs[0].ref.delete();

    return NextResponse.json({ message: 'External sheet configuration removed successfully' });
  } catch (error) {
    console.error('Error deleting external sheet:', error);
    return NextResponse.json({ error: 'Failed to remove external sheet' }, { status: 500 });
  }
}

// Helper function to test sheet connection
async function testSheetConnection(sheetUrl: string, accessToken?: string): Promise<boolean> {
  try {
    // For Google Sheets, we can test by making a simple API call
    if (sheetUrl.includes('docs.google.com/spreadsheets')) {
      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        return false;
      }

      const sheetId = sheetIdMatch[1];
      
      // Try to access sheet metadata (this is a basic test)
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title`;
      
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(testUrl, { headers });
      return response.ok;
    }

    // For other sheet types, we can add more specific tests
    // For now, assume connection is possible if URL is valid
    return true;
  } catch (error) {
    console.error('Error testing sheet connection:', error);
    return false;
  }
} 