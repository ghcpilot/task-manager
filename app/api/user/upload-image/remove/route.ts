import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/serverAuth';
import { getUserProfile, updateUserProfile } from '@/lib/firebaseService';
import fs from 'fs/promises';
import path from 'path';

// DELETE /api/user/upload-image/remove - Remove user profile image
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current user profile
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }
    
    // If user has a profile image, delete the file
    if (userProfile.photoURL && userProfile.photoURL.startsWith('/uploads/')) {
      const fileName = path.basename(userProfile.photoURL);
      const filePath = path.join(process.cwd(), 'public', userProfile.photoURL);
      
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Could not delete image file:', error);
        // Continue anyway - the database will be updated
      }
    }
    
    // Remove image URL from user profile
    await updateUserProfile(user.id, { photoURL: undefined });
    
    return NextResponse.json({
      message: 'Profile image removed successfully'
    });
  } catch (error) {
    console.error('Error removing profile image:', error);
    return NextResponse.json(
      { message: 'Failed to remove profile image' },
      { status: 500 }
    );
  }
} 