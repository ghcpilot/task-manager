'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const step2Schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [userData, setUserData] = useState<{name: string, email: string}>({
    name: '',
    email: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { register: signUp, loginWithGoogle } = useAuth();

  // Step 1 form
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
    },
  });

  // Step 2 form
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmitStep1 = (data: Step1FormData) => {
    setUserData({
      name: data.name,
      email: data.email
    });
    setStep(2);
  };

  const onSubmitStep2 = async (data: Step2FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await signUp(userData.name, userData.email, data.password);
      toast.success('Account created successfully');
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('An unexpected error occurred');
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('Failed to login with Google');
        toast.error('Failed to login with Google');
      }
      setIsGoogleLoading(false);
    }
    // No finally block because we're redirecting
  };

  return (
    <div className="bg-[#111111] rounded-xl shadow-lg p-8 space-y-6">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">Sign up</h1>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a0d2c] border-l-4 border-red-500 pl-3 pr-4 py-2 rounded-sm text-xs text-gray-300"
        >
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {step === 1 ? (
        // Step 1: Name and Email
        <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-white">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              {...registerStep1('name')}
              className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
            {errorsStep1.name && (
              <p className="text-red-400 text-xs mt-1">{errorsStep1.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Your email address"
              {...registerStep1('email')}
              className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
            {errorsStep1.email && (
              <p className="text-red-400 text-xs mt-1">{errorsStep1.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-white/90 text-black font-medium py-2.5 px-4 rounded-lg transition-colors mt-2"
          >
            Continue
          </button>
          
          <div className="relative flex items-center justify-center mt-6 mb-6">
            <div className="border-t border-gray-800 w-full"></div>
            <span className="bg-[#111111] text-gray-500 text-xs px-2 absolute">OR</span>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#292929] text-white font-medium py-2.5 px-4 rounded-lg border border-[#2e2e2e] transition-colors"
          >
            {isGoogleLoading ? (
              <span className="h-4 w-4 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></span>
            ) : (
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6,20H24v8h11.3c-1.1,5.2-5.7,9-11.3,9c-6.6,0-12-5.4-12-12s5.4-12,12-12c3.1,0,5.8,1.2,8,3l6-6 C33.7,6.1,29.1,4,24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20C44,22.6,43.9,21.3,43.6,20z"></path>
                <path fill="#FF3D00" d="M6.3,14.7l7,5.4c1.8-4.5,6.2-7.7,11.2-7.7c3.1,0,5.8,1.2,8,3l6-6c-4.3-3.8-10-6.4-15.5-6.4 C15.1,3,8.1,7.8,6.3,14.7z"></path>
                <path fill="#4CAF50" d="M24,44c5.2,0,9.9-1.8,13.6-4.9l-6.6-5.5c-2,1.4-4.6,2.4-7,2.4c-5.6,0-10.2-3.8-11.3-8.9l-7.2,5.5 C8.9,39.1,16.1,44,24,44z"></path>
                <path fill="#1976D2" d="M43.6,20H24v8h11.3c-0.5,2.5-2,4.6-4.1,6l6.6,5.5c3.8-3.5,6.2-8.7,6.2-14.5C44,22.6,43.9,21.3,43.6,20z"></path>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-white hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      ) : (
        // Step 2: Passwords
        <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">
              Creating account for {userData.email}
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-white">New Password</label>
            <input
              type="password"
              id="password"
              placeholder="Minimum 8 characters"
              {...registerStep2('password')}
              className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
            {errorsStep2.password && (
              <p className="text-red-400 text-xs mt-1">{errorsStep2.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Re-enter your password"
              {...registerStep2('confirmPassword')}
              className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-white"
            />
            {errorsStep2.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errorsStep2.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-black font-medium py-2.5 px-4 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="h-4 w-4 border-2 border-black/30 border-t-black/80 rounded-full animate-spin mr-2"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1 text-gray-400 hover:text-white text-sm py-2 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          </div>
        </form>
      )}
      
      <div className="text-center text-xs text-gray-500 mt-8">
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
} 