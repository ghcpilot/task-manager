import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createTimeEntry, 
  getTimeEntries, 
  getProjectById,
  getTasks
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';
import { Timestamp } from 'firebase/firestore';

// Schema for time entry validation
const timeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.string().transform(val => Timestamp.fromDate(new Date(val))),
  endTime: z.string().optional().transform(val => val ? Timestamp.fromDate(new Date(val)) : undefined),
  duration: z.number().optional(),
  isRunning: z.boolean().default(false),
  projectId: z.string(),
  taskId: z.string().optional()
});

// GET /api/time-entries - Get all time entries for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const filters: any = {};
    if (projectId) filters.projectId = projectId;
    if (taskId) filters.taskId = taskId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    const timeEntries = await getTimeEntries(user.id, filters);
    
    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { message: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

// POST /api/time-entries - Create a new time entry
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = timeEntrySchema.parse(body);
    
    // Verify project exists and belongs to user
    const project = await getProjectById(validatedData.projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    // If taskId is provided, verify it exists and belongs to the project
    if (validatedData.taskId) {
      const tasks = await getTasks(user.id, validatedData.projectId);
      const task = tasks.find(t => t.id === validatedData.taskId);
      if (!task) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      }
    }
    
    const timeEntry = await createTimeEntry({
      ...validatedData,
      userId: user.id
    });
    
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create time entry' },
      { status: 500 }
    );
  }
} 