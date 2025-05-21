'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#ffffff' // Fixed white color
    }
  });
  
  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      
      const project = await response.json();
      toast.success('Project created successfully');
      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };
  
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto"
      >
        {/* Header section */}
        <div className="mb-8">
          <Link href="/dashboard/projects">
            <motion.div
              variants={item}
              className="flex items-center text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Projects</span>
            </motion.div>
          </Link>
          
          <motion.h1 
            variants={item}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Create New Project
          </motion.h1>
          <motion.p 
            variants={item}
            className="text-gray-400 mt-1"
          >
            Fill in the details below to create a new project
          </motion.p>
        </div>
        
        {/* Form */}
        <motion.form 
          variants={item}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-xl p-6 border border-white/20"
        >
          {/* Project Name */}
          <div className="mb-6">
            <label 
              htmlFor="name"
              className="block text-sm font-medium text-white mb-1"
            >
              Project Name
            </label>
            <input
              id="name"
              {...register('name')}
              className="bg-[#1e1e1e]/80 w-full rounded-md px-4 py-3 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 text-white"
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <span className="text-red-400 text-xs">●</span> {errors.name.message}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label 
              htmlFor="description"
              className="block text-sm font-medium text-white mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="bg-[#1e1e1e]/80 w-full rounded-md px-4 py-3 text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 text-white resize-none"
              placeholder="Enter project description"
              rows={4}
            />
          </div>
          
          {/* Hidden color field - using fixed white */}
          <input type="hidden" {...register('color')} value="#ffffff" />
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              variant="default" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : 'Create Project'}
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </main>
  );
} 