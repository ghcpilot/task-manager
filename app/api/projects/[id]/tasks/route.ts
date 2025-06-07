import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getTasksByProject, 
  createTask, 
  getProjectById 
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';
import { Timestamp } from 'firebase/firestore';

// Schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional().transform(val => val ? Timestamp.fromDate(new Date(val)) : undefined),
});

// GET /api/projects/[id]/tasks - Get all tasks for a specific project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify project belongs to user
    const project = await getProjectById(id);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    const tasks = await getTasksByProject(id);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch project tasks' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/tasks - Create a new task for a specific project
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify project belongs to user
    const project = await getProjectById(id);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const validatedData = taskSchema.parse(body);
    
    const task = await createTask({
      ...validatedData,
      projectId: id,
      userId: user.id
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create task' },
      { status: 500 }
    );
  }
} 