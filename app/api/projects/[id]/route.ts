import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getProjectById, 
  updateProject, 
  deleteProject,
  getTasksByProject 
} from '@/lib/firebaseService';
import { getAuthUser } from '@/lib/serverAuth';

// Schema for project validation
const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required').optional(),
});

// GET /api/projects/[id] - Get a specific project
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const project = await getProjectById(id);
    
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    // Get tasks for this project
    const tasks = await getTasksByProject(id);
    
    return NextResponse.json({
      ...project,
      tasks
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a specific project
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const project = await getProjectById(id);
    
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const validatedData = projectUpdateSchema.parse(body);
    
    await updateProject(id, validatedData);
    
    return NextResponse.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const project = await getProjectById(id);
    
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
    await deleteProject(id);
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    );
  }
}