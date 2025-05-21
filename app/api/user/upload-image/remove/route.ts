import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

// Define user interface with profileImage
interface UserWithProfileImage {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  [key: string]: any;
}

// Get the user from the JWT token
async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret'
    ) as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    return user as UserWithProfileImage | null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If the user has a profile image, attempt to delete the file
    if (user.profileImage) {
      try {
        // Extract the filename from the path
        const filename = user.profileImage.split('/').pop();
        
        if (filename) {
          // Construct the full path to the file
          const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
          
          // Check if file exists and delete it
          await fs.access(filePath);
          await fs.unlink(filePath);
        }
      } catch (fileError) {
        // Just log errors with file deletion - we'll still update the database
        console.error('Error deleting profile image file:', fileError);
      }
    }

    // Update the user record to remove the profile image reference
    // Using type assertion to handle profileImage field
    const updatedUser = await (prisma.user.update as any)({
      where: { id: user.id },
      data: {
        profileImage: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile image removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing profile image:', error);
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 