import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal that a user doesn't exist for security
    if (!user) {
      return NextResponse.json(
        { message: 'If a user with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Create reset URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
      : 'http://localhost:3000';
    
    const resetUrl = `${baseUrl}/auth/reset-password/${resetToken}`;

    // Configure nodemailer with Ethereal for development
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      secure: false, // true for 465, false for other ports
    });

    // Email content
    const message = {
      from: process.env.EMAIL_FROM || 'noreply@timemate.app',
      to: user.email,
      subject: 'TimeMate Password Reset',
      html: `
        <h1>Reset Your Password</h1>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your TimeMate account.</p>
        <p>Please click the button below to set a new password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #6d28d9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Thank you,<br>The TimeMate Team</p>
      `,
    };

    // Send email
    await transporter.sendMail(message);

    return NextResponse.json(
      { message: 'If a user with that email exists, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 