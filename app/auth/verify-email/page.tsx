'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user, isEmailVerified, sendVerificationEmail, checkEmailVerification, signOut } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Redirect if already verified
    if (isEmailVerified) {
      router.push('/dashboard');
      return;
    }
  }, [user, isEmailVerified, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;
    
    try {
      setIsResending(true);
      await sendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsChecking(true);
      const isVerified = await checkEmailVerification();
      
      if (isVerified) {
        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Email not verified yet. Please check your email and try again.');
      }
    } catch (error) {
      toast.error('Failed to check verification status.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#111111] light:bg-gray-50 flex flex-col">
      {/* Back to login link */}
      <div className="p-4">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center text-sm text-gray-400 hover:text-white light:text-gray-600 light:hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Verification card */}
          <div className="bg-[#1a1a1a] light:bg-white rounded-xl border border-white/10 light:border-gray-200 p-8 light:shadow-xl text-center">
            {/* Email icon */}
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white light:text-gray-900 mb-2">
              Verify your email
            </h1>
            
            <p className="text-gray-400 light:text-gray-600 mb-6">
              We've sent a verification link to{' '}
              <span className="font-medium text-white light:text-gray-900">
                {user.email}
              </span>
            </p>

            <div className="space-y-4">
              {/* Check verification button */}
              <Button
                onClick={handleCheckVerification}
                disabled={isChecking}
                variant="default"
                className="w-full py-3"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I've verified my email
                  </div>
                )}
              </Button>

              {/* Resend verification button */}
              <Button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                variant="outline"
                className="w-full py-3"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </div>
                ) : countdown > 0 ? (
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {countdown}s
                  </div>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400 light:text-blue-600">
                <strong>Didn't receive the email?</strong>
                <br />
                Check your spam folder or click "Resend verification email" to try again.
              </p>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 light:text-gray-600">
              Having trouble?{' '}
              <Link href="/support" className="text-blue-400 hover:text-blue-300 light:text-blue-600 light:hover:text-blue-500 transition-colors">
                Contact support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 