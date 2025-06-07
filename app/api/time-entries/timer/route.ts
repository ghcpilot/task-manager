import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getRunningTimeEntry, 
  createTimeEntry, 
  stopTimeEntry,
  getProjectById
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';
import { Timestamp } from 'firebase/firestore';

// Schema for starting a timer
const startTimerSchema = z.object({
  description: z.string().optional(),
  projectId: z.string(),
  taskId: z.string().optional()
});

// GET /api/time-entries/timer - Get current running timer
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const runningTimer = await getRunningTimeEntry(user.id);
    
    return NextResponse.json(runningTimer);
  } catch (error) {
    console.error('Error fetching running timer:', error);
    return NextResponse.json(
      { message: 'Failed to fetch running timer' },
      { status: 500 }
    );
  }
}

// POST /api/time-entries/timer - Start a new timer
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if there's already a running timer
    const existingTimer = await getRunningTimeEntry(user.id);
    if (existingTimer) {
      return NextResponse.json(
        { message: 'A timer is already running. Stop it first.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = startTimerSchema.parse(body);
    
    // Verify project exists and belongs to user
    const project = await getProjectById(validatedData.projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    const timeEntry = await createTimeEntry({
      description: validatedData.description,
      startTime: Timestamp.now(),
      isRunning: true,
      projectId: validatedData.projectId,
      taskId: validatedData.taskId,
      userId: user.id
    });
    
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error starting timer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to start timer' },
      { status: 500 }
    );
  }
}

// PUT /api/time-entries/timer - Stop the current running timer
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const runningTimer = await getRunningTimeEntry(user.id);
    if (!runningTimer) {
      return NextResponse.json(
        { message: 'No running timer found' },
        { status: 404 }
      );
    }
    
    const endTime = new Date();
    const duration = await stopTimeEntry(runningTimer.id!, endTime);
    
    return NextResponse.json({
      message: 'Timer stopped successfully',
      duration
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    return NextResponse.json(
      { message: 'Failed to stop timer' },
      { status: 500 }
    );
  }
} 