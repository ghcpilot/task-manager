'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuth } from '@/app/contexts/AuthContext';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic info, 2: Password
  const [basicInfo, setBasicInfo] = useState({ name: '', email: '' });
  const { signUp, error } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleStepOne = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setBasicInfo({ name, email });
    setValue('name', name);
    setValue('email', email);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#09090b] light:bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow orbs */}
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
            <h1 className="text-xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-zinc-400 text-xs mt-1">
              {step === 1 ? 'Step 1 of 2: Basic profile info' : 'Step 2 of 2: Set your password'}
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
            <div className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleStepOne} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    name="name"
                    defaultValue={basicInfo.name}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    name="email"
                    defaultValue={basicInfo.email}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs"
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-semibold rounded-xl mt-2"
              >
                Continue to Password
              </Button>
            </form>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected info pill */}
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{basicInfo.name}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{basicInfo.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border ${
                      errors.password ? 'border-rose-500' : 'border-white/[0.08]'
                    } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs`}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full pl-9 pr-10 py-2.5 bg-white/[0.04] border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/[0.08]'
                    } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors text-xs`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 text-xs rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 text-xs font-semibold rounded-xl"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          {/* Local storage badge */}
          <div className="mt-5 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Account is stored locally in your browser storage.</span>
          </div>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}