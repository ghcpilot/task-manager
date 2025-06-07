import { NextRequest, NextResponse } from 'next/server';
import { getProjectStats } from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';

// GET /api/user/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const stats = await getProjectStats(user.id);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
} 