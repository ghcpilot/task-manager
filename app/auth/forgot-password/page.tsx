'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Button from '@/components/ui/Button';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSubmitted(true);
      toast.success('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email address');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many requests. Please try again later');
          break;
        default:
          toast.error('Failed to send password reset email. Please try again');
      }
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col">
        {/* Back to login link */}
        <div className="p-4">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">Check your email</h1>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to{' '}
                <span className="text-white font-medium">{getValues('email')}</span>
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send another email
                </Button>
                
                <Link href="/auth/login">
                  <Button variant="default" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Back to login link */}
      <div className="p-4">
        <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">Reset your password</h1>
              <p className="text-gray-400 mt-2">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-[#222222] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              {/* Submit button */}
              <Button 
                type="submit" 
                variant="default" 
                className="w-full py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </div>
          
          {/* Sign in link */}
          <div className="mt-6 text-center text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-white hover:underline">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 