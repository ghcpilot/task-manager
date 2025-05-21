import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// Schema for time entry validation
const timeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.string().transform(val => new Date(val)),
  endTime: z.string().optional().transform(val => val ? new Date(val) : undefined),
  duration: z.number().optional(),
  isRunning: z.boolean().default(false),
  projectId: z.string(),
  taskId: z.string().optional()
});

// Work around TypeScript not recognizing the new model
// This is safe because we've already run the migration and generated the client
const prismaWithTimeEntry = prisma as PrismaClient & {
  timeEntry: any
};

// GET /api/time-entries - Get all time entries for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const taskId = url.searchParams.get('taskId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build filter conditions
    const whereClause: any = { userId: user.id };
    
    if (projectId) {
      whereClause.projectId = projectId;
    }
    
    if (taskId) {
      whereClause.taskId = taskId;
    }
    
    // Date filtering
    if (startDate || endDate) {
      whereClause.startTime = {};
      
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate);
      }
    }
    
    const timeEntries = await prismaWithTimeEntry.timeEntry.findMany({
      where: whereClause,
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
      },
      orderBy: {
        startTime: 'desc'
      }
    });
    
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
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = timeEntrySchema.parse(body);
    
    // Verify project belongs to user
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
    
    // If taskId is provided, verify it belongs to the specified project
    if (validatedData.taskId) {
      const task = await prisma.task.findUnique({
        where: {
          id: validatedData.taskId,
          projectId: validatedData.projectId
        }
      });
      
      if (!task) {
        return NextResponse.json(
          { message: 'Task not found or does not belong to the specified project' },
          { status: 404 }
        );
      }
    }
    
    // Calculate duration if both start and end times are provided
    let duration = validatedData.duration;
    if (validatedData.startTime && validatedData.endTime && !duration) {
      duration = Math.floor((validatedData.endTime.getTime() - validatedData.startTime.getTime()) / 1000);
    }
    
    const timeEntry = await prismaWithTimeEntry.timeEntry.create({
      data: {
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        duration,
        isRunning: validatedData.isRunning,
        userId: user.id,
        projectId: validatedData.projectId,
        taskId: validatedData.taskId
      },
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