import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// Schema for time entry update validation
const timeEntryUpdateSchema = z.object({
  description: z.string().optional(),
  startTime: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endTime: z.string().optional().transform(val => val ? new Date(val) : undefined),
  duration: z.number().optional(),
  isRunning: z.boolean().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional().nullable()
});

// Work around TypeScript not recognizing the new model
// This is safe because we've already run the migration and generated the client
const prismaWithTimeEntry = prisma as PrismaClient & {
  timeEntry: any
};

// GET /api/time-entries/[id] - Get a time entry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const timeEntry = await prismaWithTimeEntry.timeEntry.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            userId: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });
    
    if (!timeEntry) {
      return NextResponse.json(
        { message: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    // Verify that the time entry belongs to the authenticated user
    if (timeEntry.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if time entry exists and belongs to user
    const existingEntry = await prismaWithTimeEntry.timeEntry.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        projectId: true
      }
    });
    
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
      const project = await prisma.project.findUnique({
        where: {
          id: validatedData.projectId,
          userId: user.id
        }
      });
      
      if (!project) {
        return NextResponse.json(
          { message: 'Project not found or not owned by user' },
          { status: 404 }
        );
      }
    }
    
    // If taskId is provided, verify it belongs to the project
    if (validatedData.taskId) {
      const projectId = validatedData.projectId || existingEntry.projectId;
      
      const task = await prisma.task.findUnique({
        where: {
          id: validatedData.taskId,
          projectId
        }
      });
      
      if (!task) {
        return NextResponse.json(
          { message: 'Task not found or does not belong to the project' },
          { status: 404 }
        );
      }
    }
    
    // Calculate duration if both start and end times are provided
    let duration = validatedData.duration;
    if (validatedData.startTime && validatedData.endTime && !duration) {
      duration = Math.floor((validatedData.endTime.getTime() - validatedData.startTime.getTime()) / 1000);
    }
    
    const updateData: any = {
      ...validatedData,
      duration
    };
    
    // Stopping a timer
    if (validatedData.isRunning === false && !validatedData.endTime) {
      updateData.endTime = new Date();
      
      // Calculate and update duration
      const timeEntry = await prismaWithTimeEntry.timeEntry.findUnique({
        where: { id },
        select: { startTime: true }
      });
      
      if (timeEntry && timeEntry.startTime) {
        updateData.duration = Math.floor((updateData.endTime.getTime() - timeEntry.startTime.getTime()) / 1000);
      }
    }
    
    const updatedTimeEntry = await prismaWithTimeEntry.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });
    
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if time entry exists and belongs to user
    const timeEntry = await prismaWithTimeEntry.timeEntry.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });
    
    if (!timeEntry) {
      return NextResponse.json(
        { message: 'Time entry not found' },
        { status: 404 }
      );
    }
    
    if (timeEntry.userId !== user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete the time entry
    await prismaWithTimeEntry.timeEntry.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { message: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
} 