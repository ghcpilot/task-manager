'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, error, user, isEmailVerified, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle redirect after successful login
  useEffect(() => {
    if (user && !isLoading) {
      if (isEmailVerified) {
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        router.push('/auth/verify-email');
      }
    }
  }, [user, isEmailVerified, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#09090b] light:bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/[0.08] relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white light:text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-zinc-400 light:text-slate-500 text-xs mt-1">Sign in to your local workspace</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 light:text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-9 pr-4 py-2.5 bg-white/[0.04] light:bg-slate-100 border ${
                    errors.email ? 'border-rose-500' : 'border-white/[0.08] light:border-slate-200'
                  } rounded-xl text-white light:text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300 light:text-slate-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full pl-9 pr-10 py-2.5 bg-white/[0.04] light:bg-slate-100 border ${
                    errors.password ? 'border-rose-500' : 'border-white/[0.08] light:border-slate-200'
                  } rounded-xl text-white light:text-slate-900 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-400">{errors.password.message}</p>}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-xs font-semibold rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in to Workspace'}
            </Button>
          </form>

          {/* Local storage badge */}
          <div className="mt-5 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Accounts & data are safely stored in your browser localStorage.</span>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-400 light:text-slate-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}