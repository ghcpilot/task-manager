import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// GET /api/tasks - Get all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          userId: user.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true, 
            color: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first, then in-progress, then completed
        { updatedAt: 'desc' }
      ]
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 