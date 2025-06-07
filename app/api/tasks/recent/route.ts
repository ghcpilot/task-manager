import { NextRequest, NextResponse } from 'next/server';
import { getTasks } from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';

// GET /api/tasks/recent - Get recent tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all tasks for the user
    const allTasks = await getTasks(user.id);
    
    // Filter for recent tasks (last 7 days) and limit to 10
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTasks = allTasks
      .filter(task => {
        let taskDate: Date;
        if (task.createdAt && typeof task.createdAt === 'object' && 'toDate' in task.createdAt) {
          taskDate = task.createdAt.toDate();
        } else {
          taskDate = new Date(task.createdAt as string);
        }
        return taskDate >= sevenDaysAgo;
      })
      .sort((a, b) => {
        let dateA: Date;
        let dateB: Date;
        
        if (a.createdAt && typeof a.createdAt === 'object' && 'toDate' in a.createdAt) {
          dateA = a.createdAt.toDate();
        } else {
          dateA = new Date(a.createdAt as string);
        }
        
        if (b.createdAt && typeof b.createdAt === 'object' && 'toDate' in b.createdAt) {
          dateB = b.createdAt.toDate();
        } else {
          dateB = new Date(b.createdAt as string);
        }
        
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
    
    return NextResponse.json(recentTasks);
  } catch (error) {
    console.error('Error fetching recent tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch recent tasks' },
      { status: 500 }
    );
  }
} 