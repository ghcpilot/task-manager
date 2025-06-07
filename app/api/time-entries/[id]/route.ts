import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getTimeEntryById,
  updateTimeEntry,
  deleteTimeEntry,
  getProjectById,
  getTasks
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';
import { Timestamp } from 'firebase/firestore';

// Schema for time entry update validation
const timeEntryUpdateSchema = z.object({
  description: z.string().optional(),
  startTime: z.string().optional().transform(val => val ? Timestamp.fromDate(new Date(val)) : undefined),
  endTime: z.string().optional().transform(val => val ? Timestamp.fromDate(new Date(val)) : undefined),
  duration: z.number().optional(),
  isRunning: z.boolean().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional().nullable()
});

// GET /api/time-entries/[id] - Get a time entry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const timeEntry = await getTimeEntryById(id);
    
    if (!timeEntry || timeEntry.userId !== user.id) {
      return NextResponse.json({ message: 'Time entry not found' }, { status: 404 });
    }
    
    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return NextResponse.json(
      { message: 'Failed to fetch time entry' },
      { status: 500 }
    );
  }
}

// PUT /api/time-entries/[id] - Update a time entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if time entry exists and belongs to user
    const existingEntry = await getTimeEntryById(id);
    
    if (!existingEntry) {
      return NextResponse.json(
        { message: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    if (existingEntry.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = timeEntryUpdateSchema.parse(body);
    
    // If projectId is changing, verify the new project belongs to user
    if (validatedData.projectId && validatedData.projectId !== existingEntry.projectId) {
      const project = await getProjectById(validatedData.projectId);
      
      if (!project || project.userId !== user.id) {
        return NextResponse.json(
          { message: 'Project not found or not owned by user' },
          { status: 404 }
        );
      }
    }
    
    // If taskId is provided, verify it belongs to the user
    if (validatedData.taskId) {
      const tasks = await getTasks(user.id);
      const task = tasks.find(t => t.id === validatedData.taskId);
      
      if (!task) {
        return NextResponse.json(
          { message: 'Task not found or does not belong to user' },
          { status: 404 }
        );
      }
    }
    
    // Calculate duration if both start and end times are provided
    let duration = validatedData.duration;
    if (validatedData.startTime && validatedData.endTime && !duration) {
      duration = Math.floor((validatedData.endTime.toDate().getTime() - validatedData.startTime.toDate().getTime()) / 1000);
    }
    
    const updateData: any = {
      ...validatedData,
      duration
    };
    
    // Stopping a timer
    if (validatedData.isRunning === false && !validatedData.endTime) {
      updateData.endTime = Timestamp.now();
      
      // Calculate and update duration
      if (existingEntry.startTime) {
        updateData.duration = Math.floor((updateData.endTime.toDate().getTime() - existingEntry.startTime.toDate().getTime()) / 1000);
      }
    }
    
    await updateTimeEntry(id, updateData);
    
    // Get updated time entry
    const updatedTimeEntry = await getTimeEntryById(id);
    
    return NextResponse.json(updatedTimeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/time-entries/[id] - Delete a time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if time entry exists and belongs to user
    const existingEntry = await getTimeEntryById(id);
    
    if (!existingEntry) {
      return NextResponse.json(
        { message: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    if (existingEntry.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await deleteTimeEntry(id);
    
    return NextResponse.json(
      { message: 'Time entry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { message: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
} 