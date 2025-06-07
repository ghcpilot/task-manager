import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  updateTask, 
  deleteTask,
  getTasks
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';
import { Timestamp } from 'firebase/firestore';

// Schema for task validation
const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().transform(val => val ? Timestamp.fromDate(new Date(val)) : undefined),
  projectId: z.string().optional(),
});

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all user tasks and find the specific one
    const tasks = await getTasks(user.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { message: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a specific task
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = taskUpdateSchema.parse(body);
    
    // Verify task belongs to user
    const tasks = await getTasks(user.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    
    await updateTask(id, validatedData);
    
    return NextResponse.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify task belongs to user
    const tasks = await getTasks(user.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    
    await deleteTask(id);
    
    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { message: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 