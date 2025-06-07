import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, type, rating, message, submittedAt } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate feedback type
    const validTypes = ['general', 'bug', 'feature', 'improvement'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Save feedback to Firestore
    const feedbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      rating: Number(rating),
      message: message.trim(),
      submittedAt: submittedAt || new Date().toISOString(),
      createdAt: serverTimestamp(),
      status: 'new', // new, reviewed, resolved
      resolved: false,
    };

    const docRef = await addDoc(collection(db, 'feedback'), feedbackData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This could be used by admin to fetch feedback
  // For now, return method not allowed for public access
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 